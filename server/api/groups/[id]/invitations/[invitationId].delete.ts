import { eq, and } from 'drizzle-orm'
import { db, groupInvitations } from '../../../../database'
import { isGroupAdmin } from '../../../../utils/groups'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  if (!session.user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }

  const groupId = getRouterParam(event, 'id')
  const invitationId = getRouterParam(event, 'invitationId')

  if (!groupId || !invitationId) {
    throw createError({
      statusCode: 400,
      message: 'Group ID and Invitation ID are required'
    })
  }

  // Only admins can cancel invitations
  const isAdmin = await isGroupAdmin(groupId, session.user.id)
  if (!isAdmin) {
    throw createError({
      statusCode: 403,
      message: 'Only group admins can cancel invitations'
    })
  }

  const [deletedInvitation] = await db
    .delete(groupInvitations)
    .where(
      and(
        eq(groupInvitations.id, invitationId),
        eq(groupInvitations.groupId, groupId)
      )
    )
    .returning()

  if (!deletedInvitation) {
    throw createError({
      statusCode: 404,
      message: 'Invitation not found'
    })
  }

  return {
    invitation: deletedInvitation
  }
})
