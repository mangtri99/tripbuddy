import { eq } from 'drizzle-orm'
import { db, sharedExpenses, expenseParticipants, groupMembers } from '../../../../database'
import { updateSharedExpenseSchema } from '../../../../utils/validation'
import { isGroupMember, isGroupAdmin } from '../../../../utils/groups'
import { findSharedExpenseById, calculateEqualSplit, calculatePercentageSplit, getSharedExpenseWithParticipants } from '../../../../utils/expenses'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  if (!session.user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }

  const groupId = getRouterParam(event, 'id')
  const expenseId = getRouterParam(event, 'expenseId')

  if (!groupId || !expenseId) {
    throw createError({
      statusCode: 400,
      message: 'Group ID and Expense ID are required'
    })
  }

  // Check membership
  const member = await isGroupMember(groupId, session.user.id)
  if (!member) {
    throw createError({
      statusCode: 403,
      message: 'You are not a member of this group'
    })
  }

  // Get expense and verify it belongs to this group
  const expense = await findSharedExpenseById(expenseId)
  if (!expense || expense.groupId !== groupId) {
    throw createError({
      statusCode: 404,
      message: 'Expense not found'
    })
  }

  // Check if user can edit (must be the one who created it, or admin)
  const isAdmin = await isGroupAdmin(groupId, session.user.id)
  if (expense.paidBy !== session.user.id && !isAdmin) {
    throw createError({
      statusCode: 403,
      message: 'You can only edit expenses you created'
    })
  }

  const body = await readBody(event)
  const validation = updateSharedExpenseSchema.safeParse(body)

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      message: validation.error.issues[0]?.message || 'Invalid input'
    })
  }

  const data = validation.data

  // Update expense basic info
  const updateData: Record<string, unknown> = {
    updatedAt: new Date()
  }

  if (data.category) updateData.category = data.category
  if (data.amount) updateData.amount = data.amount
  if (data.currency) updateData.currency = data.currency
  if (data.description) updateData.description = data.description
  if (data.receiptUrl !== undefined) updateData.receiptUrl = data.receiptUrl
  if (data.splitMethod) updateData.splitMethod = data.splitMethod
  if (data.date) updateData.date = new Date(data.date)

  await db
    .update(sharedExpenses)
    .set(updateData)
    .where(eq(sharedExpenses.id, expenseId))

  // If participants are being updated, recalculate shares
  if (data.participants && data.participants.length > 0) {
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

    const amount = data.amount || expense.amount
    const splitMethod = data.splitMethod || expense.splitMethod || 'equal'
    let shareAmounts: number[] = []

    switch (splitMethod) {
      case 'equal': {
        const { shareAmount, remainder } = calculateEqualSplit(amount, data.participants.length)
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
        shareAmounts = calculatePercentageSplit(amount, percentages)
        break
      }
      case 'custom': {
        shareAmounts = data.participants.map((p: { shareAmount?: number }) => p.shareAmount || 0)
        const totalCustom = shareAmounts.reduce((a, b) => a + b, 0)
        if (totalCustom !== amount) {
          throw createError({
            statusCode: 400,
            message: 'Custom amounts must add up to the total expense amount'
          })
        }
        break
      }
      case 'full': {
        shareAmounts = data.participants.map((_: unknown, index: number) =>
          index === 0 ? amount : 0
        )
        break
      }
    }

    // Delete existing participants and recreate
    await db.delete(expenseParticipants).where(eq(expenseParticipants.expenseId, expenseId))

    const participantRecords = data.participants.map((p: { userId: string; sharePercentage?: number }, index: number) => ({
      expenseId,
      userId: p.userId,
      shareAmount: shareAmounts[index] ?? 0,
      sharePercentage: splitMethod === 'percentage' ? p.sharePercentage : null,
      isSettled: p.userId === expense.paidBy
    }))

    await db.insert(expenseParticipants).values(participantRecords)
  }

  const expenseWithParticipants = await getSharedExpenseWithParticipants(expenseId)

  return { expense: expenseWithParticipants }
})
