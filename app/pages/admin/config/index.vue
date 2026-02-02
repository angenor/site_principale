<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

interface ConfigItem {
  id: string
  key: string
  value: string
  description: string | null
}

interface ConfigGroup {
  label: string
  icon: string
  items: Array<{
    key: string
    label: string
    type: 'text' | 'textarea' | 'email' | 'url' | 'number'
    placeholder?: string
    description?: string
  }>
}

const { data: configs, refresh } = await useFetch<ConfigItem[]>('/api/admin/config')

const isSaving = ref(false)
const error = ref('')
const success = ref('')

// Groupes de configuration
const configGroups: ConfigGroup[] = [
  {
    label: 'Informations générales',
    icon: 'cog',
    items: [
      { key: 'site_name', label: 'Nom du site', type: 'text', placeholder: 'Observatoire des Mines de Madagascar' },
      { key: 'site_description', label: 'Description', type: 'textarea', placeholder: 'Description courte du site...' },
      { key: 'site_keywords', label: 'Mots-clés SEO', type: 'text', placeholder: 'mines, madagascar, transparence...' }
    ]
  },
  {
    label: 'Contenus des sections',
    icon: 'file-lines',
    items: [
      { key: 'strategic_axes_intro', label: 'Introduction Axes Stratégiques', type: 'textarea', placeholder: 'Quatre piliers fondamentaux pour une gouvernance minière responsable à Madagascar' },
      { key: 'partners_intro', label: 'Introduction Partenaires', type: 'text', placeholder: 'Ensemble pour une gouvernance minière transparente' },
      { key: 'news_intro', label: 'Introduction Actualités', type: 'textarea', placeholder: 'Les dernières nouvelles du secteur minier malgache', description: 'Affiché sur la page d\'accueil et en sous-titre de la page Actualités' },
      { key: 'case_studies_intro', label: 'Introduction Études de cas', type: 'textarea', placeholder: 'Analyses approfondies des activités minières à Madagascar', description: 'Affiché sur la page d\'accueil et en sous-titre de la page Études de cas' },
      { key: 'report_case_intro', label: 'Introduction Signaler un cas', type: 'textarea', placeholder: 'Vous avez connaissance d\'un cas de mauvaise gouvernance ? Partagez l\'information de manière sécurisée.', description: 'Affiché sur la page d\'accueil et en sous-titre de la page Signaler' }
    ]
  },
  {
    label: 'Contact',
    icon: 'envelope',
    items: [
      { key: 'contact_email', label: 'Email de contact', type: 'email', placeholder: 'contact@example.com' },
      { key: 'contact_phone', label: 'Téléphone', type: 'text', placeholder: '+261 XX XXX XX XX' },
      { key: 'contact_address', label: 'Adresse', type: 'textarea', placeholder: 'Adresse complète...' }
    ]
  },
  {
    label: 'Réseaux sociaux',
    icon: 'share-nodes',
    items: [
      { key: 'social_facebook', label: 'Facebook', type: 'url', placeholder: 'https://facebook.com/...' },
      { key: 'social_twitter', label: 'Twitter / X', type: 'url', placeholder: 'https://twitter.com/...' },
      { key: 'social_linkedin', label: 'LinkedIn', type: 'url', placeholder: 'https://linkedin.com/...' },
      { key: 'social_youtube', label: 'YouTube', type: 'url', placeholder: 'https://youtube.com/...' }
    ]
  },
  {
    label: 'Organisation',
    icon: 'building',
    items: [
      { key: 'org_timg_name', label: 'Nom TIMG', type: 'text', placeholder: 'Transparency International - Initiative Madagascar' },
      { key: 'org_timg_website', label: 'Site TIMG', type: 'url', placeholder: 'https://...' }
    ]
  },
  {
    label: 'Paramètres avancés',
    icon: 'sliders',
    items: [
      { key: 'analytics_enabled', label: 'Analytics activé', type: 'text', placeholder: 'true ou false', description: 'Activer le suivi des visites' },
      { key: 'items_per_page', label: 'Éléments par page', type: 'number', placeholder: '12' },
      { key: 'cache_duration', label: 'Durée du cache (secondes)', type: 'number', placeholder: '3600' }
    ]
  }
]

