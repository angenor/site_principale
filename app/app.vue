<script setup lang="ts">
// Initialiser le dark mode au niveau de l'app
// @ts-ignore - Nuxt auto-imports composables
useDarkMode()
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
