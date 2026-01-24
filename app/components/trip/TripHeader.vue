<script setup lang="ts">
import type { Trip } from "~/composables/useTrips";

const props = defineProps<{
  trip: Trip;
}>();

const emit = defineEmits<{
  edit: [];
  delete: [];
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
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  if (!props.trip.endDate) return start;
  const end = new Date(props.trip.endDate).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${start} - ${end}`;
});

const tripDuration = computed(() => {
  if (!props.trip.startDate || !props.trip.endDate) return null;
  const start = new Date(props.trip.startDate);
  const end = new Date(props.trip.endDate);
  const days =
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return `${days} day${days > 1 ? "s" : ""}`;
});
</script>

<template>
  <div class="space-y-4">
    <div
      class="flex items-start justify-between flex-col md:flex-row gap-0 md:gap-4"
    >
      <div class="flex-1">
        <div class="flex items-center gap-3 mb-2">
          <h1 class="text-3xl font-bold">{{ trip.title }}</h1>
          <UBadge :color="statusColors[trip.status]" variant="subtle">
            {{ statusLabels[trip.status] }}
          </UBadge>
        </div>
        <div class="flex items-center gap-1.5 text-lg text-muted">
          <UIcon name="i-lucide-map-pin" class="w-5 h-5" />
          <span>{{ trip.destination }}</span>
        </div>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-6 text-sm text-muted">
      <div v-if="formattedDates" class="flex items-center gap-2">
        <UIcon name="i-lucide-calendar" class="w-4 h-4" />
        <span>{{ formattedDates }}</span>
        <span
          v-if="tripDuration"
          class="text-xs bg-muted/20 px-2 py-0.5 rounded"
        >
          {{ tripDuration }}
        </span>
      </div>
      <div v-if="trip.budget" class="flex items-center gap-2">
        <UIcon name="i-lucide-wallet" class="w-4 h-4" />
        <span>{{ trip.currency }} {{ trip.budget.toLocaleString() }}</span>
      </div>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-eye" class="w-4 h-4" />
        <span class="capitalize">{{ trip.visibility }}</span>
      </div>
    </div>

    <p v-if="trip.description" class="text-muted mt-4">
      {{ trip.description }}
    </p>

    <div class="flex items-center justify-end md:justify-start w-full gap-2">
      <UButton
        color="neutral"
        variant="ghost"
        icon="i-lucide-edit"
        @click="emit('edit')"
      >
        Edit
      </UButton>
      <UButton
        color="error"
        variant="ghost"
        icon="i-lucide-trash-2"
        @click="emit('delete')"
      >
        Delete
      </UButton>
    </div>
  </div>
</template>
