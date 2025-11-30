<script setup lang="ts">
const { user, isAuthenticated, logout, fullName, isAdmin } = useAuth()

// Navigation admin
const navigation = [
  { name: 'Tableau de bord', href: '/admin', icon: 'chart-pie' },
  { name: 'Études de cas', href: '/admin/cases', icon: 'folder-open' },
  { name: 'Actualités', href: '/admin/news', icon: 'newspaper' },
  { name: 'Signalements', href: '/admin/contacts', icon: 'envelope' },
  { name: 'Contenu', href: '/admin/content', icon: 'file-lines' },
  { name: 'Utilisateurs', href: '/admin/users', icon: 'users', adminOnly: true }
]

const filteredNavigation = computed(() => {
  return navigation.filter(item => !item.adminOnly || isAdmin.value)
})

const isSidebarOpen = ref(true)
const isMobileMenuOpen = ref(false)

const route = useRoute()

function isActive(href: string) {
  if (href === '/admin') {
    return route.path === '/admin'
  }
  return route.path.startsWith(href)
}

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}

async function handleLogout() {
  await logout()
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900">
    <!-- Sidebar mobile -->
    <Transition name="slide-fade">
      <div
        v-if="isMobileMenuOpen"
        class="fixed inset-0 z-40 lg:hidden"
        @click="isMobileMenuOpen = false"
      >
        <div class="fixed inset-0 bg-gray-600/75" />
      </div>
    </Transition>

    <Transition name="slide-left">
      <aside
        v-show="isMobileMenuOpen"
        class="fixed inset-y-0 left-0 z-50 w-72 bg-gray-900 lg:hidden"
      >
        <div class="flex h-16 items-center justify-between px-4 border-b border-gray-800">
          <NuxtLink to="/admin" class="flex items-center gap-2">
            <img
              src="/images/logos/logo_fond_noire_texte_blanc.jpeg"
              alt="MOM"
              class="h-10 w-auto rounded"
            />
            <span class="text-white font-semibold">Admin</span>
          </NuxtLink>
          <button
            @click="isMobileMenuOpen = false"
            class="text-gray-400 hover:text-white cursor-pointer"
          >
            <font-awesome-icon icon="xmark" class="w-6 h-6" />
          </button>
        </div>
        <nav class="flex-1 px-3 py-4 space-y-1">
          <NuxtLink
            v-for="item in filteredNavigation"
            :key="item.name"
            :to="item.href"
            @click="isMobileMenuOpen = false"
            :class="[
              isActive(item.href)
                ? 'bg-ti-blue text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white',
              'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors'
            ]"
          >
            <font-awesome-icon :icon="item.icon" class="w-5 h-5" />
            {{ item.name }}
          </NuxtLink>
        </nav>
      </aside>
    </Transition>

    <!-- Sidebar desktop -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-30 hidden lg:flex flex-col bg-gray-900 transition-all duration-300',
        isSidebarOpen ? 'w-64' : 'w-20'
      ]"
    >
      <!-- Logo -->
      <div class="flex h-16 items-center justify-between px-4 border-b border-gray-800">
        <NuxtLink v-if="isSidebarOpen" to="/admin" class="flex items-center gap-2">
          <img
            src="/images/logos/logo_fond_noire_texte_blanc.jpeg"
            alt="MOM"
            class="h-10 w-auto rounded"
          />
          <span class="text-white font-semibold">Admin</span>
        </NuxtLink>
        <NuxtLink v-else to="/admin" class="mx-auto">
          <img
            src="/images/logos/logo_fond_noire_texte_blanc.jpeg"
            alt="MOM"
            class="h-10 w-auto rounded"
          />
        </NuxtLink>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <NuxtLink
          v-for="item in filteredNavigation"
          :key="item.name"
          :to="item.href"
          :class="[
            isActive(item.href)
              ? 'bg-ti-blue text-white'
              : 'text-gray-300 hover:bg-gray-800 hover:text-white',
            'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
            !isSidebarOpen && 'justify-center'
          ]"
          :title="!isSidebarOpen ? item.name : undefined"
        >
          <font-awesome-icon :icon="item.icon" class="w-5 h-5 shrink-0" />
          <span v-if="isSidebarOpen">{{ item.name }}</span>
        </NuxtLink>
      </nav>

      <!-- Lien vers le site public -->
      <div class="p-3 border-t border-gray-800">
        <NuxtLink
          to="/"
          target="_blank"
          :class="[
            'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors',
            !isSidebarOpen && 'justify-center'
          ]"
          :title="!isSidebarOpen ? 'Voir le site' : undefined"
        >
          <font-awesome-icon icon="external-link-alt" class="w-5 h-5" />
          <span v-if="isSidebarOpen">Voir le site</span>
        </NuxtLink>
      </div>
    </aside>

    <!-- Main content -->
    <div
      :class="[
        'transition-all duration-300',
        isSidebarOpen ? 'lg:pl-64' : 'lg:pl-20'
      ]"
    >
      <!-- Top bar -->
      <header class="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 shadow-sm">
        <!-- Toggle sidebar (desktop) -->
        <button
          @click="toggleSidebar"
          class="hidden lg:flex items-center justify-center w-10 h-10 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-white transition-colors cursor-pointer"
        >
          <font-awesome-icon :icon="isSidebarOpen ? 'angles-left' : 'angles-right'" />
        </button>

        <!-- Mobile menu button -->
        <button
          @click="isMobileMenuOpen = true"
          class="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-white transition-colors cursor-pointer"
        >
          <font-awesome-icon icon="bars" class="w-5 h-5" />
        </button>

        <!-- Breadcrumb / Title -->
        <div class="flex-1">
          <h1 class="text-lg font-semibold text-gray-900 dark:text-white">
            <slot name="title">Administration</slot>
          </h1>
        </div>

        <!-- User menu -->
        <div class="flex items-center gap-4">
          <!-- Theme toggle -->
          <ThemeToggle />

          <!-- User info -->
          <div class="hidden sm:flex items-center gap-3">
            <div class="text-right">
              <p class="text-sm font-medium text-gray-900 dark:text-white">{{ fullName }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ user?.role }}</p>
            </div>
            <div class="h-10 w-10 rounded-full bg-ti-blue flex items-center justify-center text-white font-semibold">
              {{ user?.firstName?.charAt(0) }}{{ user?.lastName?.charAt(0) }}
            </div>
          </div>

          <!-- Logout -->
          <button
            @click="handleLogout"
            class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
            title="Se déconnecter"
          >
            <font-awesome-icon icon="right-from-bracket" />
            <span class="hidden sm:inline">Déconnexion</span>
          </button>
        </div>
      </header>

      <!-- Page content -->
      <main class="p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: opacity 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s ease;
}

.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(-100%);
}
</style>
