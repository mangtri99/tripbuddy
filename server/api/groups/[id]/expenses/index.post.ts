import { eq } from 'drizzle-orm'
import { db, sharedExpenses, expenseParticipants, groupMembers } from '../../../../database'
import { createSharedExpenseSchema } from '../../../../utils/validation'
import { isGroupMember, canEditGroup } from '../../../../utils/groups'
import { calculateEqualSplit, calculatePercentageSplit, getSharedExpenseWithParticipants } from '../../../../utils/expenses'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  if (!session.user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }

  const userId = session.user.id
  const groupId = getRouterParam(event, 'id')

  if (!groupId) {
    throw createError({
      statusCode: 400,
      message: 'Group ID is required'
    })
  }

  // Check membership and edit permission
  const member = await isGroupMember(groupId, userId)
  if (!member) {
    throw createError({
      statusCode: 403,
      message: 'You are not a member of this group'
    })
  }

  const canEdit = await canEditGroup(groupId, userId)
  if (!canEdit) {
    throw createError({
      statusCode: 403,
      message: 'You do not have permission to add expenses'
    })
  }

  const body = await readBody(event)
  const validation = createSharedExpenseSchema.safeParse(body)

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      message: validation.error.issues[0]?.message || 'Invalid input'
    })
  }

  const data = validation.data

  // Verify all participants are group members
  const groupMembersList = await db
    .select({ userId: groupMembers.userId })
    .from(groupMembers)
    .where(eq(groupMembers.groupId, groupId))

  const memberIds = new Set(groupMembersList.map((m: { userId: string }) => m.userId))

  for (const participant of data.participants) {
    if (!memberIds.has(participant.userId)) {
      throw createError({
        statusCode: 400,
        message: `User ${participant.userId} is not a member of this group`
      })
    }
  }

  // Calculate share amounts based on split method
  let shareAmounts: number[] = []

  switch (data.splitMethod) {
    case 'equal': {
      const { shareAmount, remainder } = calculateEqualSplit(data.amount, data.participants.length)
      shareAmounts = data.participants.map((_: unknown, index: number) =>
        index === 0 ? shareAmount + remainder : shareAmount
      )
      break
    }
    case 'percentage': {
      const percentages = data.participants.map((p: { sharePercentage?: number }) => p.sharePercentage || 0)
      const totalPercentage = percentages.reduce((a: number, b: number) => a + b, 0)
      if (Math.abs(totalPercentage - 100) > 0.01) {
        throw createError({
          statusCode: 400,
          message: 'Percentages must add up to 100'
        })
      }
      shareAmounts = calculatePercentageSplit(data.amount, percentages)
      break
    }
    case 'custom': {
      shareAmounts = data.participants.map((p: { shareAmount?: number }) => p.shareAmount || 0)
      const totalCustom = shareAmounts.reduce((a, b) => a + b, 0)
      if (totalCustom !== data.amount) {
        throw createError({
          statusCode: 400,
          message: 'Custom amounts must add up to the total expense amount'
        })
      }
      break
    }
    case 'full': {
      // One person pays the full amount (first participant)
      shareAmounts = data.participants.map((_: unknown, index: number) =>
        index === 0 ? data.amount : 0
      )
      break
    }
  }

  // Create the shared expense
  const [newExpense] = await db
    .insert(sharedExpenses)
    .values({
      groupId,
      paidBy: userId,
      category: data.category,
      amount: data.amount,
      currency: data.currency,
      description: data.description,
      receiptUrl: data.receiptUrl,
      splitMethod: data.splitMethod,
      date: new Date(data.date)
    })
    .returning()

  if (!newExpense) {
    throw createError({
      statusCode: 500,
      message: 'Failed to create expense'
    })
  }

  // Create expense participants
  const participantRecords = data.participants.map((p: { userId: string; sharePercentage?: number }, index: number) => ({
    expenseId: newExpense.id,
    userId: p.userId,
    shareAmount: shareAmounts[index] ?? 0,
    sharePercentage: data.splitMethod === 'percentage' ? p.sharePercentage : null,
    isSettled: p.userId === userId // Mark payer's own share as settled
  }))

  await db.insert(expenseParticipants).values(participantRecords)

  // Return the expense with participants
  const expenseWithParticipants = await getSharedExpenseWithParticipants(newExpense.id)

  return {
    expense: expenseWithParticipants
  }
})
