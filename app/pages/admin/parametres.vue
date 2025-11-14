<template>
  <div>
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Paramètres Système</h1>
      <p class="text-gray-600 dark:text-gray-400">Configuration générale de la plateforme</p>
    </div>

    <!-- Tabs -->
    <div class="mb-6">
      <div class="border-b border-gray-200 dark:border-gray-700">
        <nav class="-mb-px flex space-x-8">
          <button @click="activeTab = 'general'" :class="activeTab === 'general' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'" class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
            Général
          </button>
          <button @click="activeTab = 'email'" :class="activeTab === 'email' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'" class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
            Email & Notifications
          </button>
          <button @click="activeTab = 'securite'" :class="activeTab === 'securite' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'" class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
            Sécurité
          </button>
          <button @click="activeTab = 'api'" :class="activeTab === 'api' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'" class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
            API & Intégrations
          </button>
          <button @click="activeTab = 'maintenance'" :class="activeTab === 'maintenance' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'" class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
            Maintenance
          </button>
        </nav>
      </div>
    </div>

    <!-- Paramètres Généraux -->
    <div v-if="activeTab === 'general'" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Configuration Générale</h2>

      <div class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nom de la plateforme
          </label>
          <input v-model="settings.general.nom_plateforme" type="text" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea v-model="settings.general.description" rows="3" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email de contact
          </label>
          <input v-model="settings.general.email_contact" type="email" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Téléphone
          </label>
          <input v-model="settings.general.telephone" type="text" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
        </div>

        <div class="flex items-center justify-between py-3 border-t border-gray-200 dark:border-gray-700">
          <div>
            <p class="text-sm font-medium text-gray-900 dark:text-white">Mode maintenance</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">Désactiver temporairement le site public</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input v-model="settings.general.mode_maintenance" type="checkbox" class="sr-only peer">
            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div class="flex items-center justify-between py-3 border-t border-gray-200 dark:border-gray-700">
          <div>
            <p class="text-sm font-medium text-gray-900 dark:text-white">Enregistrement public</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">Autoriser les nouveaux utilisateurs à s'inscrire</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input v-model="settings.general.inscription_publique" type="checkbox" class="sr-only peer">
            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      <div class="mt-6 flex justify-end">
        <button @click="saveSettings" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
          Enregistrer les modifications
        </button>
      </div>
    </div>

    <!-- Email & Notifications -->
    <div v-if="activeTab === 'email'" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Configuration Email & Notifications</h2>

      <div class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Serveur SMTP
          </label>
          <input v-model="settings.email.smtp_host" type="text" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Port
            </label>
            <input v-model="settings.email.smtp_port" type="number" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sécurité
            </label>
            <select v-model="settings.email.smtp_security" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option value="tls">TLS</option>
              <option value="ssl">SSL</option>
              <option value="none">Aucune</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nom de l'expéditeur
          </label>
          <input v-model="settings.email.from_name" type="text" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email de l'expéditeur
          </label>
          <input v-model="settings.email.from_email" type="email" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
        </div>

        <div class="flex items-center justify-between py-3 border-t border-gray-200 dark:border-gray-700">
          <div>
            <p class="text-sm font-medium text-gray-900 dark:text-white">Notifications par email</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">Envoyer des notifications aux administrateurs</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input v-model="settings.email.notifications_enabled" type="checkbox" class="sr-only peer">
            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      <div class="mt-6 flex justify-end gap-3">
        <button @click="testEmail" class="px-6 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors">
          Envoyer un test
        </button>
        <button @click="saveSettings" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
          Enregistrer
        </button>
      </div>
    </div>

    <!-- Sécurité -->
    <div v-if="activeTab === 'securite'" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Paramètres de Sécurité</h2>

      <div class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Durée de session (minutes)
          </label>
          <input v-model="settings.securite.session_duration" type="number" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nombre max de tentatives de connexion
          </label>
          <input v-model="settings.securite.max_login_attempts" type="number" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
        </div>

        <div class="flex items-center justify-between py-3 border-t border-gray-200 dark:border-gray-700">
          <div>
            <p class="text-sm font-medium text-gray-900 dark:text-white">Authentification à deux facteurs</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">Exiger 2FA pour tous les administrateurs</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input v-model="settings.securite.require_2fa" type="checkbox" class="sr-only peer">
            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div class="flex items-center justify-between py-3 border-t border-gray-200 dark:border-gray-700">
          <div>
            <p class="text-sm font-medium text-gray-900 dark:text-white">Logs d'activité</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">Enregistrer toutes les actions des utilisateurs</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input v-model="settings.securite.activity_logs_enabled" type="checkbox" class="sr-only peer">
            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div class="flex items-center justify-between py-3 border-t border-gray-200 dark:border-gray-700">
          <div>
            <p class="text-sm font-medium text-gray-900 dark:text-white">Chiffrement des messages</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">Chiffrer automatiquement tous les messages</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input v-model="settings.securite.auto_encrypt_messages" type="checkbox" class="sr-only peer">
            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      <div class="mt-6 flex justify-end">
        <button @click="saveSettings" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
          Enregistrer
        </button>
      </div>
    </div>

    <!-- API & Intégrations -->
    <div v-if="activeTab === 'api'" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">API & Intégrations</h2>

      <div class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Clé API publique
          </label>
          <div class="flex gap-2">
            <input v-model="settings.api.public_key" type="text" readonly class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white font-mono text-sm">
            <button @click="copyToClipboard(settings.api.public_key)" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors">
              <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Webhook URL
          </label>
          <input v-model="settings.api.webhook_url" type="url" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
        </div>

        <div class="flex items-center justify-between py-3 border-t border-gray-200 dark:border-gray-700">
          <div>
            <p class="text-sm font-medium text-gray-900 dark:text-white">API externe activée</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">Autoriser l'accès API pour applications tierces</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input v-model="settings.api.external_api_enabled" type="checkbox" class="sr-only peer">
            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div class="flex">
            <svg class="w-5 h-5 text-yellow-600 dark:text-yellow-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 class="text-sm font-medium text-yellow-800 dark:text-yellow-500">Attention</h3>
              <p class="mt-1 text-sm text-yellow-700 dark:text-yellow-400">Ne partagez jamais vos clés API. Régénérez-les si elles ont été compromises.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-6 flex justify-end gap-3">
        <button @click="regenerateApiKey" class="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors">
          Régénérer la clé
        </button>
        <button @click="saveSettings" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
          Enregistrer
        </button>
      </div>
    </div>

    <!-- Maintenance -->
    <div v-if="activeTab === 'maintenance'" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Maintenance & Sauvegarde</h2>

      <div class="space-y-6">
        <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div class="flex items-start">
            <svg class="w-5 h-5 text-blue-600 dark:text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 class="text-sm font-medium text-blue-800 dark:text-blue-500">Base de données</h3>
              <p class="mt-1 text-sm text-blue-700 dark:text-blue-400">Taille: 2.4 GB | Dernière sauvegarde: Il y a 2 heures</p>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <button @click="backupDatabase" class="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors">
            <svg class="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span class="text-sm font-medium text-gray-900 dark:text-white">Sauvegarder</span>
          </button>

          <button @click="restoreDatabase" class="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors">
            <svg class="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span class="text-sm font-medium text-gray-900 dark:text-white">Restaurer</span>
          </button>
        </div>

        <div class="flex items-center justify-between py-3 border-t border-gray-200 dark:border-gray-700">
          <div>
            <p class="text-sm font-medium text-gray-900 dark:text-white">Sauvegarde automatique</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">Sauvegarder quotidiennement à 2h du matin</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input v-model="settings.maintenance.auto_backup" type="checkbox" class="sr-only peer">
            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
          <button @click="clearCache" class="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Vider le cache
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const activeTab = ref<'general' | 'email' | 'securite' | 'api' | 'maintenance'>('general')

