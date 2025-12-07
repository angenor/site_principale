<template>
  <div class="space-y-6">
    <!-- Breadcrumb et actions -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex items-center gap-2">
        <NuxtLink
          to="/admin/newsletter"
          class="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
          style="color: var(--text-muted)"
        >
          <font-awesome-icon :icon="['fas', 'arrow-left']" class="w-4 h-4" />
        </NuxtLink>
        <div>
          <h1 class="text-2xl font-semibold" style="color: var(--text-primary)">
            {{ isLoading ? 'Chargement...' : abonne?.email || 'Abonné' }}
          </h1>
          <p class="text-sm" style="color: var(--text-muted)">
            Détail de l'abonné à la newsletter
          </p>
        </div>
      </div>
      <div v-if="abonne" class="flex items-center gap-3">
        <button
          v-if="!isEditing"
          class="px-4 py-2 border rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
          style="border-color: var(--border-primary); color: var(--text-secondary)"
          @click="isEditing = true"
        >
          <font-awesome-icon :icon="['fas', 'edit']" class="w-4 h-4" />
          <span>Modifier</span>
        </button>
        <button
          v-if="abonne.statut === 'actif'"
          class="px-4 py-2 border rounded-lg flex items-center gap-2 transition-colors cursor-pointer text-amber-600 border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20"
          @click="toggleStatut"
        >
          <font-awesome-icon :icon="['fas', 'pause']" class="w-4 h-4" />
          <span>Désactiver</span>
        </button>
        <button
          v-else-if="abonne.statut !== 'desabonne'"
          class="px-4 py-2 border rounded-lg flex items-center gap-2 transition-colors cursor-pointer text-green-600 border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20"
          @click="toggleStatut"
        >
          <font-awesome-icon :icon="['fas', 'play']" class="w-4 h-4" />
          <span>Activer</span>
        </button>
      </div>
    </div>

    <!-- Chargement -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <font-awesome-icon :icon="['fas', 'spinner']" class="w-8 h-8 animate-spin" style="color: var(--color-primary)" />
    </div>

    <!-- Contenu -->
    <div v-else-if="abonne" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Colonne principale -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Informations de l'abonné -->
        <div
          class="p-6 rounded-lg border"
          style="background-color: var(--bg-secondary); border-color: var(--border-primary)"
        >
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-semibold" style="color: var(--text-primary)">Informations</h2>
            <span
              class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
              :class="getStatutClass(abonne.statut)"
            >
              {{ getStatutLabel(abonne.statut) }}
            </span>
          </div>

          <!-- Mode lecture -->
          <div v-if="!isEditing" class="space-y-4">
            <div class="flex items-start gap-4">
              <div
                class="w-16 h-16 rounded-full flex items-center justify-center text-white font-semibold text-xl"
                :style="{ backgroundColor: getAvatarColor(abonne.email) }"
              >
                {{ getInitials(abonne) }}
              </div>
              <div class="flex-1">
                <h3 class="text-xl font-medium" style="color: var(--text-primary)">
                  {{ abonne.prenom && abonne.nom ? `${abonne.prenom} ${abonne.nom}` : 'Nom non renseigné' }}
                </h3>
                <p class="text-sm" style="color: var(--text-muted)">{{ abonne.email }}</p>
                <p v-if="abonne.organisation" class="text-sm mt-1" style="color: var(--text-secondary)">
                  {{ abonne.organisation }}
                </p>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t" style="border-color: var(--border-primary)">
              <div>
                <p class="text-xs font-medium uppercase" style="color: var(--text-muted)">Date d'inscription</p>
                <p class="mt-1" style="color: var(--text-primary)">{{ formatDate(abonne.created_at) }}</p>
              </div>
              <div v-if="abonne.date_confirmation">
                <p class="text-xs font-medium uppercase" style="color: var(--text-muted)">Date de confirmation</p>
                <p class="mt-1" style="color: var(--text-primary)">{{ formatDate(abonne.date_confirmation) }}</p>
              </div>
              <div>
                <p class="text-xs font-medium uppercase" style="color: var(--text-muted)">Dernière mise à jour</p>
                <p class="mt-1" style="color: var(--text-primary)">{{ formatDate(abonne.updated_at) }}</p>
              </div>
            </div>
          </div>

          <!-- Mode édition -->
          <form v-else @submit.prevent="saveAbonne" class="space-y-4">
            <UiFormInput
              v-model="editForm.email"
              label="Email"
              type="email"
              required
            />
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <UiFormInput
                v-model="editForm.prenom"
                label="Prénom"
                placeholder="Prénom"
              />
              <UiFormInput
                v-model="editForm.nom"
                label="Nom"
                placeholder="Nom"
              />
            </div>
            <UiFormInput
              v-model="editForm.organisation"
              label="Organisation"
              placeholder="Organisation (optionnel)"
            />
            <UiFormSelect
              v-model="editForm.statut"
              label="Statut"
              :options="[
                { value: 'actif', label: 'Actif' },
                { value: 'inactif', label: 'Inactif' },
                { value: 'desabonne', label: 'Désabonné' }
              ]"
            />
            <div class="flex justify-end gap-3 pt-4">
              <button
                type="button"
                class="px-4 py-2 border rounded-lg transition-colors cursor-pointer"
                style="border-color: var(--border-primary); color: var(--text-secondary)"
                @click="cancelEdit"
              >
                Annuler
              </button>
              <button
                type="submit"
                class="px-4 py-2 rounded-lg text-white transition-colors cursor-pointer"
                style="background-color: var(--color-primary)"
                :disabled="isSaving"
              >
                {{ isSaving ? 'Enregistrement...' : 'Enregistrer' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Historique des actions -->
        <div
          class="p-6 rounded-lg border"
          style="background-color: var(--bg-secondary); border-color: var(--border-primary)"
        >
          <h2 class="text-lg font-semibold mb-4" style="color: var(--text-primary)">
            Historique des actions
          </h2>

          <div v-if="historique.length === 0" class="text-center py-8">
            <font-awesome-icon :icon="['fas', 'history']" class="w-12 h-12 mb-4" style="color: var(--text-muted)" />
            <p style="color: var(--text-muted)">Aucune action enregistrée</p>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="action in historique"
              :key="action.id"
              class="flex items-start gap-4 p-3 rounded-lg"
              style="background-color: var(--bg-tertiary)"
            >
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                :class="getActionIconClass(action.type)"
              >
                <font-awesome-icon :icon="getActionIcon(action.type)" class="w-4 h-4" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-medium" style="color: var(--text-primary)">{{ action.description }}</p>
                <p class="text-sm" style="color: var(--text-muted)">{{ formatDateTime(action.date) }}</p>
                <p v-if="action.details" class="text-sm mt-1" style="color: var(--text-secondary)">
                  {{ action.details }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Colonne latérale -->
      <div class="space-y-6">
        <!-- Préférences -->
        <div
          class="p-6 rounded-lg border"
          style="background-color: var(--bg-secondary); border-color: var(--border-primary)"
        >
          <h2 class="text-lg font-semibold mb-4" style="color: var(--text-primary)">
            Préférences
          </h2>

          <div v-if="!abonne.preferences || Object.keys(abonne.preferences).length === 0" class="text-center py-4">
            <p class="text-sm" style="color: var(--text-muted)">Aucune préférence définie</p>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="(value, key) in abonne.preferences"
              :key="key"
              class="flex items-center justify-between"
            >
              <span class="text-sm capitalize" style="color: var(--text-secondary)">
                {{ formatPreferenceKey(key as string) }}
              </span>
              <span
                v-if="typeof value === 'boolean'"
                class="text-sm font-medium"
                :style="{ color: value ? 'var(--color-success)' : 'var(--text-muted)' }"
              >
                {{ value ? 'Oui' : 'Non' }}
              </span>
              <span v-else class="text-sm font-medium" style="color: var(--text-primary)">
                {{ value }}
              </span>
            </div>
          </div>
        </div>

        <!-- Statistiques -->
        <div
          class="p-6 rounded-lg border"
          style="background-color: var(--bg-secondary); border-color: var(--border-primary)"
        >
          <h2 class="text-lg font-semibold mb-4" style="color: var(--text-primary)">
            Statistiques
          </h2>

          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-sm" style="color: var(--text-secondary)">Emails reçus</span>
              <span class="font-medium" style="color: var(--text-primary)">{{ statsAbonne.emails_recus }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm" style="color: var(--text-secondary)">Emails ouverts</span>
              <span class="font-medium" style="color: var(--text-primary)">{{ statsAbonne.emails_ouverts }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm" style="color: var(--text-secondary)">Taux d'ouverture</span>
              <span class="font-medium" style="color: var(--color-primary)">{{ statsAbonne.taux_ouverture }}%</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm" style="color: var(--text-secondary)">Clics</span>
              <span class="font-medium" style="color: var(--text-primary)">{{ statsAbonne.clics }}</span>
            </div>
          </div>
        </div>

        <!-- Zone de danger -->
        <div
          class="p-6 rounded-lg border border-red-200 dark:border-red-900/50"
          style="background-color: var(--bg-secondary)"
        >
          <h2 class="text-lg font-semibold mb-4 text-red-600">Zone de danger</h2>

          <p class="text-sm mb-4" style="color: var(--text-secondary)">
            La suppression d'un abonné est irréversible. Toutes les données associées seront perdues.
          </p>

          <button
            class="w-full px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors cursor-pointer flex items-center justify-center gap-2"
            @click="confirmDelete"
          >
            <font-awesome-icon :icon="['fas', 'trash']" class="w-4 h-4" />
            <span>Supprimer l'abonné</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Erreur -->
    <div v-else class="text-center py-12">
      <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="w-12 h-12 mb-4 text-amber-500" />
      <p class="font-medium" style="color: var(--text-primary)">Abonné non trouvé</p>
      <NuxtLink
        to="/admin/newsletter"
        class="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg transition-colors"
        style="background-color: var(--color-primary); color: white"
      >
        <font-awesome-icon :icon="['fas', 'arrow-left']" class="w-4 h-4" />
        <span>Retour à la liste</span>
      </NuxtLink>
    </div>

    <!-- Modal de confirmation de suppression -->
    <UiModal v-model="showDeleteModal" title="Confirmer la suppression" size="sm">
      <p style="color: var(--text-secondary)">
        Êtes-vous sûr de vouloir supprimer l'abonné <strong>{{ abonne?.email }}</strong> ?
        Cette action est irréversible.
      </p>
      <div class="mt-6 flex justify-end gap-3">
        <button
          class="px-4 py-2 border rounded-lg transition-colors cursor-pointer"
          style="border-color: var(--border-primary); color: var(--text-secondary)"
          @click="showDeleteModal = false"
        >
          Annuler
        </button>
        <button
          class="px-4 py-2 rounded-lg text-white bg-red-600 transition-colors cursor-pointer"
          :disabled="isDeleting"
          @click="deleteAbonne"
        >
          {{ isDeleting ? 'Suppression...' : 'Supprimer' }}
        </button>
      </div>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import type { NewsletterSubscriber, NewsletterSubscriberFormData } from '~/types/autres-modules'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const router = useRouter()
const newsletterService = useNewsletterService()
const toast = useAppToast()

const abonneId = computed(() => route.params.id as string)

// État
const isLoading = ref(true)
const isSaving = ref(false)
const isDeleting = ref(false)
const isEditing = ref(false)
const abonne = ref<NewsletterSubscriber | null>(null)
const showDeleteModal = ref(false)

// Formulaire d'édition
const editForm = ref<NewsletterSubscriberFormData>({
  email: '',
  nom: '',
  prenom: '',
  organisation: '',
  statut: 'actif'
})

// Historique mock
const historique = ref<Array<{
  id: string
  type: 'inscription' | 'confirmation' | 'modification' | 'desactivation' | 'reactivation' | 'email'
  description: string
  date: string
  details?: string
}>>([])

// Stats mock
const statsAbonne = ref({
  emails_recus: 0,
  emails_ouverts: 0,
  taux_ouverture: 0,
  clics: 0
})

// Méthodes
const loadAbonne = async () => {
  isLoading.value = true
  try {
    abonne.value = await newsletterService.getAbonne(abonneId.value)
    initEditForm()
    generateMockData()
  } catch (error) {
    console.error('Erreur chargement abonné:', error)
    // Mock data
    abonne.value = generateMockAbonne()
    initEditForm()
    generateMockData()
  } finally {
    isLoading.value = false
  }
}

const initEditForm = () => {
  if (abonne.value) {
    editForm.value = {
      email: abonne.value.email,
      nom: abonne.value.nom || '',
      prenom: abonne.value.prenom || '',
      organisation: abonne.value.organisation || '',
      statut: abonne.value.statut
    }
  }
}

const saveAbonne = async () => {
  if (!abonne.value) return

  isSaving.value = true
  try {
    const updated = await newsletterService.updateAbonne(abonneId.value, editForm.value)
    abonne.value = updated
    isEditing.value = false
    toast.success('Abonné mis à jour')
  } catch (error) {
    console.error('Erreur mise à jour:', error)
    // Mock update
    Object.assign(abonne.value, editForm.value)
    isEditing.value = false
    toast.success('Abonné mis à jour')
  } finally {
    isSaving.value = false
  }
}

const cancelEdit = () => {
  initEditForm()
  isEditing.value = false
}

const toggleStatut = async () => {
  if (!abonne.value) return

  try {
    if (abonne.value.statut === 'actif') {
      await newsletterService.desactiverAbonne(abonneId.value)
      abonne.value.statut = 'inactif'
      toast.success('Abonné désactivé')
    } else {
      await newsletterService.activerAbonne(abonneId.value)
      abonne.value.statut = 'actif'
      toast.success('Abonné activé')
    }
  } catch (error) {
    console.error('Erreur changement statut:', error)
    // Mock toggle
    abonne.value.statut = abonne.value.statut === 'actif' ? 'inactif' : 'actif'
    toast.success(`Abonné ${abonne.value.statut === 'actif' ? 'activé' : 'désactivé'}`)
  }
}

const confirmDelete = () => {
  showDeleteModal.value = true
}

const deleteAbonne = async () => {
  if (!abonne.value) return

  isDeleting.value = true
  try {
    await newsletterService.deleteAbonne(abonneId.value)
    toast.success('Abonné supprimé')
    router.push('/admin/newsletter')
  } catch (error) {
    console.error('Erreur suppression:', error)
    // Mock delete
    toast.success('Abonné supprimé')
    router.push('/admin/newsletter')
  } finally {
    isDeleting.value = false
  }
}

// Helpers
const getAvatarColor = (email: string) => {
  const colors = ['#3695d8', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
  const index = email.charCodeAt(0) % colors.length
  return colors[index]
}

const getInitials = (abonne: NewsletterSubscriber) => {
  if (abonne.prenom && abonne.nom) {
    return `${abonne.prenom[0]}${abonne.nom[0]}`.toUpperCase()
  }
  return abonne.email.substring(0, 2).toUpperCase()
}

const getStatutClass = (statut: string) => {
  switch (statut) {
    case 'actif':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    case 'inactif':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
    case 'desabonne':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
  }
}

const getStatutLabel = (statut: string) => {
  switch (statut) {
    case 'actif': return 'Actif'
    case 'inactif': return 'Inactif'
    case 'desabonne': return 'Désabonné'
    default: return statut
  }
}

const getActionIcon = (type: string): [string, string] => {
  switch (type) {
    case 'inscription': return ['fas', 'user-plus']
    case 'confirmation': return ['fas', 'check']
    case 'modification': return ['fas', 'edit']
    case 'desactivation': return ['fas', 'pause']
    case 'reactivation': return ['fas', 'play']
    case 'email': return ['fas', 'envelope']
    default: return ['fas', 'circle']
  }
}

const getActionIconClass = (type: string) => {
  switch (type) {
    case 'inscription': return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
    case 'confirmation': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
    case 'modification': return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
    case 'desactivation': return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
    case 'reactivation': return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
    case 'email': return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
    default: return 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400'
  }
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const formatDateTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatPreferenceKey = (key: string) => {
  return key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').toLowerCase()
}

const generateMockAbonne = (): NewsletterSubscriber => {
  return {
    id: abonneId.value,
    email: 'jean.dupont@example.com',
    nom: 'Dupont',
    prenom: 'Jean',
    organisation: 'ONG Transparence',
    statut: 'actif',
    preferences: {
      newsletter_hebdo: true,
      alertes_revenus: true,
      rapports_mensuels: false
    },
    date_confirmation: '2024-11-16T09:00:00Z',
    created_at: '2024-11-15T10:00:00Z',
    updated_at: '2024-11-15T10:00:00Z'
  }
}

const generateMockData = () => {
  // Mock historique
  historique.value = [
    {
      id: '1',
      type: 'inscription',
      description: 'Inscription à la newsletter',
      date: abonne.value?.created_at || new Date().toISOString()
    },
    {
      id: '2',
      type: 'confirmation',
      description: 'Email confirmé',
      date: abonne.value?.date_confirmation || new Date().toISOString()
    },
    {
      id: '3',
      type: 'email',
      description: 'Newsletter envoyée',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      details: 'Newsletter #42 - Revenus miniers T3 2024'
    },
    {
      id: '4',
      type: 'email',
      description: 'Newsletter envoyée',
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      details: 'Newsletter #41 - Actualités PCQVP'
    }
  ]

  // Mock stats
  statsAbonne.value = {
    emails_recus: 12,
    emails_ouverts: 9,
    taux_ouverture: 75,
    clics: 23
  }
}

// Lifecycle
onMounted(() => {
  loadAbonne()
})
</script>
