<script setup lang="ts">
import type { ItineraryItem } from '~/composables/useTrips'
import type { CreateItineraryItemData } from '~/composables/useItinerary'

const props = defineProps<{
  item?: ItineraryItem
  dayNumber: number
  orderIndex: number
  loading?: boolean
}>()

const emit = defineEmits<{
  submit: [data: CreateItineraryItemData]
  cancel: []
}>()

const form = reactive<CreateItineraryItemData>({
  dayNumber: props.item?.dayNumber || props.dayNumber,
  orderIndex: props.item?.orderIndex || props.orderIndex,
  type: props.item?.type || 'activity',
  title: props.item?.title || '',
  description: props.item?.description || '',
  location: props.item?.location || '',
  startTime: props.item?.startTime || '',
  endTime: props.item?.endTime || '',
  duration: props.item?.duration || undefined,
  cost: props.item?.cost || undefined,
  currency: props.item?.currency || 'USD',
  notes: props.item?.notes || ''
})

const typeOptions = [
  { label: 'Activity', value: 'activity', icon: 'i-lucide-ticket' },
  { label: 'Accommodation', value: 'accommodation', icon: 'i-lucide-bed' },
  { label: 'Transportation', value: 'transportation', icon: 'i-lucide-car' },
  { label: 'Food', value: 'food', icon: 'i-lucide-utensils' },
  { label: 'Other', value: 'other', icon: 'i-lucide-circle-dot' }
]

const currencyOptions = [
  { label: 'USD', value: 'USD' },
  { label: 'EUR', value: 'EUR' },
  { label: 'GBP', value: 'GBP' },
  { label: 'JPY', value: 'JPY' },
  { label: 'IDR', value: 'IDR' }
]

function handleSubmit() {
  const data: CreateItineraryItemData = {
    dayNumber: form.dayNumber,
    orderIndex: form.orderIndex,
    type: form.type,
    title: form.title
  }

  if (form.description) data.description = form.description
  if (form.location) data.location = form.location
  if (form.startTime) data.startTime = form.startTime
  if (form.endTime) data.endTime = form.endTime
  if (form.duration) data.duration = form.duration
  if (form.cost) data.cost = form.cost
  if (form.currency) data.currency = form.currency
  if (form.notes) data.notes = form.notes

  emit('submit', data)
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <UFormField label="Activity Type" required>
      <USelect
        v-model="form.type"
        :items="typeOptions"
        value-key="value"
      />
    </UFormField>

    <UFormField label="Title" required>
      <UInput
        v-model="form.title"
        placeholder="What are you doing?"
        required
      />
    </UFormField>

    <UFormField label="Location">
      <UInput
        v-model="form.location"
        placeholder="Where is this happening?"
        icon="i-lucide-map-pin"
      />
    </UFormField>

    <div class="grid grid-cols-2 gap-4">
      <UFormField label="Start Time">
        <UInput
          v-model="form.startTime"
          type="time"
          icon="i-lucide-clock"
        />
      </UFormField>

      <UFormField label="End Time">
        <UInput
          v-model="form.endTime"
          type="time"
          icon="i-lucide-clock"
        />
      </UFormField>
    </div>

    <UFormField label="Description">
      <UTextarea
        v-model="form.description"
        placeholder="Add more details..."
        :rows="2"
      />
    </UFormField>

    <div class="grid grid-cols-2 gap-4">
      <UFormField label="Cost">
        <UInput
          v-model.number="form.cost"
          type="number"
          placeholder="0"
          icon="i-lucide-coins"
          min="0"
        />
      </UFormField>

      <UFormField label="Currency">
        <USelect
          v-model="form.currency"
          :items="currencyOptions"
          value-key="value"
        />
      </UFormField>
    </div>

    <UFormField label="Notes">
      <UTextarea
        v-model="form.notes"
        placeholder="Any additional notes..."
        :rows="2"
      />
    </UFormField>

    <div class="flex items-center justify-end gap-3 pt-4 border-t">
      <UButton
        type="button"
        color="neutral"
        variant="ghost"
        @click="emit('cancel')"
      >
        Cancel
      </UButton>
      <UButton
        type="submit"
        color="primary"
        :loading="loading"
        icon="i-lucide-check"
      >
        {{ item ? 'Update' : 'Add Activity' }}
      </UButton>
    </div>
  </form>
</template>
