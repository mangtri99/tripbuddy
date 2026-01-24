<script setup lang="ts">
import type { Trip } from "~/composables/useTrips";

const props = defineProps<{
  trip: Trip;
}>();

type BadgeColor =
  | "error"
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "warning"
  | "neutral";

const statusColors: Record<Trip["status"], BadgeColor> = {
  draft: "neutral",
  planned: "info",
  ongoing: "success",
  completed: "primary",
  cancelled: "error",
};

const statusLabels: Record<Trip["status"], string> = {
  draft: "Draft",
  planned: "Planned",
  ongoing: "Ongoing",
  completed: "Completed",
  cancelled: "Cancelled",
};

const formattedDates = computed(() => {
  if (!props.trip.startDate) return null;
  const start = new Date(props.trip.startDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  if (!props.trip.endDate) return start;
  const end = new Date(props.trip.endDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${start} - ${end}`;
});
</script>

<template>
  <NuxtLink :to="`/trips/${trip.id}`">
    <UCard
      class="hover:ring-2 hover:ring-primary/50 transition-all cursor-pointer"
    >
      <template #header>
        <div class="flex items-start justify-between gap-2">
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-lg truncate">{{ trip.title }}</h3>
            <div class="flex items-center gap-1.5 text-muted mt-1">
              <UIcon name="i-lucide-map-pin" class="w-4 h-4 shrink-0" />
              <span class="truncate">{{ trip.destination }}</span>
            </div>
          </div>
          <UBadge :color="statusColors[trip.status]" variant="subtle" size="sm">
            {{ statusLabels[trip.status] }}
          </UBadge>
        </div>
      </template>

      <p v-if="trip.description" class="text-sm text-muted line-clamp-2">
        {{ trip.description }}
      </p>
      <p v-else class="text-sm text-muted italic">No description</p>

      <template #footer>
        <div class="flex items-center justify-between text-sm">
          <div
            v-if="formattedDates"
            class="flex items-center gap-1.5 text-muted"
          >
            <UIcon name="i-lucide-calendar" class="w-4 h-4" />
            <span>{{ formattedDates }}</span>
          </div>
          <div v-else class="text-muted italic">No dates set</div>
          <div v-if="trip.budget" class="flex items-center gap-1.5 text-muted">
            <UIcon name="i-lucide-wallet" class="w-4 h-4" />
            <span>{{ trip.currency }} {{ trip.budget.toLocaleString() }}</span>
          </div>
        </div>
      </template>
    </UCard>
  </NuxtLink>
</template>
