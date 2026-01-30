export type ExpenseCategory =
  | 'accommodation'
  | 'transportation'
  | 'food'
  | 'activities'
  | 'shopping'
  | 'entertainment'
  | 'insurance'
  | 'visa'
  | 'communication'
  | 'other'

export type SplitMethod = 'equal' | 'percentage' | 'custom' | 'full'

export interface ExpenseParticipant {
  id: string
  userId: string
  shareAmount: number
  sharePercentage: number | null
  isSettled: boolean
  settledAt: string | null
  user: {
    id: string
    name: string
    avatarUrl: string | null
  }
}

export interface SharedExpense {
  id: string
  groupId: string
  paidBy: string
  category: ExpenseCategory
  amount: number
  currency: string
  description: string
  receiptUrl: string | null
  splitMethod: SplitMethod
  date: string
  createdAt: string
  updatedAt: string
  paidByUser: {
    id: string
    name: string
    email: string
    avatarUrl: string | null
  }
  participants: ExpenseParticipant[]
}

export interface Settlement {
  id: string
  groupId: string
  fromUserId: string
  toUserId: string
  amount: number
  currency: string
  note: string | null
  createdAt: string
  fromUser: {
    id: string
    name: string
    avatarUrl: string | null
  }
  toUser?: {
    id: string
    name: string
    avatarUrl: string | null
  }
}

export interface UserBalance {
  userId: string
  user: {
    id: string
    name: string
    avatarUrl: string | null
  }
  owes: { userId: string; userName: string; amount: number }[]
  isOwed: { userId: string; userName: string; amount: number }[]
  netBalance: number
}

export interface CreateSharedExpenseData {
  category: ExpenseCategory
  amount: number
  currency?: string
  description: string
  receiptUrl?: string
  splitMethod: SplitMethod
  date: string
  participants: {
    userId: string
    shareAmount?: number
    sharePercentage?: number
  }[]
}

export interface CreateSettlementData {
  toUserId: string
  amount: number
  currency?: string
  note?: string
}

export function useSharedExpenses(groupId: Ref<string>) {
  const expenses = ref<SharedExpense[]>([])
  const settlements = ref<Settlement[]>([])
  const balances = ref<UserBalance[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchExpenses() {
    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch<{ expenses: SharedExpense[] }>(
        `/api/groups/${groupId.value}/expenses`
      )
      expenses.value = response.expenses
    } catch (err: any) {
      error.value = err.data?.message || 'Failed to fetch expenses'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchExpense(expenseId: string) {
    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch<{ expense: SharedExpense }>(
        `/api/groups/${groupId.value}/expenses/${expenseId}`
      )
      return response.expense
    } catch (err: any) {
      error.value = err.data?.message || 'Failed to fetch expense'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function createExpense(data: CreateSharedExpenseData) {
    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch<{ expense: SharedExpense }>(
        `/api/groups/${groupId.value}/expenses`,
        {
          method: 'POST',
          body: data
        }
      )
      expenses.value.unshift(response.expense)
      await fetchBalances()
      return response.expense
    } catch (err: any) {
      error.value = err.data?.message || 'Failed to create expense'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function updateExpense(expenseId: string, data: Partial<CreateSharedExpenseData>) {
    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch<{ expense: SharedExpense }>(
        `/api/groups/${groupId.value}/expenses/${expenseId}`,
        {
          method: 'PATCH',
          body: data
        }
      )
      const index = expenses.value.findIndex(e => e.id === expenseId)
      if (index !== -1) {
        expenses.value[index] = response.expense
      }
      await fetchBalances()
      return response.expense
    } catch (err: any) {
      error.value = err.data?.message || 'Failed to update expense'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function deleteExpense(expenseId: string) {
    isLoading.value = true
    error.value = null

    try {
      await $fetch(`/api/groups/${groupId.value}/expenses/${expenseId}`, {
        method: 'DELETE'
      })
      expenses.value = expenses.value.filter(e => e.id !== expenseId)
      await fetchBalances()
    } catch (err: any) {
      error.value = err.data?.message || 'Failed to delete expense'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function settleParticipant(expenseId: string, participantId: string, isSettled: boolean) {
    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch<{ expense: SharedExpense }>(
        `/api/groups/${groupId.value}/expenses/${expenseId}/settle/${participantId}`,
        {
          method: 'PATCH',
          body: { isSettled }
        }
      )
      const index = expenses.value.findIndex(e => e.id === expenseId)
      if (index !== -1) {
        expenses.value[index] = response.expense
      }
      await fetchBalances()
      return response.expense
    } catch (err: any) {
      error.value = err.data?.message || 'Failed to update settlement status'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchSettlements() {
    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch<{ settlements: Settlement[] }>(
        `/api/groups/${groupId.value}/settlements`
      )
      settlements.value = response.settlements
    } catch (err: any) {
      error.value = err.data?.message || 'Failed to fetch settlements'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function createSettlement(data: CreateSettlementData) {
    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch<{ settlement: Settlement }>(
        `/api/groups/${groupId.value}/settlements`,
        {
          method: 'POST',
          body: data
        }
      )
      settlements.value.unshift(response.settlement)
      await fetchBalances()
      return response.settlement
    } catch (err: any) {
      error.value = err.data?.message || 'Failed to create settlement'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchBalances() {
    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch<{ balances: UserBalance[] }>(
        `/api/groups/${groupId.value}/balances`
      )
      balances.value = response.balances
    } catch (err: any) {
      error.value = err.data?.message || 'Failed to fetch balances'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Computed helpers
  const totalExpenses = computed(() => {
    return expenses.value.reduce((sum, e) => sum + e.amount, 0)
  })

  const unsettledAmount = computed(() => {
    return expenses.value.reduce((sum, expense) => {
      const unsettled = expense.participants
        .filter(p => !p.isSettled && p.userId !== expense.paidBy)
        .reduce((s, p) => s + p.shareAmount, 0)
      return sum + unsettled
    }, 0)
  })

  return {
    expenses,
    settlements,
    balances,
    isLoading,
    error,
    totalExpenses,
    unsettledAmount,
    fetchExpenses,
    fetchExpense,
    createExpense,
    updateExpense,
    deleteExpense,
    settleParticipant,
    fetchSettlements,
    createSettlement,
    fetchBalances
  }
}
