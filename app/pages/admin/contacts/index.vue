<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

type ContactStatus = 'NEW' | 'IN_REVIEW' | 'PROCESSED' | 'ARCHIVED'

interface Contact {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  subject: string
  message: string
  status: ContactStatus
  isAnonymous: boolean
  createdAt: string
  processedAt: string | null
  notes: string | null
}

interface ContactsResponse {
  data: Contact[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

const search = ref('')
const status = ref('all')
const page = ref(1)
const limit = 10

const debouncedSearch = refDebounced(search, 300)

const { data: contactsResponse, pending, refresh } = await useFetch<ContactsResponse>('/api/admin/contacts', {
  query: computed(() => ({
    page: page.value,
    limit,
    search: debouncedSearch.value,
    status: status.value
  })),
  watch: [page, debouncedSearch, status]
})

const contacts = computed(() => contactsResponse.value?.data || [])
const pagination = computed(() => contactsResponse.value?.pagination)

function goToPage(p: number) {
  page.value = p
}

function resetFilters() {
  search.value = ''
  status.value = 'all'
  page.value = 1
}

async function deleteContact(id: string, subject: string) {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer "${subject}" ?`)) {
    return
  }

  try {
    await $fetch(`/api/admin/contacts/${id}`, { method: 'DELETE' })
    refresh()
  } catch {
    alert('Erreur lors de la suppression')
  }
}

async function updateStatus(id: string, newStatus: ContactStatus) {
  try {
    await $fetch(`/api/admin/contacts/${id}`, {
      method: 'PUT',
      body: { status: newStatus }
    })
    refresh()
  } catch {
    alert('Erreur lors de la mise à jour du statut')
  }
}

function formatDate(dateString: string | null) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getStatusColor(status: ContactStatus) {
  switch (status) {
    case 'NEW':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
    case 'IN_REVIEW':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
    case 'PROCESSED':
      return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
    case 'ARCHIVED':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }
}

function getStatusLabel(status: ContactStatus) {
  switch (status) {
    case 'NEW':
      return 'Nouveau'
    case 'IN_REVIEW':
      return 'En cours'
    case 'PROCESSED':
      return 'Traité'
    case 'ARCHIVED':
      return 'Archivé'
    default:
      return status
  }
}

const statuses: { value: ContactStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Tous les statuts' },
  { value: 'NEW', label: 'Nouveaux' },
  { value: 'IN_REVIEW', label: 'En cours' },
  { value: 'PROCESSED', label: 'Traités' },
  { value: 'ARCHIVED', label: 'Archivés' }
]
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h2 class="text-2xl font-heading font-bold text-gray-900 dark:text-white">Signalements</h2>
        <p class="text-gray-600 dark:text-gray-400">Gérer les signalements et contacts reçus</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <div class="relative">
            <font-awesome-icon
              icon="search"
              class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
            />
            <input
              v-model="search"
              type="text"
              placeholder="Rechercher..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-ti-blue focus:border-ti-blue"
            />
          </div>
        </div>

        <select
          v-model="status"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-ti-blue focus:border-ti-blue"
        >
          <option v-for="s in statuses" :key="s.value" :value="s.value">
            {{ s.label }}
          </option>
        </select>

        <button
          v-if="search || status !== 'all'"
          @click="resetFilters"
          class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer"
        >
          <font-awesome-icon icon="xmark" class="mr-1" />
          Réinitialiser
        </button>
      </div>
    </div>

    <!-- List -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      <div v-if="pending" class="p-8 text-center">
        <font-awesome-icon icon="spinner" class="animate-spin text-ti-blue text-2xl" />
        <p class="mt-2 text-gray-600 dark:text-gray-400">Chargement...</p>
      </div>

      <div v-else-if="contacts.length > 0" class="divide-y divide-gray-200 dark:divide-gray-700">
        <div
          v-for="contact in contacts"
          :key="contact.id"
          class="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div class="flex-1 min-w-0">
              <!-- Subject -->
              <div class="flex items-center gap-3 mb-2">
                <h3 class="font-semibold text-gray-900 dark:text-white truncate">
                  {{ contact.subject }}
                </h3>
                <span
                  :class="[getStatusColor(contact.status), 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap']"
                >
                  {{ getStatusLabel(contact.status) }}
                </span>
                <span
                  v-if="contact.isAnonymous"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300"
                >
                  Anonyme
                </span>
              </div>

              <!-- Sender info -->
              <div class="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                <span v-if="contact.name" class="flex items-center gap-1">
                  <font-awesome-icon icon="user" class="w-3 h-3" />
                  {{ contact.name }}
                </span>
                <span v-if="contact.email" class="flex items-center gap-1">
                  <font-awesome-icon icon="envelope" class="w-3 h-3" />
                  {{ contact.email }}
                </span>
                <span v-if="contact.phone" class="flex items-center gap-1">
                  <font-awesome-icon icon="phone" class="w-3 h-3" />
                  {{ contact.phone }}
                </span>
                <span class="flex items-center gap-1">
                  <font-awesome-icon icon="clock" class="w-3 h-3" />
                  {{ formatDate(contact.createdAt) }}
                </span>
              </div>

              <!-- Message preview -->
              <p class="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                {{ contact.message }}
              </p>

              <!-- Notes -->
              <p v-if="contact.notes" class="mt-2 text-xs text-gray-500 dark:text-gray-500 italic">
                Note: {{ contact.notes }}
              </p>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-2 flex-shrink-0">
              <select
                :value="contact.status"
                @change="updateStatus(contact.id, ($event.target as HTMLSelectElement).value as ContactStatus)"
                class="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-ti-blue focus:border-ti-blue cursor-pointer"
              >
                <option value="NEW">Nouveau</option>
                <option value="IN_REVIEW">En cours</option>
                <option value="PROCESSED">Traité</option>
                <option value="ARCHIVED">Archivé</option>
              </select>
              <NuxtLink
                :to="`/admin/contacts/${contact.id}`"
                class="p-2 text-gray-400 hover:text-ti-blue transition-colors"
                title="Voir détails"
              >
                <font-awesome-icon icon="eye" />
              </NuxtLink>
              <button
                @click="deleteContact(contact.id, contact.subject)"
                class="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                title="Supprimer"
              >
                <font-awesome-icon icon="trash" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="p-8 text-center">
        <font-awesome-icon icon="inbox" class="text-4xl text-gray-300 dark:text-gray-600 mb-3" />
        <p class="text-gray-600 dark:text-gray-400">Aucun signalement trouvé</p>
      </div>

      <!-- Pagination -->
      <div
        v-if="pagination && pagination.totalPages > 1"
        class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between"
      >
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ (pagination.page - 1) * limit + 1 }} - {{ Math.min(pagination.page * limit, pagination.total) }}
          sur {{ pagination.total }} résultats
        </p>
        <div class="flex gap-2">
          <button
            :disabled="pagination.page === 1"
            @click="goToPage(pagination.page - 1)"
            class="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
          >
            Précédent
          </button>
          <button
            :disabled="pagination.page === pagination.totalPages"
            @click="goToPage(pagination.page + 1)"
            class="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
