<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

interface CategoryOption {
  id: string
  name: string
  color: string | null
  icon?: string | null
}

interface AudioVideoItem {
  id: string
  title: string
  description: string
  format: AudioVideoFormat
  speakers: string[]
  externalUrl: string
  coverImage: string | null
  isPublished: boolean
  publishedAt: string | null
  categoryId: string | null
}

const route = useRoute()
const router = useRouter()
const id = route.params.id as string
const isNew = id === 'new'

const inputClass = 'w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500'

const form = ref({
  title: '',
  description: '',
  format: 'VIDEO' as AudioVideoFormat,
  speakers: [] as string[],
  externalUrl: '',
  coverImage: '',
  categoryId: '',
  publishedAt: '',
  isPublished: false
})

const isLoading = ref(false)
const isSaving = ref(false)
const error = ref('')
const success = ref('')

const { data: categories } = await useFetch<CategoryOption[]>('/api/admin/audio-video-categories', {
  default: () => []
})
const { data: suggestions } = await useFetch<{ speakers: string[] }>('/api/admin/audio-video-speakers', {
  default: () => ({ speakers: [] })
})

// Création rapide d'une catégorie depuis le formulaire
const showCategoryModal = ref(false)

function onCategoryCreated(category: CategoryOption) {
  // Placée en dernier par l'API : on l'ajoute en fin de liste et on la sélectionne
  categories.value = [...(categories.value || []), category]
  form.value.categoryId = category.id
}

if (!isNew) {
  isLoading.value = true
  try {
    const { data: itemData, status } = await useFetch<AudioVideoItem>(`/api/admin/audio-videos/${id}`)

    if (status.value === 'pending') {
      await new Promise<void>(resolve => {
        const unwatch = watch(status, (newStatus) => {
          if (newStatus !== 'pending') {
            unwatch()
            resolve()
          }
        })
      })
    }

    if (itemData.value) {
      form.value = {
        title: itemData.value.title,
        description: itemData.value.description,
        format: itemData.value.format,
        speakers: [...itemData.value.speakers],
        externalUrl: itemData.value.externalUrl,
        coverImage: itemData.value.coverImage || '',
        categoryId: itemData.value.categoryId || '',
        publishedAt: toLocalInputValue(itemData.value.publishedAt),
        isPublished: itemData.value.isPublished
      }
    } else {
      error.value = 'Audio/vidéo introuvable'
    }
  } catch {
    error.value = 'Erreur lors du chargement de l\'audio/vidéo'
  } finally {
    isLoading.value = false
  }
}

// Sauvegarde locale de la saisie en cours
const draft = useFormDraft({
  key: 'audio-videos',
  source: () => ({ ...form.value }),
  apply: (data) => {
    form.value = { ...form.value, ...data }
  }
})
const draftRestoredAt = draft.restoredAt

onMounted(() => {
  if (!error.value) draft.start(id)
})

// Lien saisi : lecteur intégré (YouTube, Vimeo) et miniature YouTube disponibles
const embed = computed(() => form.value.externalUrl ? parseVideoUrl(form.value.externalUrl) : null)
const youtubeThumbnail = computed(() => form.value.externalUrl ? getYoutubeThumbnail(form.value.externalUrl) : null)
const linkHost = computed(() => getUrlHost(form.value.externalUrl))
const selectedCategory = computed(() => categories.value?.find(c => c.id === form.value.categoryId) || null)

function applyYoutubeThumbnail() {
  if (youtubeThumbnail.value) form.value.coverImage = youtubeThumbnail.value
}

function validate(): string | null {
  if (!form.value.title.trim()) return 'Le titre est requis'
  if (!form.value.description.trim()) return 'La description est requise'
  if (!form.value.categoryId) return 'La catégorie est requise'
  if (!form.value.externalUrl.trim()) return 'Le lien vers le contenu est requis'
  if (!linkHost.value) return 'Le lien vers le contenu doit être une adresse web complète (https://...)'
  if (!form.value.coverImage) return 'L\'image de couverture est requise'
  return null
}

async function handleSubmit() {
  error.value = ''
  success.value = ''

  const validationError = validate()
  if (validationError) {
    error.value = validationError
    return
  }

  isSaving.value = true
  try {
    const payload = {
      title: form.value.title.trim(),
      description: form.value.description.trim(),
      format: form.value.format,
      speakers: form.value.speakers,
      externalUrl: form.value.externalUrl.trim(),
      coverImage: form.value.coverImage,
      categoryId: form.value.categoryId,
      publishedAt: toIsoOrNull(form.value.publishedAt),
      isPublished: form.value.isPublished
    }

    if (isNew) {
      const result = await $fetch<{ data: { id: string } }>('/api/admin/audio-videos', {
        method: 'POST',
        body: payload
      })
      draft.clear()
      success.value = 'Audio/vidéo créé avec succès'
      setTimeout(() => {
        router.push(`/admin/audio-videos/${result.data.id}`)
      }, 1500)
    } else {
      const result = await $fetch<{ data: { publishedAt: string | null } }>(`/api/admin/audio-videos/${id}`, {
        method: 'PUT',
        body: payload
      })
      form.value.publishedAt = toLocalInputValue(result.data.publishedAt)
      draft.commit()
      success.value = 'Audio/vidéo mis à jour avec succès'
    }
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } }
    error.value = err.data?.statusMessage || 'Erreur lors de l\'enregistrement'
  } finally {
    isSaving.value = false
  }
}

