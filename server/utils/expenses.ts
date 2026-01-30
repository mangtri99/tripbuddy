import { eq, and, desc, sql } from 'drizzle-orm'
import { db, sharedExpenses, expenseParticipants, settlements, users, groupMembers } from '../database'
import type { SharedExpense, ExpenseParticipant, Settlement } from '../database/schema/expenses'

export async function findSharedExpenseById(id: string): Promise<SharedExpense | undefined> {
  const result = await db
    .select()
    .from(sharedExpenses)
    .where(eq(sharedExpenses.id, id))
    .limit(1)
  return result[0]
}

export async function getSharedExpenseWithParticipants(id: string) {
  const expense = await findSharedExpenseById(id)
  if (!expense) return undefined

  const participants = await db
    .select({
      id: expenseParticipants.id,
      userId: expenseParticipants.userId,
      shareAmount: expenseParticipants.shareAmount,
      sharePercentage: expenseParticipants.sharePercentage,
      isSettled: expenseParticipants.isSettled,
      settledAt: expenseParticipants.settledAt,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
        avatarUrl: users.avatarUrl
      }
    })
    .from(expenseParticipants)
    .innerJoin(users, eq(expenseParticipants.userId, users.id))
    .where(eq(expenseParticipants.expenseId, id))

  const paidByUser = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      avatarUrl: users.avatarUrl
    })
    .from(users)
    .where(eq(users.id, expense.paidBy))
    .limit(1)

  return {
    ...expense,
    paidByUser: paidByUser[0],
    participants
  }
}

export async function getGroupSharedExpenses(groupId: string) {
  const expenses = await db
    .select({
      id: sharedExpenses.id,
      groupId: sharedExpenses.groupId,
      paidBy: sharedExpenses.paidBy,
      category: sharedExpenses.category,
      amount: sharedExpenses.amount,
      currency: sharedExpenses.currency,
      description: sharedExpenses.description,
      receiptUrl: sharedExpenses.receiptUrl,
      splitMethod: sharedExpenses.splitMethod,
      date: sharedExpenses.date,
      createdAt: sharedExpenses.createdAt,
      paidByUser: {
        id: users.id,
        name: users.name,
        email: users.email,
        avatarUrl: users.avatarUrl
      }
    })
    .from(sharedExpenses)
    .innerJoin(users, eq(sharedExpenses.paidBy, users.id))
    .where(eq(sharedExpenses.groupId, groupId))
    .orderBy(desc(sharedExpenses.date), desc(sharedExpenses.createdAt))

  // Get participants for each expense
  const expensesWithParticipants = await Promise.all(
    expenses.map(async (expense) => {
      const participants = await db
        .select({
          id: expenseParticipants.id,
          userId: expenseParticipants.userId,
          shareAmount: expenseParticipants.shareAmount,
          sharePercentage: expenseParticipants.sharePercentage,
          isSettled: expenseParticipants.isSettled,
          settledAt: expenseParticipants.settledAt,
          user: {
            id: users.id,
            name: users.name,
            avatarUrl: users.avatarUrl
          }
        })
        .from(expenseParticipants)
        .innerJoin(users, eq(expenseParticipants.userId, users.id))
        .where(eq(expenseParticipants.expenseId, expense.id))

      return { ...expense, participants }
    })
  )

  return expensesWithParticipants
}

export async function getGroupSettlements(groupId: string) {
  return db
    .select({
      id: settlements.id,
      groupId: settlements.groupId,
      fromUserId: settlements.fromUserId,
      toUserId: settlements.toUserId,
      amount: settlements.amount,
      currency: settlements.currency,
      note: settlements.note,
      createdAt: settlements.createdAt,
      fromUser: {
        id: users.id,
        name: users.name,
        avatarUrl: users.avatarUrl
      }
    })
    .from(settlements)
    .innerJoin(users, eq(settlements.fromUserId, users.id))
    .where(eq(settlements.groupId, groupId))
    .orderBy(desc(settlements.createdAt))
}

export interface Balance {
  fromUserId: string
  toUserId: string
  amount: number
  currency: string
}

export interface UserBalance {
  userId: string
  user: {
    id: string
    name: string
    avatarUrl: string | null
  }
  owes: { userId: string; userName: string; amount: number }[]
  isOwed: { userId: string; userName: string; amount: number }[]
  netBalance: number
}

