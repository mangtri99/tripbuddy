<script setup lang="ts">
definePageMeta({
  middleware: "auth",
});

const { user, logout, isLoading } = useAuth();
</script>

<template>
  <UContainer class="py-8">
    <div class="max-w-4xl mx-auto">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold">Dashboard</h1>
          <p class="text-muted mt-1">Welcome back, {{ user?.name }}!</p>
        </div>
        <UButton
          label="Logout"
          color="neutral"
          variant="outline"
          icon="i-lucide-log-out"
          :loading="isLoading"
          @click="logout"
        />
      </div>

      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <UCard>
          <template #header>
            <div class="flex items-center gap-3">
              <div class="p-2 rounded-lg bg-primary/10">
                <UIcon name="i-lucide-plane" class="w-6 h-6 text-primary" />
              </div>
              <h2 class="text-lg font-semibold">My Trips</h2>
            </div>
          </template>
          <p class="text-muted text-sm">
            Plan and manage your upcoming adventures.
          </p>
          <template #footer>
            <UButton
              label="View trips"
              color="primary"
              variant="soft"
              block
              icon="i-lucide-arrow-right"
              trailing
            />
          </template>
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center gap-3">
              <div class="p-2 rounded-lg bg-success/10">
                <UIcon name="i-lucide-users" class="w-6 h-6 text-success" />
              </div>
              <h2 class="text-lg font-semibold">Travel Partners</h2>
            </div>
          </template>
          <p class="text-muted text-sm">
            Find travel companions for your next trip.
          </p>
          <template #footer>
            <UButton
              label="Find partners"
              color="success"
              variant="soft"
              block
              icon="i-lucide-arrow-right"
              trailing
            />
          </template>
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center gap-3">
              <div class="p-2 rounded-lg bg-warning/10">
                <UIcon name="i-lucide-wallet" class="w-6 h-6 text-warning" />
              </div>
              <h2 class="text-lg font-semibold">Expenses</h2>
            </div>
          </template>
          <p class="text-muted text-sm">
            Track and split travel expenses with your group.
          </p>
          <template #footer>
            <UButton
              label="Manage expenses"
              color="warning"
              variant="soft"
              block
              icon="i-lucide-arrow-right"
              trailing
            />
          </template>
        </UCard>
      </div>

      <UCard class="mt-8">
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold">Account Information</h2>
            <UButton
              label="Edit profile"
              color="neutral"
              variant="ghost"
              icon="i-lucide-edit"
              to="/profile"
              size="sm"
            />
          </div>
        </template>
        <div class="space-y-4">
          <div class="flex items-center gap-4">
            <UAvatar
              :alt="user?.name || 'User'"
              :src="user?.avatarUrl || undefined"
              size="xl"
            />
            <div>
              <p class="font-medium text-lg">
                {{ user?.name }}
              </p>
              <p class="text-muted">
                {{ user?.email }}
              </p>
              <p v-if="user?.bio" class="text-sm text-muted mt-1">
                {{ user?.bio }}
              </p>
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </UContainer>
</template>
