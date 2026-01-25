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
const activeTab = ref<'fontawesome' | 'custom'>('fontawesome')
const fileInput = ref<HTMLInputElement | null>(null)
const isUploading = ref(false)
const uploadError = ref('')

// Détecter si la valeur actuelle est une URL (image custom) ou un nom FontAwesome
const isCustomImage = computed(() => {
  if (!props.modelValue) return false
  return props.modelValue.startsWith('/') || props.modelValue.startsWith('http')
})

// Filtrer les icônes selon la recherche
const filteredIcons = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return availableIcons
  return availableIcons.filter(icon =>
    icon.name.toLowerCase().includes(query) ||
    icon.label.toLowerCase().includes(query)
  )
})

// Icône FontAwesome sélectionnée
const selectedIcon = computed(() => {
  if (!props.modelValue || isCustomImage.value) return null
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
    // Si c'est une image custom, ouvrir l'onglet custom
    if (isCustomImage.value) {
      activeTab.value = 'custom'
    }
  }
}

// Fermer le dropdown quand on clique en dehors
function handleClickOutside(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

// Upload d'image personnalisée
function openFilePicker() {
  fileInput.value?.click()
}

async function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  // Vérifier le type
  if (!file.type.startsWith('image/')) {
    uploadError.value = 'Le fichier doit être une image'
    return
  }

  // Vérifier la taille (max 2MB pour les icônes)
  if (file.size > 2 * 1024 * 1024) {
    uploadError.value = 'L\'image ne doit pas dépasser 2MB'
    return
  }

  uploadError.value = ''
  isUploading.value = true

  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await $fetch<{ success: boolean; url: string }>('/api/admin/upload', {
      method: 'POST',
      body: formData
    })

    if (response.success && response.url) {
      emit('update:modelValue', response.url)
      isOpen.value = false
    }
  } catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string }; message?: string }
    uploadError.value = e.data?.statusMessage || e.message || 'Erreur lors du téléversement'
  } finally {
    isUploading.value = false
    if (target) target.value = ''
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
    <!-- Input file caché -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handleFileSelect"
    />

    <!-- Bouton de sélection -->
    <button
      type="button"
      @click="toggleDropdown"
      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white flex items-center justify-between cursor-pointer hover:border-ti-blue transition-colors"
    >
      <span class="flex items-center gap-2">
        <!-- Afficher l'image custom -->
        <img
          v-if="isCustomImage && modelValue"
          :src="modelValue"
          alt="Icône"
          class="w-5 h-5 object-contain"
        />
        <!-- Afficher l'icône FontAwesome -->
        <font-awesome-icon
          v-else-if="selectedIcon"
          :icon="selectedIcon.name"
          class="text-ti-blue"
        />
        <!-- Label -->
        <span v-if="isCustomImage" class="text-sm">Image personnalisée</span>
        <span v-else-if="selectedIcon" class="text-sm">{{ selectedIcon.label }}</span>
        <span v-else class="text-gray-400 text-sm">Choisir une icône...</span>
      </span>
      <div class="flex items-center gap-1">
        <button
          v-if="modelValue"
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
        <!-- Tabs -->
        <div class="flex border-b border-gray-200 dark:border-gray-700">
          <button
            type="button"
            @click="activeTab = 'fontawesome'"
            class="flex-1 px-4 py-2 text-sm font-medium transition-colors cursor-pointer"
            :class="activeTab === 'fontawesome'
              ? 'text-ti-blue border-b-2 border-ti-blue bg-ti-blue/5'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'"
          >
            <font-awesome-icon icon="star" class="mr-1" />
            FontAwesome
          </button>
          <button
            type="button"
            @click="activeTab = 'custom'"
            class="flex-1 px-4 py-2 text-sm font-medium transition-colors cursor-pointer"
            :class="activeTab === 'custom'
              ? 'text-ti-blue border-b-2 border-ti-blue bg-ti-blue/5'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'"
          >
            <font-awesome-icon icon="image" class="mr-1" />
            Image perso
          </button>
        </div>

        <!-- Contenu FontAwesome -->
        <div v-if="activeTab === 'fontawesome'">
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
        </div>

        <!-- Contenu Upload Image -->
        <div v-if="activeTab === 'custom'" class="p-4">
          <!-- Aperçu si image déjà sélectionnée -->
          <div v-if="isCustomImage && modelValue" class="mb-4 text-center">
            <img
              :src="modelValue"
              alt="Icône actuelle"
              class="w-16 h-16 object-contain mx-auto rounded-lg border border-gray-200 dark:border-gray-700 p-2"
            />
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">Image actuelle</p>
          </div>

          <!-- Zone d'upload -->
          <div
            @click="openFilePicker"
            class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-ti-blue hover:bg-ti-blue/5 transition-colors"
          >
            <div v-if="isUploading" class="text-center">
              <font-awesome-icon icon="spinner" class="animate-spin text-ti-blue text-2xl mb-2" />
              <p class="text-sm text-gray-600 dark:text-gray-400">Téléversement...</p>
            </div>
            <template v-else>
              <font-awesome-icon icon="image" class="text-gray-400 text-2xl mb-2" />
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Cliquez pour téléverser une icône
              </p>
              <p class="text-xs text-gray-400 mt-1">PNG, SVG, JPG - Max 2MB</p>
            </template>
          </div>

          <!-- Erreur -->
          <p v-if="uploadError" class="mt-2 text-sm text-red-500 flex items-center gap-1">
            <font-awesome-icon icon="circle-exclamation" class="w-3 h-3" />
            {{ uploadError }}
          </p>

          <!-- Info -->
          <p class="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
            Recommandé : image carrée, fond transparent (PNG/SVG)
          </p>
        </div>
      </div>
    </Transition>
  </div>
</template>
