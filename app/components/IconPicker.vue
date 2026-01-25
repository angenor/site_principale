<script setup lang="ts">
interface Props {
  modelValue?: string | null
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  placeholder: 'Rechercher une icône...'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void
}>()

// Liste des icônes disponibles (correspondant aux icônes importées dans fontawesome.ts)
const availableIcons = [
  // Navigation & Actions
  { name: 'home', label: 'Accueil' },
  { name: 'search', label: 'Recherche' },
  { name: 'bars', label: 'Menu' },
  { name: 'times', label: 'Fermer' },
  { name: 'xmark', label: 'X' },
  { name: 'check', label: 'Coché' },
  { name: 'plus', label: 'Plus' },
  { name: 'minus', label: 'Moins' },
  { name: 'edit', label: 'Modifier' },
  { name: 'trash', label: 'Supprimer' },
  { name: 'download', label: 'Télécharger' },
  { name: 'link', label: 'Lien' },
  { name: 'external-link-alt', label: 'Lien externe' },

  // Flèches
  { name: 'arrow-left', label: 'Flèche gauche' },
  { name: 'arrow-right', label: 'Flèche droite' },
  { name: 'arrow-up', label: 'Flèche haut' },
  { name: 'arrow-down', label: 'Flèche bas' },
  { name: 'chevron-left', label: 'Chevron gauche' },
  { name: 'chevron-right', label: 'Chevron droite' },
  { name: 'chevron-up', label: 'Chevron haut' },
  { name: 'chevron-down', label: 'Chevron bas' },
  { name: 'angles-left', label: 'Double flèche gauche' },
  { name: 'angles-right', label: 'Double flèche droite' },

  // Utilisateur & Personnes
  { name: 'user', label: 'Utilisateur' },
  { name: 'users', label: 'Utilisateurs' },
  { name: 'people-group', label: 'Groupe de personnes' },

  // Communication
  { name: 'envelope', label: 'Email' },
  { name: 'phone', label: 'Téléphone' },
  { name: 'paper-plane', label: 'Envoyer' },
  { name: 'inbox', label: 'Boîte de réception' },
  { name: 'bullhorn', label: 'Annonce' },

  // Localisation
  { name: 'map-marker-alt', label: 'Marqueur' },
  { name: 'location-dot', label: 'Localisation' },
  { name: 'globe', label: 'Globe' },

  // Documents & Fichiers
  { name: 'file-alt', label: 'Document' },
  { name: 'file-lines', label: 'Fichier lignes' },
  { name: 'file-pdf', label: 'PDF' },
  { name: 'file-excel', label: 'Excel' },
  { name: 'file-word', label: 'Word' },
  { name: 'file-circle-question', label: 'Fichier question' },
  { name: 'folder-open', label: 'Dossier ouvert' },
  { name: 'book', label: 'Livre' },
  { name: 'newspaper', label: 'Journal' },

  // Images & Médias
  { name: 'image', label: 'Image' },
  { name: 'camera', label: 'Caméra' },
  { name: 'crop', label: 'Recadrer' },

  // Graphiques & Données
  { name: 'chart-bar', label: 'Graphique barres' },
  { name: 'chart-line', label: 'Graphique ligne' },
  { name: 'chart-pie', label: 'Graphique camembert' },
  { name: 'table', label: 'Tableau' },

  // Entreprise & Économie
  { name: 'building', label: 'Bâtiment' },
  { name: 'industry', label: 'Industrie' },
  { name: 'landmark', label: 'Monument' },
  { name: 'briefcase', label: 'Mallette' },
  { name: 'money-bill-wave', label: 'Argent' },
  { name: 'coins', label: 'Pièces' },
  { name: 'gem', label: 'Diamant' },

  // Environnement & Nature
  { name: 'leaf', label: 'Feuille' },
  { name: 'seedling', label: 'Pousse' },
  { name: 'tree-city', label: 'Ville verte' },
  { name: 'droplet', label: 'Goutte d\'eau' },
  { name: 'recycle', label: 'Recyclage' },

  // Santé & Social
  { name: 'heart', label: 'Cœur' },
  { name: 'heart-pulse', label: 'Battement cœur' },
  { name: 'hand-holding-heart', label: 'Main cœur' },
  { name: 'handshake', label: 'Poignée de main' },

  // Sécurité & Justice
  { name: 'shield-alt', label: 'Bouclier' },
  { name: 'shield-halved', label: 'Bouclier demi' },
  { name: 'lock', label: 'Verrou' },
  { name: 'scale-balanced', label: 'Balance' },
  { name: 'balance-scale', label: 'Balance justice' },

  // Paramètres & Outils
  { name: 'cog', label: 'Paramètre' },
  { name: 'cogs', label: 'Paramètres' },
  { name: 'print', label: 'Imprimer' },

  // Visibilité
  { name: 'eye', label: 'Œil' },
  { name: 'eye-slash', label: 'Œil barré' },

  // Thème
  { name: 'sun', label: 'Soleil' },
  { name: 'moon', label: 'Lune' },

  // Alertes & État
  { name: 'info-circle', label: 'Info' },
  { name: 'check-circle', label: 'Validé' },
  { name: 'circle-exclamation', label: 'Attention' },
  { name: 'exclamation-triangle', label: 'Alerte triangle' },
  { name: 'triangle-exclamation', label: 'Danger' },
  { name: 'times-circle', label: 'Erreur' },

  // Temps
  { name: 'calendar', label: 'Calendrier' },
  { name: 'clock', label: 'Horloge' },

  // Formes
  { name: 'circle', label: 'Cercle' },
  { name: 'square', label: 'Carré' },
  { name: 'star', label: 'Étoile' },
  { name: 'bullseye', label: 'Cible' },

  // Divers
  { name: 'cubes', label: 'Cubes' },
  { name: 'atom', label: 'Atome' },
  { name: 'spinner', label: 'Chargement' },
  { name: 'right-from-bracket', label: 'Déconnexion' },
  { name: 'right-to-bracket', label: 'Connexion' },
]

