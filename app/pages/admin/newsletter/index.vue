<template>
  <div class="space-y-6">
    <!-- En-tête -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold" style="color: var(--text-primary)">
          Newsletter
        </h1>
        <p class="mt-1 text-sm" style="color: var(--text-secondary)">
          Gérez les abonnés à la newsletter
        </p>
      </div>
      <div class="flex items-center gap-3">
        <!-- Export -->
        <div class="relative">
          <button
            class="px-4 py-2 border rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
            style="border-color: var(--border-primary); color: var(--text-secondary)"
            @click="showExportMenu = !showExportMenu"
          >
            <font-awesome-icon :icon="['fas', 'download']" class="w-4 h-4" />
            <span>Exporter</span>
          </button>
          <div
            v-if="showExportMenu"
            class="absolute right-0 mt-2 w-48 rounded-lg shadow-lg border z-10"
            style="background-color: var(--bg-primary); border-color: var(--border-primary)"
          >
            <button
              class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 cursor-pointer"
              style="color: var(--text-primary)"
              @click="exportAbonnes('csv')"
            >
              <font-awesome-icon :icon="['fas', 'file-csv']" class="w-4 h-4 text-green-600" />
              Exporter en CSV
            </button>
            <button
              class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 cursor-pointer"
              style="color: var(--text-primary)"
              @click="exportAbonnes('xlsx')"
            >
              <font-awesome-icon :icon="['fas', 'file-excel']" class="w-4 h-4 text-green-600" />
              Exporter en Excel
            </button>
          </div>
        </div>
        <!-- Import -->
        <button
          class="px-4 py-2 border rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
          style="border-color: var(--border-primary); color: var(--text-secondary)"
          @click="showImportModal = true"
        >
          <font-awesome-icon :icon="['fas', 'upload']" class="w-4 h-4" />
          <span>Importer</span>
        </button>
        <!-- Ajouter -->
        <button
          class="px-4 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer text-white"
          style="background-color: var(--color-primary)"
          @click="showCreateModal = true"
        >
          <font-awesome-icon :icon="['fas', 'plus']" class="w-4 h-4" />
          <span>Ajouter</span>
        </button>
      </div>
    </div>

    <!-- Cartes statistiques -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        class="p-4 rounded-lg border"
        style="background-color: var(--bg-secondary); border-color: var(--border-primary)"
      >
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg" style="background-color: var(--color-primary-light)">
            <font-awesome-icon :icon="['fas', 'users']" class="w-5 h-5" style="color: var(--color-primary)" />
          </div>
          <div>
            <p class="text-xs font-medium uppercase" style="color: var(--text-muted)">Total abonnés</p>
            <p class="text-xl font-semibold" style="color: var(--text-primary)">{{ stats.total_abonnes }}</p>
          </div>
        </div>
      </div>

      <div
        class="p-4 rounded-lg border"
        style="background-color: var(--bg-secondary); border-color: var(--border-primary)"
      >
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
            <font-awesome-icon :icon="['fas', 'check-circle']" class="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p class="text-xs font-medium uppercase" style="color: var(--text-muted)">Actifs</p>
            <p class="text-xl font-semibold text-green-600">{{ stats.abonnes_actifs }}</p>
          </div>
        </div>
      </div>

      <div
        class="p-4 rounded-lg border"
        style="background-color: var(--bg-secondary); border-color: var(--border-primary)"
      >
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
            <font-awesome-icon :icon="['fas', 'pause-circle']" class="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p class="text-xs font-medium uppercase" style="color: var(--text-muted)">Inactifs</p>
            <p class="text-xl font-semibold text-amber-600">{{ stats.abonnes_inactifs }}</p>
          </div>
        </div>
      </div>

      <div
        class="p-4 rounded-lg border"
        style="background-color: var(--bg-secondary); border-color: var(--border-primary)"
      >
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
            <font-awesome-icon :icon="['fas', 'user-minus']" class="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p class="text-xs font-medium uppercase" style="color: var(--text-muted)">Désabonnés</p>
            <p class="text-xl font-semibold text-red-600">{{ stats.desabonnes }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Carte évolution -->
    <div
      class="p-4 rounded-lg border"
      style="background-color: var(--bg-secondary); border-color: var(--border-primary)"
    >
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-medium" style="color: var(--text-primary)">Évolution des inscriptions</h3>
        <select
          v-model="evolutionPeriode"
          class="px-3 py-1.5 text-sm border rounded-lg"
          style="background-color: var(--bg-primary); border-color: var(--border-primary); color: var(--text-primary)"
        >
          <option value="7j">7 derniers jours</option>
          <option value="30j">30 derniers jours</option>
          <option value="90j">90 derniers jours</option>
          <option value="1an">Cette année</option>
        </select>
      </div>
      <div class="h-48 flex items-center justify-center" style="color: var(--text-muted)">
        <div v-if="evolutionData.length > 0" class="w-full grid grid-cols-7 gap-2">
          <div
            v-for="(item, index) in evolutionData.slice(-7)"
            :key="index"
            class="flex flex-col items-center"
          >
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden h-24 flex flex-col-reverse">
              <div
                class="w-full transition-all"
                style="background-color: var(--color-primary)"
                :style="{ height: `${(item.inscriptions / maxInscriptions) * 100}%` }"
              />
            </div>
            <span class="text-xs mt-1" style="color: var(--text-muted)">{{ formatShortDate(item.date) }}</span>
            <span class="text-xs font-medium" style="color: var(--text-primary)">{{ item.inscriptions }}</span>
          </div>
        </div>
        <span v-else>Chargement des données...</span>
      </div>
    </div>

    <!-- Filtres -->
    <div
      class="p-4 rounded-lg border flex flex-col sm:flex-row gap-4"
      style="background-color: var(--bg-secondary); border-color: var(--border-primary)"
    >
      <!-- Recherche -->
      <div class="flex-1">
        <div class="relative">
          <font-awesome-icon
            :icon="['fas', 'search']"
            class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style="color: var(--text-muted)"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher par email, nom..."
            class="w-full pl-10 pr-4 py-2 border rounded-lg"
            style="background-color: var(--bg-primary); border-color: var(--border-primary); color: var(--text-primary)"
          />
        </div>
      </div>

      <!-- Filtre statut -->
      <div class="w-full sm:w-48">
        <select
          v-model="filterStatut"
          class="w-full px-3 py-2 border rounded-lg"
          style="background-color: var(--bg-primary); border-color: var(--border-primary); color: var(--text-primary)"
        >
          <option value="">Tous les statuts</option>
          <option value="actif">Actifs</option>
          <option value="inactif">Inactifs</option>
          <option value="desabonne">Désabonnés</option>
        </select>
      </div>

      <!-- Réinitialiser -->
      <button
        v-if="searchQuery || filterStatut"
        class="px-4 py-2 text-sm border rounded-lg transition-colors cursor-pointer"
        style="border-color: var(--border-primary); color: var(--text-secondary)"
        @click="resetFilters"
      >
        Réinitialiser
      </button>
    </div>

    <!-- Liste des abonnés -->
    <div
      class="rounded-lg border overflow-hidden"
      style="background-color: var(--bg-secondary); border-color: var(--border-primary)"
    >
      <!-- État de chargement -->
      <div v-if="isLoading" class="p-8 text-center">
        <font-awesome-icon :icon="['fas', 'spinner']" class="w-8 h-8 animate-spin" style="color: var(--color-primary)" />
        <p class="mt-2 text-sm" style="color: var(--text-muted)">Chargement des abonnés...</p>
      </div>

      <!-- État vide -->
      <div v-else-if="abonnes.length === 0" class="p-8 text-center">
        <font-awesome-icon :icon="['fas', 'envelope-open']" class="w-12 h-12 mb-4" style="color: var(--text-muted)" />
        <p class="font-medium" style="color: var(--text-primary)">Aucun abonné trouvé</p>
        <p class="text-sm mt-1" style="color: var(--text-muted)">
          {{ searchQuery || filterStatut ? 'Essayez de modifier vos filtres' : 'Ajoutez des abonnés à la newsletter' }}
        </p>
      </div>

      <!-- Tableau -->
      <table v-else class="w-full">
        <thead>
          <tr style="background-color: var(--bg-tertiary)">
            <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style="color: var(--text-muted)">
              Abonné
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style="color: var(--text-muted)">
              Organisation
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style="color: var(--text-muted)">
              Statut
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style="color: var(--text-muted)">
              Date inscription
            </th>
            <th class="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider" style="color: var(--text-muted)">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="divide-y" style="border-color: var(--border-primary)">
          <tr
            v-for="abonne in abonnes"
            :key="abonne.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <td class="px-4 py-4">
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm"
                  :style="{ backgroundColor: getAvatarColor(abonne.email) }"
                >
                  {{ getInitials(abonne) }}
                </div>
                <div>
                  <p class="font-medium" style="color: var(--text-primary)">
                    {{ abonne.nom && abonne.prenom ? `${abonne.prenom} ${abonne.nom}` : abonne.email }}
                  </p>
                  <p class="text-sm" style="color: var(--text-muted)">{{ abonne.email }}</p>
                </div>
              </div>
            </td>
            <td class="px-4 py-4">
              <span style="color: var(--text-secondary)">{{ abonne.organisation || '-' }}</span>
            </td>
            <td class="px-4 py-4">
              <span
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="getStatutClass(abonne.statut)"
              >
                {{ getStatutLabel(abonne.statut) }}
              </span>
            </td>
            <td class="px-4 py-4">
              <span class="text-sm" style="color: var(--text-secondary)">
                {{ formatDate(abonne.created_at) }}
              </span>
            </td>
            <td class="px-4 py-4 text-right">
              <div class="flex items-center justify-end gap-2">
                <NuxtLink
                  :to="`/admin/newsletter/${abonne.id}`"
                  class="p-2 rounded-lg transition-colors"
                  style="color: var(--text-muted)"
                  title="Voir le détail"
                >
                  <font-awesome-icon :icon="['fas', 'eye']" class="w-4 h-4" />
                </NuxtLink>
                <button
                  v-if="abonne.statut === 'actif'"
                  class="p-2 rounded-lg transition-colors text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/30 cursor-pointer"
                  title="Désactiver"
                  @click="toggleStatut(abonne)"
                >
                  <font-awesome-icon :icon="['fas', 'pause']" class="w-4 h-4" />
                </button>
                <button
                  v-else-if="abonne.statut === 'inactif'"
                  class="p-2 rounded-lg transition-colors text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 cursor-pointer"
                  title="Activer"
                  @click="toggleStatut(abonne)"
                >
                  <font-awesome-icon :icon="['fas', 'play']" class="w-4 h-4" />
                </button>
                <button
                  class="p-2 rounded-lg transition-colors text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 cursor-pointer"
                  title="Supprimer"
                  @click="confirmDelete(abonne)"
                >
                  <font-awesome-icon :icon="['fas', 'trash']" class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div
        v-if="pagination.total > pagination.limit"
        class="px-4 py-3 border-t flex items-center justify-between"
        style="border-color: var(--border-primary)"
      >
        <p class="text-sm" style="color: var(--text-muted)">
          Affichage {{ (pagination.page - 1) * pagination.limit + 1 }} -
          {{ Math.min(pagination.page * pagination.limit, pagination.total) }} sur {{ pagination.total }}
        </p>
        <div class="flex items-center gap-2">
          <button
            :disabled="pagination.page === 1"
            class="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50 transition-colors cursor-pointer disabled:cursor-not-allowed"
            style="border-color: var(--border-primary); color: var(--text-secondary)"
            @click="goToPage(pagination.page - 1)"
          >
            Précédent
          </button>
          <button
            :disabled="pagination.page >= totalPages"
            class="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50 transition-colors cursor-pointer disabled:cursor-not-allowed"
            style="border-color: var(--border-primary); color: var(--text-secondary)"
            @click="goToPage(pagination.page + 1)"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de création -->
    <UiModal v-model="showCreateModal" title="Ajouter un abonné" size="md">
      <form @submit.prevent="createAbonne">
        <div class="space-y-4">
          <UiFormInput
            v-model="newAbonne.email"
            label="Email"
            type="email"
            placeholder="email@exemple.com"
            required
          />
          <div class="grid grid-cols-2 gap-4">
            <UiFormInput
              v-model="newAbonne.prenom"
              label="Prénom"
              placeholder="Prénom"
            />
            <UiFormInput
              v-model="newAbonne.nom"
              label="Nom"
              placeholder="Nom"
            />
          </div>
          <UiFormInput
            v-model="newAbonne.organisation"
            label="Organisation"
            placeholder="Organisation (optionnel)"
          />
          <UiFormSelect
            v-model="newAbonne.statut"
            label="Statut"
            :options="[
              { value: 'actif', label: 'Actif' },
              { value: 'inactif', label: 'Inactif' }
            ]"
          />
        </div>
        <div class="mt-6 flex justify-end gap-3">
          <button
            type="button"
            class="px-4 py-2 border rounded-lg transition-colors cursor-pointer"
            style="border-color: var(--border-primary); color: var(--text-secondary)"
            @click="showCreateModal = false"
          >
            Annuler
          </button>
          <button
            type="submit"
            class="px-4 py-2 rounded-lg text-white transition-colors cursor-pointer"
            style="background-color: var(--color-primary)"
            :disabled="isSaving"
          >
            {{ isSaving ? 'Création...' : 'Créer' }}
          </button>
        </div>
      </form>
    </UiModal>

    <!-- Modal d'import -->
    <UiModal v-model="showImportModal" title="Importer des abonnés" size="md">
      <div class="space-y-4">
        <p class="text-sm" style="color: var(--text-secondary)">
          Importez une liste d'abonnés depuis un fichier CSV ou Excel.
          Le fichier doit contenir les colonnes : email, nom, prenom, organisation.
        </p>
        <div
          class="border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer"
          :class="isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''"
          style="border-color: var(--border-primary)"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="handleFileDrop"
          @click="triggerFileInput"
        >
          <font-awesome-icon :icon="['fas', 'cloud-upload-alt']" class="w-12 h-12 mb-4" style="color: var(--text-muted)" />
          <p class="font-medium" style="color: var(--text-primary)">
            {{ importFile ? importFile.name : 'Glissez un fichier ici ou cliquez pour sélectionner' }}
          </p>
          <p class="text-sm mt-1" style="color: var(--text-muted)">
            Formats acceptés : CSV, XLSX
          </p>
          <input
            ref="fileInput"
            type="file"
            accept=".csv,.xlsx"
            class="hidden"
            @change="handleFileSelect"
          />
        </div>
        <div v-if="importResult" class="p-4 rounded-lg" :class="importResult.errors?.length ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-green-100 dark:bg-green-900/30'">
          <p class="font-medium" :class="importResult.errors?.length ? 'text-amber-800 dark:text-amber-200' : 'text-green-800 dark:text-green-200'">
            {{ importResult.imported }} abonnés importés
          </p>
          <ul v-if="importResult.errors?.length" class="mt-2 text-sm text-amber-700 dark:text-amber-300 list-disc list-inside">
            <li v-for="(error, index) in importResult.errors.slice(0, 5)" :key="index">{{ error }}</li>
            <li v-if="importResult.errors.length > 5">... et {{ importResult.errors.length - 5 }} autres erreurs</li>
          </ul>
        </div>
      </div>
      <div class="mt-6 flex justify-end gap-3">
        <button
          type="button"
          class="px-4 py-2 border rounded-lg transition-colors cursor-pointer"
          style="border-color: var(--border-primary); color: var(--text-secondary)"
          @click="closeImportModal"
        >
          {{ importResult ? 'Fermer' : 'Annuler' }}
        </button>
        <button
          v-if="!importResult"
          class="px-4 py-2 rounded-lg text-white transition-colors cursor-pointer disabled:opacity-50"
          style="background-color: var(--color-primary)"
          :disabled="!importFile || isImporting"
          @click="importAbonnes"
        >
          {{ isImporting ? 'Importation...' : 'Importer' }}
        </button>
      </div>
    </UiModal>

    <!-- Modal de confirmation de suppression -->
    <UiModal v-model="showDeleteModal" title="Confirmer la suppression" size="sm">
      <p style="color: var(--text-secondary)">
        Êtes-vous sûr de vouloir supprimer l'abonné <strong>{{ abonneToDelete?.email }}</strong> ?
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
import type { NewsletterStats } from '~/services/newsletter.service'

