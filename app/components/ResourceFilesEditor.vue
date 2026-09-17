<script setup lang="ts">
// Versions linguistiques d'un rapport : une langue par version, avec un fichier téléversé ou un lien externe

const files = defineModel<EditableResourceFile[]>({ required: true })

const emit = defineEmits<{
  (e: 'error', message: string): void
}>()

const OTHER = '__other'
const ACCEPT = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar,.7z'

const uploadingKey = ref<string | null>(null)

const inputClass = 'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500'

const usedCodes = computed(() => new Set(files.value.map(f => f.languageCode)))
const availablePresets = computed(() => RESOURCE_LANGUAGES.filter(lang => !usedCodes.value.has(lang.code)))

function isPreset(code: string): boolean {
  return RESOURCE_LANGUAGES.some(lang => lang.code === code)
}

function addVersion(code = '', label = '') {
  files.value = [...files.value, createEditableResourceFile(code, label)]
}

function removeVersion(index: number) {
  const file = files.value[index]
  const hasContent = file && (file.fileUrl || file.externalUrl)
  if (hasContent && !confirm(`Retirer la version ${file.languageCode || 'sans langue'} ?`)) return
  files.value = files.value.filter((_, i) => i !== index)
}

function moveVersion(index: number, offset: number) {
  const target = index + offset
  if (target < 0 || target >= files.value.length) return
  const next = [...files.value]
  const [item] = next.splice(index, 1)
  next.splice(target, 0, item!)
  files.value = next
}

function selectLanguage(file: EditableResourceFile, value: string) {
  if (value === OTHER) {
    file.languageCode = ''
    file.languageLabel = ''
    return
  }
  const preset = RESOURCE_LANGUAGES.find(lang => lang.code === value)
  if (preset) {
    file.languageCode = preset.code
    file.languageLabel = preset.label
  }
}

function onCodeInput(file: EditableResourceFile, event: Event) {
  file.languageCode = (event.target as HTMLInputElement).value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 8)
  // Un code proposé par défaut (MG, FR, EN) bascule sur la langue correspondante
  const preset = RESOURCE_LANGUAGES.find(lang => lang.code === file.languageCode)
  if (preset) file.languageLabel = preset.label
}

function isDuplicate(file: EditableResourceFile): boolean {
  return !!file.languageCode && files.value.filter(f => f.languageCode === file.languageCode).length > 1
}

async function upload(file: EditableResourceFile, event: Event) {
  const input = event.target as HTMLInputElement
  const selected = input.files?.[0]
  input.value = ''
  if (!selected) return

  uploadingKey.value = file.key
  try {
    const formData = new FormData()
    formData.append('file', selected)
    const result = await $fetch<{
      url: string
      filename: string
      originalName: string
      mimeType: string
      fileSize: number
    }>('/api/admin/upload-document', {
      method: 'POST',
      body: formData
    })
    file.fileUrl = result.url
    file.filename = result.originalName || result.filename
    file.mimeType = result.mimeType
    file.fileSize = result.fileSize
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } }
    emit('error', err.data?.statusMessage || 'Erreur lors du téléversement')
  } finally {
    uploadingKey.value = null
  }
}

function clearFile(file: EditableResourceFile) {
  file.fileUrl = null
  file.filename = null
  file.mimeType = null
  file.fileSize = null
}
</script>

