<script setup lang="ts">
import type { Group, CreateGroupData } from '~/composables/useGroups'
import type { Trip } from '~/composables/useTrips'

const props = defineProps<{
  group?: Group
  trips?: Trip[]
  loading?: boolean
}>()

const emit = defineEmits<{
  submit: [data: CreateGroupData]
  cancel: []
}>()

const form = reactive<CreateGroupData>({
  name: props.group?.name || '',
  description: props.group?.description || '',
  tripId: props.group?.tripId || ''
})

const tripOptions = computed(() => {
  const options = [{ label: 'No trip linked', value: '' }]
  if (props.trips) {
    options.push(...props.trips.map(t => ({
      label: `${t.title} - ${t.destination}`,
      value: t.id
    })))
  }
  return options
})

function handleSubmit() {
  const data: CreateGroupData = {
    name: form.name
  }

  if (form.description) data.description = form.description
  if (form.tripId) data.tripId = form.tripId

  emit('submit', data)
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div class="space-y-4">
      <UFormField label="Group Name" required>
        <UInput
          v-model="form.name"
          placeholder="My Travel Group"
          size="lg"
          required
        />
      </UFormField>

      <UFormField label="Description">
        <UTextarea
          v-model="form.description"
          placeholder="Describe your travel group..."
          :rows="3"
        />
      </UFormField>

      <UFormField v-if="trips && trips.length > 0" label="Link to Trip">
        <USelect
          v-model="form.tripId"
          :items="tripOptions"
          value-key="value"
        />
      </UFormField>
    </div>

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
        color="success"
        :loading="loading"
        icon="i-lucide-save"
      >
        {{ group ? 'Update Group' : 'Create Group' }}
      </UButton>
    </div>
  </form>
</template>
