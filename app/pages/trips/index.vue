<script setup lang="ts">
import type { Trip } from "~/composables/useTrips";

definePageMeta({
  middleware: "auth",
});

const { trips, isLoading, fetchTrips } = useTrips();

const statusFilter = ref<Trip["status"] | "all">("all");

const statusOptions = [
  { label: "All Trips", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Planned", value: "planned" },
  { label: "Ongoing", value: "ongoing" },
  { label: "Completed", value: "completed" },
];

const filteredTrips = computed(() => {
  if (statusFilter.value === "all") {
    return trips.value.filter((t) => t.status !== "cancelled");
  }
  return trips.value.filter((t) => t.status === statusFilter.value);
});

onMounted(() => {
  fetchTrips();
});

watch(statusFilter, (status) => {
  if (status === "all") {
    fetchTrips();
  } else {
    fetchTrips(status);
  }
});
</script>

<template>
  <UContainer class="py-8">
    <div class="max-w-6xl mx-auto">
      <div
        class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 class="text-3xl font-bold">My Trips</h1>
          <p class="text-muted mt-1">Plan and manage your adventures</p>
        </div>
        <UButton to="/trips/new" color="primary" icon="i-lucide-plus" size="lg">
          New Trip
        </UButton>
      </div>

      <div class="flex items-center gap-2 mb-6">
        <USelect
          v-model="statusFilter"
          :items="statusOptions"
          value-key="value"
          class="w-40"
        />
      </div>

      <div v-if="isLoading" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <UCard v-for="i in 6" :key="i" class="animate-pulse">
          <template #header>
            <div class="space-y-2">
              <div class="h-5 bg-muted/30 rounded w-3/4" />
              <div class="h-4 bg-muted/30 rounded w-1/2" />
            </div>
          </template>
          <div class="h-12 bg-muted/30 rounded" />
          <template #footer>
            <div class="h-4 bg-muted/30 rounded w-full" />
          </template>
        </UCard>
      </div>

      <div
        v-else-if="filteredTrips.length > 0"
        class="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        <TripCard v-for="trip in filteredTrips" :key="trip.id" :trip="trip" />
      </div>

      <div v-else class="text-center py-16 border-2 border-dashed rounded-lg">
        <UIcon
          name="i-lucide-plane"
          class="w-16 h-16 text-muted mx-auto mb-4"
        />
        <h2 class="text-xl font-semibold mb-2">No trips yet</h2>
        <p class="text-muted mb-6">Start planning your next adventure!</p>
        <UButton to="/trips/new" color="primary" icon="i-lucide-plus" size="lg">
          Create Your First Trip
        </UButton>
      </div>
    </div>
  </UContainer>
</template>
