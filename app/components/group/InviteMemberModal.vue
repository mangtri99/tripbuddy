<script setup lang="ts">
import type { Invitation } from '~/composables/useGroups'

const props = defineProps<{
  open: boolean
  loading?: boolean
  invitations: Invitation[]
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  invite: [data: { email: string; role: 'admin' | 'editor' | 'viewer' }]
  cancelInvitation: [invitationId: string]
}>()

const email = ref('')
const role = ref<'admin' | 'editor' | 'viewer'>('viewer')
const copiedLink = ref<string | null>(null)

const roleOptions = [
  { label: 'Viewer - Can view group and itinerary', value: 'viewer' },
  { label: 'Editor - Can edit group itinerary', value: 'editor' },
  { label: 'Admin - Full access', value: 'admin' }
]

function handleSubmit() {
  if (!email.value) return
  emit('invite', { email: email.value, role: role.value })
  email.value = ''
  role.value = 'viewer'
}

function copyLink(link: string) {
  navigator.clipboard.writeText(link)
  copiedLink.value = link
  setTimeout(() => {
    copiedLink.value = null
  }, 2000)
}

function formatExpiresAt(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}
</script>

<template>
  <UModal :open="open" @update:open="emit('update:open', $event)">
    <template #content>
      <UCard class="w-full max-w-lg">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">Invite Members</h3>
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-lucide-x"
              size="sm"
              square
              @click="emit('update:open', false)"
            />
          </div>
        </template>

        <div class="space-y-6">
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <UFormField label="Email Address">
              <UInput
                v-model="email"
                type="email"
                placeholder="friend@example.com"
                icon="i-lucide-mail"
                required
              />
            </UFormField>

            <UFormField label="Role">
              <USelect
                v-model="role"
                :items="roleOptions"
                value-key="value"
              />
            </UFormField>

            <UButton
              type="submit"
              color="success"
              block
              :loading="loading"
              icon="i-lucide-send"
            >
              Send Invitation
            </UButton>
          </form>

          <div v-if="invitations.length > 0" class="border-t pt-4">
            <h4 class="font-medium mb-3">Pending Invitations</h4>
            <div class="space-y-2">
              <div
                v-for="invitation in invitations"
                :key="invitation.id"
                class="flex items-center justify-between p-2 rounded bg-muted/10"
              >
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium truncate">{{ invitation.email }}</p>
                  <p class="text-xs text-muted">
                    Expires {{ formatExpiresAt(invitation.expiresAt) }}
                  </p>
                </div>
                <div class="flex items-center gap-1">
                  <UButton
                    v-if="invitation.link"
                    color="neutral"
                    variant="ghost"
                    :icon="copiedLink === invitation.link ? 'i-lucide-check' : 'i-lucide-copy'"
                    size="xs"
                    square
                    @click="copyLink(invitation.link)"
                  />
                  <UButton
                    color="error"
                    variant="ghost"
                    icon="i-lucide-x"
                    size="xs"
                    square
                    @click="emit('cancelInvitation', invitation.id)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </UCard>
    </template>
  </UModal>
</template>
