<script setup lang="ts">
import type { CreateGroupData } from '~/composables/useGroups'

definePageMeta({
  middleware: 'auth'
})

const router = useRouter()
const { isLoading: groupLoading, createGroup } = useGroups()
const { trips, isLoading: tripsLoading, fetchTrips } = useTrips()

onMounted(() => {
  fetchTrips()
})

async function handleSubmit(data: CreateGroupData) {
  try {
    const group = await createGroup(data)
    await router.push(`/groups/${group.id}`)
  } catch {
    // Error handled by composable
  }
}

function handleCancel() {
  router.push('/groups')
}
</script>

<template>
  <UContainer class="py-8">
    <div class="max-w-2xl mx-auto">
      <div class="mb-8">
        <UButton
          to="/groups"
          color="neutral"
          variant="ghost"
          icon="i-lucide-arrow-left"
          class="mb-4"
        >
          Back to Groups
        </UButton>
        <h1 class="text-3xl font-bold">Create Travel Group</h1>
        <p class="text-muted mt-1">Start planning a trip with friends and family</p>
      </div>

      <UCard>
        <div v-if="tripsLoading" class="animate-pulse space-y-4">
          <div class="h-10 bg-muted/30 rounded" />
          <div class="h-20 bg-muted/30 rounded" />
          <div class="h-10 bg-muted/30 rounded" />
        </div>
        <GroupForm
          v-else
          :trips="trips"
          :loading="groupLoading"
          @submit="handleSubmit"
          @cancel="handleCancel"
        />
      </UCard>
    </div>
  </UContainer>
</template>
