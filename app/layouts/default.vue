<template>
    <div class="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
        <NuxtPage />
    </div>
</template>

<script setup lang="ts">
// Layout par défaut avec support du dark mode et transitions de pages
</script>

<style>
/* Page transitions - Slide from right */
.page-enter-active,
.page-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

/* Ensure proper positioning for transitions */
.page-enter-active,
.page-leave-active {
  position: absolute;
  width: 100%;
}
</style>

