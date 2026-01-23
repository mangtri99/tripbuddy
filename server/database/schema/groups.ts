import { pgTable, text, timestamp, pgEnum, integer } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { createId } from '../utils'
import { users } from './users'
import { trips } from './trips'

export const groupRoleEnum = pgEnum('group_role', ['admin', 'editor', 'viewer'])
export const invitationStatusEnum = pgEnum('invitation_status', ['pending', 'accepted', 'declined', 'expired'])

export const travelGroups = pgTable('travel_groups', {
  id: text('id').primaryKey().$defaultFn(createId),
  tripId: text('trip_id').references(() => trips.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  description: text('description'),
  coverImageUrl: text('cover_image_url'),
  createdBy: text('created_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

export const groupMembers = pgTable('group_members', {
  id: text('id').primaryKey().$defaultFn(createId),
  groupId: text('group_id').notNull().references(() => travelGroups.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: groupRoleEnum('role').default('viewer'),
  joinedAt: timestamp('joined_at').defaultNow().notNull()
})

export const groupInvitations = pgTable('group_invitations', {
  id: text('id').primaryKey().$defaultFn(createId),
  groupId: text('group_id').notNull().references(() => travelGroups.id, { onDelete: 'cascade' }),
  invitedBy: text('invited_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
  email: text('email'),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  status: invitationStatusEnum('status').default('pending'),
  role: groupRoleEnum('role').default('viewer'),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const groupAnnouncements = pgTable('group_announcements', {
  id: text('id').primaryKey().$defaultFn(createId),
  groupId: text('group_id').notNull().references(() => travelGroups.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const activityVotes = pgTable('activity_votes', {
  id: text('id').primaryKey().$defaultFn(createId),
  groupId: text('group_id').notNull().references(() => travelGroups.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  closesAt: timestamp('closes_at')
})

export const activityVoteOptions = pgTable('activity_vote_options', {
  id: text('id').primaryKey().$defaultFn(createId),
  voteId: text('vote_id').notNull().references(() => activityVotes.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  voteCount: integer('vote_count').default(0)
})

export const activityVoteResponses = pgTable('activity_vote_responses', {
  id: text('id').primaryKey().$defaultFn(createId),
  optionId: text('option_id').notNull().references(() => activityVoteOptions.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const travelGroupsRelations = relations(travelGroups, ({ one, many }) => ({
  trip: one(trips, {
    fields: [travelGroups.tripId],
    references: [trips.id]
  }),
  creator: one(users, {
    fields: [travelGroups.createdBy],
    references: [users.id]
  }),
  members: many(groupMembers),
  invitations: many(groupInvitations),
  announcements: many(groupAnnouncements),
  votes: many(activityVotes)
}))

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
  group: one(travelGroups, {
    fields: [groupMembers.groupId],
    references: [travelGroups.id]
  }),
  user: one(users, {
    fields: [groupMembers.userId],
    references: [users.id]
  })
}))

export type TravelGroup = typeof travelGroups.$inferSelect
export type NewTravelGroup = typeof travelGroups.$inferInsert
export type GroupMember = typeof groupMembers.$inferSelect
export type NewGroupMember = typeof groupMembers.$inferInsert
export type GroupInvitation = typeof groupInvitations.$inferSelect
export type NewGroupInvitation = typeof groupInvitations.$inferInsert
