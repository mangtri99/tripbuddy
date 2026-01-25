import { eq } from 'drizzle-orm'
import { db, groupInvitations, groupMembers } from '../../../database'
import { findInvitationByToken, findGroupById, isGroupMember, sanitizeGroup } from '../../../utils/groups'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  if (!session.user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }

  const token = getRouterParam(event, 'token')
  if (!token) {
    throw createError({
      statusCode: 400,
      message: 'Invitation token is required'
    })
  }

  // Find invitation
  const invitation = await findInvitationByToken(token)
  if (!invitation) {
    throw createError({
      statusCode: 404,
      message: 'Invalid or expired invitation'
    })
  }

  // Check if invitation is still pending
  if (invitation.status !== 'pending') {
    throw createError({
      statusCode: 400,
      message: `This invitation has already been ${invitation.status}`
    })
  }

  // Check if invitation has expired
  if (new Date() > invitation.expiresAt) {
    // Update invitation status to expired
    await db
      .update(groupInvitations)
      .set({ status: 'expired' })
      .where(eq(groupInvitations.id, invitation.id))

    throw createError({
      statusCode: 400,
      message: 'This invitation has expired'
    })
  }

  // Check if user is already a member
  const existingMember = await isGroupMember(invitation.groupId, session.user.id)
  if (existingMember) {
    throw createError({
      statusCode: 400,
      message: 'You are already a member of this group'
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

  // Add user as member
  await db.insert(groupMembers).values({
    groupId: invitation.groupId,
    userId: session.user.id,
    role: invitation.role || 'viewer'
  })

  // Update invitation status
  await db
    .update(groupInvitations)
    .set({ status: 'accepted' })
    .where(eq(groupInvitations.id, invitation.id))

  return {
    group: sanitizeGroup(group),
    role: invitation.role
  }
})
