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

    <!-- Header -->
    <div class="mb-6">
      <h1 class="font-heading text-2xl font-bold text-[var(--text-primary)] uppercase tracking-wide">
        Nouvelle page CMS
      </h1>
      <p class="mt-1 text-sm text-[var(--text-secondary)]">
        Créer une nouvelle page pour un compte administratif
      </p>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6">
        <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-6">Association au compte</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Compte administratif -->
          <UiFormSelect
            v-model="form.compte_administratif_id"
            label="Compte administratif"
            :options="compteOptions"
            placeholder="Sélectionner un compte"
            required
            :error="formErrors.compte_administratif_id"
            hint="La page sera liée à ce compte administratif"
          />

          <!-- Statut initial -->
          <UiFormSelect
            v-model="form.statut"
            label="Statut initial"
            :options="statutOptions"
            :error="formErrors.statut"
          />
        </div>
      </div>

      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6">
        <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-6">Informations de la page</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Titre -->
          <UiFormInput
            v-model="form.titre"
            label="Titre de la page"
            placeholder="Ex: Compte Administratif 2024"
            required
            :error="formErrors.titre"
          />

          <!-- Slug -->
          <UiFormInput
            v-model="form.slug"
            label="Slug (URL)"
            placeholder="url-de-la-page"
            :error="formErrors.slug"
            hint="Laissez vide pour générer automatiquement depuis le titre"
          />

          <!-- Description -->
          <div class="md:col-span-2">
            <UiFormTextarea
              v-model="form.description"
              label="Description"
              placeholder="Description courte de la page (visible dans la liste)"
              :rows="2"
              :error="formErrors.description"
            />
          </div>

          <!-- Ordre -->
          <UiFormInput
            v-model.number="form.ordre"
            label="Ordre d'affichage"
            type="number"
            placeholder="1"
            hint="Ordre de tri dans la liste des pages"
          />
        </div>
      </div>

      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6">
        <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-6">SEO (optionnel)</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Meta title -->
          <UiFormInput
            v-model="form.meta_title"
            label="Meta Title"
            placeholder="Titre pour les moteurs de recherche"
            hint="Si vide, le titre de la page sera utilisé"
          />

          <!-- Meta description -->
          <UiFormInput
            v-model="form.meta_description"
            label="Meta Description"
            placeholder="Description pour les moteurs de recherche"
            hint="Si vide, la description de la page sera utilisée"
          />
        </div>
      </div>

      <!-- Preview card -->
      <div v-if="selectedCompte" class="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-default)] p-4">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center">
            <font-awesome-icon :icon="['fas', 'file-alt']" class="text-[var(--color-primary)] text-lg" />
          </div>
          <div class="flex-1">
            <p class="font-medium text-[var(--text-primary)]">
              {{ form.titre || 'Titre de la page' }}
            </p>
            <p class="text-sm text-[var(--text-muted)]">
              {{ selectedCompte.commune?.nom || 'Commune' }} - Exercice {{ selectedCompte.annee }}
            </p>
          </div>
          <div class="text-right">
            <UiBadge :variant="form.statut === 'brouillon' ? 'warning' : form.statut === 'publie' ? 'success' : 'neutral'">
              {{ form.statut === 'brouillon' ? 'Brouillon' : form.statut === 'publie' ? 'Publiée' : 'Archivée' }}
            </UiBadge>
            <p v-if="form.slug" class="text-xs text-[var(--text-muted)] mt-1 font-mono">
              /{{ form.slug }}
            </p>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-end gap-3">
        <UiButton
          type="button"
          variant="outline"
          @click="router.push('/admin/cms/pages')"
        >
          Annuler
        </UiButton>
        <UiButton
          type="submit"
          variant="primary"
          :loading="saving"
          :icon="['fas', 'plus']"
        >
          Créer la page
        </UiButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import type { PageCMSFormData } from '~/services/cms.service'
import { useCMSService } from '~/services/cms.service'
import { useComptesAdministratifsService } from '~/services/comptes-administratifs.service'

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

const route = useRoute()
const router = useRouter()
const cmsService = useCMSService()
const comptesService = useComptesAdministratifsService()
const toast = useToast()

// State
const comptes = ref<Array<{ id: string; annee: number; commune?: { id: string; nom: string } }>>([])
const saving = ref(false)

// Form
const form = ref<PageCMSFormData>({
  compte_administratif_id: '',
  titre: '',
  slug: '',
  description: '',
  statut: 'brouillon',
  meta_title: '',
  meta_description: '',
  ordre: 1,
})
const formErrors = ref<Record<string, string>>({})

// Computed
const selectedCompte = computed(() =>
  comptes.value.find(c => c.id === form.value.compte_administratif_id)
)

const compteOptions = computed(() =>
  comptes.value.map(c => ({
    value: c.id,
    label: `${c.commune?.nom || 'N/A'} - ${c.annee}`,
  }))
)

const statutOptions = [
  { value: 'brouillon', label: 'Brouillon' },
  { value: 'publie', label: 'Publiée' },
]

// Methods
const loadReferenceData = async () => {
  try {
    const comptesData = await comptesService.getComptes({ limit: 100 })
    comptes.value = comptesData.items
  } catch (e) {
    console.error('Erreur chargement comptes:', e)
    // Mock data for development
    comptes.value = [
      { id: '1', annee: 2024, commune: { id: '1', nom: 'Antananarivo' } },
      { id: '2', annee: 2024, commune: { id: '2', nom: 'Toamasina' } },
      { id: '3', annee: 2023, commune: { id: '3', nom: 'Fianarantsoa' } },
      { id: '4', annee: 2024, commune: { id: '4', nom: 'Mahajanga' } },
      { id: '5', annee: 2023, commune: { id: '5', nom: 'Toliara' } },
    ]
  }

  // Pre-fill compte if passed via query
  if (route.query.compte_id) {
    form.value.compte_administratif_id = route.query.compte_id as string
  }
}

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const validateForm = (): boolean => {
  formErrors.value = {}

  if (!form.value.compte_administratif_id) {
    formErrors.value.compte_administratif_id = 'Le compte administratif est requis'
  }

  if (!form.value.titre?.trim()) {
    formErrors.value.titre = 'Le titre est requis'
  }

  return Object.keys(formErrors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return

  // Generate slug if not provided
  if (!form.value.slug) {
    const compte = comptes.value.find(c => c.id === form.value.compte_administratif_id)
    form.value.slug = generateSlug(`${form.value.titre} ${compte?.commune?.nom || ''} ${compte?.annee || ''}`)
  }

  saving.value = true
  try {
    const newPage = await cmsService.createPage(form.value)
    toast.success('Page créée avec succès')
    router.push(`/admin/cms/pages/${newPage.id}`)
  } catch (e: any) {
    console.error('Erreur création page:', e)
    toast.error(e?.message || 'Erreur lors de la création de la page')
  } finally {
    saving.value = false
  }
}

// Watch titre to auto-generate slug suggestion
watch(() => form.value.titre, (newTitle) => {
  if (newTitle && !form.value.slug) {
    const compte = comptes.value.find(c => c.id === form.value.compte_administratif_id)
    if (compte) {
      form.value.slug = generateSlug(`${newTitle} ${compte.commune?.nom || ''} ${compte.annee}`)
    }
  }
})

// Load on mount
onMounted(() => {
  loadReferenceData()
})
</script>
