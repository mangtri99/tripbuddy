import { isGroupMember } from '../../../../utils/groups'
import { findSharedExpenseById, getSharedExpenseWithParticipants } from '../../../../utils/expenses'

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

  const expenseWithParticipants = await getSharedExpenseWithParticipants(expenseId)

  return { expense: expenseWithParticipants }
})
