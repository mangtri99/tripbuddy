import { eq, and } from 'drizzle-orm'
import { db, groupMembers, users } from '../../../../database'
import { updateMemberRoleSchema } from '../../../../utils/validation'
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
  const memberId = getRouterParam(event, 'memberId')

  if (!groupId || !memberId) {
    throw createError({
      statusCode: 400,
      message: 'Group ID and Member ID are required'
    })
  }

  // Only admins can update member roles
  const isAdmin = await isGroupAdmin(groupId, session.user.id)
  if (!isAdmin) {
    throw createError({
      statusCode: 403,
      message: 'Only group admins can update member roles'
    })
  }

  const body = await readValidatedBody(event, updateMemberRoleSchema.parse)

  // Find the member
  const existingMember = await db
    .select()
    .from(groupMembers)
    .where(and(eq(groupMembers.id, memberId), eq(groupMembers.groupId, groupId)))
    .limit(1)

  if (!existingMember[0]) {
    throw createError({
      statusCode: 404,
      message: 'Member not found'
    })
  }

  // Prevent demoting the last admin
  if (existingMember[0].role === 'admin' && body.role !== 'admin') {
    const adminCount = await db
      .select()
      .from(groupMembers)
      .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.role, 'admin')))

    if (adminCount.length <= 1) {
      throw createError({
        statusCode: 400,
        message: 'Cannot demote the last admin. Promote another member first.'
      })
    }
  }

  const [updatedMember] = await db
    .update(groupMembers)
    .set({ role: body.role })
    .where(eq(groupMembers.id, memberId))
    .returning()

  if (!updatedMember) {
    throw createError({
      statusCode: 404,
      message: 'Member not found'
    })
  }

  // Get user details
  const userDetails = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      avatarUrl: users.avatarUrl
    })
    .from(users)
    .where(eq(users.id, updatedMember.userId))
    .limit(1)

  return {
    member: {
      ...updatedMember,
      user: userDetails[0]
    }
  }
})
