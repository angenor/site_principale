<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Gestion des Documents</h1>
        <p class="text-gray-600 dark:text-gray-400">Gérer les documents téléchargeables</p>
      </div>
      <button @click="openCreateModal" class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Ajouter un document
      </button>
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
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Titre</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Visibilité</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Téléchargements</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="doc in documents" :key="doc.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/30">
              <td class="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{{ doc.titre }}</td>
              <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{{ doc.type_fichier }}</td>
              <td class="px-6 py-4 text-sm">
                <span :class="doc.est_public ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                  {{ doc.est_public ? 'Public' : 'Privé' }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{{ doc.nombre_telechargements }}</td>
              <td class="px-6 py-4 text-right">
                <button @click="handleDelete(doc)" class="text-red-600 dark:text-red-400 hover:text-red-800">
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
import type { Document } from '~/types/autres-modules'

definePageMeta({ layout: 'admin' })

const { fetchDocuments, deleteDocument } = useDocuments()
const documents = ref<Document[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    documents.value = await fetchDocuments()
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
})

function openCreateModal() {
  alert('Fonctionnalité à implémenter : Upload de document')
}

async function handleDelete(doc: Document) {
  if (confirm(`Supprimer "${doc.titre}" ?`)) {
    await deleteDocument(doc.id)
    documents.value = await fetchDocuments()
  }
}
</script>
