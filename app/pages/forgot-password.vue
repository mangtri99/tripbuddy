<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  layout: false
})

const { forgotPassword, isLoading } = useAuth()

const schema = z.object({
  email: z.string().email('Invalid email address')
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  email: undefined
})

const submitted = ref(false)
const submittedEmail = ref('')

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    submittedEmail.value = event.data.email
    await forgotPassword(event.data.email)
    submitted.value = true
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
            Reset your password
          </h1>
          <p class="text-muted mt-1">
            {{ submitted ? 'Check your inbox' : 'Enter your email to receive a reset link' }}
          </p>
        </div>
      </template>

      <template v-if="!submitted">
        <UForm
          :schema="schema"
          :state="state"
          class="space-y-4"
          @submit="onSubmit"
        >
          <UFormField
            label="Email"
            name="email"
          >
            <UInput
              v-model="state.email"
              type="email"
              placeholder="you@example.com"
              icon="i-lucide-mail"
              autocomplete="email"
              :disabled="isLoading"
            />
          </UFormField>

          <UButton
            type="submit"
            label="Send reset link"
            color="primary"
            block
            :loading="isLoading"
          />
        </UForm>
      </template>

      <template v-else>
        <div class="text-center space-y-4">
          <div class="mx-auto w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
            <UIcon
              name="i-lucide-mail-check"
              class="w-8 h-8 text-success"
            />
          </div>
          <p class="text-muted">
            If an account exists with <strong>{{ submittedEmail }}</strong>, you'll receive an email with instructions to reset your password.
          </p>
          <UButton
            label="Back to login"
            to="/login"
            color="primary"
            variant="outline"
            block
          />
        </div>
      </template>

      <template #footer>
        <p class="text-center text-sm text-muted">
          Remember your password?
          <NuxtLink
            to="/login"
            class="text-primary hover:underline font-medium"
          >
            Sign in
          </NuxtLink>
        </p>
      </template>
    </UCard>
  </div>
</template>
