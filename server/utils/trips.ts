import { eq, and } from 'drizzle-orm'
import { db, trips, itineraryItems } from '../database'
import type { Trip, ItineraryItem } from '../database/schema/trips'

export async function findTripById(id: string): Promise<Trip | undefined> {
  const result = await db
    .select()
    .from(trips)
    .where(eq(trips.id, id))
    .limit(1)
  return result[0]
}

export async function findTripWithItinerary(id: string) {
  const trip = await findTripById(id)
  if (!trip) return undefined

  const items = await db
    .select()
    .from(itineraryItems)
    .where(eq(itineraryItems.tripId, id))
    .orderBy(itineraryItems.dayNumber, itineraryItems.orderIndex)

  return { ...trip, itineraryItems: items }
}

export async function verifyTripOwnership(tripId: string, userId: string): Promise<Trip | null> {
  const result = await db
    .select()
    .from(trips)
    .where(and(eq(trips.id, tripId), eq(trips.userId, userId)))
    .limit(1)
  return result[0] || null
}

export async function findItineraryItemById(itemId: string): Promise<ItineraryItem | undefined> {
  const result = await db
    .select()
    .from(itineraryItems)
    .where(eq(itineraryItems.id, itemId))
    .limit(1)
  return result[0]
}

export async function verifyItemOwnership(itemId: string, userId: string): Promise<ItineraryItem | null> {
  const result = await db
    .select({
      item: itineraryItems,
      trip: trips
    })
    .from(itineraryItems)
    .innerJoin(trips, eq(itineraryItems.tripId, trips.id))
    .where(and(eq(itineraryItems.id, itemId), eq(trips.userId, userId)))
    .limit(1)

  return result[0]?.item || null
}

export function sanitizeTrip(trip: Trip) {
  return {
    id: trip.id,
    title: trip.title,
    description: trip.description,
    destination: trip.destination,
    coverImageUrl: trip.coverImageUrl,
    startDate: trip.startDate,
    endDate: trip.endDate,
    status: trip.status,
    visibility: trip.visibility,
    budget: trip.budget,
    currency: trip.currency,
    createdAt: trip.createdAt,
    updatedAt: trip.updatedAt
  }
}

export function sanitizeItineraryItem(item: ItineraryItem) {
  return {
    id: item.id,
    tripId: item.tripId,
    dayNumber: item.dayNumber,
    orderIndex: item.orderIndex,
    type: item.type,
    title: item.title,
    description: item.description,
    location: item.location,
    startTime: item.startTime,
    endTime: item.endTime,
    duration: item.duration,
    cost: item.cost,
    currency: item.currency,
    notes: item.notes,
    links: item.links,
    placeId: item.placeId,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  }
}
