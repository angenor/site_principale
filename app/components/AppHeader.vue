<script setup lang="ts">
const { isDark } = useDarkMode()

// État du menu mobile
const isMobileMenuOpen = ref(false)

// État de la recherche desktop
const isSearchOpen = ref(false)

// Liens de navigation
const navLinks = [
  { name: 'Accueil', path: '/' },
  { name: 'Études de cas', path: '/cas' },
  { name: 'Actualités', path: '/actualites' },
  { name: 'Ressources', path: '/ressources' },
  { name: 'À propos', path: '/a-propos' }
]

// Fermer la recherche desktop
const closeSearch = () => {
  isSearchOpen.value = false
}

// Fermer la recherche et le menu mobile
const closeSearchAndMenu = () => {
  isSearchOpen.value = false
  isMobileMenuOpen.value = false
}

// Fermer le menu mobile lors du changement de route
const route = useRoute()
watch(() => route.path, () => {
  isMobileMenuOpen.value = false
  isSearchOpen.value = false
})

// Fermer le menu mobile en cliquant à l'extérieur
const closeMenu = () => {
  isMobileMenuOpen.value = false
}
</script>

<template>
  <header class="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-md transition-colors duration-200">
    <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16 lg:h-20">
        <!-- Logo -->
        <NuxtLink to="/" class="flex-shrink-0">
          <img
            src="/images/logos/logo.jpeg"
            alt="Observatoire des Mines de Madagascar"
            class="h-12 lg:h-14 max-w-[180px] lg:max-w-[220px] object-contain dark:invert dark:hue-rotate-180 transition-[filter] duration-200"
          />
        </NuxtLink>

        <!-- Navigation Desktop -->
        <div class="hidden md:flex items-center space-x-1">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.path"
            :to="link.path"
            class="px-4 py-2 font-heading font-semibold text-base uppercase tracking-wide text-gray-700 dark:text-gray-200 hover:text-ti-blue dark:hover:text-ti-blue-400 transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            active-class="text-ti-blue dark:text-ti-blue-400 bg-ti-blue-50 dark:bg-ti-blue-900/30"
          >
            {{ link.name }}
          </NuxtLink>
        </div>

        <!-- Actions Desktop -->
        <div class="hidden md:flex items-center space-x-3">
          <!-- Bouton Recherche -->
          <button
            @click="isSearchOpen = !isSearchOpen"
            class="inline-flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-ti-blue dark:hover:text-ti-blue-400 transition-colors duration-200 cursor-pointer"
            aria-label="Rechercher"
          >
            <font-awesome-icon icon="search" class="w-5 h-5" />
          </button>

          <!-- Bouton Signaler -->
          <NuxtLink
            to="/signaler"
            class="btn-ti text-sm py-2 px-4"
          >
            <font-awesome-icon icon="bullhorn" class="mr-2" />
            Signaler
          </NuxtLink>

          <!-- Toggle Dark Mode -->
          <ThemeToggle />
        </div>

        <!-- Menu Mobile Toggle -->
        <div class="flex md:hidden items-center space-x-2">
          <ThemeToggle />
          <button
            @click="isMobileMenuOpen = !isMobileMenuOpen"
            class="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
            :aria-expanded="isMobileMenuOpen"
            aria-label="Menu principal"
          >
            <font-awesome-icon
              :icon="isMobileMenuOpen ? 'times' : 'bars'"
              class="w-5 h-5"
            />
          </button>
        </div>
      </div>

      <!-- Menu Mobile -->
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div
          v-if="isMobileMenuOpen"
          class="md:hidden pb-4 border-t border-gray-200 dark:border-gray-700 mt-2"
        >
          <div class="pt-4 space-y-1">
            <NuxtLink
              v-for="link in navLinks"
              :key="link.path"
              :to="link.path"
              class="block px-4 py-3 font-heading font-semibold text-base uppercase tracking-wide text-gray-700 dark:text-gray-200 hover:text-ti-blue dark:hover:text-ti-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
              active-class="text-ti-blue dark:text-ti-blue-400 bg-ti-blue-50 dark:bg-ti-blue-900/30"
            >
              {{ link.name }}
            </NuxtLink>

            <!-- Recherche Mobile -->
            <div class="mx-4 mt-4">
              <SearchAutocomplete
                is-mobile
                placeholder="Rechercher..."
                @close="closeSearchAndMenu"
              />
            </div>

            <!-- Bouton Signaler Mobile -->
            <NuxtLink
              to="/signaler"
              class="block mx-4 mt-4 btn-ti text-center"
            >
              <font-awesome-icon icon="bullhorn" class="mr-2" />
              Signaler un cas
            </NuxtLink>
          </div>
        </div>
      </Transition>

      <!-- Barre de recherche Desktop -->
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div
          v-if="isSearchOpen"
          class="hidden md:block absolute left-0 right-0 top-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg"
        >
          <div class="max-w-3xl mx-auto px-4 py-4">
            <SearchAutocomplete
              placeholder="Rechercher des études de cas, actualités, ressources..."
              @close="closeSearch"
            />
          </div>
        </div>
      </Transition>
    </nav>
  </header>
</template>
