<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter()
const toast = useToast()

const token = computed(() => route.params.token as string)
const isLoading = ref(true)
const isJoining = ref(false)
const error = ref<string | null>(null)

interface InvitationInfo {
  invitation: {
    id: string
    role: 'admin' | 'editor' | 'viewer'
    expiresAt: string
  }
  group: {
    id: string
    name: string
    description: string | null
    memberCount: number
  }
  invitedBy: {
    id: string
    name: string
    avatarUrl: string | null
  }
}

const invitationInfo = ref<InvitationInfo | null>(null)

onMounted(async () => {
  try {
    const response = await $fetch<InvitationInfo>(`/api/groups/join/${token.value}`)
    invitationInfo.value = response
  } catch (e: unknown) {
    const fetchError = e as { data?: { message?: string } }
    error.value = fetchError.data?.message || 'Invalid or expired invitation'
  } finally {
    isLoading.value = false
  }
})

async function handleJoin() {
  isJoining.value = true
  try {
    const response = await $fetch<{ group: { id: string } }>(`/api/groups/join/${token.value}`, {
      method: 'POST'
    })
    toast.add({
      title: 'Welcome!',
      description: `You've joined ${invitationInfo.value?.group.name}`,
      color: 'success'
    })
    await router.push(`/groups/${response.group.id}`)
  } catch (e: unknown) {
    const fetchError = e as { data?: { message?: string } }
    error.value = fetchError.data?.message || 'Failed to join group'
    toast.add({
      title: 'Error',
      description: error.value,
      color: 'error'
    })
  } finally {
    isJoining.value = false
  }
}

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  editor: 'Editor',
  viewer: 'Viewer'
}

function formatExpiresAt(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}
</script>

<template>
  <UContainer class="py-8">
    <div class="max-w-md mx-auto">
      <div v-if="isLoading" class="text-center py-16">
        <UIcon name="i-lucide-loader-2" class="w-12 h-12 text-muted mx-auto mb-4 animate-spin" />
        <p class="text-muted">Loading invitation...</p>
      </div>

      <div v-else-if="error" class="text-center py-16">
        <UIcon name="i-lucide-alert-circle" class="w-16 h-16 text-error mx-auto mb-4" />
        <h2 class="text-xl font-semibold mb-2">Invalid Invitation</h2>
        <p class="text-muted mb-6">{{ error }}</p>
        <UButton to="/groups" color="success">
          Go to Groups
        </UButton>
      </div>

      <UCard v-else-if="invitationInfo">
        <div class="text-center space-y-6">
          <div class="p-4 rounded-full bg-success/10 w-fit mx-auto">
            <UIcon name="i-lucide-users" class="w-12 h-12 text-success" />
          </div>

          <div>
            <h1 class="text-2xl font-bold mb-2">You're Invited!</h1>
            <p class="text-muted">
              <span class="font-medium">{{ invitationInfo.invitedBy.name }}</span>
              has invited you to join
            </p>
          </div>

          <div class="p-4 rounded-lg bg-muted/10">
            <h2 class="text-xl font-semibold">{{ invitationInfo.group.name }}</h2>
            <p v-if="invitationInfo.group.description" class="text-sm text-muted mt-1">
              {{ invitationInfo.group.description }}
            </p>
            <div class="flex items-center justify-center gap-4 mt-3 text-sm text-muted">
              <span class="flex items-center gap-1">
                <UIcon name="i-lucide-users" class="w-4 h-4" />
                {{ invitationInfo.group.memberCount }} members
              </span>
              <span class="flex items-center gap-1">
                <UIcon name="i-lucide-shield" class="w-4 h-4" />
                {{ roleLabels[invitationInfo.invitation.role] }}
              </span>
            </div>
          </div>

          <p class="text-xs text-muted">
            This invitation expires on {{ formatExpiresAt(invitationInfo.invitation.expiresAt) }}
          </p>

          <div class="flex flex-col gap-3">
            <UButton
              color="success"
              size="lg"
              block
              :loading="isJoining"
              icon="i-lucide-check"
              @click="handleJoin"
            >
              Join Group
            </UButton>
            <UButton
              to="/groups"
              color="neutral"
              variant="ghost"
              size="lg"
              block
            >
              Decline
            </UButton>
          </div>
        </div>
      </UCard>
    </div>
  </UContainer>
</template>
