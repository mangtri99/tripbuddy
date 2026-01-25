<script setup lang="ts">
import type { CreateGroupData } from '~/composables/useGroups'

definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter()
const { user } = useAuth()
const { currentGroup, isLoading, fetchGroup, updateGroup, deleteGroup } = useGroups()
const { trips, fetchTrips } = useTrips()

const groupId = computed(() => route.params.id as string)
const { members, invitations, isLoading: membersLoading, fetchMembers, fetchInvitations, inviteMember, updateMemberRole, removeMember, cancelInvitation } = useGroupMembers(groupId)

const showEditModal = ref(false)
const showInviteModal = ref(false)
const isDeleting = ref(false)

onMounted(async () => {
  await fetchGroup(groupId.value)
  await fetchTrips()
  if (currentGroup.value) {
    members.value = currentGroup.value.members
    if (currentGroup.value.currentUserRole === 'admin') {
      await fetchInvitations()
    }
  }
})

async function handleEditSubmit(data: CreateGroupData) {
  try {
    await updateGroup(groupId.value, data)
    await fetchGroup(groupId.value)
    showEditModal.value = false
  } catch {
    // Error handled by composable
  }
}

async function handleDelete() {
  if (!confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
    return
  }

  isDeleting.value = true
  try {
    await deleteGroup(groupId.value)
    await router.push('/groups')
  } catch {
    // Error handled by composable
  } finally {
    isDeleting.value = false
  }
}

async function handleInvite(data: { email: string; role: 'admin' | 'editor' | 'viewer' }) {
  try {
    await inviteMember(data)
    await fetchInvitations()
  } catch {
    // Error handled by composable
  }
}

async function handleUpdateRole(memberId: string, role: 'admin' | 'editor' | 'viewer') {
  try {
    await updateMemberRole(memberId, { role })
    await fetchGroup(groupId.value)
    members.value = currentGroup.value?.members || []
  } catch {
    // Error handled by composable
  }
}

async function handleRemoveMember(memberId: string) {
  const member = members.value.find(m => m.id === memberId)
  const isSelf = member?.userId === user.value?.id

  const message = isSelf
    ? 'Are you sure you want to leave this group?'
    : 'Are you sure you want to remove this member from the group?'

  if (!confirm(message)) return

  try {
    await removeMember(memberId)
    if (isSelf) {
      await router.push('/groups')
    } else {
      await fetchGroup(groupId.value)
      members.value = currentGroup.value?.members || []
    }
  } catch {
    // Error handled by composable
  }
}

async function handleCancelInvitation(invitationId: string) {
  try {
    await cancelInvitation(invitationId)
  } catch {
    // Error handled by composable
  }
}
</script>

<template>
  <UContainer class="py-8">
    <div class="max-w-4xl mx-auto">
      <UButton
        to="/groups"
        color="neutral"
        variant="ghost"
        icon="i-lucide-arrow-left"
        class="mb-6"
      >
        Back to Groups
      </UButton>

      <div v-if="isLoading && !currentGroup" class="space-y-6">
        <div class="animate-pulse space-y-4">
          <div class="h-8 bg-muted/30 rounded w-1/2" />
          <div class="h-4 bg-muted/30 rounded w-1/3" />
          <div class="h-4 bg-muted/30 rounded w-full" />
        </div>
      </div>

      <div v-else-if="currentGroup" class="space-y-8">
        <GroupHeader
          :group="currentGroup"
          @edit="showEditModal = true"
          @delete="handleDelete"
          @invite="showInviteModal = true"
        />

        <div class="border-t" />

        <div>
          <h2 class="text-xl font-semibold mb-4">Members</h2>
          <MembersList
            :members="members"
            :current-user-id="user?.id || ''"
            :current-user-role="currentGroup.currentUserRole"
            @update-role="handleUpdateRole"
            @remove="handleRemoveMember"
          />
        </div>

        <div v-if="currentGroup.trip" class="border-t pt-8">
          <h2 class="text-xl font-semibold mb-4">Linked Trip</h2>
          <TripCard :trip="currentGroup.trip" />
        </div>
      </div>

      <div v-else class="text-center py-16">
        <UIcon name="i-lucide-alert-circle" class="w-16 h-16 text-muted mx-auto mb-4" />
        <h2 class="text-xl font-semibold mb-2">Group not found</h2>
        <p class="text-muted mb-6">The group you're looking for doesn't exist or you don't have access to it.</p>
        <UButton to="/groups" color="success">
          Back to Groups
        </UButton>
      </div>

      <UModal v-model:open="showEditModal">
        <template #content>
          <UCard class="w-full max-w-2xl">
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold">Edit Group</h3>
                <UButton
                  color="neutral"
                  variant="ghost"
                  icon="i-lucide-x"
                  size="sm"
                  square
                  @click="showEditModal = false"
                />
              </div>
            </template>

            <GroupForm
              v-if="currentGroup"
              :group="currentGroup"
              :trips="trips"
              :loading="isLoading"
              @submit="handleEditSubmit"
              @cancel="showEditModal = false"
            />
          </UCard>
        </template>
      </UModal>

      <InviteMemberModal
        v-model:open="showInviteModal"
        :loading="membersLoading"
        :invitations="invitations"
        @invite="handleInvite"
        @cancel-invitation="handleCancelInvitation"
      />
    </div>
  </UContainer>
</template>
