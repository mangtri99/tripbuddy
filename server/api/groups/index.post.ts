import { db, travelGroups, groupMembers } from '../../database'
import { createGroupSchema } from '../../utils/validation'
import { sanitizeGroup } from '../../utils/groups'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  if (!session.user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }

  const body = await readValidatedBody(event, createGroupSchema.parse)

  // Create the group
  const [newGroup] = await db
    .insert(travelGroups)
    .values({
      name: body.name,
      description: body.description,
      tripId: body.tripId,
      coverImageUrl: body.coverImageUrl,
      createdBy: session.user.id
    })
    .returning()

  if (!newGroup) {
    throw createError({
      statusCode: 500,
      message: 'Failed to create group'
    })
  }

  // Add creator as admin member
  await db.insert(groupMembers).values({
    groupId: newGroup.id,
    userId: session.user.id,
    role: 'admin'
  })

  return {
    group: {
      ...sanitizeGroup(newGroup),
      role: 'admin',
      memberCount: 1
    }
  }
})