const isOpen = ref(false)
const searchQuery = ref('')
const dropdownRef = ref<HTMLElement | null>(null)

// Filtrer les icônes selon la recherche
const filteredIcons = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return availableIcons
  return availableIcons.filter(icon =>
    icon.name.toLowerCase().includes(query) ||
    icon.label.toLowerCase().includes(query)
  )
})

// Icône sélectionnée
const selectedIcon = computed(() => {
  if (!props.modelValue) return null
  return availableIcons.find(icon => icon.name === props.modelValue) || { name: props.modelValue, label: props.modelValue }
})

function selectIcon(iconName: string) {
  emit('update:modelValue', iconName)
  isOpen.value = false
  searchQuery.value = ''
}

function clearSelection() {
  emit('update:modelValue', null)
}

function toggleDropdown() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    searchQuery.value = ''
  }
}

// Fermer le dropdown quand on clique en dehors
function handleClickOutside(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div ref="dropdownRef" class="relative">
    <!-- Bouton de sélection -->
    <button
      type="button"
      @click="toggleDropdown"
      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white flex items-center justify-between cursor-pointer hover:border-ti-blue transition-colors"
    >
      <span class="flex items-center gap-2">
        <font-awesome-icon v-if="selectedIcon" :icon="selectedIcon.name" class="text-ti-blue" />
        <span v-if="selectedIcon" class="text-sm">{{ selectedIcon.label }}</span>
        <span v-else class="text-gray-400 text-sm">Choisir une icône...</span>
      </span>
      <div class="flex items-center gap-1">
        <button
          v-if="selectedIcon"
          type="button"
          @click.stop="clearSelection"
          class="p-1 text-gray-400 hover:text-red-500 transition-colors"
          title="Effacer"
        >
          <font-awesome-icon icon="times" class="w-3 h-3" />
        </button>
        <font-awesome-icon
          :icon="isOpen ? 'chevron-up' : 'chevron-down'"
          class="w-3 h-3 text-gray-400"
        />
      </div>
    </button>

    <!-- Dropdown -->
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden"
      >
        <!-- Recherche -->
        <div class="p-2 border-b border-gray-200 dark:border-gray-700">
          <div class="relative">
            <font-awesome-icon
              icon="search"
              class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3"
            />
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="placeholder"
              class="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-ti-blue focus:border-ti-blue"
            />
          </div>
        </div>

        <!-- Liste des icônes -->
        <div class="max-h-60 overflow-y-auto p-2">
          <div class="grid grid-cols-4 gap-1">
            <button
              v-for="icon in filteredIcons"
              :key="icon.name"
              type="button"
              @click="selectIcon(icon.name)"
              class="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer group"
              :class="{ 'bg-ti-blue/10': modelValue === icon.name }"
              :title="icon.label"
            >
              <font-awesome-icon
                :icon="icon.name"
                class="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-ti-blue"
                :class="{ 'text-ti-blue': modelValue === icon.name }"
              />
              <span class="text-[10px] text-gray-500 dark:text-gray-400 truncate w-full text-center">
                {{ icon.name }}
              </span>
            </button>
          </div>

          <!-- Aucun résultat -->
          <p
            v-if="filteredIcons.length === 0"
            class="text-center text-gray-500 dark:text-gray-400 py-4 text-sm"
          >
            Aucune icône trouvée
          </p>
        </div>

        <!-- Saisie manuelle -->
        <div class="p-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <p class="text-xs text-gray-500 dark:text-gray-400 text-center">
            Ou saisissez le nom FontAwesome directement
          </p>
        </div>
      </div>
    </Transition>
  </div>
</template>
