<script setup lang="ts">
import type {
  CreateSharedExpenseData,
  SharedExpense,
} from "~/composables/useSharedExpenses";

definePageMeta({
  middleware: "auth",
});

const route = useRoute();
const { user } = useAuth();
const { currentGroup, isLoading: groupLoading, fetchGroup } = useGroups();

const groupId = computed(() => route.params.id as string);
const {
  expenses,
  settlements,
  balances,
  isLoading: expensesLoading,
  fetchExpenses,
  fetchSettlements,
  fetchBalances,
  createExpense,
  updateExpense,
  deleteExpense,
  settleParticipant,
  createSettlement,
} = useSharedExpenses(groupId);

const showExpenseModal = ref(false);
const showSettlementModal = ref(false);
const editingExpense = ref<SharedExpense | null>(null);
const settlementPrefill = ref<{ toUserId?: string; amount?: number }>({});

const canEdit = computed(() => {
  return (
    currentGroup.value?.currentUserRole === "admin" ||
    currentGroup.value?.currentUserRole === "editor"
  );
});

const members = computed(() => {
  return currentGroup.value?.members || [];
});

onMounted(async () => {
  await fetchGroup(groupId.value);
  await Promise.all([fetchExpenses(), fetchSettlements(), fetchBalances()]);
});

async function handleExpenseSubmit(data: CreateSharedExpenseData) {
  try {
    if (editingExpense.value) {
      await updateExpense(editingExpense.value.id, data);
    } else {
      await createExpense(data);
    }
    showExpenseModal.value = false;
    editingExpense.value = null;
  } catch {
    // Error handled by composable
  }
}

function handleEditExpense(expense: SharedExpense) {
  editingExpense.value = expense;
  showExpenseModal.value = true;
}

async function handleDeleteExpense(expenseId: string) {
  try {
    await deleteExpense(expenseId);
  } catch {
    // Error handled by composable
  }
}

async function handleSettleParticipant(
  expenseId: string,
  participantId: string,
  isSettled: boolean,
) {
  try {
    await settleParticipant(expenseId, participantId, isSettled);
  } catch {
    // Error handled by composable
  }
}

function openSettlementModal(toUserId: string, amount: number) {
  settlementPrefill.value = { toUserId, amount };
  showSettlementModal.value = true;
}

async function handleSettlementSubmit(data: {
  toUserId: string;
  amount: number;
  currency: string;
  note?: string;
}) {
  try {
    await createSettlement(data);
    showSettlementModal.value = false;
    settlementPrefill.value = {};
  } catch {
    // Error handled by composable
  }
}

function openNewExpense() {
  editingExpense.value = null;
  showExpenseModal.value = true;
}
</script>

<template>
  <UContainer class="py-8">
    <div class="max-w-6xl mx-auto">
      <div class="flex items-center gap-4 mb-6">
        <UButton
          :to="`/groups/${groupId}`"
          color="neutral"
          variant="ghost"
          icon="i-lucide-arrow-left"
        >
          Back to Group
        </UButton>
      </div>

      <div v-if="groupLoading && !currentGroup" class="space-y-6">
        <div class="animate-pulse">
          <div class="h-8 bg-muted/30 rounded w-1/3 mb-4" />
          <div class="h-4 bg-muted/30 rounded w-1/4" />
        </div>
      </div>

      <div v-else-if="currentGroup">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="text-2xl font-bold">
              {{ currentGroup.name }} - Expenses
            </h1>
            <p class="text-muted">Track and split shared expenses</p>
          </div>
          <UButton
            v-if="canEdit"
            color="primary"
            icon="i-lucide-plus"
            @click="openNewExpense"
          >
            Add Expense
          </UButton>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Main expenses list -->
          <div class="lg:col-span-2 space-y-6">
            <ExpenseList
              :expenses="expenses"
              :current-user-id="user?.id || ''"
              :can-edit="canEdit"
              :loading="expensesLoading"
              @edit="handleEditExpense"
              @delete="handleDeleteExpense"
              @settle="handleSettleParticipant"
            />
          </div>

          <!-- Sidebar with balances and settlements -->
          <div class="space-y-6">
            <ExpenseBalanceSummary
              :balances="balances"
              :current-user-id="user?.id || ''"
              @settle="
                (toUserId: string, amount: number) =>
                  openSettlementModal(toUserId, amount)
              "
            />

            <ExpenseSettlementHistory
              :settlements="settlements"
              :current-user-id="user?.id || ''"
            />
          </div>
        </div>
      </div>

      <div v-else class="text-center py-16">
        <UIcon
          name="i-lucide-alert-circle"
          class="w-16 h-16 text-muted mx-auto mb-4"
        />
        <h2 class="text-xl font-semibold mb-2">Group not found</h2>
        <p class="text-muted mb-6">
          The group you're looking for doesn't exist or you don't have access.
        </p>
        <UButton to="/groups" color="primary"> Back to Groups </UButton>
      </div>

      <!-- Expense Form Modal -->
      <UModal v-model:open="showExpenseModal">
        <template #content>
          <UCard class="w-full max-w-2xl">
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold">
                  {{ editingExpense ? "Edit Expense" : "Add Expense" }}
                </h3>
                <UButton
                  color="neutral"
                  variant="ghost"
                  icon="i-lucide-x"
                  size="sm"
                  square
                  @click="showExpenseModal = false"
                />
              </div>
            </template>

            <ExpenseForm
              :expense="editingExpense || undefined"
              :members="members"
              :loading="expensesLoading"
              @submit="handleExpenseSubmit"
              @cancel="showExpenseModal = false"
            />
          </UCard>
        </template>
      </UModal>

      <!-- Settlement Modal -->
      <ExpenseSettlementModal
        v-model:open="showSettlementModal"
        :members="members"
        :current-user-id="user?.id || ''"
        :loading="expensesLoading"
        :prefilled-to-user-id="settlementPrefill.toUserId"
        :prefilled-amount="settlementPrefill.amount"
        @submit="handleSettlementSubmit"
        @cancel="showSettlementModal = false"
      />
    </div>
  </UContainer>
</template>
