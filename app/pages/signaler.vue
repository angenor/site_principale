<script setup lang="ts">
// Utiliser la config partagée
const { getConfig } = useAppSettings()

const introText = computed(() => getConfig('report_case_intro', 'Vous avez connaissance d\'un cas de mauvaise gouvernance ou d\'impact négatif lié à l\'exploitation minière ? Partagez l\'information de manière sécurisée.'))

// Métadonnées de la page
useHead({
  title: 'Signaler un cas - Observatoire des Mines de Madagascar',
  meta: [
    {
      name: 'description',
      content: 'Signalez un cas de mauvaise gouvernance ou d\'impact négatif lié à l\'exploitation minière à Madagascar de manière sécurisée.'
    }
  ]
})

// Coordonnées affichées dans « Autres moyens de nous contacter » (modifiables dans la configuration)
const reportEmail = computed(() => getConfig('report_contact_email', 'vramaherison@transparency.mg'))
const reportPhone = computed(() => getConfig('report_contact_phone', '+261 20 22 309 71'))
const reportPhoneHref = computed(() => `tel:${reportPhone.value.replace(/[^\d+]/g, '')}`)

interface ReportCategoryOption {
  id: string
  name: string
}

// Catégories de signalement (gérées dans le back-office)
const { data: categories } = await useFetch<ReportCategoryOption[]>('/api/report-categories', {
  default: () => []
})

// État du formulaire
const form = reactive({
  name: '',
  email: '',
  phone: '',
  categoryId: '',
  message: '',
  isAnonymous: false
})

const isSubmitting = ref(false)
const submitSuccess = ref(false)
const submitError = ref('')
const uploadProgress = ref<number | null>(null)

// Pièces jointes
const limits = REPORT_ATTACHMENT_LIMITS
const acceptedExtensions = Object.keys(REPORT_ATTACHMENT_EXTENSIONS).join(',')
const acceptedLabel = 'PDF, Word, Excel, PowerPoint, OpenDocument, TXT, CSV, images, audio, vidéo, ZIP/RAR/7Z'

const files = ref<File[]>([])
const links = ref<string[]>([])
const linkInput = ref('')
const attachmentError = ref('')
const isDragging = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const totalSize = computed(() => files.value.reduce((sum, file) => sum + file.size, 0))

function fileIcon(file: File): string | string[] {
  const icon = getFileIcon(file.type || REPORT_ATTACHMENT_EXTENSIONS[getReportAttachmentExtension(file.name) || ''])
  return icon === 'file' ? ['far', 'file'] : icon
}

function addFiles(list: FileList | File[] | null | undefined) {
  if (!list) return
  const rejected: string[] = []
  let size = totalSize.value

  for (const file of Array.from(list)) {
    if (files.value.length >= limits.maxFiles) {
      rejected.push(`${file.name} : maximum ${limits.maxFiles} fichiers`)
      continue
    }
    if (!getReportAttachmentExtension(file.name)) {
      rejected.push(`${file.name} : type de fichier non accepté`)
      continue
    }
    if (file.size === 0) {
      rejected.push(`${file.name} : fichier vide`)
      continue
    }
    if (file.size > limits.maxFileSize) {
      rejected.push(`${file.name} : dépasse ${formatFileSize(limits.maxFileSize)}`)
      continue
    }
    if (size + file.size > limits.maxTotalSize) {
      rejected.push(`${file.name} : la taille totale dépasserait ${formatFileSize(limits.maxTotalSize)}`)
      continue
    }
    const duplicate = files.value.some(f => f.name === file.name && f.size === file.size && f.lastModified === file.lastModified)
    if (duplicate) continue

    files.value.push(file)
    size += file.size
  }

  attachmentError.value = rejected.length ? `Fichier(s) non ajouté(s) — ${rejected.join(' ; ')}` : ''
}

function onFileInputChange(event: Event) {
  const input = event.target as HTMLInputElement
  addFiles(input.files)
  // Permet de re-sélectionner le même fichier après l'avoir retiré
  input.value = ''
}

function onDrop(event: DragEvent) {
  isDragging.value = false
  addFiles(event.dataTransfer?.files)
}

function removeFile(index: number) {
  files.value.splice(index, 1)
  attachmentError.value = ''
}

// Ajoute le lien saisi ; renvoie false s'il est invalide
function addLink(): boolean {
  const value = linkInput.value.trim()
  if (!value) return true
  const url = /^https?:\/\//i.test(value) ? value : `https://${value}`

  if (links.value.length >= limits.maxLinks) {
    attachmentError.value = `Vous pouvez ajouter au maximum ${limits.maxLinks} liens`
    return false
  }
  if (!isValidReportLink(url)) {
    attachmentError.value = 'Lien invalide. Exemple : https://www.exemple.com/article'
    return false
  }
  if (!links.value.includes(url)) {
    links.value.push(url)
  }
  linkInput.value = ''
  attachmentError.value = ''
  return true
}

