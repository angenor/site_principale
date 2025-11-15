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
              {{ isEditing ? 'Modifier le document' : 'Nouveau document' }}
            </h3>
          </div>

          <div class="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Titre <span class="text-red-500">*</span>
              </label>
              <input v-model="form.titre" type="text" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type de document <span class="text-red-500">*</span>
              </label>
              <select v-model="form.type_document" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="compte_administratif">Compte administratif</option>
                <option value="rapport">Rapport</option>
                <option value="deliberation">Délibération</option>
                <option value="arrete">Arrêté</option>
                <option value="plan">Plan</option>
                <option value="autre">Autre</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea v-model="form.description" rows="3" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"></textarea>
            </div>

            <div v-if="!isEditing">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fichier <span class="text-red-500">*</span>
              </label>
              <input type="file" @change="handleFileChange" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Formats acceptés: PDF, DOC, DOCX, XLS, XLSX (max 10MB)</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Visibilité <span class="text-red-500">*</span>
              </label>
              <select v-model="form.visibilite" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="public">Public</option>
                <option value="prive">Privé</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Collectivité liée
              </label>
              <select v-model="collectiviteType" @change="onCollectiviteTypeChange" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-2">
                <option value="">Aucune</option>
                <option value="region">Région</option>
                <option value="district">District</option>
                <option value="commune">Commune</option>
              </select>

              <select v-if="collectiviteType === 'region'" v-model="form.region_id" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option :value="null">Sélectionner une région</option>
                <option v-for="region in regions" :key="region.id" :value="region.id">
                  {{ region.nom }}
                </option>
              </select>

              <select v-if="collectiviteType === 'district'" v-model="form.district_id" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option :value="null">Sélectionner un district</option>
                <option v-for="district in districts" :key="district.id" :value="district.id">
                  {{ district.nom }}
                </option>
              </select>

              <select v-if="collectiviteType === 'commune'" v-model="form.commune_id" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option :value="null">Sélectionner une commune</option>
                <option v-for="commune in communes" :key="commune.id" :value="commune.id">
                  {{ commune.nom }}
                </option>
              </select>
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
import type { Document, DocumentFormData } from '~/types/autres-modules'
import { useRegions } from '~/composables/useRegions'
import { useDistricts } from '~/composables/useDistricts'
import { useCommunes } from '~/composables/useCommunes'

const props = defineProps<{
  isOpen: boolean
  document?: Document | null
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const supabase = useSupabaseClient()
const { regions, fetchRegions } = useRegions()
const { districts, fetchDistricts } = useDistricts()
const { communes, fetchCommunes } = useCommunes()
const saving = ref(false)
const collectiviteType = ref('')
const selectedFile = ref<File | null>(null)

const isEditing = computed(() => !!props.document)

const form = ref<DocumentFormData>({
  titre: '',
  type_document: 'compte_administratif',
  description: null,
  fichier_url: '',
  fichier_nom: '',
  fichier_taille: 0,
  visibilite: 'public',
  region_id: null,
  district_id: null,
  commune_id: null
})

onMounted(async () => {
  await Promise.all([fetchRegions(), fetchDistricts(), fetchCommunes()])
})

watch(() => props.document, (newDocument) => {
  if (newDocument) {
    form.value = {
      titre: newDocument.titre,
      type_document: newDocument.type_document,
      description: newDocument.description,
      fichier_url: newDocument.fichier_url,
      fichier_nom: newDocument.fichier_nom,
      fichier_taille: newDocument.fichier_taille,
      visibilite: newDocument.visibilite,
      region_id: newDocument.region_id,
      district_id: newDocument.district_id,
      commune_id: newDocument.commune_id
    }

    // Determine collectivite type
    if (newDocument.commune_id) collectiviteType.value = 'commune'
    else if (newDocument.district_id) collectiviteType.value = 'district'
    else if (newDocument.region_id) collectiviteType.value = 'region'
  } else {
    resetForm()
  }
}, { immediate: true })

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0]
  }
}

function onCollectiviteTypeChange() {
  form.value.region_id = null
  form.value.district_id = null
  form.value.commune_id = null
}

function resetForm() {
  form.value = {
    titre: '',
    type_document: 'compte_administratif',
    description: null,
    fichier_url: '',
    fichier_nom: '',
    fichier_taille: 0,
    visibilite: 'public',
    region_id: null,
    district_id: null,
    commune_id: null
  }
  collectiviteType.value = ''
  selectedFile.value = null
}

function close() {
  resetForm()
  emit('close')
}

async function handleSubmit() {
  saving.value = true
  try {
    let fichierUrl = form.value.fichier_url
    let fichierNom = form.value.fichier_nom
    let fichierTaille = form.value.fichier_taille

    // Upload file if new document
    if (!isEditing.value && selectedFile.value) {
      const fileName = `${Date.now()}_${selectedFile.value.name}`
      const { data, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, selectedFile.value)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName)

      fichierUrl = publicUrl
      fichierNom = selectedFile.value.name
      fichierTaille = selectedFile.value.size
    }

    const dataToSave = {
      ...form.value,
      fichier_url: fichierUrl,
      fichier_nom: fichierNom,
      fichier_taille: fichierTaille
    }

    if (isEditing.value && props.document) {
      // Update
      const { error } = await supabase
        .from('documents')
        .update(dataToSave)
        .eq('id', props.document.id)

      if (error) throw error
    } else {
      // Create
      const { error } = await supabase
        .from('documents')
        .insert([dataToSave])

      if (error) throw error
    }

    emit('saved')
    close()
  } catch (err) {
    console.error('Erreur lors de l\'enregistrement:', err)
    alert('Erreur lors de l\'enregistrement du document')
  } finally {
    saving.value = false
  }
}
</script>