<template>
  <div class="space-y-4">
    <p v-if="files.length === 0" class="text-sm text-gray-500 dark:text-gray-400">
      Ajoutez une version par langue disponible. Chaque version peut être un fichier téléversé ou un lien vers le site source.
    </p>

    <div
      v-for="(file, index) in files"
      :key="file.key"
      class="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-4"
    >
      <!-- Langue -->
      <div class="flex flex-wrap items-end gap-3">
        <div class="flex-1 min-w-[12rem]">
          <label :for="`lang-${file.key}`" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Langue <span class="text-red-500">*</span>
          </label>
          <select
            :id="`lang-${file.key}`"
            :value="isPreset(file.languageCode) ? file.languageCode : OTHER"
            :class="[inputClass, 'cursor-pointer']"
            @change="selectLanguage(file, ($event.target as HTMLSelectElement).value)"
          >
            <option
              v-for="lang in RESOURCE_LANGUAGES"
              :key="lang.code"
              :value="lang.code"
              :disabled="lang.code !== file.languageCode && usedCodes.has(lang.code)"
            >
              {{ lang.code }} – {{ lang.label }}
            </option>
            <option :value="OTHER">Autre langue…</option>
          </select>
        </div>

        <template v-if="!isPreset(file.languageCode)">
          <div class="w-28">
            <label :for="`code-${file.key}`" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Code
            </label>
            <input
              :id="`code-${file.key}`"
              :value="file.languageCode"
              type="text"
              maxlength="8"
              placeholder="ES"
              :class="[inputClass, 'uppercase']"
              @input="onCodeInput(file, $event)"
            />
          </div>
          <div class="flex-1 min-w-[10rem]">
            <label :for="`label-${file.key}`" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nom de la langue
            </label>
            <input
              :id="`label-${file.key}`"
              v-model="file.languageLabel"
              type="text"
              placeholder="Español"
              :class="inputClass"
            />
          </div>
        </template>

        <div class="flex items-center gap-1 ml-auto">
          <button
            type="button"
            :disabled="index === 0"
            class="p-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            title="Monter"
            aria-label="Monter cette version"
            @click="moveVersion(index, -1)"
          >
            <font-awesome-icon icon="arrow-up" />
          </button>
          <button
            type="button"
            :disabled="index === files.length - 1"
            class="p-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            title="Descendre"
            aria-label="Descendre cette version"
            @click="moveVersion(index, 1)"
          >
            <font-awesome-icon icon="arrow-down" />
          </button>
          <button
            type="button"
            class="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 cursor-pointer"
            title="Retirer cette version"
            aria-label="Retirer cette version"
            @click="removeVersion(index)"
          >
            <font-awesome-icon icon="trash" />
          </button>
        </div>
      </div>
      <p v-if="isDuplicate(file)" class="text-xs text-red-600 dark:text-red-400 -mt-2">
        Cette langue est déjà utilisée par une autre version.
      </p>

      <!-- Source : fichier ou lien externe -->
      <div class="inline-flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1" role="group" aria-label="Source du document">
        <button
          type="button"
          :aria-pressed="file.source === 'file'"
          :class="[
            'px-3 py-1.5 text-sm rounded-md transition-colors cursor-pointer',
            file.source === 'file'
              ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          ]"
          @click="file.source = 'file'"
        >
          <font-awesome-icon icon="cloud-arrow-up" class="mr-1.5" />
          Fichier
        </button>
        <button
          type="button"
          :aria-pressed="file.source === 'link'"
          :class="[
            'px-3 py-1.5 text-sm rounded-md transition-colors cursor-pointer',
            file.source === 'link'
              ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          ]"
          @click="file.source = 'link'"
        >
          <font-awesome-icon icon="link" class="mr-1.5" />
          Lien externe
        </button>
      </div>

      <!-- Fichier téléversé -->
      <template v-if="file.source === 'file'">
        <div v-if="file.fileUrl" class="flex items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-gray-700/60 rounded-lg">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 shrink-0 rounded-lg bg-ti-blue/10 flex items-center justify-center">
              <font-awesome-icon :icon="getFileIcon(file.mimeType)" class="text-ti-blue" />
            </div>
            <div class="min-w-0">
              <p class="font-medium text-gray-900 dark:text-white truncate">{{ file.filename }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ formatFileSize(file.fileSize) }}</p>
            </div>
          </div>
          <div class="flex items-center gap-1 shrink-0">
            <a
              :href="file.fileUrl"
              target="_blank"
              rel="noopener"
              class="p-2 text-gray-500 hover:text-ti-blue dark:text-gray-400 transition-colors"
              title="Voir le fichier"
            >
              <font-awesome-icon icon="external-link-alt" />
            </a>
            <label
              class="p-2 text-gray-500 hover:text-ti-blue dark:text-gray-400 transition-colors cursor-pointer"
              title="Remplacer le fichier"
            >
              <font-awesome-icon :icon="uploadingKey === file.key ? 'spinner' : 'sync'" :class="{ 'animate-spin': uploadingKey === file.key }" />
              <span class="sr-only">Remplacer le fichier</span>
              <input type="file" class="hidden" :accept="ACCEPT" @change="upload(file, $event)" />
            </label>
            <button
              type="button"
              class="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 transition-colors cursor-pointer"
              title="Supprimer le fichier"
              @click="clearFile(file)"
            >
              <font-awesome-icon icon="xmark" />
            </button>
          </div>
        </div>

        <label
          v-else
          class="relative flex flex-col items-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-ti-blue transition-colors cursor-pointer"
        >
          <input
            type="file"
            class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            :accept="ACCEPT"
            :disabled="uploadingKey === file.key"
            @change="upload(file, $event)"
          />
          <template v-if="uploadingKey === file.key">
            <font-awesome-icon icon="spinner" class="animate-spin text-ti-blue text-2xl mb-2" />
            <span class="text-gray-600 dark:text-gray-400">Téléversement en cours...</span>
          </template>
          <template v-else>
            <font-awesome-icon icon="cloud-arrow-up" class="text-gray-400 text-3xl mb-2" />
            <span class="text-gray-600 dark:text-gray-400">Glissez un fichier ici ou cliquez pour sélectionner</span>
            <span class="text-xs text-gray-500 mt-1">PDF, Word, Excel, PowerPoint, archives (max 20 Mo)</span>
          </template>
        </label>
      </template>

      <!-- Lien externe -->
      <div v-else>
        <label :for="`url-${file.key}`" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Adresse du document sur le site source
        </label>
        <input
          :id="`url-${file.key}`"
          v-model.trim="file.externalUrl"
          type="url"
          placeholder="https://..."
          :class="inputClass"
        />
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Le bouton de téléchargement redirigera l'internaute vers cette adresse.
        </p>
      </div>
    </div>

    <!-- Ajout d'une langue -->
    <div class="flex flex-wrap items-center gap-2">
      <span class="text-sm text-gray-600 dark:text-gray-400 mr-1">
        <font-awesome-icon icon="language" class="mr-1" />
        Ajouter une version :
      </span>
      <button
        v-for="lang in availablePresets"
        :key="lang.code"
        type="button"
        class="px-3 py-1.5 text-sm rounded-lg border border-green-600 text-green-700 hover:bg-green-50 dark:border-green-500 dark:text-green-400 dark:hover:bg-green-900/30 transition-colors cursor-pointer"
        @click="addVersion(lang.code, lang.label)"
      >
        <font-awesome-icon icon="plus" class="mr-1 text-xs" />
        {{ lang.code }} – {{ lang.label }}
      </button>
      <button
        type="button"
        class="px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors cursor-pointer"
        @click="addVersion()"
      >
        <font-awesome-icon icon="plus" class="mr-1 text-xs" />
        Autre langue
      </button>
    </div>
  </div>
</template>