definePageMeta({
  layout: 'admin'
})

const newsletterService = useNewsletterService()
const toast = useAppToast()

// État
const isLoading = ref(true)
const isSaving = ref(false)
const isDeleting = ref(false)
const isImporting = ref(false)
const abonnes = ref<NewsletterSubscriber[]>([])
const stats = ref<NewsletterStats>({
  total_abonnes: 0,
  abonnes_actifs: 0,
  abonnes_inactifs: 0,
  desabonnes: 0,
  inscriptions_ce_mois: 0,
  taux_croissance: 0
})
const evolutionData = ref<Array<{ date: string; inscriptions: number; desabonnements: number }>>([])
const evolutionPeriode = ref('30j')

// Pagination
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0
})

// Filtres
const searchQuery = ref('')
const filterStatut = ref<'' | 'actif' | 'inactif' | 'desabonne'>('')

// Modals
const showCreateModal = ref(false)
const showImportModal = ref(false)
const showDeleteModal = ref(false)
const showExportMenu = ref(false)

// Formulaire nouveau abonné
const newAbonne = ref<NewsletterSubscriberFormData>({
  email: '',
  nom: '',
  prenom: '',
  organisation: '',
  statut: 'actif'
})

// Import
const fileInput = ref<HTMLInputElement>()
const importFile = ref<File | null>(null)
const importResult = ref<{ imported: number; errors?: string[] } | null>(null)
const isDragging = ref(false)

