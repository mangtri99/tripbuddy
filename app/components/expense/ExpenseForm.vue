<script setup lang="ts">
import type { SharedExpense, CreateSharedExpenseData, ExpenseCategory, SplitMethod } from '~/composables/useSharedExpenses'

interface GroupMember {
  id: string
  userId: string
  user: {
    id: string
    name: string
    avatarUrl: string | null
  }
}

const props = defineProps<{
  expense?: SharedExpense
  members: GroupMember[]
  loading?: boolean
}>()

const emit = defineEmits<{
  submit: [data: CreateSharedExpenseData]
  cancel: []
}>()

const categories: { value: ExpenseCategory; label: string }[] = [
  { value: 'food', label: 'Food & Drinks' },
  { value: 'accommodation', label: 'Accommodation' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'activities', label: 'Activities' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'visa', label: 'Visa & Fees' },
  { value: 'communication', label: 'Communication' },
  { value: 'other', label: 'Other' }
]

const splitMethods: { value: SplitMethod; label: string; description: string }[] = [
  { value: 'equal', label: 'Split Equally', description: 'Divide evenly among participants' },
  { value: 'percentage', label: 'By Percentage', description: 'Each pays a percentage' },
  { value: 'custom', label: 'Custom Amounts', description: 'Set specific amounts' },
  { value: 'full', label: 'Full Amount', description: 'One person pays all' }
]

const getDateString = (dateStr?: string): string => {
  if (dateStr) {
    const parsed = dateStr.split('T')[0]
    if (parsed) return parsed
  }
  return new Date().toISOString().split('T')[0] || ''
}

const form = reactive({
  description: props.expense?.description || '',
  amount: props.expense ? (props.expense.amount / 100).toString() : '',
  currency: props.expense?.currency || 'USD',
  category: props.expense?.category || 'food' as ExpenseCategory,
  splitMethod: props.expense?.splitMethod || 'equal' as SplitMethod,
  date: getDateString(props.expense?.date),
  receiptUrl: props.expense?.receiptUrl || ''
})

const selectedParticipants = ref<string[]>(
  props.expense?.participants.map(p => p.userId) ||
  props.members.map(m => m.userId)
)

const participantShares = ref<Record<string, { percentage: number; amount: number }>>(
  props.expense?.participants.reduce((acc, p) => {
    acc[p.userId] = {
      percentage: p.sharePercentage || 0,
      amount: p.shareAmount / 100
    }
    return acc
  }, {} as Record<string, { percentage: number; amount: number }>) ||
  {}
)

// Initialize shares for all members
watch(() => props.members, (members) => {
  for (const member of members) {
    if (!participantShares.value[member.userId]) {
      participantShares.value[member.userId] = { percentage: 0, amount: 0 }
    }
  }
}, { immediate: true })

const amountInCents = computed(() => {
  const parsed = parseFloat(form.amount)
  return isNaN(parsed) ? 0 : Math.round(parsed * 100)
})

const equalShare = computed(() => {
  if (selectedParticipants.value.length === 0) return 0
  return amountInCents.value / selectedParticipants.value.length / 100
})

const totalPercentage = computed(() => {
  return selectedParticipants.value.reduce((sum, id) => {
    return sum + (participantShares.value[id]?.percentage || 0)
  }, 0)
})

const totalCustomAmount = computed(() => {
  return selectedParticipants.value.reduce((sum, id) => {
    return sum + (participantShares.value[id]?.amount || 0)
  }, 0)
})

const isValid = computed(() => {
  if (!form.description.trim()) return false
  if (amountInCents.value <= 0) return false
  if (selectedParticipants.value.length === 0) return false
  if (!form.date) return false

  if (form.splitMethod === 'percentage' && Math.abs(totalPercentage.value - 100) > 0.01) {
    return false
  }

  if (form.splitMethod === 'custom' && Math.abs(totalCustomAmount.value - parseFloat(form.amount)) > 0.01) {
    return false
  }

  return true
})

function toggleParticipant(userId: string) {
  const index = selectedParticipants.value.indexOf(userId)
  if (index === -1) {
    selectedParticipants.value.push(userId)
  } else {
    selectedParticipants.value.splice(index, 1)
  }
}

function distributeEqually() {
  if (selectedParticipants.value.length === 0) return
  const equalPercentage = 100 / selectedParticipants.value.length
  const equalAmount = parseFloat(form.amount) / selectedParticipants.value.length

  for (const id of selectedParticipants.value) {
    if (!participantShares.value[id]) {
      participantShares.value[id] = { percentage: 0, amount: 0 }
    }
    participantShares.value[id].percentage = Math.round(equalPercentage * 100) / 100
    participantShares.value[id].amount = Math.round(equalAmount * 100) / 100
  }
}

function handleSubmit() {
  if (!isValid.value) return

  const participants = selectedParticipants.value.map(userId => ({
    userId,
    shareAmount: form.splitMethod === 'custom'
      ? Math.round((participantShares.value[userId]?.amount || 0) * 100)
      : undefined,
    sharePercentage: form.splitMethod === 'percentage'
      ? participantShares.value[userId]?.percentage || 0
      : undefined
  }))

  emit('submit', {
    description: form.description.trim(),
    amount: amountInCents.value,
    currency: form.currency,
    category: form.category,
    splitMethod: form.splitMethod,
    date: form.date,
    receiptUrl: form.receiptUrl || undefined,
    participants
  })
}
</script>

