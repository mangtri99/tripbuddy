<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  layout: false
})

const { resetPassword, isLoading } = useAuth()
const route = useRoute()

const token = computed(() => route.query.token as string || '')

// Redirect if no token
if (!token.value) {
  navigateTo('/forgot-password')
}

const schema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string().min(1, 'Please confirm your password')
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  password: undefined,
  confirmPassword: undefined
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    await resetPassword(token.value, event.data.password)
  } catch {
    // Error handled in useAuth
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-default px-4">
    <UCard class="w-full max-w-md">
      <template #header>
        <div class="text-center">
          <NuxtLink
            to="/"
            class="inline-block mb-4"
          >
            <AppLogo />
          </NuxtLink>
          <h1 class="text-2xl font-bold">
            Set new password
          </h1>
          <p class="text-muted mt-1">
            Enter your new password below
          </p>
        </div>
      </template>

      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField
          label="New Password"
          name="password"
          hint="Min 8 characters with uppercase, lowercase, and number"
        >
          <UInput
            v-model="state.password"
            type="password"
            placeholder="Create a new password"
            icon="i-lucide-lock"
            autocomplete="new-password"
            :disabled="isLoading"
          />
        </UFormField>

        <UFormField
          label="Confirm Password"
          name="confirmPassword"
        >
          <UInput
            v-model="state.confirmPassword"
            type="password"
            placeholder="Confirm your new password"
            icon="i-lucide-lock"
            autocomplete="new-password"
            :disabled="isLoading"
          />
        </UFormField>

        <UButton
          type="submit"
          label="Reset password"
          color="primary"
          block
          :loading="isLoading"
        />
      </UForm>

      <template #footer>
        <p class="text-center text-sm text-muted">
          <NuxtLink
            to="/login"
            class="text-primary hover:underline font-medium"
          >
            Back to login
          </NuxtLink>
        </p>
      </template>
    </UCard>
  </div>
</template>