// Suppression
const abonneToDelete = ref<NewsletterSubscriber | null>(null)

// Computed
const totalPages = computed(() => Math.ceil(pagination.value.total / pagination.value.limit))
const maxInscriptions = computed(() => Math.max(...evolutionData.value.map(d => d.inscriptions), 1))

// Watchers
watch([searchQuery, filterStatut], () => {
  pagination.value.page = 1
  loadAbonnes()
}, { debounce: 300 } as any)

watch(evolutionPeriode, () => {
  loadEvolution()
})

// Méthodes
const loadAbonnes = async () => {
  isLoading.value = true
  try {
    const response = await newsletterService.getAbonnes({
      page: pagination.value.page,
      limit: pagination.value.limit,
      search: searchQuery.value || undefined,
      statut: filterStatut.value || undefined
    })
    abonnes.value = response.items
    pagination.value.total = response.total
  } catch (error) {
    console.error('Erreur chargement abonnés:', error)
    // Mock data
    abonnes.value = generateMockAbonnes()
    pagination.value.total = abonnes.value.length
  } finally {
    isLoading.value = false
  }
}

const loadStats = async () => {
  try {
    stats.value = await newsletterService.getStats()
  } catch (error) {
    console.error('Erreur chargement stats:', error)
    // Mock stats
    stats.value = {
      total_abonnes: 156,
      abonnes_actifs: 142,
      abonnes_inactifs: 8,
      desabonnes: 6,
      inscriptions_ce_mois: 12,
      taux_croissance: 8.5
    }
  }
}

