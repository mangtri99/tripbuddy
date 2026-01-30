import { findGroupWithMembers, isGroupMember, sanitizeGroup } from '../../utils/groups'
import { sanitizeTrip } from '../../utils/trips'

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

  // Verify user is a member of the group
  const membership = await isGroupMember(groupId, session.user.id)
  if (!membership) {
    throw createError({
      statusCode: 404,
      message: 'Group not found'
    })
  }

  const groupWithMembers = await findGroupWithMembers(groupId)
  if (!groupWithMembers) {
    throw createError({
      statusCode: 404,
      message: 'Group not found'
    })
  }

  return {
    group: {
      ...sanitizeGroup(groupWithMembers),
      members: groupWithMembers.members,
      trips: groupWithMembers.trips.map(sanitizeTrip),
      currentUserRole: membership.role
    }
  }
})
