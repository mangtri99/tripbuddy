import { eq } from 'drizzle-orm'
import { db, travelGroups } from '../../database'
import { isGroupAdmin, sanitizeGroup } from '../../utils/groups'

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

  // Only admins can delete groups
  const isAdmin = await isGroupAdmin(groupId, session.user.id)
  if (!isAdmin) {
    throw createError({
      statusCode: 403,
      message: 'Only group admins can delete the group'
    })
  }

  const [deletedGroup] = await db
    .delete(travelGroups)
    .where(eq(travelGroups.id, groupId))
    .returning()

  if (!deletedGroup) {
    throw createError({
      statusCode: 404,
      message: 'Group not found'
    })
  }

  return {
    group: sanitizeGroup(deletedGroup)
  }
})