async function togglePublish() {
  if (isNew) {
    form.value.isPublished = !form.value.isPublished
    return
  }

  isSaving.value = true
  try {
    const result = await $fetch<{ data: { publishedAt: string | null } }>(`/api/admin/audio-videos/${id}`, {
      method: 'PUT',
      body: { isPublished: !form.value.isPublished }
    })
    form.value.isPublished = !form.value.isPublished
    form.value.publishedAt = toLocalInputValue(result.data.publishedAt)
    draft.updateBaseline((reference) => {
      reference.isPublished = form.value.isPublished
      reference.publishedAt = form.value.publishedAt
    })
    success.value = form.value.isPublished ? 'Audio/vidéo publié' : 'Audio/vidéo dépublié'
  } catch {
    error.value = 'Erreur lors du changement de statut'
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div class="flex items-center gap-4">
        <NuxtLink
          to="/admin/audio-videos"
          class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          aria-label="Retour à la liste"
        >
          <font-awesome-icon icon="arrow-left" />
        </NuxtLink>
        <div>
          <h2 class="text-2xl font-heading font-bold text-gray-900 dark:text-white">
            {{ isNew ? 'Nouvel audio/vidéo' : 'Modifier l\'audio/vidéo' }}
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            Contenu hébergé sur un site externe (YouTube, SoundCloud…)
          </p>
        </div>
      </div>
      <AdminPublishActions
        :published="form.isPublished"
        published-label="Publié"
        :saving="isSaving"
        @toggle="togglePublish"
        @save="handleSubmit"
      />
    </div>

    <!-- Messages -->
    <div v-if="error" class="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg flex items-center gap-2">
      <font-awesome-icon icon="circle-exclamation" />
      {{ error }}
    </div>
    <div v-if="success" class="mb-6 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg flex items-center gap-2">
      <font-awesome-icon icon="check-circle" />
      {{ success }}
    </div>
    <FormDraftNotice
      v-if="draftRestoredAt"
      :saved-at="draftRestoredAt"
      class="mb-6"
      @discard="draft.discard()"
    />

    <div v-if="isLoading" class="flex justify-center py-12">
      <font-awesome-icon icon="spinner" class="animate-spin text-green-600 text-3xl" />
    </div>

    <form v-else class="space-y-6" @submit.prevent="handleSubmit">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Colonne principale -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Informations générales -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informations générales</h3>

            <div class="space-y-4">
              <div>
                <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Titre <span class="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  v-model="form.title"
                  type="text"
                  required
                  :class="inputClass"
                  placeholder="Titre de l'audio ou de la vidéo"
                />
              </div>

              <div>
                <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description <span class="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  v-model="form.description"
                  rows="4"
                  required
                  :class="[inputClass, 'resize-y']"
                  placeholder="De quoi parle ce contenu ?"
                />
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div class="flex items-center justify-between mb-1">
                    <label for="categoryId" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Catégorie <span class="text-red-500">*</span>
                    </label>
                    <NuxtLink
                      to="/admin/audio-video-categories"
                      target="_blank"
                      class="text-xs text-green-600 dark:text-green-400 hover:underline"
                    >
                      Gérer les catégories
                    </NuxtLink>
                  </div>
                  <div class="flex items-center gap-2">
                    <select
                      id="categoryId"
                      v-model="form.categoryId"
                      :class="[inputClass, 'flex-1 min-w-0 cursor-pointer']"
                    >
                      <option value="" disabled>Choisir une catégorie</option>
                      <option v-for="category in categories" :key="category.id" :value="category.id">
                        {{ category.name }}
                      </option>
                    </select>
                    <button
                      type="button"
                      title="Nouvelle catégorie"
                      aria-label="Nouvelle catégorie"
                      class="shrink-0 w-10 h-10 inline-flex items-center justify-center rounded-lg border border-green-600 text-green-600 hover:bg-green-50 dark:border-green-500 dark:text-green-400 dark:hover:bg-green-900/30 transition-colors cursor-pointer"
                      @click="showCategoryModal = true"
                    >
                      <font-awesome-icon icon="plus" />
                    </button>
                  </div>
                  <p v-if="!categories?.length" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Aucune catégorie pour l'instant : créez-en une avec le bouton +.
                  </p>
                </div>

                <div>
                  <span class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Format</span>
                  <div class="inline-flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1" role="group" aria-label="Format">
                    <button
                      v-for="option in AUDIO_VIDEO_FORMATS"
                      :key="option.value"
                      type="button"
                      :aria-pressed="form.format === option.value"
                      :class="[
                        'px-4 py-1.5 text-sm rounded-md transition-colors cursor-pointer',
                        form.format === option.value
                          ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      ]"
                      @click="form.format = option.value"
                    >
                      <font-awesome-icon :icon="option.icon" class="mr-1.5" />
                      {{ option.label }}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label for="speakers" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Intervenant(s)
                  <span class="text-xs font-normal text-gray-500 dark:text-gray-400">(optionnel)</span>
                </label>
                <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Appuyez sur Entrée après chaque nom.
                </p>
                <TagInput
                  v-model="form.speakers"
                  input-id="speakers"
                  :suggestions="suggestions?.speakers || []"
                  placeholder="Ex : Hery Rasolofo"
                />
              </div>

              <div>
                <label for="publishedAt" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date de publication
                </label>
                <input
                  id="publishedAt"
                  v-model="form.publishedAt"
                  type="datetime-local"
                  :class="inputClass"
                />
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {{ form.publishedAt ? 'Date affichée sur le site et utilisée pour le tri.' : 'Laissez vide pour utiliser la date de mise en ligne.' }}
                </p>
              </div>
            </div>
          </div>

          <!-- Contenu -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              <font-awesome-icon icon="link" class="mr-2 text-green-600" />
              Contenu <span class="text-red-500">*</span>
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
              L'internaute sera redirigé vers cette adresse pour écouter ou regarder le contenu.
            </p>
            <label for="externalUrl" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Lien vers le site source
            </label>
            <input
              id="externalUrl"
              v-model.trim="form.externalUrl"
              type="url"
              required
              :class="inputClass"
              placeholder="https://www.youtube.com/watch?v=..."
            />
            <p v-if="linkHost" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Site source : <strong>{{ linkHost }}</strong>
              <a :href="form.externalUrl" target="_blank" rel="noopener" class="ml-2 text-green-600 dark:text-green-400 hover:underline">
                Ouvrir <font-awesome-icon icon="external-link-alt" class="text-[0.6rem]" />
              </a>
            </p>

            <div v-if="embed" class="mt-4 aspect-video rounded-lg overflow-hidden bg-black">
              <iframe
                :src="embed.embed"
                title="Aperçu du contenu"
                class="w-full h-full"
                loading="lazy"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              />
            </div>
          </div>
        </div>

        <!-- Colonne latérale -->
        <div class="space-y-6">
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Image de couverture <span class="text-red-500">*</span>
            </h3>
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Affichée sur la carte du contenu dans la rubrique Ressources.
            </p>
            <button
              v-if="youtubeThumbnail && form.coverImage !== youtubeThumbnail"
              type="button"
              class="mb-4 w-full px-3 py-2 text-sm rounded-lg border border-red-500 text-red-600 hover:bg-red-50 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
              @click="applyYoutubeThumbnail"
            >
              <font-awesome-icon :icon="['fab', 'youtube']" class="mr-2" />
              Utiliser la miniature YouTube
            </button>
            <ImageUpload v-model="form.coverImage" :generate-variants="true" />
          </div>

          <!-- Aperçu -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Aperçu</h3>
            <AudioVideoCard
              :item="{
                id: 'preview',
                title: form.title || 'Titre du contenu',
                description: form.description,
                format: form.format,
                speakers: form.speakers,
                externalUrl: form.externalUrl,
                coverImage: form.coverImage || null,
                publishedAt: toIsoOrNull(form.publishedAt),
                category: selectedCategory ? { id: selectedCategory.id, name: selectedCategory.name, color: selectedCategory.color, icon: selectedCategory.icon ?? null } : null
              }"
              preview
            />
          </div>
        </div>
      </div>

      <!-- Actions répétées en bas du formulaire, pour éviter de remonter -->
      <div class="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <p v-if="error" class="text-sm text-red-600 dark:text-red-400 sm:mr-auto flex items-center gap-2">
          <font-awesome-icon icon="circle-exclamation" />
          {{ error }}
        </p>
        <p v-else-if="success" class="text-sm text-green-700 dark:text-green-400 sm:mr-auto flex items-center gap-2">
          <font-awesome-icon icon="check-circle" />
          {{ success }}
        </p>
        <AdminPublishActions
          :published="form.isPublished"
          published-label="Publié"
          :saving="isSaving"
          @toggle="togglePublish"
          @save="handleSubmit"
        />
      </div>
    </form>

    <CategoryQuickCreate
      v-model="showCategoryModal"
      endpoint="/api/admin/audio-video-categories"
      manage-url="/admin/audio-video-categories"
      name-placeholder="Ex: Éducation, Face-à-face, Podcast"
      @created="onCategoryCreated"
    />
  </div>
</template>
