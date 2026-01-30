import { eq } from 'drizzle-orm'
import { db, sharedExpenses } from '../../../../database'
import { isGroupMember, isGroupAdmin } from '../../../../utils/groups'
import { findSharedExpenseById } from '../../../../utils/expenses'

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

  // Check if user can delete (must be the one who created it, or admin)
  const isAdmin = await isGroupAdmin(groupId, session.user.id)
  if (expense.paidBy !== session.user.id && !isAdmin) {
    throw createError({
      statusCode: 403,
      message: 'You can only delete expenses you created'
    })
  }

  // Delete expense (participants will be cascade deleted)
  await db.delete(sharedExpenses).where(eq(sharedExpenses.id, expenseId))

  return { success: true }
})
