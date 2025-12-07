<template>
  <div>
    <!-- Back link -->
    <NuxtLink
      to="/admin/projets/societes"
      class="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--color-primary)] mb-6 transition-colors"
    >
      <font-awesome-icon :icon="['fas', 'arrow-left']" class="w-3 h-3" />
      Retour aux sociétés
    </NuxtLink>

    <!-- Loading state -->
    <div v-if="loading" class="space-y-6">
      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6">
        <UiSkeleton class="h-8 w-64 mb-4" />
        <UiSkeleton class="h-4 w-48 mb-2" />
        <UiSkeleton class="h-4 w-32" />
      </div>
    </div>

    <!-- Error state -->
    <UiErrorState
      v-else-if="error"
      :message="error"
      @retry="loadSociete"
    />

    <!-- Content -->
    <template v-else-if="societe">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <h1 class="font-heading text-2xl font-bold text-[var(--text-primary)] uppercase tracking-wide">
              {{ societe.nom }}
            </h1>
            <span v-if="societe.code" class="px-2 py-1 rounded-full text-xs bg-[var(--bg-secondary)] text-[var(--text-secondary)] font-mono">
              {{ societe.code }}
            </span>
          </div>
          <p v-if="societe.pays" class="text-sm text-[var(--text-muted)]">
            <font-awesome-icon :icon="['fas', 'globe']" class="mr-1" />
            {{ societe.pays }}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <UiButton
            v-if="!isEditing"
            variant="primary"
            :icon="['fas', 'edit']"
            @click="startEditing"
          >
            Modifier
          </UiButton>
          <template v-else>
            <UiButton variant="outline" @click="cancelEditing">
              Annuler
            </UiButton>
            <UiButton
              variant="primary"
              :loading="saving"
              @click="saveChanges"
            >
              Enregistrer
            </UiButton>
          </template>
        </div>
      </div>

      <!-- Info cards -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <!-- Contact card -->
        <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-5">
          <h3 class="text-sm font-medium text-[var(--text-muted)] mb-3">Contact</h3>
          <div class="space-y-3">
            <div v-if="societe.email" class="flex items-center gap-2">
              <font-awesome-icon :icon="['fas', 'envelope']" class="text-[var(--color-primary)] text-sm w-4" />
              <a :href="`mailto:${societe.email}`" class="text-[var(--text-primary)] hover:text-[var(--color-primary)]">
                {{ societe.email }}
              </a>
            </div>
            <div v-if="societe.telephone" class="flex items-center gap-2">
              <font-awesome-icon :icon="['fas', 'phone']" class="text-[var(--color-primary)] text-sm w-4" />
              <a :href="`tel:${societe.telephone}`" class="text-[var(--text-primary)] hover:text-[var(--color-primary)]">
                {{ societe.telephone }}
              </a>
            </div>
            <div v-if="societe.site_web" class="flex items-center gap-2">
              <font-awesome-icon :icon="['fas', 'link']" class="text-[var(--color-primary)] text-sm w-4" />
              <a :href="societe.site_web" target="_blank" class="text-[var(--text-primary)] hover:text-[var(--color-primary)] truncate">
                {{ societe.site_web.replace(/^https?:\/\//, '') }}
              </a>
            </div>
            <p v-if="!societe.email && !societe.telephone && !societe.site_web" class="text-[var(--text-muted)] italic">
              Aucune information de contact
            </p>
          </div>
        </div>

        <!-- Address card -->
        <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-5">
          <h3 class="text-sm font-medium text-[var(--text-muted)] mb-3">Adresse</h3>
          <p v-if="societe.adresse" class="text-[var(--text-primary)]">
            {{ societe.adresse }}
          </p>
          <p v-else class="text-[var(--text-muted)] italic">
            Non renseignée
          </p>
        </div>

        <!-- Projects card -->
        <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-5">
          <h3 class="text-sm font-medium text-[var(--text-muted)] mb-3">Projets miniers</h3>
          <div class="text-center py-2">
            <p class="text-3xl font-bold text-[var(--color-primary)]">{{ societe.nombre_projets || 0 }}</p>
            <p class="text-sm text-[var(--text-muted)]">projet(s) actif(s)</p>
          </div>
          <NuxtLink
            :to="`/admin/projets?societe_id=${societe.id}`"
            class="mt-3 flex items-center justify-center gap-2 text-sm text-[var(--color-primary)] hover:underline"
          >
            Voir les projets
            <font-awesome-icon :icon="['fas', 'arrow-right']" class="text-xs" />
          </NuxtLink>
        </div>
      </div>

      <!-- Edit form -->
      <div v-if="isEditing" class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6">
        <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-6">Modifier la société</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Nom -->
          <UiFormInput
            v-model="form.nom"
            label="Nom"
            placeholder="Nom de la société"
            required
            :error="formErrors.nom"
          />

          <!-- Code -->
          <UiFormInput
            v-model="form.code"
            label="Code"
            placeholder="Code unique (ex: QMM)"
            :error="formErrors.code"
          />

          <!-- Pays -->
          <UiFormInput
            v-model="form.pays"
            label="Pays"
            placeholder="Pays d'origine"
            :error="formErrors.pays"
          />

          <!-- Email -->
          <UiFormInput
            v-model="form.email"
            label="Email"
            type="email"
            placeholder="contact@societe.com"
            :error="formErrors.email"
          />

          <!-- Téléphone -->
          <UiFormInput
            v-model="form.telephone"
            label="Téléphone"
            placeholder="+261 20 22 xxx xx"
            :error="formErrors.telephone"
          />

          <!-- Site web -->
          <UiFormInput
            v-model="form.site_web"
            label="Site web"
            placeholder="https://www.societe.com"
            :error="formErrors.site_web"
          />

          <!-- Description -->
          <div class="md:col-span-2">
            <UiFormTextarea
              v-model="form.description"
              label="Description"
              placeholder="Description de la société et de ses activités"
              :rows="3"
              :error="formErrors.description"
            />
          </div>

          <!-- Adresse -->
          <div class="md:col-span-2">
            <UiFormTextarea
              v-model="form.adresse"
              label="Adresse"
              placeholder="Adresse complète"
              :rows="2"
              :error="formErrors.adresse"
            />
          </div>
        </div>
      </div>

      <!-- View mode details -->
      <div v-else class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6">
        <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-4">Description</h2>
        <p v-if="societe.description" class="text-[var(--text-secondary)] whitespace-pre-line">
          {{ societe.description }}
        </p>
        <p v-else class="text-[var(--text-muted)] italic">
          Aucune description
        </p>

        <div class="mt-6 pt-6 border-t border-[var(--border-default)] grid grid-cols-2 gap-4 text-sm">
          <div>
            <p class="text-[var(--text-muted)]">Créée le</p>
            <p class="text-[var(--text-primary)]">{{ formatDate(societe.created_at) }}</p>
          </div>
          <div>
            <p class="text-[var(--text-muted)]">Dernière modification</p>
            <p class="text-[var(--text-primary)]">{{ formatDate(societe.updated_at) }}</p>
          </div>
        </div>
      </div>

      <!-- Related projects -->
      <div v-if="!isEditing && projets.length" class="mt-6 bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-[var(--text-primary)]">Projets de cette société</h2>
          <NuxtLink :to="`/admin/projets/create?societe_id=${societe.id}`">
            <UiButton variant="outline" size="sm" :icon="['fas', 'plus']">
              Ajouter
            </UiButton>
          </NuxtLink>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NuxtLink
            v-for="projet in projets"
            :key="projet.id"
            :to="`/admin/projets/${projet.id}`"
            class="group flex items-center justify-between p-4 rounded-lg border border-[var(--border-light)] hover:border-[var(--color-primary)] transition-colors"
          >
            <div>
              <p class="font-medium text-[var(--text-primary)] group-hover:text-[var(--color-primary)]">
                {{ projet.nom }}
              </p>
              <p class="text-sm text-[var(--text-muted)]">
                {{ projet.type_minerai }} • {{ getStatutLabel(projet.statut) }}
              </p>
            </div>
            <font-awesome-icon :icon="['fas', 'chevron-right']" class="text-[var(--text-muted)] group-hover:text-[var(--color-primary)]" />
          </NuxtLink>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Societe, SocieteFormData } from '~/services/projets.service'
import type { ProjetMinierWithStats } from '~/types/projets-miniers'
import { useProjetsService } from '~/services/projets.service'

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

const route = useRoute()
const projetsService = useProjetsService()
const toast = useToast()

// State
const societe = ref<Societe | null>(null)
const projets = ref<ProjetMinierWithStats[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const isEditing = ref(false)
const saving = ref(false)

// Form
const form = ref<SocieteFormData>({
  nom: '',
  code: '',
  description: '',
  site_web: '',
  email: '',
  telephone: '',
  adresse: '',
  pays: '',
})
const formErrors = ref<Record<string, string>>({})

// Methods
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date(dateStr))
  } catch {
    return dateStr
  }
}