function removeLink(index: number) {
  links.value.splice(index, 1)
}

// Envoi en multipart avec suivi de la progression (utile pour les fichiers volumineux)
function sendReport(body: FormData): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/api/contact')
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        uploadProgress.value = Math.round((event.loaded / event.total) * 100)
      }
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve()
        return
      }
      let message = ''
      try {
        message = JSON.parse(xhr.responseText)?.statusMessage || ''
      } catch {
        // Réponse non JSON (ex. limite de taille du proxy)
      }
      if (!message && xhr.status === 413) {
        message = 'Les pièces jointes sont trop volumineuses.'
      }
      reject(new Error(message || 'Une erreur est survenue. Veuillez réessayer.'))
    }
    xhr.onerror = () => reject(new Error('Connexion impossible. Vérifiez votre connexion internet et réessayez.'))
    xhr.send(body)
  })
}

// Soumission du formulaire
const submitForm = async () => {
  // Validation
  if (!form.categoryId) {
    submitError.value = 'Veuillez sélectionner une catégorie'
    return
  }
  if (!form.message || form.message.length < 50) {
    submitError.value = 'Votre message doit contenir au moins 50 caractères'
    return
  }
  // Un lien saisi mais pas encore ajouté est pris en compte
  if (!addLink()) {
    submitError.value = 'Veuillez corriger le lien saisi avant l\'envoi'
    return
  }

  isSubmitting.value = true
  submitError.value = ''
  uploadProgress.value = files.value.length ? 0 : null

  try {
    const body = new FormData()
    body.append('data', JSON.stringify({
      name: form.isAnonymous ? null : form.name,
      email: form.isAnonymous ? null : form.email,
      phone: form.isAnonymous ? null : form.phone,
      categoryId: form.categoryId,
      message: form.message,
      isAnonymous: form.isAnonymous,
      links: links.value
    }))
    for (const file of files.value) {
      body.append('files', file, file.name)
    }

    await sendReport(body)

    submitSuccess.value = true

    // Réinitialiser le formulaire
    form.name = ''
    form.email = ''
    form.phone = ''
    form.categoryId = ''
    form.message = ''
    form.isAnonymous = false
    files.value = []
    links.value = []
    linkInput.value = ''
    attachmentError.value = ''
  } catch (error: unknown) {
    submitError.value = error instanceof Error ? error.message : 'Une erreur est survenue. Veuillez réessayer.'
  } finally {
    isSubmitting.value = false
    uploadProgress.value = null
  }
}

