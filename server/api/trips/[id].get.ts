import { verifyTripOwnership, findTripWithItinerary, sanitizeTrip, sanitizeItineraryItem } from '../../utils/trips'

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

  const tripWithItinerary = await findTripWithItinerary(tripId)

  return {
    trip: {
      ...sanitizeTrip(tripWithItinerary!),
      itineraryItems: tripWithItinerary!.itineraryItems.map(sanitizeItineraryItem)
    }
  }
})
