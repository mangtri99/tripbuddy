import { eq, and } from 'drizzle-orm'
import { db, itineraryItems, trips } from '../../../../database'
import { updateItineraryItemSchema } from '../../../../utils/validation'
import { sanitizeItineraryItem } from '../../../../utils/trips'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  if (!session.user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }

  const tripId = getRouterParam(event, 'id')
  const itemId = getRouterParam(event, 'itemId')

  if (!tripId || !itemId) {
    throw createError({
      statusCode: 400,
      message: 'Trip ID and Item ID are required'
    })
  }

  // Verify item exists and user owns the trip
  const result = await db
    .select({ item: itineraryItems })
    .from(itineraryItems)
    .innerJoin(trips, eq(itineraryItems.tripId, trips.id))
    .where(
      and(
        eq(itineraryItems.id, itemId),
        eq(itineraryItems.tripId, tripId),
        eq(trips.userId, session.user.id)
      )
    )
    .limit(1)

  if (!result[0]) {
    throw createError({
      statusCode: 404,
      message: 'Itinerary item not found'
    })
  }

  const body = await readValidatedBody(event, updateItineraryItemSchema.parse)

  const [updatedItem] = await db
    .update(itineraryItems)
    .set({
      ...body,
      updatedAt: new Date()
    })
    .where(eq(itineraryItems.id, itemId))
    .returning()

  return {
    item: sanitizeItineraryItem(updatedItem!)
  }
})
