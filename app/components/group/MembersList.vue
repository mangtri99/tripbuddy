<script setup lang="ts">
import type { GroupMember } from '~/composables/useGroups'

const props = defineProps<{
  members: GroupMember[]
  currentUserId: string
  currentUserRole: 'admin' | 'editor' | 'viewer'
}>()

const emit = defineEmits<{
  updateRole: [memberId: string, role: 'admin' | 'editor' | 'viewer']
  remove: [memberId: string]
}>()

const isAdmin = computed(() => props.currentUserRole === 'admin')

const roleOptions = [
  { label: 'Admin', value: 'admin' },
  { label: 'Editor', value: 'editor' },
  { label: 'Viewer', value: 'viewer' }
]

type BadgeColor = 'error' | 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'neutral'

const roleColors: Record<GroupMember['role'], BadgeColor> = {
  admin: 'primary',
  editor: 'info',
  viewer: 'neutral'
}

const roleLabels: Record<GroupMember['role'], string> = {
  admin: 'Admin',
  editor: 'Editor',
  viewer: 'Viewer'
}

function handleRoleChange(memberId: string, newRole: string) {
  emit('updateRole', memberId, newRole as 'admin' | 'editor' | 'viewer')
}

function canRemoveMember(member: GroupMember): boolean {
  // Admins can remove anyone except the last admin
  if (isAdmin.value) {
    if (member.role === 'admin') {
      const adminCount = props.members.filter(m => m.role === 'admin').length
      return adminCount > 1
    }
    return true
  }
  // Non-admins can only remove themselves
  return member.userId === props.currentUserId
}
</script>

<template>
  <div class="space-y-3">
    <div
      v-for="member in members"
      :key="member.id"
      class="flex items-center gap-3 p-3 rounded-lg border bg-default"
    >
      <UAvatar
        :alt="member.user.name"
        :src="member.user.avatarUrl || undefined"
        size="md"
      />

      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <p class="font-medium truncate">{{ member.user.name }}</p>
          <span v-if="member.userId === currentUserId" class="text-xs text-muted">(You)</span>
        </div>
        <p class="text-sm text-muted truncate">{{ member.user.email }}</p>
      </div>

      <div class="flex items-center gap-2">
        <USelect
          v-if="isAdmin && member.userId !== currentUserId"
          :model-value="member.role"
          :items="roleOptions"
          value-key="value"
          size="sm"
          class="w-28"
          @update:model-value="handleRoleChange(member.id, $event as string)"
        />
        <UBadge v-else :color="roleColors[member.role]" variant="subtle" size="sm">
          {{ roleLabels[member.role] }}
        </UBadge>

        <UButton
          v-if="canRemoveMember(member)"
          color="error"
          variant="ghost"
          icon="i-lucide-x"
          size="xs"
          square
          @click="emit('remove', member.id)"
        />
      </div>
    </div>

    <p v-if="members.length === 0" class="text-center text-muted py-4">
      No members yet
    </p>
  </div>
</template>
