import { eq, and, inArray } from 'drizzle-orm'
import { db, itineraryItems, trips } from '../../../../database'
import { reorderItemsSchema } from '../../../../utils/validation'
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
  if (!tripId) {
    throw createError({
      statusCode: 400,
      message: 'Trip ID is required'
    })
  }

  // Verify user owns the trip
  const tripResult = await db
    .select()
    .from(trips)
    .where(and(eq(trips.id, tripId), eq(trips.userId, session.user.id)))
    .limit(1)

  if (!tripResult[0]) {
    throw createError({
      statusCode: 404,
      message: 'Trip not found'
    })
  }

  const body = await readValidatedBody(event, reorderItemsSchema.parse)

  // Verify all items belong to this trip
  const itemIds = body.items.map(item => item.id)
  const existingItems = await db
    .select()
    .from(itineraryItems)
    .where(
      and(
        eq(itineraryItems.tripId, tripId),
        inArray(itineraryItems.id, itemIds)
      )
    )

  if (existingItems.length !== itemIds.length) {
    throw createError({
      statusCode: 400,
      message: 'Some items do not belong to this trip'
    })
  }

  // Update each item's position
  const updates = body.items.map(item =>
    db
      .update(itineraryItems)
      .set({
        dayNumber: item.dayNumber,
        orderIndex: item.orderIndex,
        updatedAt: new Date()
      })
      .where(eq(itineraryItems.id, item.id))
  )

  await Promise.all(updates)

  // Return updated items
  const updatedItems = await db
    .select()
    .from(itineraryItems)
    .where(eq(itineraryItems.tripId, tripId))
    .orderBy(itineraryItems.dayNumber, itineraryItems.orderIndex)

  return {
    items: updatedItems.map(sanitizeItineraryItem)
  }
})