const settings = ref({
  general: {
    nom_plateforme: 'Collectivités Territoriales Madagascar',
    description: 'Plateforme de gestion des collectivités territoriales',
    email_contact: 'contact@collectivites-mg.gov',
    telephone: '+261 20 XX XX XXX',
    mode_maintenance: false,
    inscription_publique: false
  },
  email: {
    smtp_host: 'smtp.gmail.com',
    smtp_port: 587,
    smtp_security: 'tls',
    from_name: 'Collectivités Madagascar',
    from_email: 'noreply@collectivites-mg.gov',
    notifications_enabled: true
  },
  securite: {
    session_duration: 480,
    max_login_attempts: 5,
    require_2fa: false,
    activity_logs_enabled: true,
    auto_encrypt_messages: true
  },
  api: {
    public_key: 'pk_live_' + Math.random().toString(36).substring(2, 15),
    webhook_url: '',
    external_api_enabled: false
  },
  maintenance: {
    auto_backup: true
  }
})

function saveSettings() {
  alert('Paramètres enregistrés avec succès!')
}

function testEmail() {
  alert('Email de test envoyé!')
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
  alert('Clé copiée dans le presse-papier!')
}

function regenerateApiKey() {
  if (confirm('Voulez-vous vraiment régénérer la clé API? L\'ancienne clé ne fonctionnera plus.')) {
    settings.value.api.public_key = 'pk_live_' + Math.random().toString(36).substring(2, 15)
    alert('Nouvelle clé générée!')
  }
}

function backupDatabase() {
  alert('Sauvegarde de la base de données en cours...')
}

function restoreDatabase() {
  alert('Restauration de la base de données...')
}

function clearCache() {
  alert('Cache vidé avec succès!')
}
</script>
