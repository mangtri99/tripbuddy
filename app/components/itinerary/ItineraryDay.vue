<script setup lang="ts">
import type { ItineraryItem } from '~/composables/useTrips'

const props = defineProps<{
  dayNumber: number
  items: ItineraryItem[]
  tripStartDate?: string | null
}>()

const emit = defineEmits<{
  addItem: [dayNumber: number]
  editItem: [item: ItineraryItem]
  deleteItem: [item: ItineraryItem]
}>()

const dayDate = computed(() => {
  if (!props.tripStartDate) return null
  const start = new Date(props.tripStartDate)
  start.setDate(start.getDate() + props.dayNumber - 1)
  return start.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })
})

const sortedItems = computed(() => {
  return [...props.items].sort((a, b) => a.orderIndex - b.orderIndex)
})
</script>

<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold">
          {{ dayNumber }}
        </div>
        <div>
          <h3 class="font-semibold">Day {{ dayNumber }}</h3>
          <p v-if="dayDate" class="text-sm text-muted">{{ dayDate }}</p>
        </div>
      </div>
      <UButton
        size="sm"
        color="primary"
        variant="soft"
        icon="i-lucide-plus"
        @click="emit('addItem', dayNumber)"
      >
        Add
      </UButton>
    </div>

    <div v-if="sortedItems.length > 0" class="space-y-2 ml-5 pl-8 border-l-2 border-dashed">
      <ItineraryItem
        v-for="item in sortedItems"
        :key="item.id"
        :item="item"
        @edit="emit('editItem', item)"
        @delete="emit('deleteItem', item)"
      />
    </div>

    <div
      v-else
      class="ml-5 pl-8 border-l-2 border-dashed py-6 text-center text-muted"
    >
      <p class="text-sm">No activities planned for this day.</p>
      <UButton
        size="xs"
        color="primary"
        variant="link"
        class="mt-1"
        @click="emit('addItem', dayNumber)"
      >
        Add your first activity
      </UButton>
    </div>
  </div>
</template>
