<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
    <!-- Sidebar -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 flex flex-col',
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
            to="/admin/collectivites/departements"
            class="flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Départements
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
            to="/admin/projets-miniers/types-minerais"
            class="flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Types de Minerais
          </NuxtLink>
          <NuxtLink
            to="/admin/projets-miniers/societes"
            class="flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Sociétés Minières
          </NuxtLink>
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
            to="/admin/exercices"
            class="flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Exercices Fiscaux
          </NuxtLink>
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
          <NuxtLink
            to="/admin/comptes-administratifs/lignes-budgetaires"
            class="flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Lignes Budgétaires
          </NuxtLink>
          <NuxtLink
            to="/admin/comptes-administratifs/equilibre"
            class="flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Tableau d'Équilibre
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
            to="/admin/documents/types-documents"
            class="flex items-center px-4 py-3 pl-8 text-sm font-medium text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Types de Documents
          </NuxtLink>
          <NuxtLink
            to="/admin/import/excel"
            class="flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Import Excel
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
          <!-- Search (future feature) -->
          <!-- <button class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button> -->

          <!-- Notifications -->
          <div class="relative">
            <button
              @click="showNotifications = !showNotifications"
              class="relative text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span class="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800"></span>
            </button>
          </div>

          <!-- Theme Toggle -->
          <ThemeToggle />

          <!-- User Menu -->
          <div class="relative">
            <button
              @click="showUserMenu = !showUserMenu"
              class="flex items-center space-x-3 focus:outline-none cursor-pointer"
            >
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300 hidden md:block">
                {{ user?.nom || 'Utilisateur' }}
              </span>
              <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-sm font-medium ring-2 ring-offset-2 ring-transparent hover:ring-blue-500 transition-all">
                {{ userInitials }}
              </div>
            </button>

            <!-- User Menu Dropdown -->
            <transition
              enter-active-class="transition ease-out duration-200"
              enter-from-class="transform opacity-0 scale-95"
              enter-to-class="transform opacity-100 scale-100"
              leave-active-class="transition ease-in duration-75"
              leave-from-class="transform opacity-100 scale-100"
              leave-to-class="transform opacity-0 scale-95"
            >
              <div
                v-if="showUserMenu"
                @click.stop
                class="absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50"
              >
                <div class="p-3 border-b border-gray-200 dark:border-gray-700">
                  <p class="text-sm font-medium text-gray-900 dark:text-white">{{ user?.nom }} {{ user?.prenom }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ user?.email }}</p>
                  <p class="text-xs text-blue-600 dark:text-blue-400 mt-1">{{ user?.role?.nom }}</p>
                </div>
                <div class="py-1">
                  <a
                    href="#"
                    class="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Mon profil
                  </a>
                  <a
                    href="#"
                    class="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Paramètres
                  </a>
                </div>
                <div class="py-1 border-t border-gray-200 dark:border-gray-700">
                  <button
                    @click="handleLogout"
                    class="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Déconnexion
                  </button>
                </div>
              </div>
            </transition>
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
definePageMeta({
  middleware: ['auth'],
})

const { user, logout } = useAuth()

const sidebarOpen = ref(false)
const showUserMenu = ref(false)
const showNotifications = ref(false)

// Initiales de l'utilisateur
const userInitials = computed(() => {
  if (user.value?.nom) {
    const nom = user.value.nom.charAt(0).toUpperCase()
    const prenom = user.value.prenom?.charAt(0).toUpperCase() || ''
    return prenom ? `${nom}${prenom}` : nom
  }
  return 'U'
})

// Déconnexion
const handleLogout = async () => {
  showUserMenu.value = false
  await logout()
}

// Fermer les menus quand on clique ailleurs
if (process.client) {
  document.addEventListener('click', () => {
    showUserMenu.value = false
    showNotifications.value = false
  })
}
</script>
