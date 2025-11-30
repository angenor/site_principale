<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const { user, isAdmin } = useAuth()

// Statistiques
interface Stats {
  casesCount: number
  newsCount: number
  contactsCount: number
  viewsCount: number
}

interface RecentContact {
  id: string
  name: string | null
  subject: string
  status: string
  createdAt: string
}

interface RecentCase {
  id: string
  slug: string
  title: string
  isPublished: boolean
  createdAt: string
}

const { data: stats } = await useFetch<Stats>('/api/admin/stats')
const { data: recentContacts } = await useFetch<RecentContact[]>('/api/admin/contacts/recent')
const { data: recentCases } = await useFetch<RecentCase[]>('/api/admin/cases/recent')

const statsCards = computed(() => [
  {
    name: 'Études de cas',
    value: stats.value?.casesCount ?? 0,
    icon: 'folder-open',
    color: 'bg-blue-500',
    href: '/admin/cases'
  },
  {
    name: 'Actualités',
    value: stats.value?.newsCount ?? 0,
    icon: 'newspaper',
    color: 'bg-green-500',
    href: '/admin/news'
  },
  {
    name: 'Signalements',
    value: stats.value?.contactsCount ?? 0,
    icon: 'envelope',
    color: 'bg-orange-500',
    href: '/admin/contacts'
  },
  {
    name: 'Visites (30j)',
    value: stats.value?.viewsCount ?? 0,
    icon: 'chart-line',
    color: 'bg-purple-500',
    href: '#'
  }
])

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

function getStatusColor(status: string) {
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

function getStatusLabel(status: string) {
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
    <!-- Bienvenue -->
    <div class="mb-8">
      <h2 class="text-2xl font-heading font-bold text-gray-900 dark:text-white">
        Bienvenue, {{ user?.firstName }} !
      </h2>
      <p class="mt-1 text-gray-600 dark:text-gray-400">
        Voici un aperçu de l'activité du site.
      </p>
    </div>

    <!-- Stats cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <NuxtLink
        v-for="stat in statsCards"
        :key="stat.name"
        :to="stat.href"
        class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
      >
        <div class="flex items-center gap-4">
          <div
            :class="[stat.color, 'w-12 h-12 rounded-lg flex items-center justify-center text-white']"
          >
            <font-awesome-icon :icon="stat.icon" class="w-6 h-6" />
          </div>
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ stat.name }}</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stat.value }}</p>
          </div>
        </div>
      </NuxtLink>
    </div>

    <!-- Contenu principal -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Signalements récents -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 class="font-semibold text-gray-900 dark:text-white">Signalements récents</h3>
          <NuxtLink
            to="/admin/contacts"
            class="text-sm text-ti-blue hover:underline"
          >
            Voir tout
          </NuxtLink>
        </div>
        <div v-if="recentContacts && recentContacts.length > 0" class="divide-y divide-gray-100 dark:divide-gray-700">
          <div
            v-for="contact in recentContacts"
            :key="contact.id"
            class="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {{ contact.subject }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {{ contact.name || 'Anonyme' }} - {{ formatDate(contact.createdAt) }}
                </p>
              </div>
              <span
                :class="[
                  getStatusColor(contact.status),
                  'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium'
                ]"
              >
                {{ getStatusLabel(contact.status) }}
              </span>
            </div>
          </div>
        </div>
        <div v-else class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
          <font-awesome-icon icon="inbox" class="w-8 h-8 mb-2 text-gray-400 dark:text-gray-500" />
          <p>Aucun signalement récent</p>
        </div>
      </div>

      <!-- Études de cas récentes -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 class="font-semibold text-gray-900 dark:text-white">Études de cas récentes</h3>
          <NuxtLink
            to="/admin/cases"
            class="text-sm text-ti-blue hover:underline"
          >
            Voir tout
          </NuxtLink>
        </div>
        <div v-if="recentCases && recentCases.length > 0" class="divide-y divide-gray-100 dark:divide-gray-700">
          <NuxtLink
            v-for="caseStudy in recentCases"
            :key="caseStudy.id"
            :to="`/admin/cases/${caseStudy.id}`"
            class="block px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {{ caseStudy.title }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {{ formatDate(caseStudy.createdAt) }}
                </p>
              </div>
              <span
                :class="[
                  caseStudy.isPublished
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
                  'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium'
                ]"
              >
                {{ caseStudy.isPublished ? 'Publié' : 'Brouillon' }}
              </span>
            </div>
          </NuxtLink>
        </div>
        <div v-else class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
          <font-awesome-icon icon="folder-open" class="w-8 h-8 mb-2 text-gray-400 dark:text-gray-500" />
          <p>Aucune étude de cas</p>
        </div>
      </div>
    </div>

    <!-- Actions rapides -->
    <div class="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Actions rapides</h3>
      <div class="flex flex-wrap gap-3">
        <NuxtLink
          to="/admin/cases/new"
          class="inline-flex items-center gap-2 px-4 py-2 bg-ti-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <font-awesome-icon icon="plus" />
          Nouvelle étude de cas
        </NuxtLink>
        <NuxtLink
          to="/admin/news/new"
          class="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <font-awesome-icon icon="plus" />
          Nouvelle actualité
        </NuxtLink>
        <NuxtLink
          to="/admin/content"
          class="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <font-awesome-icon icon="edit" />
          Gérer le contenu
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