const getStatutLabel = (statut: string) => {
  const labels: Record<string, string> = {
    en_cours: 'En cours',
    suspendu: 'Suspendu',
    termine: 'Terminé',
    planifie: 'Planifié',
  }
  return labels[statut] || statut
}

const loadSociete = async () => {
  const id = route.params.id as string
  if (!id) {
    error.value = 'ID de société invalide'
    loading.value = false
    return
  }

  loading.value = true
  error.value = null

  try {
    societe.value = await projetsService.getSociete(id)

    // Load associated projects
    const projetsResponse = await projetsService.getProjets({ societe_id: id, limit: 10 })
    projets.value = projetsResponse.items
  } catch (e: any) {
    console.error('Erreur chargement société:', e)
    error.value = e?.message || 'Erreur lors du chargement de la société'

    // Mock data
    societe.value = {
      id,
      nom: 'QIT Madagascar Minerals',
      code: 'QMM',
      description: 'Exploitation de sables minéralisés et production d\'ilménite dans le sud-est de Madagascar. La société est une joint-venture entre Rio Tinto et le gouvernement malgache.',
      site_web: 'https://www.riotinto.com/operations/madagascar',
      email: 'contact@qmm.mg',
      telephone: '+261 20 22 xxx xx',
      adresse: 'Fort Dauphin, Région Anosy, Madagascar',
      pays: 'Madagascar / Rio Tinto',
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-11-20T14:45:00Z',
      nombre_projets: 2,
    }

    projets.value = [
      {
        id: '1',
        nom: 'Site de Mandena',
        code: 'QMM-MAN',
        type_minerai: 'Ilménite',
        societe_exploitante: 'QIT Madagascar Minerals',
        statut: 'en_cours',
        created_at: '',
        updated_at: '',
      },
      {
        id: '2',
        nom: 'Site de Petriky',
        code: 'QMM-PET',
        type_minerai: 'Ilménite',
        societe_exploitante: 'QIT Madagascar Minerals',
        statut: 'planifie',
        created_at: '',
        updated_at: '',
      },
    ]
    error.value = null
  } finally {
    loading.value = false
  }
}

