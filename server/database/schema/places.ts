import { pgTable, text, timestamp, integer, real, pgEnum, jsonb, boolean } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { createId } from '../utils'
import { users } from './users'

export const placeCategoryEnum = pgEnum('place_category', [
  'attraction',
  'restaurant',
  'hotel',
  'museum',
  'park',
  'beach',
  'shopping',
  'entertainment',
  'transportation',
  'other'
])

export const priceLevelEnum = pgEnum('price_level', ['free', 'budget', 'moderate', 'expensive', 'luxury'])

export const places = pgTable('places', {
  id: text('id').primaryKey().$defaultFn(createId),
  externalId: text('external_id'),
  name: text('name').notNull(),
  description: text('description'),
  category: placeCategoryEnum('category').notNull(),
  address: text('address'),
  city: text('city'),
  country: text('country'),
  latitude: real('latitude'),
  longitude: real('longitude'),
  phone: text('phone'),
  website: text('website'),
  priceLevel: priceLevelEnum('price_level'),
  openingHours: jsonb('opening_hours').$type<Record<string, string>>(),
  amenities: jsonb('amenities').$type<string[]>(),
  photos: jsonb('photos').$type<string[]>(),
  averageRating: real('average_rating').default(0),
  totalReviews: integer('total_reviews').default(0),
  isVerified: boolean('is_verified').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

export const reviews = pgTable('reviews', {
  id: text('id').primaryKey().$defaultFn(createId),
  placeId: text('place_id').notNull().references(() => places.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  rating: integer('rating').notNull(),
  ratingValue: integer('rating_value'),
  ratingLocation: integer('rating_location'),
  ratingService: integer('rating_service'),
  ratingCleanliness: integer('rating_cleanliness'),
  content: text('content').notNull(),
  photos: jsonb('photos').$type<string[]>(),
  helpfulCount: integer('helpful_count').default(0),
  isVerifiedVisit: boolean('is_verified_visit').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

export const reviewHelpful = pgTable('review_helpful', {
  id: text('id').primaryKey().$defaultFn(createId),
  reviewId: text('review_id').notNull().references(() => reviews.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const savedPlaces = pgTable('saved_places', {
  id: text('id').primaryKey().$defaultFn(createId),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  placeId: text('place_id').notNull().references(() => places.id, { onDelete: 'cascade' }),
  listName: text('list_name').default('Favorites'),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const placesRelations = relations(places, ({ many }) => ({
  reviews: many(reviews),
  savedBy: many(savedPlaces)
}))

export const reviewsRelations = relations(reviews, ({ one, many }) => ({
  place: one(places, {
    fields: [reviews.placeId],
    references: [places.id]
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id]
  }),
  helpfulMarks: many(reviewHelpful)
}))

export type Place = typeof places.$inferSelect
export type NewPlace = typeof places.$inferInsert
export type Review = typeof reviews.$inferSelect
export type NewReview = typeof reviews.$inferInsert
export type SavedPlace = typeof savedPlaces.$inferSelect
export type NewSavedPlace = typeof savedPlaces.$inferInsert
