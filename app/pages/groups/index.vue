<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const { groups, isLoading, fetchGroups } = useGroups()

onMounted(() => {
  fetchGroups()
})
</script>

<template>
  <UContainer class="py-8">
    <div class="max-w-6xl mx-auto">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-bold">Travel Groups</h1>
          <p class="text-muted mt-1">Plan trips together with friends and family</p>
        </div>
        <UButton to="/groups/new" color="success" icon="i-lucide-plus" size="lg">
          New Group
        </UButton>
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

      <div v-else-if="groups.length > 0" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <GroupCard v-for="group in groups" :key="group.id" :group="group" />
      </div>

      <div v-else class="text-center py-16 border-2 border-dashed rounded-lg">
        <UIcon name="i-lucide-users" class="w-16 h-16 text-muted mx-auto mb-4" />
        <h2 class="text-xl font-semibold mb-2">No groups yet</h2>
        <p class="text-muted mb-6">Create a group to start planning trips together!</p>
        <UButton to="/groups/new" color="success" icon="i-lucide-plus" size="lg">
          Create Your First Group
        </UButton>
      </div>
    </div>
  </UContainer>
</template>
