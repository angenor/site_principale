/**
 * Composable pour gérer le mode sombre/clair
 *
 * Fonctionnalités :
 * - Détection automatique du thème système
 * - Persistance dans localStorage
 * - Application de la classe 'dark' sur l'élément HTML
 */

// Fonction pour obtenir le thème initial
const getInitialTheme = (): boolean => {
  if (import.meta.client) {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      return savedTheme === 'dark'
    }
    // Utiliser la préférence système
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  return false
}

export const useDarkMode = () => {
  // Utiliser useState de Nuxt pour un état partagé SSR-safe
  const isDark = useState('darkMode', () => getInitialTheme())

  // Appliquer le thème au DOM
  const applyTheme = () => {
    if (import.meta.client) {
      const html = document.documentElement

      if (isDark.value) {
        html.classList.add('dark')
      } else {
        html.classList.remove('dark')
      }
    }
  }

  // Basculer entre dark et light
  const toggleDarkMode = () => {
    isDark.value = !isDark.value

    if (import.meta.client) {
      localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
      applyTheme()
    }
  }

  // Définir le thème explicitement
  const setTheme = (dark: boolean) => {
    isDark.value = dark

    if (import.meta.client) {
      localStorage.setItem('theme', dark ? 'dark' : 'light')
      applyTheme()
    }
  }

  // Initialiser au montage
  onMounted(() => {
    // Synchroniser l'état avec le DOM au cas où le plugin l'aurait déjà appliqué
    if (import.meta.client) {
      const hasInitialDarkClass = document.documentElement.classList.contains('dark')
      if (hasInitialDarkClass !== isDark.value) {
        isDark.value = hasInitialDarkClass
      }

      // Appliquer le thème pour être sûr
      applyTheme()

      // Écouter les changements de préférence système
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

      const handleChange = (e: MediaQueryListEvent) => {
        // Seulement si aucune préférence n'est sauvegardée
        if (!localStorage.getItem('theme')) {
          isDark.value = e.matches
          // Le watch s'occupera d'appliquer le thème
        }
      }

      mediaQuery.addEventListener('change', handleChange)

      // Nettoyer l'écouteur à la destruction
      onUnmounted(() => {
        mediaQuery.removeEventListener('change', handleChange)
      })
    }
  })

  return {
    isDark: readonly(isDark),
    toggleDarkMode,
    setTheme
  }
}
