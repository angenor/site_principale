<script setup lang="ts">
const { isDark, toggleDarkMode } = useDarkMode()
</script>

<template>
  <button
    @click="toggleDarkMode"
    class="relative inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-200"
    :aria-label="isDark ? 'Activer le mode clair' : 'Activer le mode sombre'"
    :title="isDark ? 'Activer le mode clair' : 'Activer le mode sombre'"
  >
    <!-- Icône Soleil (mode clair) avec Font Awesome -->
    <Transition name="icon-fade">
      <font-awesome-icon
        v-if="!isDark"
        key="sun"
        icon="sun"
        class="w-5 h-5 text-yellow-500"
      />
    </Transition>

    <!-- Icône Lune (mode sombre) avec Font Awesome -->
    <Transition name="icon-fade">
      <font-awesome-icon
        v-if="isDark"
        key="moon"
        icon="moon"
        class="w-5 h-5 text-blue-400"
      />
    </Transition>
  </button>
</template>

<style scoped>
.icon-fade-enter-active,
.icon-fade-leave-active {
  transition: opacity 0.2s ease;
  position: absolute;
}

.icon-fade-enter-from,
.icon-fade-leave-to {
  opacity: 0;
}

.icon-fade-enter-to,
.icon-fade-leave-from {
  opacity: 1;
}
</style>
