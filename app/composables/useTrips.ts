export interface Trip {
  id: string
  title: string
  description: string | null
  destination: string
  coverImageUrl: string | null
  startDate: string | null
  endDate: string | null
  status: 'draft' | 'planned' | 'ongoing' | 'completed' | 'cancelled'
  visibility: 'private' | 'group' | 'public'
  budget: number | null
  currency: string
  createdAt: string
  updatedAt: string
}

export interface TripWithItinerary extends Trip {
  itineraryItems: ItineraryItem[]
}

export interface ItineraryItem {
  id: string
  tripId: string
  dayNumber: number
  orderIndex: number
  type: 'activity' | 'accommodation' | 'transportation' | 'food' | 'other'
  title: string
  description: string | null
  location: string | null
  startTime: string | null
  endTime: string | null
  duration: number | null
  cost: number | null
  currency: string
  notes: string | null
  links: string[] | null
  placeId: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateTripData {
  title: string
  destination: string
  description?: string
  startDate?: string
  endDate?: string
  budget?: number
  currency?: string
  status?: Trip['status']
  visibility?: Trip['visibility']
  coverImageUrl?: string
}

export interface UpdateTripData extends Partial<CreateTripData> {}

export function useTrips() {
  const toast = useToast()
  const isLoading = ref(false)
  const trips = ref<Trip[]>([])
  const currentTrip = ref<TripWithItinerary | null>(null)

  async function fetchTrips(status?: Trip['status']) {
    isLoading.value = true
    try {
      const query = status ? `?status=${status}` : ''
      const response = await $fetch<{ trips: Trip[] }>(`/api/trips${query}`)
      trips.value = response.trips
      return response.trips
    } catch (error: unknown) {
      const fetchError = error as { data?: { message?: string } }
      toast.add({
        title: 'Error',
        description: fetchError.data?.message || 'Failed to load trips',
        color: 'error'
      })
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function fetchTrip(id: string) {
    isLoading.value = true
    try {
      const response = await $fetch<{ trip: TripWithItinerary }>(`/api/trips/${id}`)
      currentTrip.value = response.trip
      return response.trip
    } catch (error: unknown) {
      const fetchError = error as { data?: { message?: string } }
      toast.add({
        title: 'Error',
        description: fetchError.data?.message || 'Failed to load trip',
        color: 'error'
      })
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function createTrip(data: CreateTripData) {
    isLoading.value = true
    try {
      const response = await $fetch<{ trip: Trip }>('/api/trips', {
        method: 'POST',
        body: data
      })
      trips.value.unshift(response.trip)
      toast.add({
        title: 'Trip created',
        description: 'Your new trip has been created.',
        color: 'success'
      })
      return response.trip
    } catch (error: unknown) {
      const fetchError = error as { data?: { message?: string } }
      toast.add({
        title: 'Error',
        description: fetchError.data?.message || 'Failed to create trip',
        color: 'error'
      })
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function updateTrip(id: string, data: UpdateTripData) {
    isLoading.value = true
    try {
      const response = await $fetch<{ trip: Trip }>(`/api/trips/${id}`, {
        method: 'PATCH',
        body: data
      })
      const index = trips.value.findIndex(t => t.id === id)
      if (index !== -1) {
        trips.value[index] = response.trip
      }
      if (currentTrip.value?.id === id) {
        currentTrip.value = { ...currentTrip.value, ...response.trip }
      }
      toast.add({
        title: 'Trip updated',
        description: 'Your trip has been updated.',
        color: 'success'
      })
      return response.trip
    } catch (error: unknown) {
      const fetchError = error as { data?: { message?: string } }
      toast.add({
        title: 'Error',
        description: fetchError.data?.message || 'Failed to update trip',
        color: 'error'
      })
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function deleteTrip(id: string) {
    isLoading.value = true
    try {
      await $fetch(`/api/trips/${id}`, { method: 'DELETE' })
      trips.value = trips.value.filter(t => t.id !== id)
      if (currentTrip.value?.id === id) {
        currentTrip.value = null
      }
      toast.add({
        title: 'Trip deleted',
        description: 'Your trip has been deleted.',
        color: 'success'
      })
    } catch (error: unknown) {
      const fetchError = error as { data?: { message?: string } }
      toast.add({
        title: 'Error',
        description: fetchError.data?.message || 'Failed to delete trip',
        color: 'error'
      })
      throw error
    } finally {
      isLoading.value = false
    }
  }

  return {
    trips,
    currentTrip,
    isLoading: readonly(isLoading),
    fetchTrips,
    fetchTrip,
    createTrip,
    updateTrip,
    deleteTrip
  }
}
