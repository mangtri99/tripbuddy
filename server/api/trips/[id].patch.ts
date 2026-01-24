import { eq } from 'drizzle-orm'
import { db, trips } from '../../database'
import { updateTripSchema } from '../../utils/validation'
import { verifyTripOwnership, sanitizeTrip } from '../../utils/trips'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  if (!session.user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }

  const tripId = getRouterParam(event, 'id')
  if (!tripId) {
    throw createError({
      statusCode: 400,
      message: 'Trip ID is required'
    })
  }

  const trip = await verifyTripOwnership(tripId, session.user.id)
  if (!trip) {
    throw createError({
      statusCode: 404,
      message: 'Trip not found'
    })
  }

  const body = await readValidatedBody(event, updateTripSchema.parse)

  const [updatedTrip] = await db
    .update(trips)
    .set({
      ...body,
      updatedAt: new Date()
    })
    .where(eq(trips.id, tripId))
    .returning()

  return {
    trip: sanitizeTrip(updatedTrip!)
  }
})
