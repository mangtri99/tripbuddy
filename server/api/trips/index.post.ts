import { db, trips } from '../../database'
import { createTripSchema } from '../../utils/validation'
import { sanitizeTrip } from '../../utils/trips'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  if (!session.user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }

  const body = await readValidatedBody(event, createTripSchema.parse)

  const [newTrip] = await db
    .insert(trips)
    .values({
      userId: session.user.id,
      title: body.title,
      destination: body.destination,
      description: body.description,
      startDate: body.startDate,
      endDate: body.endDate,
      budget: body.budget,
      currency: body.currency,
      status: body.status,
      visibility: body.visibility,
      coverImageUrl: body.coverImageUrl
    })
    .returning()

  return {
    trip: sanitizeTrip(newTrip!)
  }
})
