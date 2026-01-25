import { eq } from 'drizzle-orm'
import { db, groupInvitations, users } from '../../../database'
import { findInvitationByToken, findGroupById, sanitizeGroup, getGroupMemberCount } from '../../../utils/groups'

export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, 'token')
  if (!token) {
    throw createError({
      statusCode: 400,
      message: 'Invitation token is required'
    })
  }

  // Find invitation (don't require auth to view invitation details)
  const invitation = await findInvitationByToken(token)
  if (!invitation) {
    throw createError({
      statusCode: 404,
      message: 'Invalid or expired invitation'
    })
  }

  // Check if invitation has expired
  if (new Date() > invitation.expiresAt) {
    throw createError({
      statusCode: 400,
      message: 'This invitation has expired'
    })
  }

  if (invitation.status !== 'pending') {
    throw createError({
      statusCode: 400,
      message: `This invitation has already been ${invitation.status}`
    })
  }

  // Get group details
  const group = await findGroupById(invitation.groupId)
  if (!group) {
    throw createError({
      statusCode: 404,
      message: 'Group no longer exists'
    })
  }

  // Get inviter details
  const inviter = await db
    .select({
      id: users.id,
      name: users.name,
      avatarUrl: users.avatarUrl
    })
    .from(users)
    .where(eq(users.id, invitation.invitedBy))
    .limit(1)

  const memberCount = await getGroupMemberCount(invitation.groupId)

  return {
    invitation: {
      id: invitation.id,
      role: invitation.role,
      expiresAt: invitation.expiresAt
    },
    group: {
      ...sanitizeGroup(group),
      memberCount
    },
    invitedBy: inviter[0]
  }
})
