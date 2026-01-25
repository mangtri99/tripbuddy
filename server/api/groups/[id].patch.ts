import { eq } from 'drizzle-orm'
import { db, travelGroups } from '../../database'
import { updateGroupSchema } from '../../utils/validation'
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

  // Only admins can update groups
  const isAdmin = await isGroupAdmin(groupId, session.user.id)
  if (!isAdmin) {
    throw createError({
      statusCode: 403,
      message: 'Only group admins can update group details'
    })
  }

  const body = await readValidatedBody(event, updateGroupSchema.parse)

  const [updatedGroup] = await db
    .update(travelGroups)
    .set({
      ...body,
      updatedAt: new Date()
    })
    .where(eq(travelGroups.id, groupId))
    .returning()

  if (!updatedGroup) {
    throw createError({
      statusCode: 404,
      message: 'Group not found'
    })
  }

  return {
    group: sanitizeGroup(updatedGroup)
  }
})
