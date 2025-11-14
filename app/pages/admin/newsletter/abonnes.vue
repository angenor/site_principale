<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Abonnés Newsletter</h1>
        <p class="text-gray-600 dark:text-gray-400">Gérer les abonnés à la newsletter</p>
      </div>
      <div class="flex gap-2">
        <select v-model="selectedStatut" @change="loadSubscribers" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
          <option value="">Tous les statuts</option>
          <option value="actif">Actif</option>
          <option value="inactif">Inactif</option>
          <option value="desabonne">Désabonné</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="bg-white dark:bg-gray-800 rounded-lg p-12 text-center">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="mt-4 text-gray-600 dark:text-gray-400">Chargement...</p>
    </div>

    <div v-else class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Email</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nom</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Organisation</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Statut</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="sub in subscribers" :key="sub.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/30">
              <td class="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{{ sub.email }}</td>
              <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{{ sub.nom || '-' }} {{ sub.prenom || '' }}</td>
              <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{{ sub.organisation || '-' }}</td>
              <td class="px-6 py-4 text-sm">
                <span :class="getStatutClass(sub.statut)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                  {{ sub.statut }}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <button @click="handleDelete(sub)" class="text-red-600 dark:text-red-400 hover:text-red-800">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NewsletterSubscriber } from '~/types/autres-modules'

definePageMeta({ layout: 'admin' })

const { fetchSubscribers, deleteSubscriber } = useNewsletter()
const subscribers = ref<NewsletterSubscriber[]>([])
const selectedStatut = ref('')
const loading = ref(true)

onMounted(() => loadSubscribers())

async function loadSubscribers() {
  try {
    loading.value = true
    const filters = selectedStatut.value ? { statut: selectedStatut.value } : undefined
    subscribers.value = await fetchSubscribers(filters)
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

function getStatutClass(statut: string) {
  return statut === 'actif' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
         statut === 'inactif' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
         'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
}

async function handleDelete(sub: NewsletterSubscriber) {
  if (confirm(`Supprimer l'abonné ${sub.email} ?`)) {
    await deleteSubscriber(sub.id)
    await loadSubscribers()
  }
}
</script>