const loadEvolution = async () => {
  try {
    evolutionData.value = await newsletterService.getEvolutionInscriptions({ periode: evolutionPeriode.value as any })
  } catch (error) {
    console.error('Erreur chargement évolution:', error)
    // Mock evolution
    const days = evolutionPeriode.value === '7j' ? 7 : evolutionPeriode.value === '30j' ? 30 : 90
    evolutionData.value = Array.from({ length: days }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (days - i - 1))
      return {
        date: date.toISOString().split('T')[0],
        inscriptions: Math.floor(Math.random() * 5) + 1,
        desabonnements: Math.floor(Math.random() * 2)
      }
    })
  }
}

const createAbonne = async () => {
  if (!newAbonne.value.email) return

  isSaving.value = true
  try {
    await newsletterService.createAbonne(newAbonne.value)
    toast.success('Abonné créé avec succès')
    showCreateModal.value = false
    newAbonne.value = { email: '', nom: '', prenom: '', organisation: '', statut: 'actif' }
    loadAbonnes()
    loadStats()
  } catch (error) {
    console.error('Erreur création:', error)
    toast.error('Erreur lors de la création')
  } finally {
    isSaving.value = false
  }
}

const toggleStatut = async (abonne: NewsletterSubscriber) => {
  try {
    if (abonne.statut === 'actif') {
      await newsletterService.desactiverAbonne(abonne.id)
      abonne.statut = 'inactif'
      toast.success('Abonné désactivé')
    } else {
      await newsletterService.activerAbonne(abonne.id)
      abonne.statut = 'actif'
      toast.success('Abonné activé')
    }
    loadStats()
  } catch (error) {
    console.error('Erreur changement statut:', error)
    // Mock toggle
    abonne.statut = abonne.statut === 'actif' ? 'inactif' : 'actif'
    toast.success(`Abonné ${abonne.statut === 'actif' ? 'activé' : 'désactivé'}`)
  }
}

