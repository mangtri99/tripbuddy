<script setup>
useHead({
  meta: [{ name: "viewport", content: "width=device-width, initial-scale=1" }],
  link: [{ rel: "icon", href: "/favicon.ico" }],
  htmlAttrs: {
    lang: "en",
  },
});

const title = "Trip Buddy - Your Ultimate Travel Planning Companion";
const description =
  "Plan trips, track budgets, find travel partners, and discover amazing places. All-in-one travel planning made easy.";

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterCard: "summary_large_image",
});

const { loggedIn, user } = useUserSession();
const { logout, isLoading } = useAuth();

const userMenuItems = [
  [
    {
      label: "Dashboard",
      icon: "i-lucide-layout-dashboard",
      to: "/dashboard",
    },
  ],
  [
    {
      label: "Sign out",
      icon: "i-lucide-log-out",
      onSelect: logout,
    },
  ],
];
</script>

<template>
  <UApp>
    <UHeader>
      <template #left>
        <NuxtLink to="/" class="flex items-center">
          <AppLogo />
        </NuxtLink>

        <TemplateMenu />
      </template>

      <template #right>
        <UColorModeButton />

        <template v-if="loggedIn">
          <UDropdownMenu :items="userMenuItems">
            <UButton color="neutral" variant="ghost" :loading="isLoading">
              <UAvatar
                :alt="user?.name || 'User'"
                :src="user?.avatarUrl || undefined"
                size="xs"
              />
              <span class="hidden sm:inline">{{ user?.name }}</span>
              <UIcon name="i-lucide-chevron-down" class="w-4 h-4" />
            </UButton>
          </UDropdownMenu>
        </template>

        <template v-else>
          <UButton
            to="/login"
            label="Sign in"
            color="neutral"
            variant="ghost"
            class="hidden sm:flex"
          />

          <UButton
            to="/register"
            label="Get Started"
            color="primary"
            trailing-icon="i-lucide-arrow-right"
          />
        </template>
      </template>
    </UHeader>

    <UMain>
      <NuxtPage />
    </UMain>

    <USeparator icon="i-lucide-plane" />

    <UFooter>
      <template #left>
        <div class="flex flex-col gap-2">
          <AppLogo />
          <p class="text-sm text-muted">
            Your travel companion for planning the perfect trip.
          </p>
          <p class="text-xs text-muted">
            &copy; {{ new Date().getFullYear() }} Trip Buddy. All rights
            reserved.
          </p>
        </div>
      </template>

      <template #right>
        <div class="flex items-center gap-2">
          <UButton
            to="https://twitter.com"
            target="_blank"
            icon="i-simple-icons-x"
            aria-label="Twitter"
            color="neutral"
            variant="ghost"
          />
          <UButton
            to="https://instagram.com"
            target="_blank"
            icon="i-simple-icons-instagram"
            aria-label="Instagram"
            color="neutral"
            variant="ghost"
          />
          <UButton
            to="https://github.com"
            target="_blank"
            icon="i-simple-icons-github"
            aria-label="GitHub"
            color="neutral"
            variant="ghost"
          />
        </div>
      </template>
    </UFooter>
  </UApp>
</template>
