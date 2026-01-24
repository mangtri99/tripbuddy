<script setup lang="ts">
import type { ItineraryItem } from '~/composables/useTrips'

const props = defineProps<{
  item: ItineraryItem
}>()

const emit = defineEmits<{
  edit: []
  delete: []
}>()

const typeIcons: Record<ItineraryItem['type'], string> = {
  activity: 'i-lucide-ticket',
  accommodation: 'i-lucide-bed',
  transportation: 'i-lucide-car',
  food: 'i-lucide-utensils',
  other: 'i-lucide-circle-dot'
}

const typeColors: Record<ItineraryItem['type'], string> = {
  activity: 'primary',
  accommodation: 'info',
  transportation: 'warning',
  food: 'success',
  other: 'neutral'
}

const formattedTime = computed(() => {
  if (!props.item.startTime) return null
  if (!props.item.endTime) return props.item.startTime
  return `${props.item.startTime} - ${props.item.endTime}`
})
</script>

<template>
  <div class="group flex items-start gap-3 p-3 rounded-lg border bg-default hover:border-primary/50 transition-colors">
    <div
      class="p-2 rounded-lg shrink-0"
      :class="`bg-${typeColors[item.type]}/10`"
    >
      <UIcon
        :name="typeIcons[item.type]"
        class="w-5 h-5"
        :class="`text-${typeColors[item.type]}`"
      />
    </div>

    <div class="flex-1 min-w-0">
      <div class="flex items-start justify-between gap-2">
        <div class="flex-1 min-w-0">
          <h4 class="font-medium truncate">{{ item.title }}</h4>
          <div class="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted">
            <span v-if="formattedTime" class="flex items-center gap-1">
              <UIcon name="i-lucide-clock" class="w-3.5 h-3.5" />
              {{ formattedTime }}
            </span>
            <span v-if="item.location" class="flex items-center gap-1 truncate">
              <UIcon name="i-lucide-map-pin" class="w-3.5 h-3.5 shrink-0" />
              <span class="truncate">{{ item.location }}</span>
            </span>
            <span v-if="item.cost" class="flex items-center gap-1">
              <UIcon name="i-lucide-coins" class="w-3.5 h-3.5" />
              {{ item.currency }} {{ item.cost.toLocaleString() }}
            </span>
          </div>
        </div>

        <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-edit"
            size="xs"
            square
            @click="emit('edit')"
          />
          <UButton
            color="error"
            variant="ghost"
            icon="i-lucide-trash-2"
            size="xs"
            square
            @click="emit('delete')"
          />
        </div>
      </div>

      <p v-if="item.description" class="text-sm text-muted mt-2 line-clamp-2">
        {{ item.description }}
      </p>

      <p v-if="item.notes" class="text-xs text-muted mt-2 italic">
        {{ item.notes }}
      </p>
    </div>
  </div>
</template>
