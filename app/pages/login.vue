<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

definePageMeta({
  layout: false,
});

const { login, isLoading, loggedIn } = useAuth();
const route = useRoute();

// Redirect if already logged in
if (loggedIn.value) {
  navigateTo("/dashboard");
}

const schema = z.object({
  email: z.email(),
  password: z.string().min(1, "Password is required"),
});

type Schema = z.output<typeof schema>;

const state = reactive<Partial<Schema>>({
  email: "",
  password: "",
});

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    await login({
      email: event.data.email,
      password: event.data.password,
    });
    // Redirect to original destination or dashboard
    const redirect = (route.query.redirect as string) || "/dashboard";
    await navigateTo(redirect);
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
          <NuxtLink to="/" class="inline-block mb-4">
            <AppLogo />
          </NuxtLink>
          <h1 class="text-2xl font-bold">Welcome back</h1>
          <p class="text-muted mt-1">Sign in to your account</p>
        </div>
      </template>

      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
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

        <UFormField label="Password" name="password">
          <UInput
            v-model="state.password"
            type="password"
            placeholder="Enter your password"
            icon="i-lucide-lock"
            autocomplete="current-password"
            :disabled="isLoading"
          />
        </UFormField>

        <div class="flex items-center justify-end">
          <NuxtLink
            to="/forgot-password"
            class="text-sm text-primary hover:underline"
          >
            Forgot password?
          </NuxtLink>
        </div>

        <UButton
          type="submit"
          label="Sign in"
          color="primary"
          block
          :loading="isLoading"
        />
      </UForm>

      <template #footer>
        <p class="text-center text-sm text-muted">
          Don't have an account?
          <NuxtLink
            to="/register"
            class="text-primary hover:underline font-medium"
          >
            Create one
          </NuxtLink>
        </p>
      </template>
    </UCard>
  </div>
</template>
