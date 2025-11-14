<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Messagerie Sécurisée</h1>
        <p class="text-gray-600 dark:text-gray-400">Communication chiffrée entre utilisateurs</p>
      </div>
      <button @click="openComposeModal" class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Nouveau message
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Messages reçus</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">{{ messagesRecus.length }}</p>
          </div>
          <div class="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Messages envoyés</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">{{ messagesEnvoyes.length }}</p>
          </div>
          <div class="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Non lus</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">{{ messagesNonLus }}</p>
          </div>
          <div class="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <svg class="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="mb-6">
      <div class="border-b border-gray-200 dark:border-gray-700">
        <nav class="-mb-px flex space-x-8">
          <button @click="activeTab = 'recus'" :class="activeTab === 'recus' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'" class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center">
            Boîte de réception
            <span v-if="messagesNonLus > 0" class="ml-2 px-2 py-0.5 text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400 rounded-full">
              {{ messagesNonLus }}
            </span>
          </button>
          <button @click="activeTab = 'envoyes'" :class="activeTab === 'envoyes' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'" class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
            Messages envoyés
          </button>
        </nav>
      </div>
    </div>

    <div v-if="loading" class="bg-white dark:bg-gray-800 rounded-lg p-12 text-center">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="mt-4 text-gray-600 dark:text-gray-400">Chargement...</p>
    </div>

    <!-- Messages Reçus -->
    <div v-else-if="activeTab === 'recus'" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div class="divide-y divide-gray-200 dark:divide-gray-700">
        <div v-for="message in messagesRecus" :key="message.id"
             @click="openMessage(message)"
             class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer transition-colors"
             :class="{ 'bg-blue-50 dark:bg-blue-900/20': !message.est_lu }">
          <div class="flex items-start justify-between">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-3 mb-1">
                <div class="flex-shrink-0">
                  <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {{ getInitials(message.expediteur?.nom, message.expediteur?.prenom) }}
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <p class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ message.expediteur?.nom || 'Utilisateur' }} {{ message.expediteur?.prenom || '' }}
                    </p>
                    <span v-if="!message.est_lu" class="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></span>
                    <span v-if="message.est_chiffre" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Chiffré
                    </span>
                  </div>
                  <p class="text-sm font-medium text-gray-900 dark:text-white mt-1">{{ message.sujet || '(Sans sujet)' }}</p>
                  <p class="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">{{ message.contenu }}</p>
                </div>
              </div>
            </div>
            <div class="ml-4 flex-shrink-0 text-sm text-gray-500 dark:text-gray-400">
              {{ formatDate(message.created_at) }}
            </div>
          </div>
          <div v-if="message.fichiers_joints && message.fichiers_joints.length > 0" class="mt-2 ml-13 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            {{ message.fichiers_joints.length }} pièce(s) jointe(s)
          </div>
        </div>
        <div v-if="messagesRecus.length === 0" class="p-12 text-center text-gray-500 dark:text-gray-400">
          Aucun message reçu
        </div>
      </div>
    </div>

    <!-- Messages Envoyés -->
    <div v-else class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div class="divide-y divide-gray-200 dark:divide-gray-700">
        <div v-for="message in messagesEnvoyes" :key="message.id"
             class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer transition-colors">
          <div class="flex items-start justify-between">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-3 mb-1">
                <div class="flex-shrink-0">
                  <div class="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white font-semibold">
                    {{ getInitials(message.destinataire?.nom, message.destinataire?.prenom) }}
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <p class="text-sm font-medium text-gray-900 dark:text-white">
                      À: {{ message.destinataire?.nom || 'Utilisateur' }} {{ message.destinataire?.prenom || '' }}
                    </p>
                    <span v-if="message.est_lu" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                      Lu
                    </span>
                    <span v-else class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                      Non lu
                    </span>
                  </div>
                  <p class="text-sm font-medium text-gray-900 dark:text-white mt-1">{{ message.sujet || '(Sans sujet)' }}</p>
                  <p class="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">{{ message.contenu }}</p>
                </div>
              </div>
            </div>
            <div class="ml-4 flex-shrink-0 text-sm text-gray-500 dark:text-gray-400">
              {{ formatDate(message.created_at) }}
            </div>
          </div>
        </div>
        <div v-if="messagesEnvoyes.length === 0" class="p-12 text-center text-gray-500 dark:text-gray-400">
          Aucun message envoyé
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MessageSecurise } from '~/types/autres-modules'

definePageMeta({ layout: 'admin' })

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const loading = ref(true)
const activeTab = ref<'recus' | 'envoyes'>('recus')

const messagesRecus = ref<MessageSecurise[]>([])
const messagesEnvoyes = ref<MessageSecurise[]>([])

const messagesNonLus = computed(() =>
  messagesRecus.value.filter(m => !m.est_lu).length
)

onMounted(async () => {
  await loadMessages()
})

async function loadMessages() {
  if (!user.value?.id) return

  loading.value = true
  try {
    // Messages reçus
    const { data: recus, error: recusError } = await supabase
      .from('messages_securises')
      .select(`
        *,
        expediteur:profiles!messages_securises_expediteur_id_fkey(id, nom, prenom, email)
      `)
      .eq('destinataire_id', user.value.id)
      .order('created_at', { ascending: false })

    if (recusError) throw recusError
    messagesRecus.value = recus || []

    // Messages envoyés
    const { data: envoyes, error: envoyesError } = await supabase
      .from('messages_securises')
      .select(`
        *,
        destinataire:profiles!messages_securises_destinataire_id_fkey(id, nom, prenom, email)
      `)
      .eq('expediteur_id', user.value.id)
      .order('created_at', { ascending: false })

    if (envoyesError) throw envoyesError
    messagesEnvoyes.value = envoyes || []

  } catch (err) {
    console.error('Erreur lors du chargement des messages:', err)
  } finally {
    loading.value = false
  }
}

async function openMessage(message: MessageSecurise) {
  // Marquer comme lu
  if (!message.est_lu) {
    await supabase
      .from('messages_securises')
      .update({ est_lu: true, date_lecture: new Date().toISOString() })
      .eq('id', message.id)

    message.est_lu = true
  }

  alert(`Ouverture du message: ${message.sujet}\n\n${message.contenu}`)
}

function openComposeModal() {
  alert('Fonctionnalité à implémenter : Composer un nouveau message')
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  } else if (days === 1) {
    return 'Hier'
  } else if (days < 7) {
    return `Il y a ${days} jours`
  } else {
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
  }
}

function getInitials(nom?: string | null, prenom?: string | null) {
  const n = nom?.charAt(0) || ''
  const p = prenom?.charAt(0) || ''
  return (n + p).toUpperCase() || '?'
}
</script>
