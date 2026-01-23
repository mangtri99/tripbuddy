import { pgTable, text, timestamp, date, integer, pgEnum, jsonb } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { createId } from '../utils'
import { users } from './users'

export const tripStatusEnum = pgEnum('trip_status', ['draft', 'planned', 'ongoing', 'completed', 'cancelled'])
export const tripVisibilityEnum = pgEnum('trip_visibility', ['private', 'group', 'public'])

export const trips = pgTable('trips', {
  id: text('id').primaryKey().$defaultFn(createId),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  destination: text('destination').notNull(),
  coverImageUrl: text('cover_image_url'),
  startDate: date('start_date'),
  endDate: date('end_date'),
  status: tripStatusEnum('status').default('draft'),
  visibility: tripVisibilityEnum('visibility').default('private'),
  budget: integer('budget'),
  currency: text('currency').default('USD'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

export const itineraryItemTypeEnum = pgEnum('itinerary_item_type', [
  'activity',
  'accommodation',
  'transportation',
  'food',
  'other'
])

export const itineraryItems = pgTable('itinerary_items', {
  id: text('id').primaryKey().$defaultFn(createId),
  tripId: text('trip_id').notNull().references(() => trips.id, { onDelete: 'cascade' }),
  placeId: text('place_id'),
  dayNumber: integer('day_number').notNull(),
  orderIndex: integer('order_index').notNull(),
  type: itineraryItemTypeEnum('type').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  location: text('location'),
  startTime: text('start_time'),
  endTime: text('end_time'),
  duration: integer('duration'),
  cost: integer('cost'),
  currency: text('currency').default('USD'),
  notes: text('notes'),
  links: jsonb('links').$type<string[]>(),
  attachments: jsonb('attachments').$type<string[]>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

export const tripsRelations = relations(trips, ({ one, many }) => ({
  user: one(users, {
    fields: [trips.userId],
    references: [users.id]
  }),
  itineraryItems: many(itineraryItems)
}))

export const itineraryItemsRelations = relations(itineraryItems, ({ one }) => ({
  trip: one(trips, {
    fields: [itineraryItems.tripId],
    references: [trips.id]
  })
}))

export type Trip = typeof trips.$inferSelect
export type NewTrip = typeof trips.$inferInsert
export type ItineraryItem = typeof itineraryItems.$inferSelect
export type NewItineraryItem = typeof itineraryItems.$inferInsert
