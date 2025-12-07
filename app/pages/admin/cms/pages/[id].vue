<template>
  <div>
    <!-- Back link -->
    <NuxtLink
      to="/admin/cms/pages"
      class="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--color-primary)] mb-6 transition-colors"
    >
      <font-awesome-icon :icon="['fas', 'arrow-left']" class="w-3 h-3" />
      Retour aux pages
    </NuxtLink>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <UiLoadingSpinner size="lg" />
    </div>

    <template v-else-if="page">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-2">
            <h1 class="font-heading text-2xl font-bold text-[var(--text-primary)] uppercase tracking-wide">
              {{ isEditing ? 'Modifier la page' : page.titre }}
            </h1>
            <UiBadge :variant="getStatutVariant(page.statut)">
              {{ getStatutLabel(page.statut) }}
            </UiBadge>
          </div>
          <p v-if="!isEditing && page.compte_administratif" class="text-sm text-[var(--text-secondary)]">
            {{ page.compte_administratif.commune?.nom }} - Exercice {{ page.compte_administratif.annee }}
          </p>
        </div>

        <div class="flex items-center gap-2">
          <template v-if="!isEditing">
            <UiButton
              v-if="page.statut === 'brouillon'"
              variant="success"
              @click="publierPage"
              :icon="['fas', 'globe']"
            >
              Publier
            </UiButton>
            <UiButton
              v-if="page.statut === 'publie'"
              variant="outline"
              @click="archiverPage"
              :icon="['fas', 'archive']"
            >
              Archiver
            </UiButton>
            <UiButton variant="outline" @click="isEditing = true" :icon="['fas', 'edit']">
              Modifier
            </UiButton>
            <UiButton variant="outline" @click="previewPage" :icon="['fas', 'eye']">
              Prévisualiser
            </UiButton>
          </template>
          <template v-else>
            <UiButton variant="outline" @click="cancelEdit">
              Annuler
            </UiButton>
            <UiButton variant="primary" @click="saveChanges" :loading="saving" :icon="['fas', 'save']">
              Enregistrer
            </UiButton>
          </template>
        </div>
      </div>

      <!-- Edit form -->
      <div v-if="isEditing" class="space-y-6">
        <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6">
          <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-6">Informations de la page</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UiFormInput
              v-model="form.titre"
              label="Titre de la page"
              placeholder="Titre affiché"
              required
              :error="formErrors.titre"
            />

            <UiFormInput
              v-model="form.slug"
              label="Slug (URL)"
              placeholder="url-de-la-page"
              hint="Laissez vide pour générer automatiquement"
              :error="formErrors.slug"
            />

            <div class="md:col-span-2">
              <UiFormTextarea
                v-model="form.description"
                label="Description"
                placeholder="Description courte de la page"
                :rows="2"
              />
            </div>

            <UiFormInput
              v-model="form.meta_title"
              label="Meta Title (SEO)"
              placeholder="Titre pour les moteurs de recherche"
            />

            <UiFormInput
              v-model="form.meta_description"
              label="Meta Description (SEO)"
              placeholder="Description pour les moteurs de recherche"
            />
          </div>
        </div>
      </div>

      <!-- Page info cards (view mode) -->
      <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <!-- Info card -->
        <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4">
          <h3 class="text-sm font-medium text-[var(--text-muted)] mb-3">Informations</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-[var(--text-secondary)]">Slug</span>
              <span class="text-[var(--text-primary)] font-mono">/{{ page.slug }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[var(--text-secondary)]">Ordre</span>
              <span class="text-[var(--text-primary)]">{{ page.ordre }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[var(--text-secondary)]">Créée le</span>
              <span class="text-[var(--text-primary)]">{{ formatDate(page.created_at) }}</span>
            </div>
            <div v-if="page.date_publication" class="flex justify-between">
              <span class="text-[var(--text-secondary)]">Publiée le</span>
              <span class="text-[var(--text-primary)]">{{ formatDate(page.date_publication) }}</span>
            </div>
          </div>
        </div>

        <!-- SEO card -->
        <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4">
          <h3 class="text-sm font-medium text-[var(--text-muted)] mb-3">SEO</h3>
          <div class="space-y-2 text-sm">
            <div>
              <span class="text-[var(--text-secondary)]">Meta Title</span>
              <p class="text-[var(--text-primary)] truncate">{{ page.meta_title || page.titre }}</p>
            </div>
            <div>
              <span class="text-[var(--text-secondary)]">Meta Description</span>
              <p class="text-[var(--text-primary)] line-clamp-2">{{ page.meta_description || page.description || '-' }}</p>
            </div>
          </div>
        </div>

        <!-- Stats card -->
        <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4">
          <h3 class="text-sm font-medium text-[var(--text-muted)] mb-3">Contenu</h3>
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center">
              <font-awesome-icon :icon="['fas', 'puzzle-piece']" class="text-[var(--color-primary)] text-xl" />
            </div>
            <div>
              <p class="text-2xl font-bold text-[var(--text-primary)]">{{ sections.length }}</p>
              <p class="text-sm text-[var(--text-muted)]">section(s)</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Description -->
      <div v-if="!isEditing && page.description" class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4 mb-6">
        <p class="text-[var(--text-secondary)]">{{ page.description }}</p>
      </div>

      <!-- Sections management -->
      <div v-if="!isEditing" class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)]">
        <div class="flex items-center justify-between p-4 border-b border-[var(--border-default)]">
          <h2 class="text-lg font-semibold text-[var(--text-primary)]">Sections</h2>
          <UiButton variant="primary" size="sm" @click="openAddSectionModal" :icon="['fas', 'plus']">
            Ajouter une section
          </UiButton>
        </div>

        <div v-if="sections.length === 0" class="p-8 text-center">
          <font-awesome-icon :icon="['fas', 'puzzle-piece']" class="text-4xl text-[var(--text-muted)] mb-4" />
          <h3 class="text-lg font-semibold text-[var(--text-primary)] mb-2">Aucune section</h3>
          <p class="text-[var(--text-secondary)] mb-4">Ajoutez des sections pour construire le contenu de cette page.</p>
          <UiButton variant="primary" @click="openAddSectionModal" :icon="['fas', 'plus']">
            Ajouter une section
          </UiButton>
        </div>

        <div v-else class="divide-y divide-[var(--border-default)]">
          <div
            v-for="(section, index) in sections"
            :key="section.id"
            class="p-4 flex items-center gap-4 hover:bg-[var(--bg-secondary)] transition-colors"
          >
            <!-- Drag handle -->
            <div class="cursor-move text-[var(--text-muted)]">
              <font-awesome-icon :icon="['fas', 'grip-vertical']" />
            </div>

            <!-- Section info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <font-awesome-icon :icon="getSectionIcon(section.type)" class="text-[var(--color-primary)]" />
                <span class="font-medium text-[var(--text-primary)]">
                  {{ section.titre || getSectionTypeLabel(section.type) }}
                </span>
                <UiBadge v-if="!section.est_visible" variant="neutral" size="sm">
                  Masquée
                </UiBadge>
              </div>
              <p class="text-sm text-[var(--text-muted)]">
                {{ getSectionTypeLabel(section.type) }}
              </p>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-1">
              <button
                @click="moveSection(index, -1)"
                :disabled="index === 0"
                class="p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-card)] rounded disabled:opacity-30 disabled:cursor-not-allowed"
                title="Monter"
              >
                <font-awesome-icon :icon="['fas', 'chevron-up']" />
              </button>
              <button
                @click="moveSection(index, 1)"
                :disabled="index === sections.length - 1"
                class="p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-card)] rounded disabled:opacity-30 disabled:cursor-not-allowed"
                title="Descendre"
              >
                <font-awesome-icon :icon="['fas', 'chevron-down']" />
              </button>
              <button
                @click="toggleVisibility(section)"
                class="p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-card)] rounded"
                :title="section.est_visible ? 'Masquer' : 'Afficher'"
              >
                <font-awesome-icon :icon="section.est_visible ? ['fas', 'eye'] : ['fas', 'eye-slash']" />
              </button>
              <button
                @click="editSection(section)"
                class="p-2 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded"
                title="Modifier"
              >
                <font-awesome-icon :icon="['fas', 'edit']" />
              </button>
              <button
                @click="confirmDeleteSection(section)"
                class="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                title="Supprimer"
              >
                <font-awesome-icon :icon="['fas', 'trash']" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Add section modal -->
    <UiModal v-model="showAddSectionModal" title="Ajouter une section" size="lg">
      <p class="text-[var(--text-secondary)] mb-4">
        Choisissez le type de section à ajouter :
      </p>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
        <button
          v-for="type in sectionTypes"
          :key="type.value"
          @click="createSection(type.value)"
          class="p-4 border border-[var(--border-default)] rounded-lg hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-colors text-left"
        >
          <font-awesome-icon :icon="getSectionIcon(type.value)" class="text-[var(--color-primary)] text-xl mb-2" />
          <p class="font-medium text-[var(--text-primary)]">{{ type.label }}</p>
          <p class="text-xs text-[var(--text-muted)]">{{ type.description }}</p>
        </button>
      </div>
    </UiModal>

    <!-- Edit section modal -->
    <UiModal v-model="showEditSectionModal" :title="editingSection?.titre || 'Modifier la section'" size="xl">
      <AdminCmsSectionEditor
        v-if="editingSection"
        :section="editingSection"
        @save="saveSectionChanges"
        @cancel="showEditSectionModal = false"
      />
    </UiModal>

    <!-- Delete section confirmation -->
    <UiModal v-model="showDeleteSectionModal" title="Supprimer la section" size="sm">
      <p class="text-[var(--text-secondary)]">
        Êtes-vous sûr de vouloir supprimer cette section ?
        Cette action est irréversible.
      </p>
      <template #footer>
        <div class="flex justify-end gap-3">
          <UiButton variant="outline" @click="showDeleteSectionModal = false">
            Annuler
          </UiButton>
          <UiButton variant="danger" @click="deleteSection" :loading="deletingSection">
            Supprimer
          </UiButton>
        </div>
      </template>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import type { PageCMS, SectionCMS, SectionType } from '~/services/cms.service'
