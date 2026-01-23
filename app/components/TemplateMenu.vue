<script setup lang="ts">
const route = useRoute()

const navigation = [
  { label: 'Discover', to: '/discover', icon: 'i-lucide-compass' },
  { label: 'My Trips', to: '/trips', icon: 'i-lucide-map' },
  { label: 'Groups', to: '/groups', icon: 'i-lucide-users' },
  { label: 'Partners', to: '/partners', icon: 'i-lucide-heart-handshake' }
]
</script>

<template>
  <nav class="hidden md:flex items-center gap-1 ml-4">
    <UButton
      v-for="item in navigation"
      :key="item.to"
      :to="item.to"
      :label="item.label"
      :icon="item.icon"
      variant="ghost"
      color="neutral"
      size="sm"
      :class="[route.path === item.to && 'bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400']"
    />
  </nav>
</template>