// Réinitialiser le message de succès
const resetForm = () => {
  submitSuccess.value = false
}
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="bg-gradient-to-br from-ti-blue-600 to-ti-blue-800 py-16 lg:py-20">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div class="w-16 h-16 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center">
          <font-awesome-icon icon="bullhorn" class="w-8 h-8 text-white" />
        </div>
        <h1 class="text-3xl lg:text-4xl font-heading font-bold uppercase text-white mb-4">
          Signaler un cas
        </h1>
        <p class="text-lg text-blue-100 max-w-2xl mx-auto">
          {{ introText }}
        </p>
      </div>
    </section>

    <!-- Contenu principal -->
    <section class="py-12 lg:py-16 bg-white dark:bg-gray-900">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Message de succès -->
        <div v-if="submitSuccess" class="text-center py-12">
          <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <font-awesome-icon icon="check" class="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h2 class="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-4">
            Signalement envoyé !
          </h2>
          <p class="text-gray-600 dark:text-gray-400 mb-8">
            Merci pour votre contribution. Votre signalement sera examiné par notre équipe
            dans les plus brefs délais.
          </p>
          <button @click="resetForm" class="btn-ti">
            Faire un autre signalement
          </button>
        </div>

        <!-- Formulaire -->
        <form v-else @submit.prevent="submitForm" class="space-y-8">
          <!-- Avertissement confidentialité -->
          <div class="bg-ti-blue-50 dark:bg-ti-blue-900/20 border border-ti-blue-200 dark:border-ti-blue-800 rounded-xl p-6">
            <div class="flex">
              <font-awesome-icon icon="shield-halved" class="w-6 h-6 text-ti-blue flex-shrink-0 mt-0.5" />
              <div class="ml-4">
                <h3 class="font-semibold text-ti-blue-800 dark:text-ti-blue-200">
                  Confidentialité garantie
                </h3>
                <p class="text-sm text-ti-blue-700 dark:text-ti-blue-300 mt-1">
                  Vos informations sont traitées de manière confidentielle. Vous pouvez choisir
                  de rester anonyme. Aucune donnée personnelle ne sera partagée sans votre consentement.
                </p>
              </div>
            </div>
          </div>

          <!-- Option anonyme -->
          <div class="flex items-center">
            <input
              id="anonymous"
              v-model="form.isAnonymous"
              type="checkbox"
              class="w-5 h-5 rounded border-gray-300 text-ti-blue focus:ring-ti-blue cursor-pointer"
            />
            <label for="anonymous" class="ml-3 text-gray-700 dark:text-gray-300 cursor-pointer">
              <span class="font-medium">Rester anonyme</span>
              <span class="text-sm text-gray-500 dark:text-gray-400 block">
                Vos coordonnées ne seront pas enregistrées
              </span>
            </label>
          </div>

          <!-- Informations de contact (si non anonyme) -->
          <Transition
            enter-active-class="transition ease-out duration-200"
            enter-from-class="opacity-0 -translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition ease-in duration-150"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-2"
          >
            <div v-if="!form.isAnonymous" class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nom (optionnel)
                </label>
                <input
                  v-model="form.name"
                  type="text"
                  placeholder="Votre nom"
                  class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-ti-blue focus:border-transparent transition-colors"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email (optionnel)
                </label>
                <input
                  v-model="form.email"
                  type="email"
                  placeholder="votre@email.com"
                  class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-ti-blue focus:border-transparent transition-colors"
                />
              </div>

              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Téléphone (optionnel)
                </label>
                <input
                  v-model="form.phone"
                  type="tel"
                  placeholder="+261 XX XX XXX XX"
                  class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-ti-blue focus:border-transparent transition-colors"
                />
              </div>
            </div>
          </Transition>

          <!-- Catégorie -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Catégorie du signalement <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.categoryId"
              required
              class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-ti-blue focus:border-transparent transition-colors cursor-pointer"
            >
              <option value="" disabled>Sélectionnez une catégorie</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>

          <!-- Message -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description du cas <span class="text-red-500">*</span>
            </label>
            <textarea
              v-model="form.message"
              rows="8"
              required
              minlength="50"
              placeholder="Décrivez le cas que vous souhaitez signaler. Soyez aussi précis que possible : lieu, date, acteurs impliqués, impacts observés..."
              class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-ti-blue focus:border-transparent transition-colors resize-none"
            />
            <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Minimum 50 caractères. {{ form.message.length }}/50
            </p>
          </div>

          <!-- Pièces jointes -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Pièces jointes (optionnel)
            </label>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Documents, photos, enregistrements ou liens qui appuient votre signalement.
              Ils ne sont accessibles qu'à l'équipe de l'Observatoire.
            </p>

            <!-- Zone de dépôt -->
            <div
              role="button"
              tabindex="0"
              :class="[
                'rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-ti-blue',
                isDragging
                  ? 'border-ti-blue bg-ti-blue-50 dark:bg-ti-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-ti-blue dark:hover:border-ti-blue bg-gray-50 dark:bg-gray-800/50',
                files.length >= limits.maxFiles ? 'opacity-60 pointer-events-none' : ''
              ]"
              @click="fileInput?.click()"
              @keydown.enter.prevent="fileInput?.click()"
              @keydown.space.prevent="fileInput?.click()"
              @dragenter.prevent="isDragging = true"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="onDrop"
            >
              <font-awesome-icon icon="cloud-arrow-up" class="w-8 h-8 text-ti-blue mb-3" />
              <p class="font-medium text-gray-900 dark:text-white">
                Glissez vos fichiers ici ou <span class="text-ti-blue underline">parcourez</span>
              </p>
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {{ acceptedLabel }}
              </p>
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Jusqu'à {{ limits.maxFiles }} fichiers, {{ formatFileSize(limits.maxFileSize) }} par fichier,
                {{ formatFileSize(limits.maxTotalSize) }} au total
              </p>
              <input
                ref="fileInput"
                type="file"
                multiple
                :accept="acceptedExtensions"
                class="hidden"
                @change="onFileInputChange"
              />
            </div>

            <!-- Fichiers sélectionnés -->
            <ul v-if="files.length" class="mt-4 divide-y divide-gray-200 dark:divide-gray-700 rounded-lg border border-gray-200 dark:border-gray-700">
              <li
                v-for="(file, index) in files"
                :key="`${file.name}-${file.size}-${file.lastModified}`"
                class="flex items-center gap-3 px-4 py-3"
              >
                <font-awesome-icon :icon="fileIcon(file)" class="w-5 h-5 text-ti-blue flex-shrink-0" />
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-medium text-gray-900 dark:text-white">{{ file.name }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">{{ formatFileSize(file.size) }}</p>
                </div>
                <button
                  type="button"
                  :disabled="isSubmitting"
                  class="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 cursor-pointer disabled:cursor-not-allowed"
                  :title="`Retirer ${file.name}`"
                  :aria-label="`Retirer ${file.name}`"
                  @click="removeFile(index)"
                >
                  <font-awesome-icon icon="xmark" class="w-4 h-4" />
                </button>
              </li>
              <li class="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50">
                {{ files.length }}/{{ limits.maxFiles }} fichier(s) · {{ formatFileSize(totalSize) }} / {{ formatFileSize(limits.maxTotalSize) }}
              </li>
            </ul>

            <!-- Liens -->
            <div class="mt-6">
              <label for="report-link" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Liens (article de presse, vidéo en ligne, document partagé…)
              </label>
              <div class="flex gap-2">
                <input
                  id="report-link"
                  v-model="linkInput"
                  type="url"
                  inputmode="url"
                  placeholder="https://"
                  :disabled="links.length >= limits.maxLinks"
                  class="min-w-0 flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-ti-blue focus:border-transparent transition-colors disabled:opacity-60"
                  @keydown.enter.prevent="addLink"
                />
                <button
                  type="button"
                  :disabled="!linkInput.trim() || links.length >= limits.maxLinks"
                  class="px-4 py-3 rounded-lg border border-ti-blue text-ti-blue hover:bg-ti-blue hover:text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-ti-blue"
                  @click="addLink"
                >
                  <font-awesome-icon icon="plus" class="w-4 h-4 sm:mr-2" />
                  <span class="hidden sm:inline">Ajouter</span>
                </button>
              </div>
              <ul v-if="links.length" class="mt-3 space-y-2">
                <li
                  v-for="(link, index) in links"
                  :key="link"
                  class="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2"
                >
                  <font-awesome-icon icon="link" class="w-4 h-4 text-ti-blue flex-shrink-0" />
                  <span class="min-w-0 flex-1 truncate text-sm text-gray-700 dark:text-gray-300">{{ link }}</span>
                  <button
                    type="button"
                    :disabled="isSubmitting"
                    class="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 cursor-pointer disabled:cursor-not-allowed"
                    title="Retirer ce lien"
                    aria-label="Retirer ce lien"
                    @click="removeLink(index)"
                  >
                    <font-awesome-icon icon="xmark" class="w-4 h-4" />
                  </button>
                </li>
              </ul>
            </div>

            <p v-if="attachmentError" class="mt-3 text-sm text-red-600 dark:text-red-400" role="alert">
              {{ attachmentError }}
            </p>

            <p class="mt-3 text-xs text-gray-500 dark:text-gray-400 flex items-start gap-2">
              <font-awesome-icon icon="triangle-exclamation" class="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <span>
                Si vous souhaitez rester anonyme, vérifiez que vos fichiers ne révèlent pas votre identité
                (nom de l'auteur dans les propriétés du document, visages, localisation des photos…).
              </span>
            </p>
          </div>

          <!-- Message d'erreur -->
          <div v-if="submitError" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div class="flex">
              <font-awesome-icon icon="circle-exclamation" class="w-5 h-5 text-red-600 dark:text-red-400" />
              <p class="ml-3 text-sm text-red-700 dark:text-red-300">{{ submitError }}</p>
            </div>
          </div>

          <!-- Bouton de soumission -->
          <div class="flex justify-end">
            <button
              type="submit"
              :disabled="isSubmitting"
              class="btn-ti px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <font-awesome-icon
                v-if="isSubmitting"
                icon="spinner"
                class="w-4 h-4 mr-2 animate-spin"
              />
              <font-awesome-icon v-else icon="paper-plane" class="w-4 h-4 mr-2" />
              {{ isSubmitting ? (uploadProgress !== null ? `Envoi en cours… ${uploadProgress} %` : 'Envoi en cours...') : 'Envoyer le signalement' }}
            </button>
          </div>
          <div
            v-if="uploadProgress !== null"
            class="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"
            role="progressbar"
            :aria-valuenow="uploadProgress"
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <div class="h-full bg-ti-blue transition-all" :style="{ width: `${uploadProgress}%` }" />
          </div>
        </form>

        <!-- Informations supplémentaires -->
        <div class="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-heading font-bold text-gray-900 dark:text-white mb-4">
            Autres moyens de nous contacter
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div class="flex items-start">
              <font-awesome-icon icon="envelope" class="w-5 h-5 text-ti-blue mt-0.5" />
              <div class="ml-3">
                <p class="font-medium text-gray-900 dark:text-white">Email</p>
                <a :href="`mailto:${reportEmail}`" class="text-ti-blue hover:text-ti-blue-700 break-all">
                  {{ reportEmail }}
                </a>
              </div>
            </div>
            <div class="flex items-start">
              <font-awesome-icon icon="phone" class="w-5 h-5 text-ti-blue mt-0.5" />
              <div class="ml-3">
                <p class="font-medium text-gray-900 dark:text-white">Téléphone</p>
                <a :href="reportPhoneHref" class="text-ti-blue hover:text-ti-blue-700">
                  {{ reportPhone }}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
