import { db, itineraryItems } from '../../../../database'
import { createItineraryItemSchema } from '../../../../utils/validation'
import { verifyTripOwnership, sanitizeItineraryItem } from '../../../../utils/trips'

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

  const body = await readValidatedBody(event, createItineraryItemSchema.parse)

  const [newItem] = await db
    .insert(itineraryItems)
    .values({
      tripId,
      dayNumber: body.dayNumber,
      orderIndex: body.orderIndex,
      type: body.type,
      title: body.title,
      description: body.description,
      location: body.location,
      startTime: body.startTime,
      endTime: body.endTime,
      duration: body.duration,
      cost: body.cost,
      currency: body.currency,
      notes: body.notes,
      links: body.links,
      placeId: body.placeId
    })
    .returning()

  return {
    item: sanitizeItineraryItem(newItem!)
  }
})
