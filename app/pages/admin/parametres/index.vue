<template>
  <div class="space-y-6">
    <!-- En-tête -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold" style="color: var(--text-primary)">
          Paramètres
        </h1>
        <p class="mt-1 text-sm" style="color: var(--text-secondary)">
          Configuration générale de la plateforme
        </p>
      </div>
      <button
        v-if="hasChanges"
        class="px-4 py-2 rounded-lg text-white transition-colors cursor-pointer flex items-center gap-2"
        style="background-color: var(--color-primary)"
        :disabled="isSaving"
        @click="saveAllSettings"
      >
        <font-awesome-icon :icon="['fas', 'save']" class="w-4 h-4" />
        <span>{{ isSaving ? 'Enregistrement...' : 'Enregistrer' }}</span>
      </button>
    </div>

    <!-- Navigation par onglets -->
    <div class="border-b" style="border-color: var(--border-primary)">
      <nav class="flex gap-4">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="px-4 py-3 text-sm font-medium transition-colors cursor-pointer border-b-2 -mb-px"
          :class="activeTab === tab.id ? 'border-blue-500' : 'border-transparent'"
          :style="{
            color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--text-muted)'
          }"
          @click="activeTab = tab.id"
        >
          <font-awesome-icon :icon="tab.icon" class="w-4 h-4 mr-2" />
          {{ tab.label }}
        </button>
      </nav>
    </div>

    <!-- Contenu des onglets -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <font-awesome-icon :icon="['fas', 'spinner']" class="w-8 h-8 animate-spin" style="color: var(--color-primary)" />
    </div>

    <!-- Exercice fiscal -->
    <div v-else-if="activeTab === 'exercice'" class="space-y-6">
      <div
        class="p-6 rounded-lg border"
        style="background-color: var(--bg-secondary); border-color: var(--border-primary)"
      >
        <h2 class="text-lg font-semibold mb-4" style="color: var(--text-primary)">
          Exercice fiscal en cours
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium mb-2" style="color: var(--text-secondary)">
              Année de l'exercice
            </label>
            <select
              v-model="settings.exercice_actuel"
              class="w-full px-3 py-2 border rounded-lg"
              style="background-color: var(--bg-primary); border-color: var(--border-primary); color: var(--text-primary)"
            >
              <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
            </select>
            <p class="text-xs mt-1" style="color: var(--text-muted)">
              L'exercice sélectionné sera utilisé par défaut lors de la saisie
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2" style="color: var(--text-secondary)">
              Statut de l'exercice
            </label>
            <select
              v-model="settings.exercice_statut"
              class="w-full px-3 py-2 border rounded-lg"
              style="background-color: var(--bg-primary); border-color: var(--border-primary); color: var(--text-primary)"
            >
              <option value="ouvert">Ouvert (saisie autorisée)</option>
              <option value="cloture">Clôturé (lecture seule)</option>
            </select>
          </div>
        </div>
      </div>

      <div
        class="p-6 rounded-lg border"
        style="background-color: var(--bg-secondary); border-color: var(--border-primary)"
      >
        <h2 class="text-lg font-semibold mb-4" style="color: var(--text-primary)">
          Historique des exercices
        </h2>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr style="background-color: var(--bg-tertiary)">
                <th class="px-4 py-3 text-left text-xs font-medium uppercase" style="color: var(--text-muted)">Année</th>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase" style="color: var(--text-muted)">Statut</th>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase" style="color: var(--text-muted)">Comptes</th>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase" style="color: var(--text-muted)">Date clôture</th>
              </tr>
            </thead>
            <tbody class="divide-y" style="border-color: var(--border-primary)">
              <tr v-for="ex in exercicesHistorique" :key="ex.annee">
                <td class="px-4 py-3">
                  <span class="font-medium" style="color: var(--text-primary)">{{ ex.annee }}</span>
                </td>
                <td class="px-4 py-3">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="ex.statut === 'ouvert' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'"
                  >
                    {{ ex.statut === 'ouvert' ? 'Ouvert' : 'Clôturé' }}
                  </span>
                </td>
                <td class="px-4 py-3" style="color: var(--text-secondary)">{{ ex.comptes_count }} comptes</td>
                <td class="px-4 py-3" style="color: var(--text-muted)">{{ ex.date_cloture || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Validation -->
    <div v-else-if="activeTab === 'validation'" class="space-y-6">
      <div
        class="p-6 rounded-lg border"
        style="background-color: var(--bg-secondary); border-color: var(--border-primary)"
      >
        <h2 class="text-lg font-semibold mb-4" style="color: var(--text-primary)">
          Seuils d'alerte
        </h2>
        <p class="text-sm mb-6" style="color: var(--text-muted)">
          Définissez les seuils qui déclencheront des alertes lors de la validation des données
        </p>
        <div class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium mb-2" style="color: var(--text-secondary)">
                Écart max recettes/dépenses (%)
              </label>
              <div class="relative">
                <input
                  v-model.number="settings.seuil_ecart_budget"
                  type="number"
                  min="0"
                  max="100"
                  class="w-full px-3 py-2 border rounded-lg pr-12"
                  style="background-color: var(--bg-primary); border-color: var(--border-primary); color: var(--text-primary)"
                />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-sm" style="color: var(--text-muted)">%</span>
              </div>
              <p class="text-xs mt-1" style="color: var(--text-muted)">
                Alerte si l'écart entre recettes et dépenses dépasse ce seuil
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium mb-2" style="color: var(--text-secondary)">
                Variation annuelle max (%)
              </label>
              <div class="relative">
                <input
                  v-model.number="settings.seuil_variation_annuelle"
                  type="number"
                  min="0"
                  max="500"
                  class="w-full px-3 py-2 border rounded-lg pr-12"
                  style="background-color: var(--bg-primary); border-color: var(--border-primary); color: var(--text-primary)"
                />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-sm" style="color: var(--text-muted)">%</span>
              </div>
              <p class="text-xs mt-1" style="color: var(--text-muted)">
                Alerte si la variation par rapport à l'année précédente dépasse ce seuil
              </p>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium mb-2" style="color: var(--text-secondary)">
                Montant minimum significatif (Ar)
              </label>
              <input
                v-model.number="settings.montant_minimum"
                type="number"
                min="0"
                class="w-full px-3 py-2 border rounded-lg"
                style="background-color: var(--bg-primary); border-color: var(--border-primary); color: var(--text-primary)"
              />
              <p class="text-xs mt-1" style="color: var(--text-muted)">
                Les montants inférieurs seront ignorés dans les validations
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium mb-2" style="color: var(--text-secondary)">
                Taux de réalisation attendu (%)
              </label>
              <div class="relative">
                <input
                  v-model.number="settings.taux_realisation_attendu"
                  type="number"
                  min="0"
                  max="100"
                  class="w-full px-3 py-2 border rounded-lg pr-12"
                  style="background-color: var(--bg-primary); border-color: var(--border-primary); color: var(--text-primary)"
                />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-sm" style="color: var(--text-muted)">%</span>
              </div>
              <p class="text-xs mt-1" style="color: var(--text-muted)">
                Alerte si le taux de réalisation est inférieur à ce seuil
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        class="p-6 rounded-lg border"
        style="background-color: var(--bg-secondary); border-color: var(--border-primary)"
      >
        <h2 class="text-lg font-semibold mb-4" style="color: var(--text-primary)">
          Règles de validation
        </h2>
        <div class="space-y-4">
          <label class="flex items-center gap-3 cursor-pointer">
            <input
              v-model="settings.validation_obligatoire"
              type="checkbox"
              class="w-4 h-4 rounded border-gray-300"
            />
            <div>
              <span class="font-medium" style="color: var(--text-primary)">Validation obligatoire avant publication</span>
              <p class="text-xs" style="color: var(--text-muted)">
                Les comptes doivent être validés par un administrateur avant publication
              </p>
            </div>
          </label>
          <label class="flex items-center gap-3 cursor-pointer">
            <input
              v-model="settings.equilibre_strict"
              type="checkbox"
              class="w-4 h-4 rounded border-gray-300"
            />
            <div>
              <span class="font-medium" style="color: var(--text-primary)">Équilibre strict requis</span>
              <p class="text-xs" style="color: var(--text-muted)">
                Les recettes doivent être égales aux dépenses pour valider
              </p>
            </div>
          </label>
          <label class="flex items-center gap-3 cursor-pointer">
            <input
              v-model="settings.alerte_email"
              type="checkbox"
              class="w-4 h-4 rounded border-gray-300"
            />
            <div>
              <span class="font-medium" style="color: var(--text-primary)">Alertes par email</span>
              <p class="text-xs" style="color: var(--text-muted)">
                Envoyer un email aux administrateurs en cas d'anomalie détectée
              </p>
            </div>
          </label>
        </div>
      </div>
    </div>

    <!-- Export -->
    <div v-else-if="activeTab === 'export'" class="space-y-6">
      <div
        class="p-6 rounded-lg border"
        style="background-color: var(--bg-secondary); border-color: var(--border-primary)"
      >
        <h2 class="text-lg font-semibold mb-4" style="color: var(--text-primary)">
          Configuration des exports
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium mb-2" style="color: var(--text-secondary)">
              Nom de l'organisation
            </label>
            <input
              v-model="settings.export_organisation"
              type="text"
              class="w-full px-3 py-2 border rounded-lg"
              style="background-color: var(--bg-primary); border-color: var(--border-primary); color: var(--text-primary)"
              placeholder="Transparency International Madagascar"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2" style="color: var(--text-secondary)">
              Slogan/Sous-titre
            </label>
            <input
              v-model="settings.export_slogan"
              type="text"
              class="w-full px-3 py-2 border rounded-lg"
              style="background-color: var(--bg-primary); border-color: var(--border-primary); color: var(--text-primary)"
              placeholder="Publiez Ce Que Vous Payez Madagascar"
            />
          </div>
        </div>
      </div>

      <div
        class="p-6 rounded-lg border"
        style="background-color: var(--bg-secondary); border-color: var(--border-primary)"
      >
        <h2 class="text-lg font-semibold mb-4" style="color: var(--text-primary)">
          Logos pour les exports
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium mb-2" style="color: var(--text-secondary)">
              Logo principal
            </label>
            <div
              class="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors hover:border-blue-400"
              style="border-color: var(--border-primary)"
              @click="selectLogo('principal')"
            >
              <img
                v-if="settings.logo_principal"
                :src="settings.logo_principal"
                alt="Logo principal"
                class="max-h-20 mx-auto mb-2"
              />
              <font-awesome-icon v-else :icon="['fas', 'image']" class="w-10 h-10 mb-2" style="color: var(--text-muted)" />
              <p class="text-sm" style="color: var(--text-muted)">
                {{ settings.logo_principal ? 'Cliquez pour changer' : 'Cliquez pour ajouter' }}
              </p>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2" style="color: var(--text-secondary)">
              Logo secondaire (partenaire)
            </label>
            <div
              class="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors hover:border-blue-400"
              style="border-color: var(--border-primary)"
              @click="selectLogo('secondaire')"
            >
              <img
                v-if="settings.logo_secondaire"
                :src="settings.logo_secondaire"
                alt="Logo secondaire"
                class="max-h-20 mx-auto mb-2"
              />
              <font-awesome-icon v-else :icon="['fas', 'image']" class="w-10 h-10 mb-2" style="color: var(--text-muted)" />
              <p class="text-sm" style="color: var(--text-muted)">
                {{ settings.logo_secondaire ? 'Cliquez pour changer' : 'Cliquez pour ajouter' }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        class="p-6 rounded-lg border"
        style="background-color: var(--bg-secondary); border-color: var(--border-primary)"
      >
        <h2 class="text-lg font-semibold mb-4" style="color: var(--text-primary)">
          Pied de page des exports
        </h2>
        <div>
          <label class="block text-sm font-medium mb-2" style="color: var(--text-secondary)">
            Texte du pied de page
          </label>
          <textarea
            v-model="settings.export_footer"
            rows="3"
            class="w-full px-3 py-2 border rounded-lg resize-none"
            style="background-color: var(--bg-primary); border-color: var(--border-primary); color: var(--text-primary)"
            placeholder="Document généré par la plateforme PCQVP Madagascar - www.pcqvp.mg"
          />
        </div>
        <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium mb-2" style="color: var(--text-secondary)">Site web</label>
            <input
              v-model="settings.export_website"
              type="url"
              class="w-full px-3 py-2 border rounded-lg"
              style="background-color: var(--bg-primary); border-color: var(--border-primary); color: var(--text-primary)"
              placeholder="https://pcqvp.mg"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2" style="color: var(--text-secondary)">Email contact</label>
            <input
              v-model="settings.export_email"
              type="email"
              class="w-full px-3 py-2 border rounded-lg"
              style="background-color: var(--bg-primary); border-color: var(--border-primary); color: var(--text-primary)"
              placeholder="contact@pcqvp.mg"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2" style="color: var(--text-secondary)">Téléphone</label>
            <input
              v-model="settings.export_telephone"
              type="tel"
              class="w-full px-3 py-2 border rounded-lg"
              style="background-color: var(--bg-primary); border-color: var(--border-primary); color: var(--text-primary)"
              placeholder="+261 20 22 xxx xx"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Plateforme -->
    <div v-else-if="activeTab === 'plateforme'" class="space-y-6">
      <div
        class="p-6 rounded-lg border"
        style="background-color: var(--bg-secondary); border-color: var(--border-primary)"
      >
        <h2 class="text-lg font-semibold mb-4" style="color: var(--text-primary)">
          Informations de la plateforme
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium mb-2" style="color: var(--text-secondary)">
              Nom de la plateforme
            </label>
            <input
              v-model="settings.nom_plateforme"
              type="text"
              class="w-full px-3 py-2 border rounded-lg"
              style="background-color: var(--bg-primary); border-color: var(--border-primary); color: var(--text-primary)"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2" style="color: var(--text-secondary)">
              Version
            </label>
            <input
              v-model="settings.version"
              type="text"
              class="w-full px-3 py-2 border rounded-lg"
              style="background-color: var(--bg-primary); border-color: var(--border-primary); color: var(--text-primary)"
              disabled
            />
          </div>
        </div>
      </div>

      <div
        class="p-6 rounded-lg border"
        style="background-color: var(--bg-secondary); border-color: var(--border-primary)"
      >
        <h2 class="text-lg font-semibold mb-4" style="color: var(--text-primary)">
          Maintenance
        </h2>
        <div class="space-y-4">
          <label class="flex items-center gap-3 cursor-pointer">
            <input
              v-model="settings.mode_maintenance"
              type="checkbox"
              class="w-4 h-4 rounded border-gray-300"
            />
            <div>
              <span class="font-medium" style="color: var(--text-primary)">Mode maintenance</span>
              <p class="text-xs" style="color: var(--text-muted)">
                Seuls les administrateurs pourront accéder à la plateforme
              </p>
            </div>
          </label>
          <div v-if="settings.mode_maintenance">
            <label class="block text-sm font-medium mb-2" style="color: var(--text-secondary)">
              Message de maintenance
            </label>
            <textarea
              v-model="settings.message_maintenance"
              rows="2"
              class="w-full px-3 py-2 border rounded-lg resize-none"
              style="background-color: var(--bg-primary); border-color: var(--border-primary); color: var(--text-primary)"
              placeholder="La plateforme est actuellement en maintenance. Veuillez réessayer plus tard."
            />
          </div>
        </div>
      </div>

      <div
        class="p-6 rounded-lg border"
        style="background-color: var(--bg-secondary); border-color: var(--border-primary)"
      >
        <h2 class="text-lg font-semibold mb-4" style="color: var(--text-primary)">
          Liens utiles
        </h2>
        <NuxtLink
          to="/admin/parametres/plan-comptable"
          class="flex items-center justify-between p-4 rounded-lg border transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
          style="border-color: var(--border-primary)"
        >
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-lg" style="background-color: var(--color-primary-light)">
              <font-awesome-icon :icon="['fas', 'sitemap']" class="w-5 h-5" style="color: var(--color-primary)" />
            </div>
            <div>
              <p class="font-medium" style="color: var(--text-primary)">Plan comptable</p>
              <p class="text-sm" style="color: var(--text-muted)">Gérer la structure du plan comptable</p>
            </div>
          </div>
          <font-awesome-icon :icon="['fas', 'chevron-right']" class="w-4 h-4" style="color: var(--text-muted)" />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

const toast = useAppToast()

// Onglets
const tabs = [
  { id: 'exercice', label: 'Exercice fiscal', icon: ['fas', 'calendar-alt'] },
  { id: 'validation', label: 'Validation', icon: ['fas', 'check-circle'] },
  { id: 'export', label: 'Export', icon: ['fas', 'file-export'] },
  { id: 'plateforme', label: 'Plateforme', icon: ['fas', 'cog'] }
]

const activeTab = ref('exercice')

// État
const isLoading = ref(true)
const isSaving = ref(false)
const originalSettings = ref<Record<string, any>>({})

// Paramètres
const settings = ref({
  // Exercice
  exercice_actuel: 2024,
  exercice_statut: 'ouvert',

  // Validation
  seuil_ecart_budget: 10,
  seuil_variation_annuelle: 50,
  montant_minimum: 100000,
  taux_realisation_attendu: 80,
  validation_obligatoire: true,
  equilibre_strict: false,
  alerte_email: true,

  // Export
  export_organisation: 'Transparency International - Initiative Madagascar',
  export_slogan: 'Publiez Ce Que Vous Payez Madagascar',
  logo_principal: '/images/logos/logo_fond_bleu_texte_blanc.jpeg',
  logo_secondaire: '',
  export_footer: "Document généré par la plateforme PCQVP Madagascar",
  export_website: 'https://pcqvp.mg',
  export_email: 'contact@ti-mg.org',
  export_telephone: '+261 20 22 xxx xx',

  // Plateforme
  nom_plateforme: 'Plateforme de Suivi des Revenus Miniers',
  version: '1.0.0',
  mode_maintenance: false,
  message_maintenance: ''
})

// Données
const currentYear = new Date().getFullYear()
const availableYears = Array.from({ length: 10 }, (_, i) => currentYear - i)

const exercicesHistorique = ref([
  { annee: 2024, statut: 'ouvert', comptes_count: 156, date_cloture: null },
  { annee: 2023, statut: 'cloture', comptes_count: 342, date_cloture: '15/01/2024' },
  { annee: 2022, statut: 'cloture', comptes_count: 298, date_cloture: '10/02/2023' },
  { annee: 2021, statut: 'cloture', comptes_count: 245, date_cloture: '05/01/2022' }
])

// Computed
const hasChanges = computed(() => {
  return JSON.stringify(settings.value) !== JSON.stringify(originalSettings.value)
})

// Méthodes
const loadSettings = async () => {
  isLoading.value = true
  try {
    // Simuler le chargement depuis l'API
    await new Promise(resolve => setTimeout(resolve, 500))
    originalSettings.value = JSON.parse(JSON.stringify(settings.value))
  } catch (error) {
    console.error('Erreur chargement paramètres:', error)
    toast.error('Erreur lors du chargement des paramètres')
  } finally {
    isLoading.value = false
  }
}

const saveAllSettings = async () => {
  isSaving.value = true
  try {
    // Simuler la sauvegarde
    await new Promise(resolve => setTimeout(resolve, 1000))
    originalSettings.value = JSON.parse(JSON.stringify(settings.value))
    toast.success('Paramètres enregistrés avec succès')
  } catch (error) {
    console.error('Erreur sauvegarde:', error)
    toast.error('Erreur lors de la sauvegarde')
  } finally {
    isSaving.value = false
  }
}

const selectLogo = (type: 'principal' | 'secondaire') => {
  // Ouvrir le sélecteur de fichier
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (type === 'principal') {
          settings.value.logo_principal = e.target?.result as string
        } else {
          settings.value.logo_secondaire = e.target?.result as string
        }
      }
      reader.readAsDataURL(file)
    }
  }
  input.click()
}

// Lifecycle
onMounted(() => {
  loadSettings()
})
</script>