export async function calculateGroupBalances(groupId: string): Promise<UserBalance[]> {
  // Get all group members
  const members = await db
    .select({
      userId: groupMembers.userId,
      user: {
        id: users.id,
        name: users.name,
        avatarUrl: users.avatarUrl
      }
    })
    .from(groupMembers)
    .innerJoin(users, eq(groupMembers.userId, users.id))
    .where(eq(groupMembers.groupId, groupId))

  // Get all shared expenses with participants
  const expenses = await getGroupSharedExpenses(groupId)

  // Get all settlements
  const allSettlements = await db
    .select()
    .from(settlements)
    .where(eq(settlements.groupId, groupId))

  // Calculate raw balances: who owes whom how much
  const balanceMap: Record<string, Record<string, number>> = {}

  // Initialize balance map for all members
  for (const member of members) {
    const memberBalance: Record<string, number> = {}
    for (const otherMember of members) {
      if (member.userId !== otherMember.userId) {
        memberBalance[otherMember.userId] = 0
      }
    }
    balanceMap[member.userId] = memberBalance
  }

  // Process expenses: each participant owes the payer their share
  for (const expense of expenses) {
    for (const participant of expense.participants) {
      if (participant.userId !== expense.paidBy && !participant.isSettled) {
        // This participant owes the payer
        const participantBalance = balanceMap[participant.userId]
        if (participantBalance && expense.paidBy in participantBalance) {
          participantBalance[expense.paidBy] = (participantBalance[expense.paidBy] || 0) + participant.shareAmount
        }
      }
    }
  }

  // Process settlements: reduce debt
  for (const settlement of allSettlements) {
    const fromBalance = balanceMap[settlement.fromUserId]
    if (fromBalance && settlement.toUserId in fromBalance) {
      fromBalance[settlement.toUserId] = (fromBalance[settlement.toUserId] || 0) - settlement.amount
    }
  }

  // Build user balances with names
  const memberMap = new Map(members.map(m => [m.userId, m.user]))

  const userBalances: UserBalance[] = members.map(member => {
    const owes: { userId: string; userName: string; amount: number }[] = []
    const isOwed: { userId: string; userName: string; amount: number }[] = []
    let netBalance = 0

    const memberBalance = balanceMap[member.userId] || {}

    for (const otherMember of members) {
      if (member.userId === otherMember.userId) continue

      const otherBalance = balanceMap[otherMember.userId] || {}
      const owedToOther = memberBalance[otherMember.userId] || 0
      const owedFromOther = otherBalance[member.userId] || 0

      const netOwed = owedToOther - owedFromOther

      if (netOwed > 0) {
        owes.push({
          userId: otherMember.userId,
          userName: memberMap.get(otherMember.userId)?.name || 'Unknown',
          amount: netOwed
        })
        netBalance -= netOwed
      } else if (netOwed < 0) {
        isOwed.push({
          userId: otherMember.userId,
          userName: memberMap.get(otherMember.userId)?.name || 'Unknown',
          amount: Math.abs(netOwed)
        })
        netBalance += Math.abs(netOwed)
      }
    }

    return {
      userId: member.userId,
      user: member.user,
      owes,
      isOwed,
      netBalance
    }
  })

  return userBalances
}

export function calculateEqualSplit(
  totalAmount: number,
  participantCount: number
): { shareAmount: number; remainder: number } {
  const shareAmount = Math.floor(totalAmount / participantCount)
  const remainder = totalAmount - (shareAmount * participantCount)
  return { shareAmount, remainder }
}

export function calculatePercentageSplit(
  totalAmount: number,
  percentages: number[]
): number[] {
  const shares = percentages.map(p => Math.floor((totalAmount * p) / 100))
  const totalShares = shares.reduce((a, b) => a + b, 0)
  const remainder = totalAmount - totalShares

  // Add remainder to first participant
  if (remainder > 0 && shares.length > 0 && shares[0] !== undefined) {
    shares[0] = shares[0] + remainder
  }

  return shares
}

export function sanitizeSharedExpense(expense: SharedExpense) {
  return {
    id: expense.id,
    groupId: expense.groupId,
    paidBy: expense.paidBy,
    category: expense.category,
    amount: expense.amount,
    currency: expense.currency,
    description: expense.description,
    receiptUrl: expense.receiptUrl,
    splitMethod: expense.splitMethod,
    date: expense.date,
    createdAt: expense.createdAt,
    updatedAt: expense.updatedAt
  }
}
