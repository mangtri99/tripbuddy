import { eq, and } from 'drizzle-orm'
import { db, groupInvitations, groupMembers, users } from '../../../../database'
import { inviteMemberSchema } from '../../../../utils/validation'
import { isGroupAdmin, createInvitationToken, findGroupById } from '../../../../utils/groups'
import { findUserByEmail } from '../../../../utils/auth'

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

  // Only admins can invite members
  const isAdmin = await isGroupAdmin(groupId, session.user.id)
  if (!isAdmin) {
    throw createError({
      statusCode: 403,
      message: 'Only group admins can invite members'
    })
  }

  const group = await findGroupById(groupId)
  if (!group) {
    throw createError({
      statusCode: 404,
      message: 'Group not found'
    })
  }

  const body = await readValidatedBody(event, inviteMemberSchema.parse)

  // If userId provided, check if user exists and is not already a member
  let targetUserId = body.userId
  let targetEmail = body.email

  if (body.email && !body.userId) {
    // Try to find user by email
    const existingUser = await findUserByEmail(body.email)
    if (existingUser) {
      targetUserId = existingUser.id
    }
  }

  if (targetUserId) {
    // Check if already a member
    const existingMember = await db
      .select()
      .from(groupMembers)
      .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, targetUserId)))
      .limit(1)

    if (existingMember[0]) {
      throw createError({
        statusCode: 400,
        message: 'User is already a member of this group'
      })
    }
  }

  // Check for existing pending invitation
  if (targetEmail) {
    const existingInvitation = await db
      .select()
      .from(groupInvitations)
      .where(
        and(
          eq(groupInvitations.groupId, groupId),
          eq(groupInvitations.email, targetEmail),
          eq(groupInvitations.status, 'pending')
        )
      )
      .limit(1)

    if (existingInvitation[0]) {
      throw createError({
        statusCode: 400,
        message: 'An invitation has already been sent to this email'
      })
    }
  }

  // Create invitation token
  const token = await createInvitationToken()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  const [invitation] = await db
    .insert(groupInvitations)
    .values({
      groupId,
      invitedBy: session.user.id,
      email: targetEmail,
      userId: targetUserId,
      token,
      role: body.role,
      expiresAt
    })
    .returning()

  if (!invitation) {
    throw createError({
      statusCode: 500,
      message: 'Failed to create invitation'
    })
  }

  // In a real app, send email notification here
  // For now, we return the invitation link
  const baseUrl = getRequestURL(event).origin
  const invitationLink = `${baseUrl}/groups/join/${token}`

  return {
    invitation: {
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      expiresAt: invitation.expiresAt,
      link: invitationLink
    }
  }
})
