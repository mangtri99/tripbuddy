import { eq } from 'drizzle-orm'
import { faker } from '@faker-js/faker'
import { db } from '../../database'
import * as schema from '../../database/schema'

// Only allow in development
export default defineEventHandler(async (event) => {
  if (process.env.NODE_ENV === 'production') {
    throw createError({
      statusCode: 403,
      message: 'Seeding is not allowed in production'
    })
  }

  // Helper to generate ID
  function createId(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    let id = ''
    for (let i = 0; i < 21; i++) {
      id += chars[Math.floor(Math.random() * chars.length)]
    }
    return id
  }

  // Helper to get random items from array
  function randomItems<T>(arr: T[], count: number): T[] {
    const shuffled = [...arr].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
  }

  // Helper to get random date in range
  function randomDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
  }

  // Constants
  const TRIP_STATUSES = ['draft', 'planned', 'ongoing', 'completed'] as const
  const TRIP_VISIBILITIES = ['private', 'group', 'public'] as const
  const ITINERARY_TYPES = ['activity', 'accommodation', 'transportation', 'food', 'other'] as const
  const PLACE_CATEGORIES = ['attraction', 'restaurant', 'hotel', 'museum', 'park', 'beach', 'shopping', 'entertainment'] as const
  const PRICE_LEVELS = ['free', 'budget', 'moderate', 'expensive', 'luxury'] as const
  const EXPENSE_CATEGORIES = ['accommodation', 'transportation', 'food', 'activities', 'shopping', 'entertainment', 'other'] as const
  const TRAVEL_STYLES = ['backpacker', 'budget', 'comfort', 'luxury', 'adventure', 'cultural', 'relaxation'] as const
  const INSURANCE_TYPES = ['basic', 'standard', 'comprehensive', 'premium'] as const

  const DESTINATIONS = [
    { city: 'Tokyo', country: 'Japan' },
    { city: 'Paris', country: 'France' },
    { city: 'Bali', country: 'Indonesia' },
    { city: 'New York', country: 'USA' },
    { city: 'London', country: 'UK' },
    { city: 'Barcelona', country: 'Spain' },
    { city: 'Rome', country: 'Italy' },
    { city: 'Sydney', country: 'Australia' },
    { city: 'Bangkok', country: 'Thailand' },
    { city: 'Dubai', country: 'UAE' }
  ]

  const INTERESTS = ['hiking', 'photography', 'food', 'history', 'art', 'beaches', 'nightlife', 'shopping', 'nature', 'adventure sports']
  const LANGUAGES = ['English', 'Spanish', 'French', 'Mandarin', 'Japanese', 'German', 'Italian', 'Portuguese', 'Korean', 'Arabic']

  const results: Record<string, number> = {}

  try {
    // ============================================
    // 1. SEED USERS
    // ============================================
    const passwordHash = await hashPassword('Password123')

    const usersData = [
      { email: 'demo@tripbuddy.com', name: 'Demo User', bio: 'Love traveling and exploring new places!' },
      { email: 'john@example.com', name: 'John Traveler', bio: 'Adventure seeker and photography enthusiast' },
      { email: 'sarah@example.com', name: 'Sarah Wilson', bio: 'Digital nomad exploring the world' },
      { email: 'mike@example.com', name: 'Mike Chen', bio: 'Food lover and cultural explorer' },
      { email: 'emma@example.com', name: 'Emma Davis', bio: 'Beach enthusiast and sunset chaser' },
      ...Array.from({ length: 10 }, () => ({
        email: faker.internet.email().toLowerCase(),
        name: faker.person.fullName(),
        bio: faker.lorem.sentence()
      }))
    ]

    const createdUsers: { id: string; email: string; name: string }[] = []
    for (const userData of usersData) {
      const [user] = await db.insert(schema.users).values({
        id: createId(),
        email: userData.email,
        name: userData.name,
        bio: userData.bio,
        passwordHash,
        emailVerified: true,
        avatarUrl: faker.image.avatar()
      }).returning()
      createdUsers.push(user)
    }
    results.users = createdUsers.length

    // ============================================
    // 2. SEED PLACES
    // ============================================
    const createdPlaces: { id: string; name: string; city: string }[] = []

    for (const dest of DESTINATIONS) {
      const placesForCity = Array.from({ length: faker.number.int({ min: 5, max: 10 }) }, () => ({
        id: createId(),
        name: faker.company.name() + ' ' + faker.helpers.arrayElement(['Restaurant', 'Hotel', 'Museum', 'Park', 'Beach Club', 'Mall']),
        description: faker.lorem.paragraph(),
        category: faker.helpers.arrayElement(PLACE_CATEGORIES),
        address: faker.location.streetAddress(),
        city: dest.city,
        country: dest.country,
        latitude: faker.location.latitude(),
        longitude: faker.location.longitude(),
        phone: faker.phone.number(),
        website: faker.internet.url(),
        priceLevel: faker.helpers.arrayElement(PRICE_LEVELS),
        averageRating: faker.number.float({ min: 3, max: 5, fractionDigits: 1 }),
        totalReviews: faker.number.int({ min: 10, max: 500 }),
        isVerified: faker.datatype.boolean()
      }))

      for (const place of placesForCity) {
        const [created] = await db.insert(schema.places).values(place).returning()
        createdPlaces.push({ id: created.id, name: created.name, city: dest.city })
      }
    }
    results.places = createdPlaces.length

    // ============================================
    // 3. SEED TRIPS
    // ============================================
    const createdTrips: { id: string; title: string; userId: string; startDate: string; endDate: string }[] = []

    for (const user of createdUsers.slice(0, 8)) {
      const numTrips = faker.number.int({ min: 2, max: 5 })

      for (let i = 0; i < numTrips; i++) {
        const dest = faker.helpers.arrayElement(DESTINATIONS)
        const startDate = faker.date.future({ years: 1 })
        const endDate = new Date(startDate)
        endDate.setDate(endDate.getDate() + faker.number.int({ min: 3, max: 14 }))

        const [trip] = await db.insert(schema.trips).values({
          id: createId(),
          userId: user.id,
          title: `${dest.city} ${faker.helpers.arrayElement(['Adventure', 'Getaway', 'Trip', 'Vacation', 'Journey'])}`,
          destination: `${dest.city}, ${dest.country}`,
          description: faker.lorem.paragraph(),
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          status: faker.helpers.arrayElement(TRIP_STATUSES),
          visibility: faker.helpers.arrayElement(TRIP_VISIBILITIES),
          budget: faker.number.int({ min: 500, max: 10000 }),
          currency: 'USD'
        }).returning()

        createdTrips.push({
          id: trip.id,
          title: trip.title,
          userId: user.id,
          startDate: trip.startDate!,
          endDate: trip.endDate!
        })
      }
    }
    results.trips = createdTrips.length

    // ============================================
    // 4. SEED ITINERARY ITEMS
    // ============================================
    let itineraryCount = 0

    for (const trip of createdTrips) {
      const start = new Date(trip.startDate)
      const end = new Date(trip.endDate)
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

      for (let day = 1; day <= days; day++) {
        const itemsPerDay = faker.number.int({ min: 2, max: 5 })

        for (let order = 0; order < itemsPerDay; order++) {
          await db.insert(schema.itineraryItems).values({
            id: createId(),
            tripId: trip.id,
            dayNumber: day,
            orderIndex: order,
            type: faker.helpers.arrayElement(ITINERARY_TYPES),
            title: faker.lorem.words({ min: 2, max: 5 }),
            description: faker.lorem.sentence(),
            location: faker.location.streetAddress(),
            startTime: `${faker.number.int({ min: 6, max: 20 }).toString().padStart(2, '0')}:00`,
            endTime: `${faker.number.int({ min: 7, max: 22 }).toString().padStart(2, '0')}:00`,
            cost: faker.number.int({ min: 0, max: 200 }),
            currency: 'USD',
            notes: faker.datatype.boolean() ? faker.lorem.sentence() : null
          })
          itineraryCount++
        }
      }
    }
    results.itineraryItems = itineraryCount

    // ============================================
    // 5. SEED REVIEWS
    // ============================================
    let reviewCount = 0

    for (const place of createdPlaces.slice(0, 30)) {
      const numReviews = faker.number.int({ min: 2, max: 8 })
      const reviewers = randomItems(createdUsers, numReviews)

      for (const reviewer of reviewers) {
        await db.insert(schema.reviews).values({
          id: createId(),
          placeId: place.id,
          userId: reviewer.id,
          rating: faker.number.int({ min: 3, max: 5 }),
          content: faker.lorem.paragraph(),
          helpfulCount: faker.number.int({ min: 0, max: 50 }),
          isVerifiedVisit: faker.datatype.boolean()
        })
        reviewCount++
      }
    }
    results.reviews = reviewCount

    // ============================================
    // 6. SEED SAVED PLACES
    // ============================================
    let savedCount = 0

    for (const user of createdUsers.slice(0, 10)) {
      const placesToSave = randomItems(createdPlaces, faker.number.int({ min: 3, max: 10 }))

      for (const place of placesToSave) {
        await db.insert(schema.savedPlaces).values({
          id: createId(),
          userId: user.id,
          placeId: place.id,
          listName: faker.helpers.arrayElement(['Favorites', 'Want to Visit', 'Bucket List', 'Restaurants'])
        })
        savedCount++
      }
    }
    results.savedPlaces = savedCount

    // ============================================
    // 7. SEED TRAVEL GROUPS
    // ============================================
    const createdGroups: { id: string; createdBy: string }[] = []

    for (const trip of createdTrips.slice(0, 10)) {
      const [group] = await db.insert(schema.travelGroups).values({
        id: createId(),
        tripId: trip.id,
        name: `${trip.title} Group`,
        description: faker.lorem.sentence(),
        createdBy: trip.userId
      }).returning()
      createdGroups.push({ id: group.id, createdBy: trip.userId })
    }
    results.travelGroups = createdGroups.length

    // ============================================
    // 8. SEED GROUP MEMBERS
    // ============================================
    let memberCount = 0

    for (const group of createdGroups) {
      await db.insert(schema.groupMembers).values({
        id: createId(),
        groupId: group.id,
        userId: group.createdBy,
        role: 'admin'
      })
      memberCount++

      const otherUsers = createdUsers.filter(u => u.id !== group.createdBy)
      const members = randomItems(otherUsers, faker.number.int({ min: 2, max: 5 }))

      for (const member of members) {
        await db.insert(schema.groupMembers).values({
          id: createId(),
          groupId: group.id,
          userId: member.id,
          role: faker.helpers.arrayElement(['editor', 'viewer'] as const)
        })
        memberCount++
      }
    }
    results.groupMembers = memberCount

    // ============================================
    // 9. SEED GROUP ANNOUNCEMENTS
    // ============================================
    let announcementCount = 0

    for (const group of createdGroups) {
      const numAnnouncements = faker.number.int({ min: 1, max: 3 })

      for (let i = 0; i < numAnnouncements; i++) {
        await db.insert(schema.groupAnnouncements).values({
          id: createId(),
          groupId: group.id,
          userId: group.createdBy,
          content: faker.lorem.paragraph()
        })
        announcementCount++
      }
    }
    results.groupAnnouncements = announcementCount

    // ============================================
    // 10. SEED ACTIVITY VOTES
    // ============================================
    let voteCount = 0

    for (const group of createdGroups.slice(0, 5)) {
      const [vote] = await db.insert(schema.activityVotes).values({
        id: createId(),
        groupId: group.id,
        userId: group.createdBy,
        title: faker.helpers.arrayElement(['Where to eat?', 'Which activity?', 'Best day trip?', 'Evening plans?']),
        description: faker.lorem.sentence(),
        closesAt: faker.date.future()
      }).returning()
      voteCount++

      const numOptions = faker.number.int({ min: 2, max: 4 })
      for (let i = 0; i < numOptions; i++) {
        await db.insert(schema.activityVoteOptions).values({
          id: createId(),
          voteId: vote.id,
          title: faker.lorem.words(3),
          description: faker.lorem.sentence(),
          voteCount: faker.number.int({ min: 0, max: 5 })
        })
      }
    }
    results.activityVotes = voteCount

    // ============================================
    // 11. SEED EXPENSES
    // ============================================
    let expenseCount = 0

    for (const trip of createdTrips.slice(0, 15)) {
      const numExpenses = faker.number.int({ min: 3, max: 8 })

      for (let i = 0; i < numExpenses; i++) {
        await db.insert(schema.expenses).values({
          id: createId(),
          tripId: trip.id,
          userId: trip.userId,
          category: faker.helpers.arrayElement(EXPENSE_CATEGORIES),
          amount: faker.number.int({ min: 10, max: 500 }) * 100,
          currency: 'USD',
          description: faker.commerce.productName(),
          date: randomDate(new Date(trip.startDate), new Date(trip.endDate))
        })
        expenseCount++
      }
    }
    results.expenses = expenseCount

    // ============================================
    // 12. SEED SHARED EXPENSES
    // ============================================
    let sharedExpenseCount = 0

    for (const group of createdGroups.slice(0, 5)) {
      const numShared = faker.number.int({ min: 2, max: 5 })

      for (let i = 0; i < numShared; i++) {
        const [expense] = await db.insert(schema.sharedExpenses).values({
          id: createId(),
          groupId: group.id,
          paidBy: group.createdBy,
          category: faker.helpers.arrayElement(EXPENSE_CATEGORIES),
          amount: faker.number.int({ min: 50, max: 300 }) * 100,
          currency: 'USD',
          description: faker.commerce.productName(),
          splitMethod: 'equal',
          date: faker.date.recent()
        }).returning()
        sharedExpenseCount++

        const members = await db.select().from(schema.groupMembers).where(
          eq(schema.groupMembers.groupId, group.id)
        )
        const shareAmount = Math.floor(expense.amount! / members.length)

        for (const member of members) {
          await db.insert(schema.expenseParticipants).values({
            id: createId(),
            expenseId: expense.id,
            userId: member.userId,
            shareAmount,
            isSettled: faker.datatype.boolean()
          })
        }
      }
    }
    results.sharedExpenses = sharedExpenseCount

    // ============================================
    // 13. SEED BUDGETS
    // ============================================
    let budgetCount = 0

    for (const trip of createdTrips.slice(0, 10)) {
      const categories = randomItems([...EXPENSE_CATEGORIES], faker.number.int({ min: 3, max: 6 }))

      for (const category of categories) {
        await db.insert(schema.budgets).values({
          id: createId(),
          tripId: trip.id,
          userId: trip.userId,
          category,
          amount: faker.number.int({ min: 100, max: 2000 }) * 100,
          currency: 'USD'
        })
        budgetCount++
      }
    }
    results.budgets = budgetCount

    // ============================================
    // 14. SEED TRAVEL PARTNER PROFILES
    // ============================================
    let profileCount = 0

    for (const user of createdUsers.slice(0, 12)) {
      await db.insert(schema.travelPartnerProfiles).values({
        id: createId(),
        userId: user.id,
        bio: faker.lorem.paragraph(),
        travelStyle: faker.helpers.arrayElement(TRAVEL_STYLES),
        interests: randomItems(INTERESTS, faker.number.int({ min: 3, max: 6 })),
        languages: randomItems(LANGUAGES, faker.number.int({ min: 1, max: 4 })),
        countriesVisited: randomItems(DESTINATIONS.map(d => d.country), faker.number.int({ min: 2, max: 8 })),
        preferredDestinations: randomItems(DESTINATIONS.map(d => d.city), faker.number.int({ min: 2, max: 5 })),
        ageRangeMin: faker.number.int({ min: 18, max: 30 }),
        ageRangeMax: faker.number.int({ min: 35, max: 60 }),
        isVerified: faker.datatype.boolean(),
        responseRate: faker.number.float({ min: 0.5, max: 1, fractionDigits: 2 }),
        totalTrips: faker.number.int({ min: 1, max: 20 }),
        isActive: true
      })
      profileCount++
    }
    results.travelPartnerProfiles = profileCount

    // ============================================
    // 15. SEED PARTNER SEARCHES
    // ============================================
    const createdSearches: { id: string; userId: string }[] = []

    for (const user of createdUsers.slice(0, 8)) {
      const dest = faker.helpers.arrayElement(DESTINATIONS)
      const startDate = faker.date.future()
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + faker.number.int({ min: 5, max: 14 }))

      const [search] = await db.insert(schema.partnerSearches).values({
        id: createId(),
        userId: user.id,
        destination: `${dest.city}, ${dest.country}`,
        startDate,
        endDate,
        description: faker.lorem.paragraph(),
        travelStyle: faker.helpers.arrayElement(TRAVEL_STYLES),
        isActive: true
      }).returning()
      createdSearches.push({ id: search.id, userId: user.id })
    }
    results.partnerSearches = createdSearches.length

    // ============================================
    // 16. SEED PARTNER REQUESTS
    // ============================================
    let requestCount = 0

    for (const search of createdSearches.slice(0, 5)) {
      const potentialPartners = createdUsers.filter(u => u.id !== search.userId)
      const requesters = randomItems(potentialPartners, faker.number.int({ min: 1, max: 3 }))

      for (const requester of requesters) {
        await db.insert(schema.partnerRequests).values({
          id: createId(),
          fromUserId: requester.id,
          toUserId: search.userId,
          searchId: search.id,
          message: faker.lorem.paragraph(),
          status: faker.helpers.arrayElement(['pending', 'accepted', 'declined'] as const)
        })
        requestCount++
      }
    }
    results.partnerRequests = requestCount

    // ============================================
    // 17. SEED PARTNER REVIEWS
    // ============================================
    let partnerReviewCount = 0

    for (let i = 0; i < 10; i++) {
      const [reviewer, reviewed] = randomItems(createdUsers, 2)

      await db.insert(schema.partnerReviews).values({
        id: createId(),
        reviewerId: reviewer.id,
        reviewedUserId: reviewed.id,
        rating: faker.number.int({ min: 3, max: 5 }),
        content: faker.lorem.paragraph(),
        wouldTravelAgain: faker.datatype.boolean()
      })
      partnerReviewCount++
    }
    results.partnerReviews = partnerReviewCount

    // ============================================
    // 18. SEED INSURANCE PLANS
    // ============================================
    const createdPlans: { id: string }[] = []
    const insuranceProviders = ['TravelGuard', 'WorldNomads', 'Allianz', 'SafeTrip']

    for (const provider of insuranceProviders) {
      for (const type of INSURANCE_TYPES) {
        const [plan] = await db.insert(schema.insurancePlans).values({
          id: createId(),
          providerId: createId(),
          providerName: provider,
          name: `${provider} ${type.charAt(0).toUpperCase() + type.slice(1)} Plan`,
          description: faker.lorem.paragraph(),
          type,
          coverageAmount: faker.number.int({ min: 50000, max: 500000 }),
          dailyRate: faker.number.int({ min: 5, max: 50 }) * 100,
          currency: 'USD',
          coverageDetails: {
            medical: '$100,000',
            tripCancellation: '$5,000',
            baggage: '$2,000'
          },
          exclusions: ['Pre-existing conditions', 'Extreme sports', 'War zones'],
          isActive: true
        }).returning()
        createdPlans.push({ id: plan.id })
      }
    }
    results.insurancePlans = createdPlans.length

    // ============================================
    // 19. SEED USER INSURANCES
    // ============================================
    const createdInsurances: { id: string }[] = []

    for (const trip of createdTrips.slice(0, 8)) {
      const plan = faker.helpers.arrayElement(createdPlans)
      const days = Math.ceil(
        (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24)
      ) + 1

      const [insurance] = await db.insert(schema.userInsurances).values({
        id: createId(),
        userId: trip.userId,
        tripId: trip.id,
        planId: plan.id,
        policyNumber: `POL-${faker.string.alphanumeric(10).toUpperCase()}`,
        startDate: trip.startDate,
        endDate: trip.endDate,
        totalPremium: days * faker.number.int({ min: 10, max: 30 }) * 100,
        currency: 'USD',
        emergencyContact: {
          name: faker.person.fullName(),
          phone: faker.phone.number(),
          relationship: faker.helpers.arrayElement(['Spouse', 'Parent', 'Sibling', 'Friend'])
        },
        isActive: true
      }).returning()
      createdInsurances.push({ id: insurance.id })
    }
    results.userInsurances = createdInsurances.length

    // ============================================
    // 20. SEED INSURANCE CLAIMS
    // ============================================
    let claimCount = 0

    for (const insurance of createdInsurances.slice(0, 3)) {
      await db.insert(schema.insuranceClaims).values({
        id: createId(),
        insuranceId: insurance.id,
        claimNumber: `CLM-${faker.string.alphanumeric(8).toUpperCase()}`,
        incidentDate: faker.date.recent().toISOString().split('T')[0],
        incidentType: faker.helpers.arrayElement(['Medical Emergency', 'Lost Baggage', 'Flight Delay', 'Trip Cancellation']),
        description: faker.lorem.paragraph(),
        claimAmount: faker.number.int({ min: 100, max: 5000 }) * 100,
        currency: 'USD',
        status: faker.helpers.arrayElement(['submitted', 'under_review', 'approved'] as const)
      })
      claimCount++
    }
    results.insuranceClaims = claimCount

    return {
      success: true,
      message: 'Database seeded successfully',
      results,
      credentials: {
        email: 'demo@tripbuddy.com',
        password: 'Password123',
        note: 'All users have the same password: Password123'
      }
    }

  } catch (error) {
    console.error('Seed error:', error)
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Failed to seed database'
    })
  }
})
