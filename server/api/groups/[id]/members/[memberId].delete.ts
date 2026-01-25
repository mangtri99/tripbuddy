import { eq, and } from 'drizzle-orm'
import { db, groupMembers } from '../../../../database'
import { isGroupAdmin, isGroupMember } from '../../../../utils/groups'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  if (!session.user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }

  const groupId = getRouterParam(event, 'id')
  const memberId = getRouterParam(event, 'memberId')

  if (!groupId || !memberId) {
    throw createError({
      statusCode: 400,
      message: 'Group ID and Member ID are required'
    })
  }

  // Find the member to remove
  const memberToRemove = await db
    .select()
    .from(groupMembers)
    .where(and(eq(groupMembers.id, memberId), eq(groupMembers.groupId, groupId)))
    .limit(1)

  if (!memberToRemove[0]) {
    throw createError({
      statusCode: 404,
      message: 'Member not found'
    })
  }

  // Check permissions - admins can remove anyone, users can only remove themselves
  const isAdmin = await isGroupAdmin(groupId, session.user.id)
  const isSelf = memberToRemove[0].userId === session.user.id

  if (!isAdmin && !isSelf) {
    throw createError({
      statusCode: 403,
      message: 'You can only remove yourself from the group'
    })
  }

  // Prevent removing the last admin
  if (memberToRemove[0].role === 'admin') {
    const adminCount = await db
      .select()
      .from(groupMembers)
      .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.role, 'admin')))

    if (adminCount.length <= 1) {
      throw createError({
        statusCode: 400,
        message: 'Cannot remove the last admin. Promote another member first or delete the group.'
      })
    }
  }

  const [removedMember] = await db
    .delete(groupMembers)
    .where(eq(groupMembers.id, memberId))
    .returning()

  return {
    member: removedMember
  }
})
