<template>
  <div class="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors duration-200">
    <!-- Header -->
    <AppHeader />

    <!-- Contenu principal -->
    <main class="flex-1 relative overflow-hidden">
      <NuxtPage :transition="pageTransition" />
    </main>

    <!-- Footer -->
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
// Layout par défaut avec support du dark mode et transitions directionnelles
const { direction } = useNavigationDirection()

// Transition dynamique basée sur la direction de navigation
const pageTransition = computed(() => ({
  name: direction.value === 'back' ? 'page-back' : 'page-forward',
  mode: 'out-in' as const
}))
</script>

<style>
/* ============================================
   Transitions de page directionnelles
   ============================================ */

/* Configuration commune */
.page-forward-enter-active,
.page-forward-leave-active,
.page-back-enter-active,
.page-back-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Navigation FORWARD (nouvelle page : droite → gauche) */
.page-forward-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.page-forward-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* Navigation BACK (retour : gauche → droite) */
.page-back-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.page-back-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