<template>
  <form class="space-y-6" @submit.prevent="handleSubmit">
    <UFormField label="Description" required>
      <UInput
        v-model="form.description"
        placeholder="e.g., Dinner at restaurant"
        :disabled="loading"
      />
    </UFormField>

    <div class="grid grid-cols-2 gap-4">
      <UFormField label="Amount" required>
        <UInput
          v-model="form.amount"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0.00"
          :disabled="loading"
        />
      </UFormField>

      <UFormField label="Currency">
        <USelect
          v-model="form.currency"
          :items="[
            { value: 'USD', label: 'USD ($)' },
            { value: 'EUR', label: 'EUR (\u20AC)' },
            { value: 'GBP', label: 'GBP (\u00A3)' },
            { value: 'JPY', label: 'JPY (\u00A5)' },
            { value: 'IDR', label: 'IDR (Rp)' }
          ]"
          value-key="value"
          label-key="label"
          :disabled="loading"
        />
      </UFormField>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <UFormField label="Category" required>
        <USelect
          v-model="form.category"
          :items="categories"
          value-key="value"
          label-key="label"
          :disabled="loading"
        />
      </UFormField>

      <UFormField label="Date" required>
        <UInput
          v-model="form.date"
          type="date"
          :disabled="loading"
        />
      </UFormField>
    </div>

    <UFormField label="Split Method">
      <div class="grid grid-cols-2 gap-2">
        <button
          v-for="method in splitMethods"
          :key="method.value"
          type="button"
          class="p-3 text-left rounded-lg border-2 transition-colors"
          :class="form.splitMethod === method.value
            ? 'border-primary bg-primary/5'
            : 'border-muted/30 hover:border-muted'"
          :disabled="loading"
          @click="form.splitMethod = method.value"
        >
          <p class="font-medium text-sm">{{ method.label }}</p>
          <p class="text-xs text-muted">{{ method.description }}</p>
        </button>
      </div>
    </UFormField>

    <UFormField label="Participants" required>
      <div class="space-y-2">
        <div
          v-for="member in members"
          :key="member.userId"
          class="flex items-center justify-between p-3 rounded-lg border"
          :class="selectedParticipants.includes(member.userId)
            ? 'border-primary bg-primary/5'
            : 'border-muted/30'"
        >
          <label class="flex items-center gap-3 cursor-pointer flex-1">
            <UCheckbox
              :model-value="selectedParticipants.includes(member.userId)"
              :disabled="loading"
              @update:model-value="toggleParticipant(member.userId)"
            />
            <UAvatar
              :src="member.user.avatarUrl || undefined"
              :alt="member.user.name"
              size="sm"
            />
            <span>{{ member.user.name }}</span>
          </label>

          <div v-if="selectedParticipants.includes(member.userId)" class="flex items-center gap-2">
            <template v-if="form.splitMethod === 'equal'">
              <span class="text-sm text-muted">
                ${{ equalShare.toFixed(2) }}
              </span>
            </template>

            <template v-else-if="form.splitMethod === 'percentage' && participantShares[member.userId]">
              <UInput
                v-model.number="participantShares[member.userId]!.percentage"
                type="number"
                step="0.01"
                min="0"
                max="100"
                class="w-20"
                :disabled="loading"
              />
              <span class="text-sm text-muted">%</span>
            </template>

            <template v-else-if="form.splitMethod === 'custom' && participantShares[member.userId]">
              <UInput
                v-model.number="participantShares[member.userId]!.amount"
                type="number"
                step="0.01"
                min="0"
                class="w-24"
                :disabled="loading"
              />
            </template>
          </div>
        </div>

        <div v-if="form.splitMethod === 'percentage' || form.splitMethod === 'custom'" class="flex items-center justify-between text-sm">
          <UButton
            type="button"
            size="xs"
            variant="soft"
            @click="distributeEqually"
          >
            Distribute Equally
          </UButton>
          <span v-if="form.splitMethod === 'percentage'" :class="Math.abs(totalPercentage - 100) > 0.01 ? 'text-error' : 'text-success'">
            Total: {{ totalPercentage.toFixed(2) }}%
          </span>
          <span v-else-if="form.splitMethod === 'custom'" :class="Math.abs(totalCustomAmount - parseFloat(form.amount || '0')) > 0.01 ? 'text-error' : 'text-success'">
            Total: ${{ totalCustomAmount.toFixed(2) }} / ${{ form.amount || '0' }}
          </span>
        </div>
      </div>
    </UFormField>

    <UFormField label="Receipt URL (optional)">
      <UInput
        v-model="form.receiptUrl"
        type="url"
        placeholder="https://..."
        :disabled="loading"
      />
    </UFormField>

    <div class="flex items-center justify-end gap-3 pt-4 border-t">
      <UButton
        type="button"
        color="neutral"
        variant="ghost"
        :disabled="loading"
        @click="emit('cancel')"
      >
        Cancel
      </UButton>
      <UButton
        type="submit"
        color="primary"
        :loading="loading"
        :disabled="!isValid"
      >
        {{ expense ? 'Update Expense' : 'Add Expense' }}
      </UButton>
    </div>
  </form>
</template>
