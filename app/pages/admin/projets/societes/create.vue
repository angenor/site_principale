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

    <!-- Header -->
    <div class="mb-6">
      <h1 class="font-heading text-2xl font-bold text-[var(--text-primary)] uppercase tracking-wide">
        Nouvelle société
      </h1>
      <p class="mt-1 text-sm text-[var(--text-secondary)]">
        Enregistrer une nouvelle société minière
      </p>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6">
        <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-6">Informations générales</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Nom -->
          <UiFormInput
            v-model="form.nom"
            label="Nom de la société"
            placeholder="Ex: QIT Madagascar Minerals"
            required
            :error="formErrors.nom"
          />

          <!-- Code -->
          <UiFormInput
            v-model="form.code"
            label="Code"
            placeholder="Ex: QMM"
            hint="Code court unique"
            :error="formErrors.code"
          />

          <!-- Pays -->
          <UiFormInput
            v-model="form.pays"
            label="Pays"
            placeholder="Ex: Madagascar"
            :error="formErrors.pays"
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
              placeholder="Description de la société et de ses activités minières"
              :rows="3"
              :error="formErrors.description"
            />
          </div>
        </div>
      </div>

      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6">
        <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-6">Contact</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          <!-- Adresse -->
          <div class="md:col-span-2">
            <UiFormTextarea
              v-model="form.adresse"
              label="Adresse"
              placeholder="Adresse complète du siège social"
              :rows="2"
              :error="formErrors.adresse"
            />
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-end gap-3">
        <UiButton
          type="button"
          variant="outline"
          @click="router.push('/admin/projets/societes')"
        >
          Annuler
        </UiButton>
        <UiButton
          type="submit"
          variant="primary"
          :loading="saving"
          :icon="['fas', 'plus']"
        >
          Créer la société
        </UiButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import type { SocieteFormData } from '~/services/projets.service'
import { useProjetsService } from '~/services/projets.service'

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

const router = useRouter()
const projetsService = useProjetsService()
const toast = useToast()

// State
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
const validateForm = (): boolean => {
  formErrors.value = {}

  if (!form.value.nom?.trim()) {
    formErrors.value.nom = 'Le nom est requis'
  } else if (form.value.nom.length < 2) {
    formErrors.value.nom = 'Le nom doit contenir au moins 2 caractères'
  }

  if (form.value.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    formErrors.value.email = 'Email invalide'
  }

  if (form.value.site_web && !/^https?:\/\/.+/.test(form.value.site_web)) {
    formErrors.value.site_web = 'URL invalide (doit commencer par http:// ou https://)'
  }

  return Object.keys(formErrors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return

  saving.value = true
  try {
    const newSociete = await projetsService.createSociete(form.value)
    toast.success(`Société "${form.value.nom}" créée avec succès`)
    router.push(`/admin/projets/societes/${newSociete.id}`)
  } catch (e: any) {
    console.error('Erreur création société:', e)
    toast.error(e?.message || 'Erreur lors de la création de la société')
  } finally {
    saving.value = false
  }
}
</script>
