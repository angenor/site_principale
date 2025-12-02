<template>
  <div class="min-h-screen bg-[var(--bg-page)]">
    <!-- Sidebar -->
    <AdminSidebar
      :is-collapsed="sidebarCollapsed"
      :is-mobile-open="mobileMenuOpen"
      @toggle="toggleSidebar"
      @close-mobile="mobileMenuOpen = false"
    />

    <!-- Header -->
    <AdminHeader
      :sidebar-collapsed="sidebarCollapsed"
      @toggle-mobile-sidebar="mobileMenuOpen = !mobileMenuOpen"
    />

    <!-- Main content -->
    <main
      :class="[
        'pt-16 min-h-screen transition-all duration-300',
        sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'
      ]"
    >
      <div class="p-4 lg:p-6">
        <NuxtPage />
      </div>
    </main>

    <!-- Toast notifications -->
    <UiToastContainer />
  </div>
</template>

<script setup lang="ts">
// Apply auth middleware to all admin pages
definePageMeta({
  middleware: 'auth',
})

// Initialize dark mode
const { isDark } = useDarkMode()

// Sidebar state
const sidebarCollapsed = ref(false)
const mobileMenuOpen = ref(false)

// Toggle sidebar collapsed state
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value

  // Persist preference
  if (import.meta.client) {
    localStorage.setItem('sidebar_collapsed', String(sidebarCollapsed.value))
  }
}

// Restore sidebar state from localStorage
onMounted(() => {
  if (import.meta.client) {
    const saved = localStorage.getItem('sidebar_collapsed')
    if (saved !== null) {
      sidebarCollapsed.value = saved === 'true'
    }
  }
})

// Close mobile menu on route change
const route = useRoute()
watch(() => route.path, () => {
  mobileMenuOpen.value = false
})

// Close mobile menu on window resize (if becomes desktop)
if (import.meta.client) {
  const handleResize = () => {
    if (window.innerWidth >= 1024) {
      mobileMenuOpen.value = false
    }
  }

  onMounted(() => {
    window.addEventListener('resize', handleResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })
}
</script>
