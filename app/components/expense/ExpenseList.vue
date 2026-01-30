<script setup lang="ts">
import type { SharedExpense } from '~/composables/useSharedExpenses'

const props = defineProps<{
  expenses: SharedExpense[]
  currentUserId: string
  canEdit: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  edit: [expense: SharedExpense]
  delete: [expenseId: string]
  settle: [expenseId: string, participantId: string, isSettled: boolean]
}>()

const totalAmount = computed(() => {
  return props.expenses.reduce((sum, e) => sum + e.amount, 0)
})

function formatAmount(amount: number, currency: string = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount / 100)
}

function handleEdit(expense: SharedExpense) {
  emit('edit', expense)
}

function handleDelete(expenseId: string) {
  if (confirm('Are you sure you want to delete this expense?')) {
    emit('delete', expenseId)
  }
}
</script>

<template>
  <div class="space-y-4">
    <div v-if="expenses.length > 0" class="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
      <span class="text-sm font-medium">Total Expenses</span>
      <span class="text-lg font-bold text-primary">{{ formatAmount(totalAmount) }}</span>
    </div>

    <div v-if="loading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="animate-pulse">
        <div class="h-32 bg-muted/20 rounded-lg" />
      </div>
    </div>

    <div v-else-if="expenses.length === 0" class="text-center py-12">
      <UIcon name="i-lucide-receipt" class="w-16 h-16 text-muted mx-auto mb-4" />
      <h3 class="text-lg font-semibold mb-2">No expenses yet</h3>
      <p class="text-muted">Add your first shared expense to start tracking</p>
    </div>

    <div v-else class="space-y-4">
      <SharedExpenseCard
        v-for="expense in expenses"
        :key="expense.id"
        :expense="expense"
        :current-user-id="currentUserId"
        :can-edit="canEdit"
        @edit="handleEdit(expense)"
        @delete="handleDelete(expense.id)"
        @settle="(participantId: string, isSettled: boolean) => emit('settle', expense.id, participantId, isSettled)"
      />
    </div>
  </div>
</template>
