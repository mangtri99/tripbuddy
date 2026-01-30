<script setup lang="ts">
import type { Settlement } from '~/composables/useSharedExpenses'

const props = defineProps<{
  settlements: Settlement[]
  currentUserId: string
}>()

function formatAmount(amount: number, currency: string = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount / 100)
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-history" class="w-5 h-5 text-primary" />
        <h3 class="font-semibold">Payment History</h3>
      </div>
    </template>

    <div v-if="settlements.length === 0" class="text-center py-8">
      <UIcon name="i-lucide-banknote" class="w-12 h-12 text-muted mx-auto mb-3" />
      <p class="text-muted">No settlements recorded yet</p>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="settlement in settlements"
        :key="settlement.id"
        class="flex items-start gap-3 p-3 rounded-lg bg-muted/10"
      >
        <div class="p-2 rounded-full bg-success/10">
          <UIcon name="i-lucide-arrow-right" class="w-4 h-4 text-success" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <UAvatar
              :src="settlement.fromUser.avatarUrl || undefined"
              :alt="settlement.fromUser.name"
              size="xs"
            />
            <span class="font-medium">
              {{ settlement.fromUserId === currentUserId ? 'You' : settlement.fromUser.name }}
            </span>
            <UIcon name="i-lucide-arrow-right" class="w-4 h-4 text-muted" />
            <span class="font-medium">
              {{ settlement.toUserId === currentUserId ? 'You' : (settlement.toUser?.name || 'Unknown') }}
            </span>
          </div>
          <p v-if="settlement.note" class="text-sm text-muted mt-1">
            {{ settlement.note }}
          </p>
          <p class="text-xs text-muted mt-1">
            {{ formatDate(settlement.createdAt) }}
          </p>
        </div>
        <span class="font-semibold text-success">
          {{ formatAmount(settlement.amount, settlement.currency) }}
        </span>
      </div>
    </div>
  </UCard>
</template>
