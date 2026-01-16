/**
 * Composable pour détecter la direction de navigation entre les pages
 * - 'forward' : nouvelle page (droite vers gauche)
 * - 'back' : retour arrière (gauche vers droite)
 */

// Historique des pages visitées
const visitedPages = ref<string[]>([])
const direction = ref<'forward' | 'back'>('forward')

export function useNavigationDirection() {
  const route = useRoute()
  const router = useRouter()

  // Détecter si on revient en arrière dans l'historique
  function getNavigationDirection(to: string, from: string): 'forward' | 'back' {
    // Si la page cible est dans notre historique (avant la page actuelle), c'est un retour
    const toIndex = visitedPages.value.lastIndexOf(to)
    const fromIndex = visitedPages.value.lastIndexOf(from)

    // Si la destination est dans l'historique et avant la position actuelle
    if (toIndex !== -1 && toIndex < fromIndex) {
      return 'back'
    }

    // Navigation par boutons du navigateur
    // On détecte aussi les patterns communs de "retour"
    // Par exemple: /cas/slug -> /cas (retour à la liste)
    const toSegments = to.split('/').filter(Boolean)
    const fromSegments = from.split('/').filter(Boolean)

    // Si on va vers un parent (moins de segments et même préfixe)
    if (toSegments.length < fromSegments.length) {
      const isParent = toSegments.every((seg, i) => fromSegments[i] === seg)
      if (isParent) {
        return 'back'
      }
    }

    return 'forward'
  }

  // Écouter les changements de route
  router.beforeEach((to, from) => {
    if (from.path && to.path !== from.path) {
      direction.value = getNavigationDirection(to.path, from.path)

      // Gérer l'historique
      if (direction.value === 'back') {
        // Retirer les pages après la destination
        const toIndex = visitedPages.value.lastIndexOf(to.path)
        if (toIndex !== -1) {
          visitedPages.value = visitedPages.value.slice(0, toIndex + 1)
        }
      } else {
        // Ajouter la nouvelle page à l'historique
        if (visitedPages.value[visitedPages.value.length - 1] !== to.path) {
          visitedPages.value.push(to.path)
        }
      }
    }
  })

  // Initialiser avec la page actuelle
  onMounted(() => {
    if (visitedPages.value.length === 0 && route.path) {
      visitedPages.value.push(route.path)
    }
  })

  // Écouter le bouton retour du navigateur
  if (import.meta.client) {
    window.addEventListener('popstate', () => {
      direction.value = 'back'
    })
  }

  return {
    direction: readonly(direction),
    visitedPages: readonly(visitedPages),
    isBack: computed(() => direction.value === 'back'),
    isForward: computed(() => direction.value === 'forward')
  }
}
