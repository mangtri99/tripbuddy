<script setup lang="ts">
import type { CreateTripData } from '~/composables/useTrips'

definePageMeta({
  middleware: 'auth'
})

const router = useRouter()
const { isLoading, createTrip } = useTrips()
const { groups, fetchGroups } = useGroups()

onMounted(async () => {
  await fetchGroups()
})

async function handleSubmit(data: CreateTripData) {
  try {
    const trip = await createTrip(data)
    await router.push(`/trips/${trip.id}`)
  } catch {
    // Error handled by composable
  }
}

function handleCancel() {
  router.push('/trips')
}
</script>

<template>
  <UContainer class="py-8">
    <div class="max-w-2xl mx-auto">
      <div class="mb-8">
        <UButton
          to="/trips"
          color="neutral"
          variant="ghost"
          icon="i-lucide-arrow-left"
          class="mb-4"
        >
          Back to Trips
        </UButton>
        <h1 class="text-3xl font-bold">Create New Trip</h1>
        <p class="text-muted mt-1">Plan your next adventure</p>
      </div>

      <UCard>
        <TripForm
          :groups="groups"
          :loading="isLoading"
          @submit="handleSubmit"
          @cancel="handleCancel"
        />
      </UCard>
    </div>
  </UContainer>
</template>
