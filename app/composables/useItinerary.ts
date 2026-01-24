import type { ItineraryItem } from './useTrips'

export interface CreateItineraryItemData {
  dayNumber: number
  orderIndex: number
  type: ItineraryItem['type']
  title: string
  description?: string
  location?: string
  startTime?: string
  endTime?: string
  duration?: number
  cost?: number
  currency?: string
  notes?: string
  links?: string[]
  placeId?: string
}

export interface UpdateItineraryItemData extends Partial<CreateItineraryItemData> {}

export interface ReorderItem {
  id: string
  dayNumber: number
  orderIndex: number
}

export function useItinerary() {
  const toast = useToast()
  const isLoading = ref(false)
  const items = ref<ItineraryItem[]>([])

  async function fetchItems(tripId: string) {
    isLoading.value = true
    try {
      const response = await $fetch<{ items: ItineraryItem[] }>(`/api/trips/${tripId}/itinerary`)
      items.value = response.items
      return response.items
    } catch (error: unknown) {
      const fetchError = error as { data?: { message?: string } }
      toast.add({
        title: 'Error',
        description: fetchError.data?.message || 'Failed to load itinerary',
        color: 'error'
      })
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function addItem(tripId: string, data: CreateItineraryItemData) {
    isLoading.value = true
    try {
      const response = await $fetch<{ item: ItineraryItem }>(`/api/trips/${tripId}/itinerary`, {
        method: 'POST',
        body: data
      })
      items.value.push(response.item)
      items.value.sort((a, b) => {
        if (a.dayNumber !== b.dayNumber) return a.dayNumber - b.dayNumber
        return a.orderIndex - b.orderIndex
      })
      toast.add({
        title: 'Activity added',
        description: 'Your activity has been added to the itinerary.',
        color: 'success'
      })
      return response.item
    } catch (error: unknown) {
      const fetchError = error as { data?: { message?: string } }
      toast.add({
        title: 'Error',
        description: fetchError.data?.message || 'Failed to add activity',
        color: 'error'
      })
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function updateItem(tripId: string, itemId: string, data: UpdateItineraryItemData) {
    isLoading.value = true
    try {
      const response = await $fetch<{ item: ItineraryItem }>(`/api/trips/${tripId}/itinerary/${itemId}`, {
        method: 'PATCH',
        body: data
      })
      const index = items.value.findIndex(i => i.id === itemId)
      if (index !== -1) {
        items.value[index] = response.item
      }
      toast.add({
        title: 'Activity updated',
        description: 'Your activity has been updated.',
        color: 'success'
      })
      return response.item
    } catch (error: unknown) {
      const fetchError = error as { data?: { message?: string } }
      toast.add({
        title: 'Error',
        description: fetchError.data?.message || 'Failed to update activity',
        color: 'error'
      })
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function deleteItem(tripId: string, itemId: string) {
    isLoading.value = true
    try {
      await $fetch<{ item: ItineraryItem }>(`/api/trips/${tripId}/itinerary/${itemId}`, { method: 'delete' })
      items.value = items.value.filter(i => i.id !== itemId)
      toast.add({
        title: 'Activity removed',
        description: 'The activity has been removed from your itinerary.',
        color: 'success'
      })
    } catch (error: unknown) {
      const fetchError = error as { data?: { message?: string } }
      toast.add({
        title: 'Error',
        description: fetchError.data?.message || 'Failed to remove activity',
        color: 'error'
      })
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function reorderItems(tripId: string, reorderData: ReorderItem[]) {
    isLoading.value = true
    try {
      const response = await $fetch<{ items: ItineraryItem[] }>(`/api/trips/${tripId}/itinerary/reorder`, {
        method: 'PATCH',
        body: { items: reorderData }
      })
      items.value = response.items
      return response.items
    } catch (error: unknown) {
      const fetchError = error as { data?: { message?: string } }
      toast.add({
        title: 'Error',
        description: fetchError.data?.message || 'Failed to reorder items',
        color: 'error'
      })
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // Helper to group items by day
  const itemsByDay = computed(() => {
    const grouped: Record<number, ItineraryItem[]> = {}
    for (const item of items.value) {
      if (!grouped[item.dayNumber]) {
        grouped[item.dayNumber] = []
      }
      grouped[item.dayNumber]!.push(item)
    }
    return grouped
  })

  // Get the next available order index for a day
  function getNextOrderIndex(dayNumber: number): number {
    const dayItems = itemsByDay.value[dayNumber] || []
    if (dayItems.length === 0) return 0
    return Math.max(...dayItems.map(i => i.orderIndex)) + 1
  }

  return {
    items,
    itemsByDay,
    isLoading: readonly(isLoading),
    fetchItems,
    addItem,
    updateItem,
    deleteItem,
    reorderItems,
    getNextOrderIndex
  }
}
