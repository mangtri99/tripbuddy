<script setup lang="ts">
import type { UserBalance } from '~/composables/useSharedExpenses'

const props = defineProps<{
  balances: UserBalance[]
  currentUserId: string
  currency?: string
}>()

const emit = defineEmits<{
  settle: [toUserId: string, amount: number]
}>()

const currency = computed(() => props.currency || 'USD')

function formatAmount(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.value
  }).format(amount / 100)
}

const currentUserBalance = computed(() => {
  return props.balances.find(b => b.userId === props.currentUserId)
})

const otherBalances = computed(() => {
  return props.balances.filter(b => b.userId !== props.currentUserId)
})
</script>

<template>
  <div class="space-y-6">
    <!-- Current user's summary -->
    <UCard v-if="currentUserBalance">
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-wallet" class="w-5 h-5 text-primary" />
          <h3 class="font-semibold">Your Balance</h3>
        </div>
      </template>

      <div class="space-y-4">
        <div class="flex items-center justify-between p-4 rounded-lg bg-muted/20">
          <span class="text-sm text-muted">Net Balance</span>
          <span
            class="text-xl font-bold"
            :class="{
              'text-success': currentUserBalance.netBalance > 0,
              'text-error': currentUserBalance.netBalance < 0,
              'text-muted': currentUserBalance.netBalance === 0
            }"
          >
            {{ currentUserBalance.netBalance >= 0 ? '+' : '' }}{{ formatAmount(currentUserBalance.netBalance) }}
          </span>
        </div>

        <!-- You owe -->
        <div v-if="currentUserBalance.owes.length > 0">
          <p class="text-sm font-medium text-muted mb-2">You Owe</p>
          <div class="space-y-2">
            <div
              v-for="debt in currentUserBalance.owes"
              :key="debt.userId"
              class="flex items-center justify-between p-3 rounded-lg bg-error/5 border border-error/20"
            >
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-arrow-up-right" class="w-4 h-4 text-error" />
                <span>{{ debt.userName }}</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="font-semibold text-error">{{ formatAmount(debt.amount) }}</span>
                <UButton
                  size="xs"
                  color="success"
                  variant="soft"
                  @click="emit('settle', debt.userId, debt.amount)"
                >
                  Settle
                </UButton>
              </div>
            </div>
          </div>
        </div>

        <!-- Owed to you -->
        <div v-if="currentUserBalance.isOwed.length > 0">
          <p class="text-sm font-medium text-muted mb-2">Owed to You</p>
          <div class="space-y-2">
            <div
              v-for="credit in currentUserBalance.isOwed"
              :key="credit.userId"
              class="flex items-center justify-between p-3 rounded-lg bg-success/5 border border-success/20"
            >
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-arrow-down-left" class="w-4 h-4 text-success" />
                <span>{{ credit.userName }}</span>
              </div>
              <span class="font-semibold text-success">{{ formatAmount(credit.amount) }}</span>
            </div>
          </div>
        </div>

        <p v-if="currentUserBalance.owes.length === 0 && currentUserBalance.isOwed.length === 0" class="text-center text-muted py-4">
          You're all settled up!
        </p>
      </div>
    </UCard>

    <!-- Group members balances -->
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-users" class="w-5 h-5 text-primary" />
          <h3 class="font-semibold">Group Balances</h3>
        </div>
      </template>

      <div class="space-y-3">
        <div
          v-for="balance in otherBalances"
          :key="balance.userId"
          class="flex items-center justify-between p-3 rounded-lg bg-muted/10"
        >
          <div class="flex items-center gap-3">
            <UAvatar
              :src="balance.user.avatarUrl || undefined"
              :alt="balance.user.name"
              size="sm"
            />
            <span class="font-medium">{{ balance.user.name }}</span>
          </div>
          <span
            class="font-semibold"
            :class="{
              'text-success': balance.netBalance > 0,
              'text-error': balance.netBalance < 0,
              'text-muted': balance.netBalance === 0
            }"
          >
            {{ balance.netBalance >= 0 ? '+' : '' }}{{ formatAmount(balance.netBalance) }}
          </span>
        </div>

        <p v-if="otherBalances.length === 0" class="text-center text-muted py-4">
          No other members in this group
        </p>
      </div>
    </UCard>
  </div>
</template>
