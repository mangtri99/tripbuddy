<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

definePageMeta({
  layout: false,
});

const { register, isLoading, loggedIn } = useAuth();

// Redirect if already logged in
if (loggedIn.value) {
  navigateTo("/dashboard");
}

const schema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be at most 100 characters"),
    email: z.email(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type Schema = z.output<typeof schema>;

const state = reactive<Partial<Schema>>({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
});

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    await register({
      name: event.data.name.trim(),
      email: event.data.email,
      password: event.data.password,
    });
  } catch {
    // Error handled in useAuth
  }
}
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-default px-4 py-12"
  >
    <UCard class="w-full max-w-md">
      <template #header>
        <div class="text-center">
          <NuxtLink to="/" class="inline-block mb-4">
            <AppLogo />
          </NuxtLink>
          <h1 class="text-2xl font-bold">Create your account</h1>
          <p class="text-muted mt-1">Start planning your next adventure</p>
        </div>
      </template>

      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Name" name="name">
          <UInput
            v-model="state.name"
            type="text"
            placeholder="Your name"
            icon="i-lucide-user"
            autocomplete="name"
            :disabled="isLoading"
          />
        </UFormField>

        <UFormField label="Email" name="email">
          <UInput
            v-model="state.email"
            type="email"
            placeholder="you@example.com"
            icon="i-lucide-mail"
            autocomplete="email"
            :disabled="isLoading"
          />
        </UFormField>

        <UFormField
          label="Password"
          name="password"
          help="Min 8 characters with uppercase, lowercase, and number"
        >
          <UInput
            v-model="state.password"
            type="password"
            placeholder="Create a password"
            icon="i-lucide-lock"
            autocomplete="new-password"
            :disabled="isLoading"
          />
        </UFormField>

        <UFormField label="Confirm Password" name="confirmPassword">
          <UInput
            v-model="state.confirmPassword"
            type="password"
            placeholder="Confirm your password"
            icon="i-lucide-lock"
            autocomplete="new-password"
            :disabled="isLoading"
          />
        </UFormField>

        <UButton
          type="submit"
          label="Create account"
          color="primary"
          block
          :loading="isLoading"
        />
      </UForm>

      <template #footer>
        <p class="text-center text-sm text-muted">
          Already have an account?
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
