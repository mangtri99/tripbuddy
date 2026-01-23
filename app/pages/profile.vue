<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

definePageMeta({
  middleware: "auth",
});

const { user, fetchSession } = useAuth();
const toast = useToast();
const isLoading = ref(false);

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  bio: z.string().max(500, "Bio must be at most 500 characters").optional(),
  avatarUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
});

type Schema = z.output<typeof schema>;

const state = reactive<Schema>({
  name: user.value?.name || "",
  bio: user.value?.bio || "",
  avatarUrl: user.value?.avatarUrl || "",
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordSchema = z.output<typeof passwordSchema>;

const passwordState = reactive<Partial<PasswordSchema>>({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const isPasswordLoading = ref(false);

async function onChangePassword(event: FormSubmitEvent<PasswordSchema>) {
  isPasswordLoading.value = true;
  try {
    await $fetch("/api/user/password", {
      method: "PATCH",
      body: event.data,
    });

    toast.add({
      title: "Password updated",
      description: "Your password has been changed successfully.",
      color: "success",
    });

    // Reset form
    passwordState.currentPassword = "";
    passwordState.newPassword = "";
    passwordState.confirmPassword = "";
  } catch (error: any) {
    const message = error.data?.message || "Failed to update password";
    toast.add({
      title: "Error",
      description: message,
      color: "error",
    });
  } finally {
    isPasswordLoading.value = false;
  }
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  isLoading.value = true;
  try {
    await $fetch("/api/user/me", {
      method: "PATCH",
      body: event.data,
    });

    await fetchSession();

    toast.add({
      title: "Profile updated",
      description: "Your profile has been updated successfully.",
      color: "success",
    });
  } catch (error: any) {
    const message = error.data?.message || "Failed to update profile";
    toast.add({
      title: "Error",
      description: message,
      color: "error",
    });
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <UContainer class="py-8">
    <div class="max-w-2xl mx-auto">
      <div class="mb-8">
        <h1 class="text-3xl font-bold">Profile Settings</h1>
        <p class="text-muted mt-1">Manage your account information</p>
      </div>

      <UCard>
        <UForm
          :schema="schema"
          :state="state"
          class="space-y-6"
          @submit="onSubmit"
        >
          <div class="flex flex-col items-center sm:flex-row gap-6 mb-6">
            <UAvatar
              :src="state.avatarUrl || undefined"
              :alt="state.name"
              size="3xl"
            />
            <div class="flex-1 w-full">
              <UFormField
                label="Avatar URL"
                name="avatarUrl"
                help="Enter a direct link to an image"
              >
                <UInput
                  v-model="state.avatarUrl"
                  icon="i-lucide-image"
                  placeholder="https://example.com/avatar.jpg"
                />
              </UFormField>
            </div>
          </div>

          <UFormField label="Name" name="name" required>
            <UInput
              v-model="state.name"
              icon="i-lucide-user"
              placeholder="Your name"
            />
          </UFormField>

          <UFormField label="Bio" name="bio">
            <UTextarea
              v-model="state.bio"
              placeholder="Tell us a little about yourself..."
              :rows="4"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Email" name="email">
            <UInput
              :model-value="user?.email"
              icon="i-lucide-mail"
              disabled
              help="Email cannot be changed"
            />
          </UFormField>

          <div class="flex justify-end gap-3">
            <UButton
              label="Cancel"
              color="neutral"
              variant="ghost"
              to="/dashboard"
            />
            <UButton
              type="submit"
              label="Save changes"
              color="primary"
              :loading="isLoading"
            />
          </div>
        </UForm>
      </UCard>

      <UCard class="mt-6">
        <template #header>
          <h2 class="text-lg font-semibold">Change Password</h2>
        </template>
        <UForm
          :schema="passwordSchema"
          :state="passwordState"
          class="space-y-6"
          @submit="onChangePassword"
        >
          <UFormField label="Current Password" name="currentPassword" required>
            <UInput
              v-model="passwordState.currentPassword"
              type="password"
              icon="i-lucide-lock"
              placeholder="Current password"
            />
          </UFormField>

          <UFormField
            label="New Password"
            name="newPassword"
            help="Min 8 chars, uppercase, lowercase, number"
            required
          >
            <UInput
              v-model="passwordState.newPassword"
              type="password"
              icon="i-lucide-key"
              placeholder="New password"
            />
          </UFormField>

          <UFormField label="Confirm Password" name="confirmPassword" required>
            <UInput
              v-model="passwordState.confirmPassword"
              type="password"
              icon="i-lucide-key"
              placeholder="Confirm new password"
            />
          </UFormField>

          <div class="flex justify-end">
            <UButton
              type="submit"
              label="Update password"
              color="primary"
              :loading="isPasswordLoading"
            />
          </div>
        </UForm>
      </UCard>
    </div>
  </UContainer>
</template>
