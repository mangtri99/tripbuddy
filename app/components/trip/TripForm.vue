<script setup lang="ts">
import type { Trip, CreateTripData } from "~/composables/useTrips";
import type { GroupListItem } from "~/composables/useGroups";
import {
  TRIP_STATUS,
  TRIP_VISIBILITY,
  TRIP_CURRENCIES,
} from "#shared/utils/constant";

const props = defineProps<{
  trip?: Trip;
  groups?: GroupListItem[];
  loading?: boolean;
}>();

const emit = defineEmits<{
  submit: [data: CreateTripData];
  cancel: [];
}>();

const form = reactive<CreateTripData & { groupId: string }>({
  title: props.trip?.title || "",
  destination: props.trip?.destination || "",
  description: props.trip?.description || "",
  startDate: props.trip?.startDate || "",
  endDate: props.trip?.endDate || "",
  budget: props.trip?.budget || undefined,
  currency: props.trip?.currency || "USD",
  status: props.trip?.status || "draft",
  visibility: props.trip?.visibility || "private",
  groupId: props.trip?.groupId || "",
});

const groupOptions = computed(() => {
  const options = [{ label: "Personal trip (no group)", value: "" }];
  if (props.groups) {
    options.push(
      ...props.groups.map((g) => ({
        label: g.name,
        value: g.id,
      }))
    );
  }
  return options;
});

function handleSubmit() {
  const data: CreateTripData = {
    title: form.title,
    destination: form.destination,
  };

  if (form.description) data.description = form.description;
  if (form.startDate) data.startDate = form.startDate;
  if (form.endDate) data.endDate = form.endDate;
  if (form.budget) data.budget = form.budget;
  if (form.currency) data.currency = form.currency;
  if (form.status) data.status = form.status;
  if (form.visibility) data.visibility = form.visibility;
  if (form.groupId) data.groupId = form.groupId;

  emit("submit", data);
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div class="space-y-4">
      <UFormField label="Trip Title" required>
        <UInput
          v-model="form.title"
          placeholder="My Amazing Trip"
          size="lg"
          required
        />
      </UFormField>

      <UFormField label="Destination" required>
        <UInput
          v-model="form.destination"
          placeholder="Paris, France"
          icon="i-lucide-map-pin"
          size="lg"
          required
        />
      </UFormField>

      <UFormField label="Description">
        <UTextarea
          v-model="form.description"
          placeholder="Describe your trip..."
          :rows="3"
        />
      </UFormField>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UFormField label="Start Date">
          <UInput
            v-model="form.startDate"
            type="date"
            icon="i-lucide-calendar"
          />
        </UFormField>

        <UFormField label="End Date">
          <UInput v-model="form.endDate" type="date" icon="i-lucide-calendar" />
        </UFormField>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UFormField label="Budget">
          <UInput
            v-model.number="form.budget"
            type="number"
            placeholder="1000"
            icon="i-lucide-wallet"
            min="0"
          />
        </UFormField>

        <UFormField label="Currency">
          <USelect
            v-model="form.currency"
            :items="TRIP_CURRENCIES"
            value-key="value"
          />
        </UFormField>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UFormField label="Status">
          <USelect
            v-model="form.status"
            :items="TRIP_STATUS"
            value-key="value"
          />
        </UFormField>

        <UFormField label="Visibility">
          <USelect
            v-model="form.visibility"
            :items="TRIP_VISIBILITY"
            value-key="value"
          />
        </UFormField>
      </div>

      <UFormField v-if="groups && groups.length > 0" label="Travel Group">
        <USelect
          v-model="form.groupId"
          :items="groupOptions"
          value-key="value"
        />
        <template #hint>
          <span class="text-xs text-muted">Link this trip to a travel group for shared expenses and collaboration</span>
        </template>
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
        color="primary"
        :loading="loading"
        icon="i-lucide-save"
      >
        {{ trip ? "Update Trip" : "Create Trip" }}
      </UButton>
    </div>
  </form>
</template>
