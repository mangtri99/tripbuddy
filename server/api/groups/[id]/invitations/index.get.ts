import { isGroupAdmin, getPendingInvitations } from '../../../../utils/groups'

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

  // Only admins can view pending invitations
  const isAdmin = await isGroupAdmin(groupId, session.user.id)
  if (!isAdmin) {
    throw createError({
      statusCode: 403,
      message: 'Only group admins can view pending invitations'
    })
  }

  const invitations = await getPendingInvitations(groupId)

  return { invitations }
})
