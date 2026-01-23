import { pgTable, text, timestamp, pgEnum, jsonb, boolean, integer, real } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { createId } from '../utils'
import { users } from './users'

export const travelStyleEnum = pgEnum('travel_style', [
  'backpacker',
  'budget',
  'comfort',
  'luxury',
  'adventure',
  'cultural',
  'relaxation'
])

export const partnerRequestStatusEnum = pgEnum('partner_request_status', [
  'pending',
  'accepted',
  'declined',
  'cancelled'
])

export const travelPartnerProfiles = pgTable('travel_partner_profiles', {
  id: text('id').primaryKey().$defaultFn(createId),
  userId: text('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  bio: text('bio'),
  travelStyle: travelStyleEnum('travel_style'),
  interests: jsonb('interests').$type<string[]>(),
  languages: jsonb('languages').$type<string[]>(),
  countriesVisited: jsonb('countries_visited').$type<string[]>(),
  preferredDestinations: jsonb('preferred_destinations').$type<string[]>(),
  ageRangeMin: integer('age_range_min'),
  ageRangeMax: integer('age_range_max'),
  isVerified: boolean('is_verified').default(false),
  responseRate: real('response_rate').default(0),
  totalTrips: integer('total_trips').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

export const partnerSearches = pgTable('partner_searches', {
  id: text('id').primaryKey().$defaultFn(createId),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  destination: text('destination').notNull(),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  description: text('description'),
  travelStyle: travelStyleEnum('travel_style'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

export const partnerRequests = pgTable('partner_requests', {
  id: text('id').primaryKey().$defaultFn(createId),
  fromUserId: text('from_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  toUserId: text('to_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  searchId: text('search_id').references(() => partnerSearches.id, { onDelete: 'set null' }),
  message: text('message'),
  status: partnerRequestStatusEnum('status').default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  respondedAt: timestamp('responded_at')
})

export const partnerReviews = pgTable('partner_reviews', {
  id: text('id').primaryKey().$defaultFn(createId),
  reviewerId: text('reviewer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  reviewedUserId: text('reviewed_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  rating: integer('rating').notNull(),
  content: text('content'),
  wouldTravelAgain: boolean('would_travel_again'),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const userBlocks = pgTable('user_blocks', {
  id: text('id').primaryKey().$defaultFn(createId),
  blockerId: text('blocker_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  blockedId: text('blocked_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  reason: text('reason'),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const userReports = pgTable('user_reports', {
  id: text('id').primaryKey().$defaultFn(createId),
  reporterId: text('reporter_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  reportedUserId: text('reported_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  reason: text('reason').notNull(),
  description: text('description'),
  status: text('status').default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  resolvedAt: timestamp('resolved_at')
})

export const travelPartnerProfilesRelations = relations(travelPartnerProfiles, ({ one }) => ({
  user: one(users, {
    fields: [travelPartnerProfiles.userId],
    references: [users.id]
  })
}))

export const partnerRequestsRelations = relations(partnerRequests, ({ one }) => ({
  fromUser: one(users, {
    fields: [partnerRequests.fromUserId],
    references: [users.id]
  }),
  toUser: one(users, {
    fields: [partnerRequests.toUserId],
    references: [users.id]
  }),
  search: one(partnerSearches, {
    fields: [partnerRequests.searchId],
    references: [partnerSearches.id]
  })
}))

export const partnerReviewsRelations = relations(partnerReviews, ({ one }) => ({
  reviewer: one(users, {
    fields: [partnerReviews.reviewerId],
    references: [users.id]
  }),
  reviewedUser: one(users, {
    fields: [partnerReviews.reviewedUserId],
    references: [users.id]
  })
}))

export type TravelPartnerProfile = typeof travelPartnerProfiles.$inferSelect
export type NewTravelPartnerProfile = typeof travelPartnerProfiles.$inferInsert
export type PartnerSearch = typeof partnerSearches.$inferSelect
export type NewPartnerSearch = typeof partnerSearches.$inferInsert
export type PartnerRequest = typeof partnerRequests.$inferSelect
export type NewPartnerRequest = typeof partnerRequests.$inferInsert
export type PartnerReview = typeof partnerReviews.$inferSelect
export type NewPartnerReview = typeof partnerReviews.$inferInsert
