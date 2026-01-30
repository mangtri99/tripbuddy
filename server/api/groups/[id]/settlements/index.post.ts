import { eq } from 'drizzle-orm'
import { db, settlements, users } from '../../../../database'
import { createSettlementSchema } from '../../../../utils/validation'
import { isGroupMember } from '../../../../utils/groups'

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

  // Check membership
  const member = await isGroupMember(groupId, session.user.id)
  if (!member) {
    throw createError({
      statusCode: 403,
      message: 'You are not a member of this group'
    })
  }

  const body = await readBody(event)
  const validation = createSettlementSchema.safeParse(body)

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      message: validation.error.issues[0]?.message || 'Invalid input'
    })
  }

  const data = validation.data

  // Verify the recipient is a group member
  const recipientMember = await isGroupMember(groupId, data.toUserId)
  if (!recipientMember) {
    throw createError({
      statusCode: 400,
      message: 'Recipient is not a member of this group'
    })
  }

  // Cannot settle with yourself
  if (data.toUserId === session.user.id) {
    throw createError({
      statusCode: 400,
      message: 'Cannot create a settlement with yourself'
    })
  }

  // Create the settlement record
  const [newSettlement] = await db
    .insert(settlements)
    .values({
      groupId,
      fromUserId: session.user.id,
      toUserId: data.toUserId,
      amount: data.amount,
      currency: data.currency,
      note: data.note
    })
    .returning()

  if (!newSettlement) {
    throw createError({
      statusCode: 500,
      message: 'Failed to create settlement'
    })
  }

  // Get user details for response
  const [fromUser] = await db
    .select({
      id: users.id,
      name: users.name,
      avatarUrl: users.avatarUrl
    })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1)

  const [toUser] = await db
    .select({
      id: users.id,
      name: users.name,
      avatarUrl: users.avatarUrl
    })
    .from(users)
    .where(eq(users.id, data.toUserId))
    .limit(1)

  return {
    settlement: {
      ...newSettlement,
      fromUser,
      toUser
    }
  }
})