const confirmDelete = (abonne: NewsletterSubscriber) => {
  abonneToDelete.value = abonne
  showDeleteModal.value = true
}

const deleteAbonne = async () => {
  if (!abonneToDelete.value) return

  isDeleting.value = true
  try {
    await newsletterService.deleteAbonne(abonneToDelete.value.id)
    toast.success('Abonné supprimé')
    showDeleteModal.value = false
    abonneToDelete.value = null
    loadAbonnes()
    loadStats()
  } catch (error) {
    console.error('Erreur suppression:', error)
    // Mock delete
    abonnes.value = abonnes.value.filter(a => a.id !== abonneToDelete.value?.id)
    toast.success('Abonné supprimé')
    showDeleteModal.value = false
    abonneToDelete.value = null
  } finally {
    isDeleting.value = false
  }
}

const exportAbonnes = async (format: 'csv' | 'xlsx') => {
  showExportMenu.value = false
  try {
    const blob = await newsletterService.exportAbonnes({
      format,
      statut: filterStatut.value || undefined
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `abonnes_newsletter.${format}`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Export ${format.toUpperCase()} téléchargé`)
  } catch (error) {
    console.error('Erreur export:', error)
    toast.error("Erreur lors de l'export")
  }
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files?.length) {
    importFile.value = input.files[0]
  }
}

const handleFileDrop = (event: DragEvent) => {
  isDragging.value = false
  const files = event.dataTransfer?.files
  if (files?.length) {
    importFile.value = files[0]
  }
}

const importAbonnes = async () => {
  if (!importFile.value) return

  isImporting.value = true
  try {
    const result = await newsletterService.importAbonnes(importFile.value)
    importResult.value = result
    loadAbonnes()
    loadStats()
    toast.success(`${result.imported} abonnés importés`)
  } catch (error) {
    console.error('Erreur import:', error)
    toast.error("Erreur lors de l'import")
  } finally {
    isImporting.value = false
  }
}

const closeImportModal = () => {
  showImportModal.value = false
  importFile.value = null
  importResult.value = null
}

const goToPage = (page: number) => {
  pagination.value.page = page
  loadAbonnes()
}

const resetFilters = () => {
  searchQuery.value = ''
  filterStatut.value = ''
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

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const formatShortDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short'
  })
}

const generateMockAbonnes = (): NewsletterSubscriber[] => {
  return [
    {
      id: '1',
      email: 'jean.dupont@example.com',
      nom: 'Dupont',
      prenom: 'Jean',
      organisation: 'ONG Transparence',
      statut: 'actif',
      created_at: '2024-11-15T10:00:00Z',
      updated_at: '2024-11-15T10:00:00Z'
    },
    {
      id: '2',
      email: 'marie.martin@example.com',
      nom: 'Martin',
      prenom: 'Marie',
      organisation: 'Ministère des Mines',
      statut: 'actif',
      created_at: '2024-11-10T14:30:00Z',
      updated_at: '2024-11-10T14:30:00Z'
    },
    {
      id: '3',
      email: 'pierre.durand@example.com',
      nom: 'Durand',
      prenom: 'Pierre',
      organisation: null,
      statut: 'inactif',
      created_at: '2024-10-20T09:15:00Z',
      updated_at: '2024-11-01T12:00:00Z'
    },
    {
      id: '4',
      email: 'sarah.bernard@example.com',
      nom: 'Bernard',
      prenom: 'Sarah',
      organisation: 'Banque Mondiale',
      statut: 'actif',
      created_at: '2024-09-05T16:45:00Z',
      updated_at: '2024-09-05T16:45:00Z'
    },
    {
      id: '5',
      email: 'ancien.abonne@example.com',
      nom: 'Ancien',
      prenom: 'Abonné',
      organisation: null,
      statut: 'desabonne',
      created_at: '2024-06-01T08:00:00Z',
      updated_at: '2024-10-15T11:30:00Z'
    }
  ]
}

// Lifecycle
onMounted(() => {
  loadAbonnes()
  loadStats()
  loadEvolution()
})

// Click outside pour fermer le menu export
onMounted(() => {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (!target.closest('[data-export-menu]')) {
      showExportMenu.value = false
    }
  })
})
</script>
