import { eq } from 'drizzle-orm'
import { db, groupMembers, users } from '../../../../database'
import { isGroupMember } from '../../../../utils/groups'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  if (!session.user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }

  const groupId = getRouterParam(event, 'id')
  if (!groupId) {
    throw createError({
      statusCode: 400,
      message: 'Group ID is required'
    })
  }

  // Verify user is a member
  const membership = await isGroupMember(groupId, session.user.id)
  if (!membership) {
    throw createError({
      statusCode: 404,
      message: 'Group not found'
    })
  }

  const members = await db
    .select({
      id: groupMembers.id,
      userId: groupMembers.userId,
      role: groupMembers.role,
      joinedAt: groupMembers.joinedAt,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
        avatarUrl: users.avatarUrl
      }
    })
    .from(groupMembers)
    .innerJoin(users, eq(groupMembers.userId, users.id))
    .where(eq(groupMembers.groupId, groupId))

  return { members }
})
