import { eq } from 'drizzle-orm'
import { db, trips } from '../../database'
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

  // Soft delete by setting status to cancelled
  const [deletedTrip] = await db
    .update(trips)
    .set({
      status: 'cancelled',
      updatedAt: new Date()
    })
    .where(eq(trips.id, tripId))
    .returning()

  return {
    trip: sanitizeTrip(deletedTrip!)
  }
})
