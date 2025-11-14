<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Gestion des Utilisateurs</h1>
        <p class="text-gray-600 dark:text-gray-400">Gérer les comptes utilisateurs et leurs permissions</p>
      </div>
      <button @click="openCreateModal" class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Nouvel utilisateur
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
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Email</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nom</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Rôle</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Organisation</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Statut</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="profile in profiles" :key="profile.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/30">
              <td class="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{{ profile.email }}</td>
              <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{{ profile.nom || '-' }} {{ profile.prenom || '' }}</td>
              <td class="px-6 py-4 text-sm">
                <span :class="getRoleClass(profile.role)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                  {{ profile.role }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{{ profile.organisation || '-' }}</td>
              <td class="px-6 py-4 text-sm">
                <span :class="profile.est_actif ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                  {{ profile.est_actif ? 'Actif' : 'Inactif' }}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button @click="editProfile(profile)" class="text-blue-600 dark:text-blue-400 hover:text-blue-800">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button @click="handleDelete(profile)" class="text-red-600 dark:text-red-400 hover:text-red-800">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Profile } from '~/types/autres-modules'

definePageMeta({ layout: 'admin' })

const { fetchProfiles, deleteProfile } = useProfiles()
const profiles = ref<Profile[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    profiles.value = await fetchProfiles()
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
})

function getRoleClass(role: string) {
  return role === 'administrateur' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
         role === 'editeur' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
         'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
}

function openCreateModal() {
  alert('Fonctionnalité à implémenter : Créer un utilisateur')
}

function editProfile(profile: Profile) {
  alert(`Modifier l'utilisateur ${profile.email}`)
}

async function handleDelete(profile: Profile) {
  if (confirm(`Supprimer l'utilisateur ${profile.email} ?`)) {
    await deleteProfile(profile.id)
    profiles.value = await fetchProfiles()
  }
}
</script>
