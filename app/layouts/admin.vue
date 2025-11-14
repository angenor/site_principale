<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
    <!-- Sidebar -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      ]"
    >
      <!-- Logo / Brand -->
      <div class="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
        <h1 class="text-xl font-bold text-gray-900 dark:text-white">
          Admin CT
        </h1>
        <button
          @click="sidebarOpen = false"
          class="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <NuxtLink
          to="/admin"
          class="flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          active-class="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
        >
          <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Dashboard
        </NuxtLink>

        <!-- Section: Collectivités -->
        <div class="pt-4">
          <h3 class="px-4 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
            Collectivités
          </h3>
          <NuxtLink
            to="/admin/collectivites/regions"
            class="flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Régions
          </NuxtLink>
          <NuxtLink
            to="/admin/collectivites/districts"
            class="flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Districts
          </NuxtLink>
          <NuxtLink
            to="/admin/collectivites/communes"
            class="flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Communes
          </NuxtLink>
        </div>

        <!-- Section: Projets Miniers -->
        <div class="pt-4">
          <h3 class="px-4 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
            Projets Miniers
          </h3>
          <NuxtLink
            to="/admin/projets-miniers/projets"
            class="flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Projets
          </NuxtLink>
          <NuxtLink
            to="/admin/projets-miniers/revenus"
            class="flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Revenus
          </NuxtLink>
        </div>

        <!-- Section: Comptes Administratifs -->
        <div class="pt-4">
          <h3 class="px-4 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
            Comptes Administratifs
          </h3>
          <NuxtLink
            to="/admin/comptes-administratifs/comptes"
            class="flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Comptes
          </NuxtLink>
          <NuxtLink
            to="/admin/comptes-administratifs/rubriques"
            class="flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Rubriques
          </NuxtLink>
        </div>

        <!-- Section: Gestion -->
        <div class="pt-4">
          <h3 class="px-4 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
            Gestion
          </h3>
          <NuxtLink
            to="/admin/documents"
            class="flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Documents
          </NuxtLink>
          <NuxtLink
            to="/admin/newsletter/abonnes"
            class="flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Newsletter
          </NuxtLink>
          <NuxtLink
            to="/admin/utilisateurs"
            class="flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Utilisateurs
          </NuxtLink>
          <NuxtLink
            to="/admin/analytics"
            class="flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Analytics
          </NuxtLink>
          <NuxtLink
            to="/admin/messagerie"
            class="flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Messagerie
          </NuxtLink>
        </div>

        <!-- Section: Système -->
        <div class="pt-4">
          <h3 class="px-4 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
            Système
          </h3>
          <NuxtLink
            to="/admin/parametres"
            class="flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Paramètres
          </NuxtLink>
        </div>
      </nav>
    </aside>

    <!-- Main Content -->
    <div class="lg:pl-64">
      <!-- Header -->
      <header class="sticky top-0 z-40 flex items-center justify-between h-16 px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <!-- Mobile menu button -->
        <button
          @click="sidebarOpen = true"
          class="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div class="flex items-center space-x-4">
          <!-- Theme Toggle -->
          <ThemeToggle />

          <!-- User Menu -->
          <div class="flex items-center space-x-3">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Admin</span>
            <div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
              A
            </div>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="p-6">
        <slot />
      </main>
    </div>

    <!-- Overlay pour mobile -->
    <div
      v-if="sidebarOpen"
      @click="sidebarOpen = false"
      class="fixed inset-0 z-40 bg-gray-900/50 lg:hidden"
    ></div>
  </div>
</template>

<script setup lang="ts">
const sidebarOpen = ref(false)
</script>
