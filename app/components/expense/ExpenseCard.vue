<script setup lang="ts">
import type { SharedExpense } from '~/composables/useSharedExpenses'

const props = defineProps<{
  expense: SharedExpense
  currentUserId: string
  canEdit: boolean
}>()

const emit = defineEmits<{
  edit: []
  delete: []
  settle: [participantId: string, isSettled: boolean]
}>()

const categoryIcons: Record<string, string> = {
  accommodation: 'i-lucide-bed',
  transportation: 'i-lucide-car',
  food: 'i-lucide-utensils',
  activities: 'i-lucide-compass',
  shopping: 'i-lucide-shopping-bag',
  entertainment: 'i-lucide-tv',
  insurance: 'i-lucide-shield',
  visa: 'i-lucide-file-text',
  communication: 'i-lucide-phone',
  other: 'i-lucide-more-horizontal'
}

const categoryLabels: Record<string, string> = {
  accommodation: 'Accommodation',
  transportation: 'Transportation',
  food: 'Food & Drinks',
  activities: 'Activities',
  shopping: 'Shopping',
  entertainment: 'Entertainment',
  insurance: 'Insurance',
  visa: 'Visa & Fees',
  communication: 'Communication',
  other: 'Other'
}

const splitMethodLabels: Record<string, string> = {
  equal: 'Split Equally',
  percentage: 'By Percentage',
  custom: 'Custom Split',
  full: 'Full Amount'
}

const isOwner = computed(() => props.expense.paidBy === props.currentUserId)
const formattedDate = computed(() => {
  return new Date(props.expense.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
})

const formattedAmount = computed(() => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: props.expense.currency
  }).format(props.expense.amount / 100)
})

const settledCount = computed(() => {
  return props.expense.participants.filter(p => p.isSettled).length
})

const totalParticipants = computed(() => props.expense.participants.length)

function formatParticipantAmount(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: props.expense.currency
  }).format(amount / 100)
}
</script>

<template>
  <UCard>
    <div class="space-y-4">
      <div class="flex items-start justify-between">
        <div class="flex items-start gap-3">
          <div class="p-2 bg-primary/10 rounded-lg">
            <UIcon :name="categoryIcons[expense.category]" class="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 class="font-semibold">{{ expense.description }}</h3>
            <div class="flex items-center gap-2 text-sm text-muted">
              <UBadge color="neutral" variant="subtle" size="xs">
                {{ categoryLabels[expense.category] }}
              </UBadge>
              <span>{{ formattedDate }}</span>
            </div>
          </div>
        </div>
        <div class="text-right">
          <p class="text-lg font-bold">{{ formattedAmount }}</p>
          <p class="text-sm text-muted">{{ splitMethodLabels[expense.splitMethod] }}</p>
        </div>
      </div>

      <div class="flex items-center gap-2 text-sm">
        <UAvatar
          :src="expense.paidByUser.avatarUrl || undefined"
          :alt="expense.paidByUser.name"
          size="xs"
        />
        <span class="text-muted">
          Paid by <span class="font-medium text-default">{{ expense.paidByUser.name }}</span>
        </span>
      </div>

      <div class="border-t pt-4">
        <div class="flex items-center justify-between mb-2">
          <p class="text-sm font-medium">Participants ({{ settledCount }}/{{ totalParticipants }} settled)</p>
        </div>
        <div class="space-y-2">
          <div
            v-for="participant in expense.participants"
            :key="participant.id"
            class="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/20"
          >
            <div class="flex items-center gap-2">
              <UAvatar
                :src="participant.user.avatarUrl || undefined"
                :alt="participant.user.name"
                size="xs"
              />
              <span class="text-sm">{{ participant.user.name }}</span>
              <UBadge
                v-if="participant.userId === expense.paidBy"
                color="primary"
                variant="subtle"
                size="xs"
              >
                Paid
              </UBadge>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium">{{ formatParticipantAmount(participant.shareAmount) }}</span>
              <UBadge
                v-if="participant.isSettled"
                color="success"
                variant="subtle"
                size="xs"
              >
                Settled
              </UBadge>
              <UButton
                v-else-if="isOwner && participant.userId !== expense.paidBy"
                size="xs"
                color="success"
                variant="soft"
                @click="emit('settle', participant.id, true)"
              >
                Mark Paid
              </UButton>
            </div>
          </div>
        </div>
      </div>

      <div v-if="canEdit && (isOwner || canEdit)" class="flex items-center gap-2 pt-2 border-t">
        <UButton
          size="sm"
          color="neutral"
          variant="ghost"
          icon="i-lucide-edit"
          @click="emit('edit')"
        >
          Edit
        </UButton>
        <UButton
          size="sm"
          color="error"
          variant="ghost"
          icon="i-lucide-trash-2"
          @click="emit('delete')"
        >
          Delete
        </UButton>
      </div>
    </div>
  </UCard>
</template>
