<script setup lang="ts">
import type { CreateTripData } from "~/composables/useTrips";

definePageMeta({
  middleware: "auth",
});

const route = useRoute();
const router = useRouter();
const { currentTrip, isLoading, fetchTrip, updateTrip, deleteTrip } =
  useTrips();

const tripId = computed(() => route.params.id as string);
const showEditModal = ref(false);
const isDeleting = ref(false);

onMounted(async () => {
  await fetchTrip(tripId.value);
});

async function handleEditSubmit(data: CreateTripData) {
  try {
    await updateTrip(tripId.value, data);
    await fetchTrip(tripId.value);
    showEditModal.value = false;
  } catch {
    // Error handled by composable
  }
}

async function handleDelete() {
  if (
    !confirm(
      "Are you sure you want to delete this trip? This action cannot be undone.",
    )
  ) {
    return;
  }

  isDeleting.value = true;
  try {
    await deleteTrip(tripId.value);
    await router.push("/trips");
  } catch {
    // Error handled by composable
  } finally {
    isDeleting.value = false;
  }
}
</script>

<template>
  <UContainer class="py-8">
    <div class="max-w-4xl mx-auto">
      <UButton
        to="/trips"
        color="neutral"
        variant="ghost"
        icon="i-lucide-arrow-left"
        class="mb-6"
      >
        Back to Trips
      </UButton>

      <div v-if="isLoading && !currentTrip" class="space-y-6">
        <div class="animate-pulse space-y-4">
          <div class="h-8 bg-muted/30 rounded w-1/2" />
          <div class="h-4 bg-muted/30 rounded w-1/3" />
          <div class="h-4 bg-muted/30 rounded w-full" />
        </div>
      </div>

      <div v-else-if="currentTrip" class="space-y-8">
        <TripHeader
          :trip="currentTrip"
          @edit="showEditModal = true"
          @delete="handleDelete"
        />

        <UDivider />

        <ItineraryBuilder :trip="currentTrip" />
      </div>

      <div v-else class="text-center py-16">
        <UIcon
          name="i-lucide-alert-circle"
          class="w-16 h-16 text-muted mx-auto mb-4"
        />
        <h2 class="text-xl font-semibold mb-2">Trip not found</h2>
        <p class="text-muted mb-6">
          The trip you're looking for doesn't exist or you don't have access to
          it.
        </p>
        <UButton to="/trips" color="primary"> Back to Trips </UButton>
      </div>

      <UModal v-model:open="showEditModal">
        <template #content>
          <UCard class="w-full max-w-2xl">
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold">Edit Trip</h3>
                <UButton
                  color="neutral"
                  variant="ghost"
                  icon="i-lucide-x"
                  size="sm"
                  square
                  @click="showEditModal = false"
                />
              </div>
            </template>

            <TripForm
              v-if="currentTrip"
              :trip="currentTrip"
              :loading="isLoading"
              @submit="handleEditSubmit"
              @cancel="showEditModal = false"
            />
          </UCard>
        </template>
      </UModal>
    </div>
  </UContainer>
</template>
