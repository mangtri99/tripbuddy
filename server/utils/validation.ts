import { z } from 'zod'

export const emailSchema = z.string().email('Invalid email address').toLowerCase().trim()

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

export const nameSchema = z.string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must be at most 100 characters')
  .trim()

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema
})

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
})

export const forgotPasswordSchema = z.object({
  email: emailSchema
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: passwordSchema
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

// Trip validation schemas
export const tripStatusValues = ['draft', 'planned', 'ongoing', 'completed', 'cancelled'] as const
export const tripVisibilityValues = ['private', 'group', 'public'] as const

export const createTripSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be at most 200 characters').trim(),
  destination: z.string().min(1, 'Destination is required').max(200, 'Destination must be at most 200 characters').trim(),
  description: z.string().max(2000, 'Description must be at most 2000 characters').optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
  budget: z.number().int().min(0).optional(),
  currency: z.string().length(3, 'Currency must be 3 characters').default('USD'),
  status: z.enum(tripStatusValues).default('draft'),
  visibility: z.enum(tripVisibilityValues).default('private'),
  coverImageUrl: z.string().url().optional()
})

export const updateTripSchema = createTripSchema.partial()

// Itinerary item validation schemas
export const itineraryItemTypeValues = ['activity', 'accommodation', 'transportation', 'food', 'other'] as const

export const createItineraryItemSchema = z.object({
  dayNumber: z.number().int().min(1, 'Day number must be at least 1'),
  orderIndex: z.number().int().min(0),
  type: z.enum(itineraryItemTypeValues),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be at most 200 characters').trim(),
  description: z.string().max(2000).optional(),
  location: z.string().max(500).optional(),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)').optional(),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)').optional(),
  duration: z.number().int().min(0).optional(),
  cost: z.number().int().min(0).optional(),
  currency: z.string().length(3).default('USD'),
  notes: z.string().max(2000).optional(),
  links: z.array(z.string().url()).optional(),
  placeId: z.string().optional()
})

export const updateItineraryItemSchema = createItineraryItemSchema.partial()

export const reorderItemsSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    dayNumber: z.number().int().min(1),
    orderIndex: z.number().int().min(0)
  }))
})

export type CreateTripInput = z.infer<typeof createTripSchema>
export type UpdateTripInput = z.infer<typeof updateTripSchema>
export type CreateItineraryItemInput = z.infer<typeof createItineraryItemSchema>
export type UpdateItineraryItemInput = z.infer<typeof updateItineraryItemSchema>
export type ReorderItemsInput = z.infer<typeof reorderItemsSchema>
