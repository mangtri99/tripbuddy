import { pgTable, text, timestamp, integer, real, pgEnum, boolean, jsonb } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { createId } from '../utils'
import { users } from './users'
import { trips } from './trips'
import { travelGroups } from './groups'

export const expenseCategoryEnum = pgEnum('expense_category', [
  'accommodation',
  'transportation',
  'food',
  'activities',
  'shopping',
  'entertainment',
  'insurance',
  'visa',
  'communication',
  'other'
])

export const splitMethodEnum = pgEnum('split_method', ['equal', 'percentage', 'custom', 'full'])

export const expenses = pgTable('expenses', {
  id: text('id').primaryKey().$defaultFn(createId),
  tripId: text('trip_id').references(() => trips.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  category: expenseCategoryEnum('category').notNull(),
  amount: integer('amount').notNull(),
  currency: text('currency').default('USD'),
  description: text('description').notNull(),
  receiptUrl: text('receipt_url'),
  date: timestamp('date').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

export const sharedExpenses = pgTable('shared_expenses', {
  id: text('id').primaryKey().$defaultFn(createId),
  groupId: text('group_id').notNull().references(() => travelGroups.id, { onDelete: 'cascade' }),
  paidBy: text('paid_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
  category: expenseCategoryEnum('category').notNull(),
  amount: integer('amount').notNull(),
  currency: text('currency').default('USD'),
  description: text('description').notNull(),
  receiptUrl: text('receipt_url'),
  splitMethod: splitMethodEnum('split_method').default('equal'),
  date: timestamp('date').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

export const expenseParticipants = pgTable('expense_participants', {
  id: text('id').primaryKey().$defaultFn(createId),
  expenseId: text('expense_id').notNull().references(() => sharedExpenses.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  shareAmount: integer('share_amount').notNull(),
  sharePercentage: real('share_percentage'),
  isSettled: boolean('is_settled').default(false),
  settledAt: timestamp('settled_at')
})

export const settlements = pgTable('settlements', {
  id: text('id').primaryKey().$defaultFn(createId),
  groupId: text('group_id').notNull().references(() => travelGroups.id, { onDelete: 'cascade' }),
  fromUserId: text('from_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  toUserId: text('to_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  amount: integer('amount').notNull(),
  currency: text('currency').default('USD'),
  note: text('note'),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const budgets = pgTable('budgets', {
  id: text('id').primaryKey().$defaultFn(createId),
  tripId: text('trip_id').notNull().references(() => trips.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  category: expenseCategoryEnum('category'),
  amount: integer('amount').notNull(),
  currency: text('currency').default('USD'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

export const expensesRelations = relations(expenses, ({ one }) => ({
  trip: one(trips, {
    fields: [expenses.tripId],
    references: [trips.id]
  }),
  user: one(users, {
    fields: [expenses.userId],
    references: [users.id]
  })
}))

export const sharedExpensesRelations = relations(sharedExpenses, ({ one, many }) => ({
  group: one(travelGroups, {
    fields: [sharedExpenses.groupId],
    references: [travelGroups.id]
  }),
  paidByUser: one(users, {
    fields: [sharedExpenses.paidBy],
    references: [users.id]
  }),
  participants: many(expenseParticipants)
}))

export const expenseParticipantsRelations = relations(expenseParticipants, ({ one }) => ({
  expense: one(sharedExpenses, {
    fields: [expenseParticipants.expenseId],
    references: [sharedExpenses.id]
  }),
  user: one(users, {
    fields: [expenseParticipants.userId],
    references: [users.id]
  })
}))

export type Expense = typeof expenses.$inferSelect
export type NewExpense = typeof expenses.$inferInsert
export type SharedExpense = typeof sharedExpenses.$inferSelect
export type NewSharedExpense = typeof sharedExpenses.$inferInsert
export type ExpenseParticipant = typeof expenseParticipants.$inferSelect
export type NewExpenseParticipant = typeof expenseParticipants.$inferInsert
export type Settlement = typeof settlements.$inferSelect
export type NewSettlement = typeof settlements.$inferInsert
export type Budget = typeof budgets.$inferSelect
export type NewBudget = typeof budgets.$inferInsert
