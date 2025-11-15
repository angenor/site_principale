<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <!-- Overlay -->
      <div @click="close" class="fixed inset-0 transition-opacity bg-gray-500/75 dark:bg-gray-900/75 z-0"></div>

      <!-- Modal -->
      <div class="relative z-10 inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
        <form @submit.prevent="handleSubmit">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">
              Nouveau message sécurisé
            </h3>
          </div>

          <div class="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Destinataire <span class="text-red-500">*</span>
              </label>
              <select v-model="form.destinataire_id" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="">Sélectionner un destinataire</option>
                <option v-for="user in users" :key="user.id" :value="user.id">
                  {{ user.nom }} {{ user.prenom }} ({{ user.email }})
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sujet <span class="text-red-500">*</span>
              </label>
              <input v-model="form.sujet" type="text" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Message <span class="text-red-500">*</span>
              </label>
              <textarea v-model="form.contenu" rows="8" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"></textarea>
            </div>

            <div class="flex items-center">
              <input v-model="form.est_chiffre" type="checkbox" id="est_chiffre" class="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500">
              <label for="est_chiffre" class="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Chiffrer le message
              </label>
              <span class="ml-2 text-xs text-gray-500 dark:text-gray-400">(End-to-end encryption)</span>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priorité
              </label>
              <select v-model="form.priorite" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="normale">Normale</option>
                <option value="haute">Haute</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Pièces jointes
              </label>
              <input type="file" multiple @change="handleFileChange" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Formats acceptés: PDF, DOC, DOCX, JPG, PNG (max 5MB par fichier)</p>
              <div v-if="selectedFiles.length > 0" class="mt-2 space-y-1">
                <div v-for="(file, index) in selectedFiles" :key="index" class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>{{ file.name }} ({{ formatFileSize(file.size) }})</span>
                  <button type="button" @click="removeFile(index)" class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 flex justify-end gap-3">
            <button type="button" @click="close" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              Annuler
            </button>
            <button type="submit" :disabled="saving" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50">
              {{ saving ? 'Envoi en cours...' : 'Envoyer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MessageSecuriseFormData, Profile } from '~/types/autres-modules'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
  sent: []
}>()

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const saving = ref(false)
const users = ref<Profile[]>([])
const selectedFiles = ref<File[]>([])

const form = ref<MessageSecuriseFormData>({
  expediteur_id: '',
  destinataire_id: '',
  sujet: '',
  contenu: '',
  est_chiffre: false,
  priorite: 'normale'
})

onMounted(async () => {
  await loadUsers()
  if (user.value?.id) {
    form.value.expediteur_id = user.value.id
  }
})

watch(() => props.isOpen, (isOpen) => {
  if (!isOpen) {
    resetForm()
  }
})

async function loadUsers() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .neq('id', user.value?.id || '')
      .eq('est_actif', true)
      .order('nom', { ascending: true })

    if (error) throw error
    users.value = data || []
  } catch (err) {
    console.error('Erreur lors du chargement des utilisateurs:', err)
  }
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files) {
    selectedFiles.value = Array.from(target.files)
  }
}

function removeFile(index: number) {
  selectedFiles.value.splice(index, 1)
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function resetForm() {
  form.value = {
    expediteur_id: user.value?.id || '',
    destinataire_id: '',
    sujet: '',
    contenu: '',
    est_chiffre: false,
    priorite: 'normale'
  }
  selectedFiles.value = []
}

function close() {
  resetForm()
  emit('close')
}

async function handleSubmit() {
  saving.value = true
  try {
    // Upload attachments if any
    const fichiers_joints: string[] = []
    for (const file of selectedFiles.value) {
      const fileName = `${Date.now()}_${file.name}`
      const { data, error: uploadError } = await supabase.storage
        .from('messages')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('messages')
        .getPublicUrl(fileName)

      fichiers_joints.push(publicUrl)
    }

    // Create message
    const { error } = await supabase
      .from('messages_securises')
      .insert([{
        ...form.value,
        fichiers_joints: fichiers_joints.length > 0 ? fichiers_joints : null
      }])

    if (error) throw error

    emit('sent')
    close()
  } catch (err) {
    console.error('Erreur lors de l\'envoi:', err)
    alert('Erreur lors de l\'envoi du message')
  } finally {
    saving.value = false
  }
}
</script>