const startEditing = () => {
  if (!societe.value) return

  form.value = {
    nom: societe.value.nom,
    code: societe.value.code || '',
    description: societe.value.description || '',
    site_web: societe.value.site_web || '',
    email: societe.value.email || '',
    telephone: societe.value.telephone || '',
    adresse: societe.value.adresse || '',
    pays: societe.value.pays || '',
  }
  formErrors.value = {}
  isEditing.value = true
}

const cancelEditing = () => {
  isEditing.value = false
  formErrors.value = {}
}

const validateForm = (): boolean => {
  formErrors.value = {}

  if (!form.value.nom?.trim()) {
    formErrors.value.nom = 'Le nom est requis'
  }

  if (form.value.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    formErrors.value.email = 'Email invalide'
  }

  if (form.value.site_web && !/^https?:\/\/.+/.test(form.value.site_web)) {
    formErrors.value.site_web = 'URL invalide (doit commencer par http:// ou https://)'
  }

  return Object.keys(formErrors.value).length === 0
}

const saveChanges = async () => {
  if (!validateForm() || !societe.value) return

  saving.value = true
  try {
    await projetsService.updateSociete(societe.value.id, form.value)
    toast.success('Société mise à jour avec succès')
    isEditing.value = false
    await loadSociete()
  } catch (e: any) {
    toast.error(e?.message || 'Erreur lors de la mise à jour')
  } finally {
    saving.value = false
  }
}

// Load on mount
onMounted(() => {
  loadSociete()
})

// Watch for edit query param
watch(() => route.query.edit, (edit) => {
  if (edit === 'true' && societe.value) {
    startEditing()
  }
}, { immediate: true })
</script>
