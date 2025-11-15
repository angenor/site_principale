<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <!-- Overlay -->
      <div @click="close" class="fixed inset-0 transition-opacity bg-gray-500/75 dark:bg-gray-900/75 z-0"></div>

      <!-- Modal -->
      <div class="relative z-10 inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <form @submit.prevent="handleSubmit">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">
              {{ isEditing ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur' }}
            </h3>
          </div>

          <div class="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email <span class="text-red-500">*</span>
              </label>
              <input v-model="form.email" type="email" required :disabled="isEditing" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50">
              <p v-if="isEditing" class="mt-1 text-xs text-gray-500 dark:text-gray-400">L'email ne peut pas être modifié</p>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nom <span class="text-red-500">*</span>
                </label>
                <input v-model="form.nom" type="text" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Prénom
                </label>
                <input v-model="form.prenom" type="text" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rôle <span class="text-red-500">*</span>
              </label>
              <select v-model="form.role" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="administrateur">Administrateur</option>
                <option value="editeur">Éditeur</option>
                <option value="lecteur">Lecteur</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Téléphone
              </label>
              <input v-model="form.telephone" type="tel" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Organisation
              </label>
              <input v-model="form.organisation" type="text" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fonction
              </label>
              <input v-model="form.fonction" type="text" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            </div>

            <div class="flex items-center">
              <input v-model="form.est_actif" type="checkbox" id="est_actif" class="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500">
              <label for="est_actif" class="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Compte actif
              </label>
            </div>

            <div v-if="isEditing">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date d'inscription
              </label>
              <input :value="formatDate(profile?.created_at)" type="text" disabled class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400">
            </div>
          </div>

          <div class="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 flex justify-end gap-3">
            <button type="button" @click="close" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              Annuler
            </button>
            <button type="submit" :disabled="saving" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50">
              {{ saving ? 'Enregistrement...' : (isEditing ? 'Modifier' : 'Créer') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Profile, ProfileFormData } from '~/types/autres-modules'

const props = defineProps<{
  isOpen: boolean
  profile?: Profile | null
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const supabase = useSupabaseClient()
const saving = ref(false)

const isEditing = computed(() => !!props.profile)

const form = ref<ProfileFormData>({
  email: '',
  nom: '',
  prenom: null,
  role: 'lecteur',
  telephone: null,
  organisation: null,
  fonction: null,
  est_actif: true
})

watch(() => props.profile, (newProfile) => {
  if (newProfile) {
    form.value = {
      email: newProfile.email,
      nom: newProfile.nom,
      prenom: newProfile.prenom,
      role: newProfile.role,
      telephone: newProfile.telephone,
      organisation: newProfile.organisation,
      fonction: newProfile.fonction,
      est_actif: newProfile.est_actif
    }
  } else {
    resetForm()
  }
}, { immediate: true })

function formatDate(dateStr?: string) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

function resetForm() {
  form.value = {
    email: '',
    nom: '',
    prenom: null,
    role: 'lecteur',
    telephone: null,
    organisation: null,
    fonction: null,
    est_actif: true
  }
}

function close() {
  resetForm()
  emit('close')
}

async function handleSubmit() {
  saving.value = true
  try {
    if (isEditing.value && props.profile) {
      // Update
      const { error } = await supabase
        .from('profiles')
        .update(form.value)
        .eq('id', props.profile.id)

      if (error) throw error
    } else {
      // Create (would need to create auth user first in real scenario)
      alert('La création d\'utilisateurs nécessite une intégration avec Supabase Auth. Fonctionnalité à venir.')
      close()
      return
    }

    emit('saved')
    close()
  } catch (err) {
    console.error('Erreur lors de l\'enregistrement:', err)
    alert('Erreur lors de l\'enregistrement de l\'utilisateur')
  } finally {
    saving.value = false
  }
}
</script>
