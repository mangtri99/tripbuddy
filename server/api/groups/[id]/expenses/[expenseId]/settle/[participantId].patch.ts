import { eq, and } from 'drizzle-orm'
import { db, expenseParticipants } from '../../../../../../database'
import { settleParticipantSchema } from '../../../../../../utils/validation'
import { isGroupMember, isGroupAdmin } from '../../../../../../utils/groups'
import { findSharedExpenseById, getSharedExpenseWithParticipants } from '../../../../../../utils/expenses'

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
  const participantId = getRouterParam(event, 'participantId')

  if (!groupId || !expenseId || !participantId) {
    throw createError({
      statusCode: 400,
      message: 'Group ID, Expense ID, and Participant ID are required'
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

  // Get the participant record
  const [participant] = await db
    .select()
    .from(expenseParticipants)
    .where(and(
      eq(expenseParticipants.id, participantId),
      eq(expenseParticipants.expenseId, expenseId)
    ))
    .limit(1)

  if (!participant) {
    throw createError({
      statusCode: 404,
      message: 'Participant not found'
    })
  }

  // Check if user can mark as settled (must be the payer, or admin)
  const isAdmin = await isGroupAdmin(groupId, session.user.id)
  if (expense.paidBy !== session.user.id && !isAdmin) {
    throw createError({
      statusCode: 403,
      message: 'Only the person who paid or an admin can mark debts as settled'
    })
  }

  const body = await readBody(event)
  const validation = settleParticipantSchema.safeParse(body)

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      message: validation.error.issues[0]?.message || 'Invalid input'
    })
  }

  const { isSettled } = validation.data

  // Update the participant's settled status
  await db
    .update(expenseParticipants)
    .set({
      isSettled,
      settledAt: isSettled ? new Date() : null
    })
    .where(eq(expenseParticipants.id, participantId))

  const expenseWithParticipants = await getSharedExpenseWithParticipants(expenseId)

  return { expense: expenseWithParticipants }
})
