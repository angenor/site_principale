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
  ipAddress: string | null
  createdAt: string
  processedAt: string | null
  notes: string | null
}

const route = useRoute()
const router = useRouter()
const id = route.params.id as string

const contact = ref<Contact | null>(null)
const notes = ref('')
const isLoading = ref(true)
const isSaving = ref(false)
const error = ref('')
const success = ref('')

// Fetch contact
try {
  const { data } = await useFetch<Contact>(`/api/admin/contacts/${id}`)
  if (data.value) {
    contact.value = data.value
    notes.value = data.value.notes || ''
  }
} catch {
  error.value = 'Erreur lors du chargement du signalement'
} finally {
  isLoading.value = false
}

async function updateStatus(newStatus: ContactStatus) {
  if (!contact.value) return

  isSaving.value = true
  error.value = ''
  success.value = ''

  try {
    const result = await $fetch<{ success: boolean; data: Contact }>(`/api/admin/contacts/${id}`, {
      method: 'PUT',
      body: { status: newStatus }
    })
    if (result.success) {
      contact.value = result.data
      success.value = 'Statut mis à jour'
    }
  } catch {
    error.value = 'Erreur lors de la mise à jour du statut'
  } finally {
    isSaving.value = false
  }
}

async function saveNotes() {
  if (!contact.value) return

  isSaving.value = true
  error.value = ''
  success.value = ''

  try {
    const result = await $fetch<{ success: boolean; data: Contact }>(`/api/admin/contacts/${id}`, {
      method: 'PUT',
      body: { notes: notes.value }
    })
    if (result.success) {
      contact.value = result.data
      success.value = 'Notes enregistrées'
    }
  } catch {
    error.value = 'Erreur lors de l\'enregistrement des notes'
  } finally {
    isSaving.value = false
  }
}

async function deleteContact() {
  if (!contact.value) return
  if (!confirm('Êtes-vous sûr de vouloir supprimer ce signalement ?')) return

  try {
    await $fetch(`/api/admin/contacts/${id}`, { method: 'DELETE' })
    router.push('/admin/contacts')
  } catch {
    error.value = 'Erreur lors de la suppression'
  }
}

function formatDate(dateString: string | null) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
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
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div class="flex items-center gap-4">
        <NuxtLink
          to="/admin/contacts"
          class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <font-awesome-icon icon="arrow-left" />
        </NuxtLink>
        <div>
          <h2 class="text-2xl font-heading font-bold text-gray-900 dark:text-white">
            Détail du signalement
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            Consulter et gérer ce signalement
          </p>
        </div>
      </div>
      <button
        @click="deleteContact"
        class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer flex items-center gap-2"
      >
        <font-awesome-icon icon="trash" />
        Supprimer
      </button>
    </div>

    <!-- Messages -->
    <div v-if="error" class="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg flex items-center gap-2">
      <font-awesome-icon icon="circle-exclamation" />
      {{ error }}
    </div>
    <div v-if="success" class="mb-6 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg flex items-center gap-2">
      <font-awesome-icon icon="check-circle" />
      {{ success }}
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <font-awesome-icon icon="spinner" class="animate-spin text-ti-blue text-3xl" />
    </div>

    <!-- Content -->
    <div v-else-if="contact" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main content -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Message -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ contact.subject }}
            </h3>
            <div class="flex items-center gap-2">
              <span
                :class="[getStatusColor(contact.status), 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium']"
              >
                {{ getStatusLabel(contact.status) }}
              </span>
              <span
                v-if="contact.isAnonymous"
                class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300"
              >
                Anonyme
              </span>
            </div>
          </div>

          <div class="prose prose-gray dark:prose-invert max-w-none">
            <p class="whitespace-pre-wrap text-gray-700 dark:text-gray-300">{{ contact.message }}</p>
          </div>
        </div>

        <!-- Notes -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notes internes</h3>

          <textarea
            v-model="notes"
            rows="4"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-ti-blue focus:border-ti-blue resize-none"
            placeholder="Ajouter des notes internes..."
          />

          <button
            @click="saveNotes"
            :disabled="isSaving"
            class="mt-4 px-4 py-2 bg-ti-blue text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            <font-awesome-icon v-if="isSaving" icon="spinner" class="animate-spin" />
            <font-awesome-icon v-else icon="check" />
            Enregistrer les notes
          </button>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Status -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Statut</h3>

          <div class="space-y-2">
            <button
              v-for="s in ['NEW', 'IN_REVIEW', 'PROCESSED', 'ARCHIVED'] as ContactStatus[]"
              :key="s"
              @click="updateStatus(s)"
              :disabled="isSaving || contact.status === s"
              :class="[
                contact.status === s
                  ? getStatusColor(s) + ' ring-2 ring-offset-2 ring-ti-blue dark:ring-offset-gray-800'
                  : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600',
                'w-full px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer disabled:opacity-50 text-left'
              ]"
            >
              {{ getStatusLabel(s) }}
            </button>
          </div>
        </div>

        <!-- Contact info -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informations</h3>

          <dl class="space-y-4">
            <div v-if="contact.name">
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Nom</dt>
              <dd class="mt-1 text-gray-900 dark:text-white">{{ contact.name }}</dd>
            </div>

            <div v-if="contact.email">
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
              <dd class="mt-1">
                <a
                  :href="`mailto:${contact.email}`"
                  class="text-ti-blue hover:underline"
                >
                  {{ contact.email }}
                </a>
              </dd>
            </div>

            <div v-if="contact.phone">
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Téléphone</dt>
              <dd class="mt-1">
                <a
                  :href="`tel:${contact.phone}`"
                  class="text-ti-blue hover:underline"
                >
                  {{ contact.phone }}
                </a>
              </dd>
            </div>

            <div>
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Date de réception</dt>
              <dd class="mt-1 text-gray-900 dark:text-white">{{ formatDate(contact.createdAt) }}</dd>
            </div>

            <div v-if="contact.processedAt">
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Date de traitement</dt>
              <dd class="mt-1 text-gray-900 dark:text-white">{{ formatDate(contact.processedAt) }}</dd>
            </div>

            <div v-if="contact.ipAddress">
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Adresse IP</dt>
              <dd class="mt-1 text-gray-600 dark:text-gray-400 text-sm font-mono">{{ contact.ipAddress }}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>

    <!-- Not found -->
    <div v-else class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
      <font-awesome-icon icon="inbox" class="text-4xl text-gray-300 dark:text-gray-600 mb-3" />
      <p class="text-gray-600 dark:text-gray-400">Signalement non trouvé</p>
      <NuxtLink
        to="/admin/contacts"
        class="mt-4 inline-flex items-center gap-2 text-ti-blue hover:underline"
      >
        <font-awesome-icon icon="arrow-left" />
        Retour à la liste
      </NuxtLink>
    </div>
  </div>
</template>
