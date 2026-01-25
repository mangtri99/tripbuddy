import { eq, and, or } from 'drizzle-orm'
import { db, travelGroups, groupMembers, groupInvitations, users, trips } from '../database'
import type { TravelGroup, GroupMember, GroupInvitation } from '../database/schema/groups'
import { createId } from '../database/utils'

export async function findGroupById(id: string): Promise<TravelGroup | undefined> {
  const result = await db
    .select()
    .from(travelGroups)
    .where(eq(travelGroups.id, id))
    .limit(1)
  return result[0]
}

export async function findGroupWithMembers(id: string) {
  const group = await findGroupById(id)
  if (!group) return undefined

  const members = await db
    .select({
      id: groupMembers.id,
      userId: groupMembers.userId,
      role: groupMembers.role,
      joinedAt: groupMembers.joinedAt,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
        avatarUrl: users.avatarUrl
      }
    })
    .from(groupMembers)
    .innerJoin(users, eq(groupMembers.userId, users.id))
    .where(eq(groupMembers.groupId, id))

  let trip = null
  if (group.tripId) {
    const tripResult = await db
      .select()
      .from(trips)
      .where(eq(trips.id, group.tripId))
      .limit(1)
    trip = tripResult[0] || null
  }

  return { ...group, members, trip }
}

export async function getUserGroups(userId: string) {
  // Get groups where user is a member
  const memberGroups = await db
    .select({
      group: travelGroups,
      role: groupMembers.role,
      memberCount: groupMembers.id
    })
    .from(groupMembers)
    .innerJoin(travelGroups, eq(groupMembers.groupId, travelGroups.id))
    .where(eq(groupMembers.userId, userId))

  // Get unique groups with member count
  const groupIds = [...new Set(memberGroups.map(mg => mg.group.id))]

  const result = await Promise.all(
    groupIds.map(async (groupId) => {
      const group = memberGroups.find(mg => mg.group.id === groupId)!
      const memberCount = await db
        .select({ count: groupMembers.id })
        .from(groupMembers)
        .where(eq(groupMembers.groupId, groupId))

      return {
        ...group.group,
        role: group.role,
        memberCount: memberCount.length
      }
    })
  )

  return result
}

export async function isGroupMember(groupId: string, userId: string): Promise<GroupMember | null> {
  const result = await db
    .select()
    .from(groupMembers)
    .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)))
    .limit(1)
  return result[0] || null
}

export async function isGroupAdmin(groupId: string, userId: string): Promise<boolean> {
  const member = await isGroupMember(groupId, userId)
  return member?.role === 'admin'
}

export async function canEditGroup(groupId: string, userId: string): Promise<boolean> {
  const member = await isGroupMember(groupId, userId)
  return member?.role === 'admin' || member?.role === 'editor'
}

export async function getGroupMemberCount(groupId: string): Promise<number> {
  const result = await db
    .select()
    .from(groupMembers)
    .where(eq(groupMembers.groupId, groupId))
  return result.length
}

export async function createInvitationToken(): Promise<string> {
  return createId() + createId() // 42 chars for security
}

export async function findInvitationByToken(token: string): Promise<GroupInvitation | undefined> {
  const result = await db
    .select()
    .from(groupInvitations)
    .where(eq(groupInvitations.token, token))
    .limit(1)
  return result[0]
}

export async function getPendingInvitations(groupId: string) {
  return db
    .select({
      id: groupInvitations.id,
      email: groupInvitations.email,
      role: groupInvitations.role,
      status: groupInvitations.status,
      expiresAt: groupInvitations.expiresAt,
      createdAt: groupInvitations.createdAt,
      invitedBy: {
        id: users.id,
        name: users.name,
        email: users.email
      }
    })
    .from(groupInvitations)
    .innerJoin(users, eq(groupInvitations.invitedBy, users.id))
    .where(
      and(
        eq(groupInvitations.groupId, groupId),
        eq(groupInvitations.status, 'pending')
      )
    )
}

export function sanitizeGroup(group: TravelGroup) {
  return {
    id: group.id,
    name: group.name,
    description: group.description,
    coverImageUrl: group.coverImageUrl,
    tripId: group.tripId,
    createdBy: group.createdBy,
    createdAt: group.createdAt,
    updatedAt: group.updatedAt
  }
}

export function sanitizeMember(member: GroupMember & { user: { id: string; name: string; email: string; avatarUrl: string | null } }) {
  return {
    id: member.id,
    userId: member.userId,
    role: member.role,
    joinedAt: member.joinedAt,
    user: {
      id: member.user.id,
      name: member.user.name,
      email: member.user.email,
      avatarUrl: member.user.avatarUrl
    }
  }
}
