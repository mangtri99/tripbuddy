import { pgTable, text, timestamp, integer, pgEnum, jsonb, boolean, date } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { createId } from '../utils'
import { users } from './users'
import { trips } from './trips'

export const insuranceTypeEnum = pgEnum('insurance_type', [
  'basic',
  'standard',
  'comprehensive',
  'premium'
])

export const claimStatusEnum = pgEnum('claim_status', [
  'submitted',
  'under_review',
  'approved',
  'rejected',
  'paid'
])

export const insurancePlans = pgTable('insurance_plans', {
  id: text('id').primaryKey().$defaultFn(createId),
  providerId: text('provider_id').notNull(),
  providerName: text('provider_name').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  type: insuranceTypeEnum('type').notNull(),
  coverageAmount: integer('coverage_amount').notNull(),
  dailyRate: integer('daily_rate').notNull(),
  currency: text('currency').default('USD'),
  coverageDetails: jsonb('coverage_details').$type<Record<string, string>>(),
  exclusions: jsonb('exclusions').$type<string[]>(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

export const userInsurances = pgTable('user_insurances', {
  id: text('id').primaryKey().$defaultFn(createId),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tripId: text('trip_id').references(() => trips.id, { onDelete: 'set null' }),
  planId: text('plan_id').notNull().references(() => insurancePlans.id),
  policyNumber: text('policy_number').notNull().unique(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  totalPremium: integer('total_premium').notNull(),
  currency: text('currency').default('USD'),
  policyDocument: text('policy_document'),
  emergencyContact: jsonb('emergency_contact').$type<{
    name: string
    phone: string
    relationship: string
  }>(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const insuranceClaims = pgTable('insurance_claims', {
  id: text('id').primaryKey().$defaultFn(createId),
  insuranceId: text('insurance_id').notNull().references(() => userInsurances.id, { onDelete: 'cascade' }),
  claimNumber: text('claim_number').notNull().unique(),
  incidentDate: date('incident_date').notNull(),
  incidentType: text('incident_type').notNull(),
  description: text('description').notNull(),
  claimAmount: integer('claim_amount').notNull(),
  currency: text('currency').default('USD'),
  supportingDocuments: jsonb('supporting_documents').$type<string[]>(),
  status: claimStatusEnum('status').default('submitted'),
  reviewNotes: text('review_notes'),
  approvedAmount: integer('approved_amount'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  resolvedAt: timestamp('resolved_at')
})

export const insurancePlansRelations = relations(insurancePlans, ({ many }) => ({
  userInsurances: many(userInsurances)
}))

export const userInsurancesRelations = relations(userInsurances, ({ one, many }) => ({
  user: one(users, {
    fields: [userInsurances.userId],
    references: [users.id]
  }),
  trip: one(trips, {
    fields: [userInsurances.tripId],
    references: [trips.id]
  }),
  plan: one(insurancePlans, {
    fields: [userInsurances.planId],
    references: [insurancePlans.id]
  }),
  claims: many(insuranceClaims)
}))

export const insuranceClaimsRelations = relations(insuranceClaims, ({ one }) => ({
  insurance: one(userInsurances, {
    fields: [insuranceClaims.insuranceId],
    references: [userInsurances.id]
  })
}))

export type InsurancePlan = typeof insurancePlans.$inferSelect
export type NewInsurancePlan = typeof insurancePlans.$inferInsert
export type UserInsurance = typeof userInsurances.$inferSelect
export type NewUserInsurance = typeof userInsurances.$inferInsert
export type InsuranceClaim = typeof insuranceClaims.$inferSelect
export type NewInsuranceClaim = typeof insuranceClaims.$inferInsert