// Stocker les valeurs du formulaire
const formValues = ref<Record<string, string>>({})

// Initialiser les valeurs du formulaire à partir des données chargées
watch(configs, (newConfigs) => {
  if (newConfigs) {
    const values: Record<string, string> = {}
    newConfigs.forEach(config => {
      values[config.key] = config.value
    })
    formValues.value = values
  }
}, { immediate: true })

function getValue(key: string): string {
  return formValues.value[key] || ''
}

function setValue(key: string, value: string) {
  formValues.value[key] = value
}

async function saveAll() {
  error.value = ''
  success.value = ''
  isSaving.value = true

  try {
    const configsToSave = Object.entries(formValues.value).map(([key, value]) => ({
      key,
      value
    }))

    await $fetch('/api/admin/config/batch', {
      method: 'PUT',
      body: { configs: configsToSave }
    })

    success.value = 'Configuration enregistrée avec succès'
    await refresh()
  } catch (err: any) {
    error.value = err.data?.message || 'Erreur lors de l\'enregistrement'
  } finally {
    isSaving.value = false
  }
}

async function saveSingle(key: string) {
  try {
    await $fetch(`/api/admin/config/${key}`, {
      method: 'PUT',
      body: { value: formValues.value[key] || '' }
    })
    success.value = 'Valeur enregistrée'
    setTimeout(() => success.value = '', 3000)
  } catch (err: any) {
    error.value = err.data?.message || 'Erreur'
  }
}
</script>

<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-heading font-bold text-gray-900 dark:text-white">
          Configuration du site
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">
          Paramètres généraux du site
        </p>
      </div>
      <button
        @click="saveAll"
        :disabled="isSaving"
        class="btn-ti text-sm"
      >
        <font-awesome-icon v-if="isSaving" icon="spinner" class="animate-spin mr-2" />
        <font-awesome-icon v-else icon="save" class="mr-2" />
        Enregistrer tout
      </button>
    </div>

    <!-- Messages -->
    <div v-if="error" class="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
      <p class="text-red-600 dark:text-red-400">{{ error }}</p>
    </div>
    <div v-if="success" class="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
      <p class="text-green-600 dark:text-green-400">{{ success }}</p>
    </div>

    <!-- Groupes de configuration -->
    <div class="space-y-6">
      <div
        v-for="group in configGroups"
        :key="group.label"
        class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <font-awesome-icon :icon="group.icon" class="mr-3 text-ti-blue" />
            {{ group.label }}
          </h2>
        </div>

        <div class="p-6 space-y-4">
          <div
            v-for="item in group.items"
            :key="item.key"
            class="grid grid-cols-1 md:grid-cols-3 gap-4 items-start"
          >
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300 pt-2">
              {{ item.label }}
              <p v-if="item.description" class="font-normal text-xs text-gray-500 mt-1">
                {{ item.description }}
              </p>
            </label>

            <div class="md:col-span-2">
              <textarea
                v-if="item.type === 'textarea'"
                :value="getValue(item.key)"
                @input="setValue(item.key, ($event.target as HTMLTextAreaElement).value)"
                rows="3"
                class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                :placeholder="item.placeholder"
              />
              <input
                v-else
                :type="item.type"
                :value="getValue(item.key)"
                @input="setValue(item.key, ($event.target as HTMLInputElement).value)"
                class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                :placeholder="item.placeholder"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bouton fixe en bas sur mobile -->
    <div class="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 lg:hidden">
      <button
        @click="saveAll"
        :disabled="isSaving"
        class="w-full btn-ti"
      >
        <font-awesome-icon v-if="isSaving" icon="spinner" class="animate-spin mr-2" />
        <font-awesome-icon v-else icon="save" class="mr-2" />
        Enregistrer tout
      </button>
    </div>

    <!-- Spacer pour le bouton fixe sur mobile -->
    <div class="h-20 lg:hidden" />
  </div>
</template>
