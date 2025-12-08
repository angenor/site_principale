<template>
  <header
    :class="[
      'fixed top-0 right-0 z-[var(--z-sticky)] h-16 bg-[var(--bg-header)] border-b border-[var(--border-default)] flex items-center justify-between px-4 lg:px-6 transition-all duration-300',
      sidebarCollapsed ? 'left-0 lg:left-16' : 'left-0 lg:left-64'
    ]"
  >
    <!-- Left section -->
    <div class="flex items-center gap-4">
      <!-- Mobile menu button -->
      <button
        @click="$emit('toggle-mobile-sidebar')"
        class="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--interactive-hover)] transition-colors cursor-pointer"
      >
        <font-awesome-icon :icon="['fas', 'bars']" class="text-xl" />
      </button>

      <!-- Breadcrumb -->
      <AdminBreadcrumb />
    </div>

    <!-- Right section -->
    <div class="flex items-center gap-2">
      <!-- Search button (mobile) -->
      <button
        @click="showMobileSearch = true"
        class="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--interactive-hover)] transition-colors cursor-pointer"
      >
        <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
      </button>

      <!-- Search bar (desktop) -->
      <div class="hidden lg:flex items-center">
        <AdminSearchBar />
      </div>

      <!-- Divider -->
      <div class="hidden lg:block h-6 w-px bg-[var(--border-default)] mx-2" />

      <!-- Notifications -->
      <button
        class="relative flex items-center justify-center w-10 h-10 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--interactive-hover)] transition-colors cursor-pointer"
      >
        <font-awesome-icon :icon="['fas', 'bell']" />
        <!-- Notification badge -->
        <span
          v-if="notificationCount > 0"
          class="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-bold text-white bg-[var(--color-error)] rounded-full"
        >
          {{ notificationCount > 99 ? '99+' : notificationCount }}
        </span>
      </button>

      <!-- Theme toggle -->
      <button
        @click="toggleDarkMode"
        class="flex items-center justify-center w-10 h-10 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--interactive-hover)] transition-colors cursor-pointer"
        :title="isDark ? 'Mode clair' : 'Mode sombre'"
      >
        <font-awesome-icon :icon="['fas', isDark ? 'sun' : 'moon']" />
      </button>

      <!-- User menu -->
      <AdminUserMenu />
    </div>

    <!-- Mobile search modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showMobileSearch"
          class="fixed inset-0 z-[100] bg-black/50 lg:hidden"
          @click="showMobileSearch = false"
        >
          <div
            class="absolute top-4 left-4 right-4 bg-[var(--bg-card)] rounded-xl shadow-xl p-4"
            @click.stop
          >
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-[var(--text-primary)]">Recherche</h3>
              <button
                @click="showMobileSearch = false"
                class="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--interactive-hover)]"
              >
                <font-awesome-icon :icon="['fas', 'xmark']" />
              </button>
            </div>
            <AdminSearchBar @navigate="showMobileSearch = false" />
          </div>
        </div>
      </Transition>
    </Teleport>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  sidebarCollapsed: boolean
}>()

defineEmits<{
  'toggle-mobile-sidebar': []
}>()

const { isDark, toggleDarkMode } = useDarkMode()

// Mobile search modal
const showMobileSearch = ref(false)

// TODO: Replace with real notification count from API
const notificationCount = ref(3)
</script>
