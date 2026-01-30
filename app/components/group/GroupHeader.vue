<script setup lang="ts">
import type { GroupWithDetails } from '~/composables/useGroups'

const props = defineProps<{
  group: GroupWithDetails
}>()

const emit = defineEmits<{
  edit: []
  delete: []
  invite: []
}>()

type BadgeColor = 'error' | 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'neutral'

const roleColors: Record<GroupWithDetails['currentUserRole'], BadgeColor> = {
  admin: 'primary',
  editor: 'info',
  viewer: 'neutral'
}

const roleLabels: Record<GroupWithDetails['currentUserRole'], string> = {
  admin: 'Admin',
  editor: 'Editor',
  viewer: 'Viewer'
}

const isAdmin = computed(() => props.group.currentUserRole === 'admin')
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-start justify-between flex-col md:flex-row gap-4">
      <div class="flex-1">
        <div class="flex items-center gap-3 mb-2">
          <h1 class="text-3xl font-bold">{{ group.name }}</h1>
          <UBadge :color="roleColors[group.currentUserRole]" variant="subtle">
            {{ roleLabels[group.currentUserRole] }}
          </UBadge>
        </div>
        <div class="flex items-center gap-1.5 text-lg text-muted">
          <UIcon name="i-lucide-users" class="w-5 h-5" />
          <span>{{ group.members.length }} member{{ group.members.length !== 1 ? 's' : '' }}</span>
        </div>
      </div>
    </div>

    <p v-if="group.description" class="text-muted">
      {{ group.description }}
    </p>

    <div v-if="group.trips && group.trips.length > 0" class="flex items-center gap-2 text-sm text-muted">
      <UIcon name="i-lucide-plane" class="w-4 h-4" />
      <span>{{ group.trips.length }} trip{{ group.trips.length !== 1 ? 's' : '' }} linked</span>
    </div>

    <div class="flex items-center gap-2 flex-wrap">
      <UButton
        v-if="isAdmin"
        color="success"
        variant="soft"
        icon="i-lucide-user-plus"
        @click="emit('invite')"
      >
        Invite Members
      </UButton>
      <UButton
        v-if="isAdmin"
        color="neutral"
        variant="ghost"
        icon="i-lucide-edit"
        @click="emit('edit')"
      >
        Edit
      </UButton>
      <UButton
        v-if="isAdmin"
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
