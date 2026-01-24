import { eq, desc } from 'drizzle-orm'
import { db, trips } from '../../database'
import { sanitizeTrip } from '../../utils/trips'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  if (!session.user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }

  const query = getQuery(event)
  const status = query.status as string | undefined

  let userTrips = await db
    .select()
    .from(trips)
    .where(eq(trips.userId, session.user.id))
    .orderBy(desc(trips.updatedAt))

  if (status && ['draft', 'planned', 'ongoing', 'completed', 'cancelled'].includes(status)) {
    userTrips = userTrips.filter(trip => trip.status === status)
  }

  return {
    trips: userTrips.map(sanitizeTrip)
  }
})
