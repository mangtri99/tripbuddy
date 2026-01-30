<script setup lang="ts">
import type { GroupListItem } from '~/composables/useGroups'

const props = defineProps<{
  group: GroupListItem
}>()

type BadgeColor = 'error' | 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'neutral'

const roleColors: Record<GroupListItem['role'], BadgeColor> = {
  admin: 'primary',
  editor: 'info',
  viewer: 'neutral'
}

const roleLabels: Record<GroupListItem['role'], string> = {
  admin: 'Admin',
  editor: 'Editor',
  viewer: 'Viewer'
}
</script>

<template>
  <NuxtLink :to="`/groups/${group.id}`">
    <UCard class="hover:ring-2 hover:ring-success/50 transition-all cursor-pointer h-full">
      <template #header>
        <div class="flex items-start justify-between gap-2">
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-lg truncate">{{ group.name }}</h3>
            <div class="flex items-center gap-1.5 text-muted mt-1">
              <UIcon name="i-lucide-users" class="w-4 h-4 shrink-0" />
              <span>{{ group.memberCount }} member{{ group.memberCount !== 1 ? 's' : '' }}</span>
            </div>
          </div>
          <UBadge :color="roleColors[group.role]" variant="subtle" size="sm">
            {{ roleLabels[group.role] }}
          </UBadge>
        </div>
      </template>

      <p v-if="group.description" class="text-sm text-muted line-clamp-2">
        {{ group.description }}
      </p>
      <p v-else class="text-sm text-muted italic">No description</p>

      <template #footer>
        <div class="flex items-center justify-between text-sm text-muted">
          <span class="flex items-center gap-1.5">
            <UIcon name="i-lucide-plane" class="w-4 h-4" />
            Travel group
          </span>
        </div>
      </template>
    </UCard>
  </NuxtLink>
</template>
