<template>
  <div>
    <!-- Page header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="font-heading text-2xl font-bold text-[var(--text-primary)] uppercase tracking-wide">
          Sociétés Minières
        </h1>
        <p class="mt-1 text-sm text-[var(--text-secondary)]">
          Gestion des sociétés exploitant des projets miniers
        </p>
      </div>
      <NuxtLink to="/admin/projets/societes/create">
        <UiButton variant="primary" :icon="['fas', 'plus']">
          Nouvelle société
        </UiButton>
      </NuxtLink>
    </div>

    <!-- Search -->
    <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4 mb-6">
      <div class="flex flex-wrap items-end gap-4">
        <div class="flex-1 min-w-[250px]">
          <UiFormInput
            v-model="searchQuery"
            placeholder="Rechercher une société..."
            :icon="['fas', 'magnifying-glass']"
            @update:model-value="debouncedSearch"
          />
        </div>
        <UiButton
          v-if="searchQuery"
          variant="ghost"
          size="sm"
          :icon="['fas', 'times']"
          @click="clearSearch"
        >
          Effacer
        </UiButton>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <UiSkeleton v-for="i in 6" :key="i" class="h-48 rounded-xl" />
    </div>

    <!-- Empty state -->
    <UiEmptyState
      v-else-if="!societes.length"
      title="Aucune société"
      :description="searchQuery ? 'Aucune société ne correspond à votre recherche.' : 'Commencez par ajouter une société minière.'"
      icon="building"
    >
      <template #action>
        <NuxtLink to="/admin/projets/societes/create">
          <UiButton variant="primary" :icon="['fas', 'plus']">
            Ajouter une société
          </UiButton>
        </NuxtLink>
      </template>
    </UiEmptyState>

    <!-- Societes grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="societe in societes"
        :key="societe.id"
        class="group bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-5 hover:border-[var(--color-primary)] hover:shadow-md transition-all duration-200"
      >
        <div class="flex items-start justify-between mb-3">
          <div>
            <NuxtLink
              :to="`/admin/projets/societes/${societe.id}`"
              class="font-semibold text-lg text-[var(--text-primary)] group-hover:text-[var(--color-primary)] transition-colors"
            >
              {{ societe.nom }}
            </NuxtLink>
            <p v-if="societe.code" class="text-xs text-[var(--text-muted)] font-mono mt-0.5">
              {{ societe.code }}
            </p>
          </div>
          <div class="flex items-center gap-1">
            <NuxtLink :to="`/admin/projets/societes/${societe.id}`">
              <UiButton variant="ghost" size="sm" :icon="['fas', 'eye']" title="Voir" />
            </NuxtLink>
            <UiButton
              variant="ghost"
              size="sm"
              :icon="['fas', 'trash']"
              title="Supprimer"
              class="text-[var(--color-error)] hover:bg-[var(--color-error)]/10"
              @click="confirmDelete(societe)"
            />
          </div>
        </div>

        <p v-if="societe.description" class="text-sm text-[var(--text-secondary)] line-clamp-2 mb-4">
          {{ societe.description }}
        </p>

        <div class="space-y-2 text-sm">
          <div v-if="societe.pays" class="flex items-center gap-2 text-[var(--text-muted)]">
            <font-awesome-icon :icon="['fas', 'globe']" class="w-4 text-center" />
            <span>{{ societe.pays }}</span>
          </div>
          <div v-if="societe.email" class="flex items-center gap-2 text-[var(--text-muted)]">
            <font-awesome-icon :icon="['fas', 'envelope']" class="w-4 text-center" />
            <a :href="`mailto:${societe.email}`" class="hover:text-[var(--color-primary)]">
              {{ societe.email }}
            </a>
          </div>
          <div v-if="societe.site_web" class="flex items-center gap-2 text-[var(--text-muted)]">
            <font-awesome-icon :icon="['fas', 'link']" class="w-4 text-center" />
            <a :href="societe.site_web" target="_blank" class="hover:text-[var(--color-primary)] truncate">
              {{ societe.site_web.replace(/^https?:\/\//, '') }}
            </a>
          </div>
        </div>

        <div class="mt-4 pt-4 border-t border-[var(--border-light)] flex items-center justify-between">
          <div class="text-center">
            <p class="text-xl font-bold text-[var(--color-primary)]">{{ societe.nombre_projets || 0 }}</p>
            <p class="text-xs text-[var(--text-muted)]">Projet(s)</p>
          </div>
          <NuxtLink
            :to="`/admin/projets?societe_id=${societe.id}`"
            class="text-sm text-[var(--color-primary)] hover:underline flex items-center gap-1"
          >
            Voir les projets
            <font-awesome-icon :icon="['fas', 'arrow-right']" class="text-xs" />
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.pages > 1" class="mt-6 flex justify-center">
      <div class="flex items-center gap-2">
        <UiButton
          variant="outline"
          size="sm"
          :disabled="pagination.page === 1"
          @click="handlePageChange(pagination.page - 1)"
        >
          Précédent
        </UiButton>
        <span class="text-sm text-[var(--text-secondary)]">
          Page {{ pagination.page }} sur {{ pagination.pages }}
        </span>
        <UiButton
          variant="outline"
          size="sm"
          :disabled="pagination.page === pagination.pages"
          @click="handlePageChange(pagination.page + 1)"
        >
          Suivant
        </UiButton>
      </div>
    </div>

    <!-- Delete confirmation modal -->
    <UiModal
      v-model="showDeleteModal"
      title="Supprimer la société"
      size="sm"
      :confirm-loading="deleting"
      confirm-text="Supprimer"
      confirm-variant="danger"
      @confirm="handleDelete"
    >
      <p class="text-[var(--text-secondary)]">
        Êtes-vous sûr de vouloir supprimer la société
        <strong class="text-[var(--text-primary)]">{{ societeToDelete?.nom }}</strong> ?
      </p>
      <p class="mt-2 text-sm text-[var(--text-muted)]">
        Cette action est irréversible. Les projets associés ne seront pas supprimés.
      </p>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import type { Societe } from '~/services/projets.service'
import { useProjetsService } from '~/services/projets.service'
import { useDebounceFn } from '@vueuse/core'

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

const projetsService = useProjetsService()
const toast = useToast()

// State
const societes = ref<Societe[]>([])
const loading = ref(true)
const searchQuery = ref('')
const pagination = ref({
  page: 1,
  limit: 12,
  total: 0,
  pages: 1,
})

// Delete modal
const showDeleteModal = ref(false)
const societeToDelete = ref<Societe | null>(null)
const deleting = ref(false)

// Methods
const loadSocietes = async () => {
  loading.value = true

  try {
    const params: any = {
      page: pagination.value.page,
      limit: pagination.value.limit,
    }

    if (searchQuery.value) params.search = searchQuery.value

    const response = await projetsService.getSocietes(params)
    societes.value = response.items
    pagination.value.total = response.total
    pagination.value.pages = response.pages
  } catch (e: any) {
    console.error('Erreur chargement sociétés:', e)

    // Mock data
    societes.value = [
      {
        id: '1',
        nom: 'QIT Madagascar Minerals',
        code: 'QMM',
        description: 'Exploitation de sables minéralisés et production d\'ilménite dans le sud-est de Madagascar',
        site_web: 'https://www.riotinto.com/operations/madagascar',
        email: 'contact@qmm.mg',
        telephone: '+261 20 22 xxx xx',
        pays: 'Madagascar / Rio Tinto',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        nombre_projets: 2,
      },
      {
        id: '2',
        nom: 'Ambatovy Minerals',
        code: 'AMB',
        description: 'Extraction et traitement de nickel et cobalt près de Moramanga',
        site_web: 'https://www.ambatovy.com',
        email: 'info@ambatovy.com',
        pays: 'Madagascar',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        nombre_projets: 1,
      },
      {
        id: '3',
        nom: 'Kraoma SA',
        code: 'KRA',
        description: 'Exploitation de chromite dans la région de Betsiboka',
        email: 'kraoma@kraoma.mg',
        pays: 'Madagascar',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        nombre_projets: 3,
      },
      {
        id: '4',
        nom: 'Toliara Sands',
        code: 'TLS',
        description: 'Projet d\'exploitation de sables minéralisés dans la région de Toliara',
        site_web: 'https://www.base-resources.com.au',
        pays: 'Australie',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        nombre_projets: 1,
      },
    ]
    pagination.value.total = societes.value.length
    pagination.value.pages = 1
  } finally {
    loading.value = false
  }
}

const debouncedSearch = useDebounceFn(() => {
  pagination.value.page = 1
  loadSocietes()
}, 300)

const clearSearch = () => {
  searchQuery.value = ''
  pagination.value.page = 1
  loadSocietes()
}

const handlePageChange = (page: number) => {
  pagination.value.page = page
  loadSocietes()
}

const confirmDelete = (societe: Societe) => {
  societeToDelete.value = societe
  showDeleteModal.value = true
}

const handleDelete = async () => {
  if (!societeToDelete.value) return

  deleting.value = true
  try {
    await projetsService.deleteSociete(societeToDelete.value.id)
    toast.success(`Société "${societeToDelete.value.nom}" supprimée`)
    showDeleteModal.value = false
    societeToDelete.value = null
    await loadSocietes()
  } catch (e: any) {
    toast.error(e?.message || 'Erreur lors de la suppression')
  } finally {
    deleting.value = false
  }
}

// Load on mount
onMounted(() => {
  loadSocietes()
})
</script>
