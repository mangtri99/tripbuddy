<script setup lang="ts">
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
  members: GroupMember[]
  currentUserId: string
  loading?: boolean
  prefilledToUserId?: string
  prefilledAmount?: number
  currency?: string
}>()

const emit = defineEmits<{
  submit: [data: { toUserId: string; amount: number; currency: string; note?: string }]
  cancel: []
}>()

const open = defineModel<boolean>('open', { default: false })

const form = reactive({
  toUserId: '',
  amount: '',
  note: ''
})

const currency = computed(() => props.currency || 'USD')

const otherMembers = computed(() => {
  return props.members.filter(m => m.userId !== props.currentUserId)
})

const amountInCents = computed(() => {
  const parsed = parseFloat(form.amount)
  return isNaN(parsed) ? 0 : Math.round(parsed * 100)
})

const isValid = computed(() => {
  return form.toUserId && amountInCents.value > 0
})

watch(open, (isOpen) => {
  if (isOpen) {
    // Reset form and apply prefilled values
    form.toUserId = props.prefilledToUserId || ''
    form.amount = props.prefilledAmount ? (props.prefilledAmount / 100).toString() : ''
    form.note = ''
  }
})

function handleSubmit() {
  if (!isValid.value) return

  emit('submit', {
    toUserId: form.toUserId,
    amount: amountInCents.value,
    currency: currency.value,
    note: form.note || undefined
  })
}
</script>

<template>
  <UModal v-model:open="open">
    <template #content>
      <UCard class="w-full max-w-md">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">Record Settlement</h3>
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-lucide-x"
              size="sm"
              square
              @click="open = false"
            />
          </div>
        </template>

        <form class="space-y-4" @submit.prevent="handleSubmit">
          <UFormField label="Paying To" required>
            <USelect
              v-model="form.toUserId"
              placeholder="Select member"
              :items="otherMembers.map(m => ({ value: m.userId, label: m.user.name }))"
              value-key="value"
              label-key="label"
              :disabled="loading"
            />
          </UFormField>

          <UFormField label="Amount" required>
            <UInput
              v-model="form.amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              :disabled="loading"
            >
              <template #leading>
                <span class="text-muted">{{ currency === 'USD' ? '$' : currency }}</span>
              </template>
            </UInput>
          </UFormField>

          <UFormField label="Note (optional)">
            <UTextarea
              v-model="form.note"
              placeholder="e.g., Cash payment, Venmo transfer..."
              :rows="2"
              :disabled="loading"
            />
          </UFormField>

          <div class="flex items-center justify-end gap-3 pt-4 border-t">
            <UButton
              type="button"
              color="neutral"
              variant="ghost"
              :disabled="loading"
              @click="open = false"
            >
              Cancel
            </UButton>
            <UButton
              type="submit"
              color="success"
              :loading="loading"
              :disabled="!isValid"
            >
              Record Payment
            </UButton>
          </div>
        </form>
      </UCard>
    </template>
  </UModal>
</template>