import { useCMSService } from '~/services/cms.service'

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

const route = useRoute()
const router = useRouter()
const cmsService = useCMSService()
const toast = useToast()

// State
const page = ref<PageCMS | null>(null)
const sections = ref<SectionCMS[]>([])
const loading = ref(true)
const saving = ref(false)
const isEditing = ref(false)

// Form
const form = ref({
  titre: '',
  slug: '',
  description: '',
  meta_title: '',
  meta_description: '',
})
const formErrors = ref<Record<string, string>>({})

// Section modals
const showAddSectionModal = ref(false)
const showEditSectionModal = ref(false)
const showDeleteSectionModal = ref(false)
const editingSection = ref<SectionCMS | null>(null)
const sectionToDelete = ref<SectionCMS | null>(null)
const deletingSection = ref(false)

// Section types
const sectionTypes = cmsService.getSectionTypes()

// Methods
const getStatutVariant = (statut: string) => {
  switch (statut) {
    case 'publie': return 'success'
    case 'brouillon': return 'warning'
    case 'archive': return 'neutral'
    default: return 'neutral'
  }
}

const getStatutLabel = (statut: string) => {
  switch (statut) {
    case 'publie': return 'Publiée'
    case 'brouillon': return 'Brouillon'
    case 'archive': return 'Archivée'
    default: return statut
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const getSectionIcon = (type: SectionType) => {
  const icons: Record<SectionType, string[]> = {
    editorjs: ['fas', 'align-left'],
    bloc_image_gauche: ['fas', 'image'],
    bloc_image_droite: ['fas', 'image'],
    carte_fond_image: ['fas', 'id-card'],
    grille_cartes: ['fas', 'th-large'],
    galerie_photos: ['fas', 'images'],
    liens_utiles: ['fas', 'link'],
    note_informative: ['fas', 'info-circle'],
    tableau_financier: ['fas', 'table'],
    graphiques_analytiques: ['fas', 'chart-bar'],
  }
  return icons[type] || ['fas', 'puzzle-piece']
}

const getSectionTypeLabel = (type: SectionType) => {
  const found = sectionTypes.find(t => t.value === type)
  return found?.label || type
}

const loadPage = async () => {
  loading.value = true
  try {
    const [pageData, sectionsData] = await Promise.all([
      cmsService.getPage(route.params.id as string),
      cmsService.getSections(route.params.id as string),
    ])
    page.value = pageData
    sections.value = sectionsData.sort((a, b) => a.ordre - b.ordre)

    // Populate form
    form.value = {
      titre: pageData.titre,
      slug: pageData.slug,
      description: pageData.description || '',
      meta_title: pageData.meta_title || '',
      meta_description: pageData.meta_description || '',
    }
  } catch (e) {
    console.error('Erreur chargement page:', e)
    // Mock data for development
    page.value = {
      id: route.params.id as string,
      compte_administratif_id: '1',
      titre: 'Compte Administratif 2024 - Antananarivo',
      slug: 'ca-2024-antananarivo',
      description: 'Présentation complète du compte administratif de la commune d\'Antananarivo pour l\'exercice 2024.',
      statut: 'brouillon',
      ordre: 1,
      created_at: '2024-01-10',
      updated_at: '2024-03-15',
      compte_administratif: { id: '1', annee: 2024, commune: { id: '1', nom: 'Antananarivo' } },
    }
    sections.value = [
      { id: '1', page_id: route.params.id as string, type: 'editorjs', titre: 'Introduction', contenu: {}, ordre: 1, est_visible: true, created_at: '', updated_at: '' },
      { id: '2', page_id: route.params.id as string, type: 'tableau_financier', titre: 'Recettes', contenu: { type: 'recettes' }, ordre: 2, est_visible: true, created_at: '', updated_at: '' },
      { id: '3', page_id: route.params.id as string, type: 'graphiques_analytiques', titre: 'Évolution', contenu: { type: 'bar' }, ordre: 3, est_visible: false, created_at: '', updated_at: '' },
    ]

    form.value = {
      titre: page.value.titre,
      slug: page.value.slug,
      description: page.value.description || '',
      meta_title: page.value.meta_title || '',
      meta_description: page.value.meta_description || '',
    }
  } finally {
    loading.value = false
  }
}

const cancelEdit = () => {
  isEditing.value = false
  if (page.value) {
    form.value = {
      titre: page.value.titre,
      slug: page.value.slug,
      description: page.value.description || '',
      meta_title: page.value.meta_title || '',
      meta_description: page.value.meta_description || '',
    }
  }
}

const saveChanges = async () => {
  formErrors.value = {}

  if (!form.value.titre?.trim()) {
    formErrors.value.titre = 'Le titre est requis'
    return
  }

  saving.value = true
  try {
    const updated = await cmsService.updatePage(page.value!.id, form.value)
    page.value = updated
    toast.success('Page mise à jour avec succès')
    isEditing.value = false
  } catch (e: any) {
    toast.error(e?.message || 'Erreur lors de la mise à jour')
  } finally {
    saving.value = false
  }
}

const publierPage = async () => {
  try {
    const updated = await cmsService.publierPage(page.value!.id)
    page.value = updated
    toast.success('Page publiée avec succès')
  } catch (e: any) {
    toast.error(e?.message || 'Erreur lors de la publication')
  }
}

const archiverPage = async () => {
  try {
    const updated = await cmsService.archiverPage(page.value!.id)
    page.value = updated
    toast.success('Page archivée avec succès')
  } catch (e: any) {
    toast.error(e?.message || 'Erreur lors de l\'archivage')
  }
}

const previewPage = async () => {
  try {
    const previewUrl = await cmsService.previewPage(page.value!.id)
    window.open(previewUrl, '_blank')
  } catch (e: any) {
    // In development, just open the public page
    window.open(`/compte-administratif/${page.value!.slug}`, '_blank')
  }
}

// Section management
const openAddSectionModal = () => {
  showAddSectionModal.value = true
}

const createSection = async (type: SectionType) => {
  try {
    const newSection = await cmsService.createSection(page.value!.id, {
      type,
      contenu: getDefaultContent(type),
      ordre: sections.value.length + 1,
      est_visible: true,
    })
    sections.value.push(newSection)
    showAddSectionModal.value = false
    toast.success('Section ajoutée')
    editSection(newSection)
  } catch (e: any) {
    // Mock for development
    const mockSection: SectionCMS = {
      id: String(Date.now()),
      page_id: page.value!.id,
      type,
      contenu: getDefaultContent(type),
      ordre: sections.value.length + 1,
      est_visible: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    sections.value.push(mockSection)
    showAddSectionModal.value = false
    toast.success('Section ajoutée')
    editSection(mockSection)
  }
}

const getDefaultContent = (type: SectionType): Record<string, any> => {
  switch (type) {
    case 'editorjs':
      return { blocks: [] }
    case 'bloc_image_gauche':
    case 'bloc_image_droite':
      return { image_url: '', texte: '' }
    case 'carte_fond_image':
      return { titre: '', description: '', image_url: '' }
    case 'grille_cartes':
      return { cartes: [], colonnes: 3 }
    case 'galerie_photos':
      return { images: [] }
    case 'liens_utiles':
      return { liens: [] }
    case 'note_informative':
      return { type: 'info', contenu: '' }
    case 'tableau_financier':
      return { type: 'recettes' }
    case 'graphiques_analytiques':
      return { type: 'bar', donnees_source: 'recettes' }
    default:
      return {}
  }
}

const editSection = (section: SectionCMS) => {
  editingSection.value = { ...section }
  showEditSectionModal.value = true
}

const saveSectionChanges = async (updatedSection: Partial<SectionCMS>) => {
  if (!editingSection.value) return

  try {
    const updated = await cmsService.updateSection(
      page.value!.id,
      editingSection.value.id,
      updatedSection
    )
    const index = sections.value.findIndex(s => s.id === editingSection.value!.id)
    if (index !== -1) {
      sections.value[index] = updated
    }
    showEditSectionModal.value = false
    toast.success('Section mise à jour')
  } catch (e: any) {
    // Mock for development
    const index = sections.value.findIndex(s => s.id === editingSection.value!.id)
    if (index !== -1) {
      sections.value[index] = { ...sections.value[index], ...updatedSection }
    }
    showEditSectionModal.value = false
    toast.success('Section mise à jour')
  }
}

const confirmDeleteSection = (section: SectionCMS) => {
  sectionToDelete.value = section
  showDeleteSectionModal.value = true
}

const deleteSection = async () => {
  if (!sectionToDelete.value) return

  deletingSection.value = true
  try {
    await cmsService.deleteSection(page.value!.id, sectionToDelete.value.id)
    sections.value = sections.value.filter(s => s.id !== sectionToDelete.value!.id)
    showDeleteSectionModal.value = false
    toast.success('Section supprimée')
  } catch (e: any) {
    // Mock for development
    sections.value = sections.value.filter(s => s.id !== sectionToDelete.value!.id)
    showDeleteSectionModal.value = false
    toast.success('Section supprimée')
  } finally {
    deletingSection.value = false
  }
}

const toggleVisibility = async (section: SectionCMS) => {
  try {
    const updated = await cmsService.toggleSectionVisibility(page.value!.id, section.id)
    const index = sections.value.findIndex(s => s.id === section.id)
    if (index !== -1) {
      sections.value[index] = updated
    }
  } catch (e: any) {
    // Mock for development
    const index = sections.value.findIndex(s => s.id === section.id)
    if (index !== -1) {
      sections.value[index].est_visible = !sections.value[index].est_visible
    }
  }
}

const moveSection = async (index: number, direction: number) => {
  const newIndex = index + direction
  if (newIndex < 0 || newIndex >= sections.value.length) return

  const temp = sections.value[index]
  sections.value[index] = sections.value[newIndex]
  sections.value[newIndex] = temp

  // Update ordre
  sections.value.forEach((s, i) => {
    s.ordre = i + 1
  })

  try {
    await cmsService.reorderSections(
      page.value!.id,
      sections.value.map((s, i) => ({ id: s.id, ordre: i + 1 }))
    )
  } catch (e) {
    console.error('Erreur réordonnement:', e)
  }
}

// Load on mount
onMounted(() => {
  loadPage()
})
</script>
