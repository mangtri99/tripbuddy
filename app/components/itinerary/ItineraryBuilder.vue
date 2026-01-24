<script setup lang="ts">
import type { TripWithItinerary, ItineraryItem } from "~/composables/useTrips";
import type { CreateItineraryItemData } from "~/composables/useItinerary";

const props = defineProps<{
  trip: TripWithItinerary;
}>();

const {
  items,
  itemsByDay,
  isLoading,
  addItem,
  updateItem,
  deleteItem,
  getNextOrderIndex,
} = useItinerary();

const showItemModal = ref(false);
const editingItem = ref<ItineraryItem | null>(null);
const selectedDayNumber = ref(1);

// Initialize items from trip
onMounted(() => {
  items.value = props.trip.itineraryItems || [];
});

// Watch for trip changes
watch(
  () => props.trip.itineraryItems,
  (newItems) => {
    items.value = newItems || [];
  },
  { deep: true },
);

// Calculate number of days in trip
const tripDays = computed(() => {
  if (!props.trip.startDate || !props.trip.endDate) return 1;
  const start = new Date(props.trip.startDate);
  const end = new Date(props.trip.endDate);
  return Math.max(
    1,
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1,
  );
});

// Generate array of day numbers
const dayNumbers = computed(() => {
  // Get all days that have items
  const daysWithItems = Object.keys(itemsByDay.value).map(Number);
  // Generate days from 1 to tripDays, plus any extra days with items
  const maxDay = Math.max(tripDays.value, ...daysWithItems);
  return Array.from({ length: maxDay }, (_, i) => i + 1);
});

function openAddModal(dayNumber: number) {
  editingItem.value = null;
  selectedDayNumber.value = dayNumber;
  showItemModal.value = true;
}

function openEditModal(item: ItineraryItem) {
  editingItem.value = item;
  selectedDayNumber.value = item.dayNumber;
  showItemModal.value = true;
}

async function handleSubmit(data: CreateItineraryItemData) {
  try {
    if (editingItem.value) {
      await updateItem(props.trip.id, editingItem.value.id, data);
    } else {
      console.log(data);
      await addItem(props.trip.id, data);
    }
    showItemModal.value = false;
    editingItem.value = null;
  } catch {
    // Error handled by composable
  }
}

async function handleDelete(item: ItineraryItem) {
  if (!confirm("Are you sure you want to delete this activity?")) return;
  await deleteItem(props.trip.id, item.id);
}

function addNewDay() {
  const newDayNumber = dayNumbers.value.length + 1;
  openAddModal(newDayNumber);
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold">Itinerary</h2>
      <UButton
        color="primary"
        variant="soft"
        icon="i-lucide-plus"
        @click="addNewDay"
      >
        Add Day
      </UButton>
    </div>

    <div v-if="dayNumbers.length > 0" class="space-y-8">
      <ItineraryDay
        v-for="dayNumber in dayNumbers"
        :key="dayNumber"
        :day-number="dayNumber"
        :items="itemsByDay[dayNumber] || []"
        :trip-start-date="trip.startDate"
        @add-item="openAddModal"
        @edit-item="openEditModal"
        @delete-item="handleDelete"
      />
    </div>

    <div v-else class="text-center py-12 border-2 border-dashed rounded-lg">
      <UIcon
        name="i-lucide-calendar-plus"
        class="w-12 h-12 text-muted mx-auto mb-3"
      />
      <h3 class="font-medium mb-1">No itinerary yet</h3>
      <p class="text-sm text-muted mb-4">
        Start planning your trip by adding activities
      </p>
      <UButton color="primary" icon="i-lucide-plus" @click="openAddModal(1)">
        Add First Activity
      </UButton>
    </div>

    <UModal v-model:open="showItemModal">
      <template #content>
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">
                {{ editingItem ? "Edit Activity" : "Add Activity" }}
              </h3>
              <UButton
                color="neutral"
                variant="ghost"
                icon="i-lucide-x"
                size="sm"
                square
                @click="showItemModal = false"
              />
            </div>
          </template>

          <ItineraryItemForm
            :item="editingItem || undefined"
            :day-number="selectedDayNumber"
            :order-index="
              editingItem?.orderIndex ?? getNextOrderIndex(selectedDayNumber)
            "
            :loading="isLoading"
            @submit="handleSubmit"
            @cancel="showItemModal = false"
          />
        </UCard>
      </template>
    </UModal>
  </div>
</template>
