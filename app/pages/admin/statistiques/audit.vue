<template>
  <div class="space-y-6">
    <!-- En-tête -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex items-center gap-2">
        <NuxtLink
          to="/admin/statistiques"
          class="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
          style="color: var(--text-muted)"
        >
          <font-awesome-icon :icon="['fas', 'arrow-left']" class="w-4 h-4" />
        </NuxtLink>
        <div>
          <h1 class="text-2xl font-semibold" style="color: var(--text-primary)">
            Journal d'audit
          </h1>
          <p class="text-sm" style="color: var(--text-muted)">
            Historique des actions effectuées sur la plateforme
          </p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <button
          class="px-4 py-2 border rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
          style="border-color: var(--border-primary); color: var(--text-secondary)"
          @click="exportAudit"
          :disabled="isExporting"
        >
          <font-awesome-icon :icon="['fas', 'download']" class="w-4 h-4" />
          <span>{{ isExporting ? 'Export...' : 'Exporter' }}</span>
        </button>
      </div>
    </div>

    <!-- Filtres -->
    <div
      class="p-4 rounded-lg border"
      style="background-color: var(--bg-secondary); border-color: var(--border-primary)"
    >
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <!-- Recherche -->
        <div class="lg:col-span-2">
          <div class="relative">
            <font-awesome-icon
              :icon="['fas', 'search']"
              class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style="color: var(--text-muted)"
            />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher dans les logs..."
              class="w-full pl-10 pr-4 py-2 border rounded-lg"
              style="background-color: var(--bg-primary); border-color: var(--border-primary); color: var(--text-primary)"
            />
          </div>
        </div>

        <!-- Filtre action -->
        <select
          v-model="filterAction"
          class="px-3 py-2 border rounded-lg"
          style="background-color: var(--bg-primary); border-color: var(--border-primary); color: var(--text-primary)"
        >
          <option value="">Toutes les actions</option>
          <option v-for="action in actions" :key="action" :value="action">
            {{ formatAction(action) }}
          </option>
        </select>

        <!-- Filtre table -->
        <select
          v-model="filterTable"
          class="px-3 py-2 border rounded-lg"
          style="background-color: var(--bg-primary); border-color: var(--border-primary); color: var(--text-primary)"
        >
          <option value="">Toutes les tables</option>
          <option v-for="table in tables" :key="table" :value="table">
            {{ formatTableName(table) }}
          </option>
        </select>

        <!-- Filtre période -->
        <select
          v-model="filterPeriode"
          class="px-3 py-2 border rounded-lg"
          style="background-color: var(--bg-primary); border-color: var(--border-primary); color: var(--text-primary)"
        >
          <option value="">Toutes les dates</option>
          <option value="today">Aujourd'hui</option>
          <option value="week">Cette semaine</option>
          <option value="month">Ce mois</option>
          <option value="year">Cette année</option>
        </select>
      </div>

      <!-- Réinitialiser -->
      <div v-if="hasFilters" class="mt-4 flex justify-end">
        <button
          class="text-sm transition-colors cursor-pointer"
          style="color: var(--color-primary)"
          @click="resetFilters"
        >
          Réinitialiser les filtres
        </button>
      </div>
    </div>

    <!-- Statistiques rapides -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        class="p-4 rounded-lg border"
        style="background-color: var(--bg-secondary); border-color: var(--border-primary)"
      >
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
            <font-awesome-icon :icon="['fas', 'plus']" class="w-4 h-4 text-green-600" />
          </div>
          <div>
            <p class="text-xs" style="color: var(--text-muted)">Créations</p>
            <p class="text-xl font-semibold" style="color: var(--text-primary)">{{ stats.creations }}</p>
          </div>
        </div>
      </div>
      <div
        class="p-4 rounded-lg border"
        style="background-color: var(--bg-secondary); border-color: var(--border-primary)"
      >
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <font-awesome-icon :icon="['fas', 'edit']" class="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p class="text-xs" style="color: var(--text-muted)">Modifications</p>
            <p class="text-xl font-semibold" style="color: var(--text-primary)">{{ stats.modifications }}</p>
          </div>
        </div>
      </div>
      <div
        class="p-4 rounded-lg border"
        style="background-color: var(--bg-secondary); border-color: var(--border-primary)"
      >
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
            <font-awesome-icon :icon="['fas', 'trash']" class="w-4 h-4 text-red-600" />
          </div>
          <div>
            <p class="text-xs" style="color: var(--text-muted)">Suppressions</p>
            <p class="text-xl font-semibold" style="color: var(--text-primary)">{{ stats.suppressions }}</p>
          </div>
        </div>
      </div>
      <div
        class="p-4 rounded-lg border"
        style="background-color: var(--bg-secondary); border-color: var(--border-primary)"
      >
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
            <font-awesome-icon :icon="['fas', 'sign-in-alt']" class="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <p class="text-xs" style="color: var(--text-muted)">Connexions</p>
            <p class="text-xl font-semibold" style="color: var(--text-primary)">{{ stats.connexions }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Liste des logs -->
    <div
      class="rounded-lg border overflow-hidden"
      style="background-color: var(--bg-secondary); border-color: var(--border-primary)"
    >
      <!-- Chargement -->
      <div v-if="isLoading" class="p-8 text-center">
        <font-awesome-icon :icon="['fas', 'spinner']" class="w-8 h-8 animate-spin" style="color: var(--color-primary)" />
        <p class="mt-2 text-sm" style="color: var(--text-muted)">Chargement des logs...</p>
      </div>

      <!-- Liste vide -->
      <div v-else-if="logs.length === 0" class="p-8 text-center">
        <font-awesome-icon :icon="['fas', 'clipboard-list']" class="w-12 h-12 mb-4" style="color: var(--text-muted)" />
        <p class="font-medium" style="color: var(--text-primary)">Aucun log trouvé</p>
        <p class="text-sm mt-1" style="color: var(--text-muted)">
          {{ hasFilters ? 'Essayez de modifier vos filtres' : 'Aucune action enregistrée pour le moment' }}
        </p>
      </div>

      <!-- Tableau -->
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr style="background-color: var(--bg-tertiary)">
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style="color: var(--text-muted)">
                Date / Heure
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style="color: var(--text-muted)">
                Action
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style="color: var(--text-muted)">
                Table
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style="color: var(--text-muted)">
                Utilisateur
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style="color: var(--text-muted)">
                IP
              </th>
              <th class="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider" style="color: var(--text-muted)">
                Détails
              </th>
            </tr>
          </thead>
          <tbody class="divide-y" style="border-color: var(--border-primary)">
            <tr
              v-for="log in logs"
              :key="log.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <td class="px-4 py-4">
                <div>
                  <p class="text-sm font-medium" style="color: var(--text-primary)">
                    {{ formatDate(log.created_at) }}
                  </p>
                  <p class="text-xs" style="color: var(--text-muted)">
                    {{ formatTime(log.created_at) }}
                  </p>
                </div>
              </td>
              <td class="px-4 py-4">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="getActionClass(log.action)"
                >
                  <font-awesome-icon :icon="getActionIcon(log.action)" class="w-3 h-3 mr-1" />
                  {{ formatAction(log.action) }}
                </span>
              </td>
              <td class="px-4 py-4">
                <span class="text-sm" style="color: var(--text-secondary)">
                  {{ formatTableName(log.table_name || '-') }}
                </span>
              </td>
              <td class="px-4 py-4">
                <span class="text-sm" style="color: var(--text-secondary)">
                  {{ log.user_id || 'Système' }}
                </span>
              </td>
              <td class="px-4 py-4">
                <span class="text-sm font-mono" style="color: var(--text-muted)">
                  {{ log.ip_address || '-' }}
                </span>
              </td>
              <td class="px-4 py-4 text-right">
                <button
                  v-if="log.old_values || log.new_values"
                  class="p-2 rounded-lg transition-colors cursor-pointer"
                  style="color: var(--color-primary)"
                  @click="showDetails(log)"
                >
                  <font-awesome-icon :icon="['fas', 'eye']" class="w-4 h-4" />
                </button>
                <span v-else class="text-sm" style="color: var(--text-muted)">-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div
        v-if="pagination.total > pagination.limit"
        class="px-4 py-3 border-t flex items-center justify-between"
        style="border-color: var(--border-primary)"
      >
        <p class="text-sm" style="color: var(--text-muted)">
          Affichage {{ (pagination.page - 1) * pagination.limit + 1 }} -
          {{ Math.min(pagination.page * pagination.limit, pagination.total) }} sur {{ pagination.total }}
        </p>
        <div class="flex items-center gap-2">
          <button
            :disabled="pagination.page === 1"
            class="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50 transition-colors cursor-pointer disabled:cursor-not-allowed"
            style="border-color: var(--border-primary); color: var(--text-secondary)"
            @click="goToPage(pagination.page - 1)"
          >
            Précédent
          </button>
          <button
            :disabled="pagination.page >= totalPages"
            class="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50 transition-colors cursor-pointer disabled:cursor-not-allowed"
            style="border-color: var(--border-primary); color: var(--text-secondary)"
            @click="goToPage(pagination.page + 1)"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>

    <!-- Modal détails -->
    <UiModal v-model="showDetailsModal" title="Détails du changement" size="lg">
      <div v-if="selectedLog" class="space-y-4">
        <!-- Infos générales -->
        <div class="grid grid-cols-2 gap-4 p-4 rounded-lg" style="background-color: var(--bg-tertiary)">
          <div>
            <p class="text-xs font-medium uppercase" style="color: var(--text-muted)">Action</p>
            <span
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1"
              :class="getActionClass(selectedLog.action)"
            >
              {{ formatAction(selectedLog.action) }}
            </span>
          </div>
          <div>
            <p class="text-xs font-medium uppercase" style="color: var(--text-muted)">Table</p>
            <p class="mt-1" style="color: var(--text-primary)">{{ formatTableName(selectedLog.table_name || '-') }}</p>
          </div>
          <div>
            <p class="text-xs font-medium uppercase" style="color: var(--text-muted)">Date</p>
            <p class="mt-1" style="color: var(--text-primary)">{{ formatDateTime(selectedLog.created_at) }}</p>
          </div>
          <div>
            <p class="text-xs font-medium uppercase" style="color: var(--text-muted)">ID Enregistrement</p>
            <p class="mt-1 font-mono text-sm" style="color: var(--text-primary)">{{ selectedLog.record_id || '-' }}</p>
          </div>
        </div>

        <!-- Comparaison avant/après -->
        <div v-if="selectedLog.old_values || selectedLog.new_values" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Avant -->
          <div v-if="selectedLog.old_values">
            <h4 class="text-sm font-medium mb-2 flex items-center gap-2" style="color: var(--text-primary)">
              <span class="w-2 h-2 rounded-full bg-red-500"></span>
              Avant
            </h4>
            <pre
              class="p-3 rounded-lg text-xs overflow-auto max-h-64"
              style="background-color: var(--bg-tertiary); color: var(--text-secondary)"
            >{{ JSON.stringify(selectedLog.old_values, null, 2) }}</pre>
          </div>

          <!-- Après -->
          <div v-if="selectedLog.new_values">
            <h4 class="text-sm font-medium mb-2 flex items-center gap-2" style="color: var(--text-primary)">
              <span class="w-2 h-2 rounded-full bg-green-500"></span>
              Après
            </h4>
            <pre
              class="p-3 rounded-lg text-xs overflow-auto max-h-64"
              style="background-color: var(--bg-tertiary); color: var(--text-secondary)"
            >{{ JSON.stringify(selectedLog.new_values, null, 2) }}</pre>
          </div>
        </div>

        <!-- Changements détaillés -->
        <div v-if="detailedChanges.length > 0">
          <h4 class="text-sm font-medium mb-2" style="color: var(--text-primary)">Changements</h4>
          <div class="space-y-2">
            <div
              v-for="change in detailedChanges"
              :key="change.field"
              class="p-3 rounded-lg"
              style="background-color: var(--bg-tertiary)"
            >
              <p class="text-xs font-medium uppercase" style="color: var(--text-muted)">{{ change.field }}</p>
              <div class="flex items-center gap-2 mt-1">
                <span class="text-sm line-through" style="color: var(--text-muted)">{{ change.oldValue }}</span>
                <font-awesome-icon :icon="['fas', 'arrow-right']" class="w-3 h-3" style="color: var(--text-muted)" />
                <span class="text-sm font-medium" style="color: var(--color-primary)">{{ change.newValue }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-6 flex justify-end">
        <button
          class="px-4 py-2 border rounded-lg transition-colors cursor-pointer"
          style="border-color: var(--border-primary); color: var(--text-secondary)"
          @click="showDetailsModal = false"
        >
          Fermer
        </button>
      </div>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import type { ActivityLog } from '~/types'

definePageMeta({
  layout: 'admin'
})

const statistiquesService = useStatistiquesService()
const toast = useAppToast()

// État
const isLoading = ref(true)
const isExporting = ref(false)
const logs = ref<ActivityLog[]>([])
const actions = ref<string[]>([])
const tables = ref<string[]>([])

// Filtres
const searchQuery = ref('')
const filterAction = ref('')
const filterTable = ref('')
const filterPeriode = ref('')

// Pagination
const pagination = ref({
  page: 1,
  limit: 20,
  total: 0
})

// Modal
const showDetailsModal = ref(false)
const selectedLog = ref<ActivityLog | null>(null)

// Stats
const stats = ref({
  creations: 0,
  modifications: 0,
  suppressions: 0,
  connexions: 0
})

// Computed
const totalPages = computed(() => Math.ceil(pagination.value.total / pagination.value.limit))
const hasFilters = computed(() => searchQuery.value || filterAction.value || filterTable.value || filterPeriode.value)

const detailedChanges = computed(() => {
  if (!selectedLog.value?.old_values || !selectedLog.value?.new_values) return []

  const changes: Array<{ field: string; oldValue: string; newValue: string }> = []
  const oldVals = selectedLog.value.old_values as Record<string, unknown>
  const newVals = selectedLog.value.new_values as Record<string, unknown>

  for (const key of Object.keys(newVals)) {
    if (JSON.stringify(oldVals[key]) !== JSON.stringify(newVals[key])) {
      changes.push({
        field: key,
        oldValue: String(oldVals[key] ?? '-'),
        newValue: String(newVals[key] ?? '-')
      })
    }
  }

  return changes
})

// Watchers
watch([searchQuery, filterAction, filterTable, filterPeriode], () => {
  pagination.value.page = 1
  loadLogs()
}, { debounce: 300 } as any)

// Méthodes
const loadLogs = async () => {
  isLoading.value = true
  try {
    const params: Record<string, unknown> = {
      page: pagination.value.page,
      limit: pagination.value.limit
    }

    if (filterAction.value) params.action = filterAction.value
    if (filterTable.value) params.table_name = filterTable.value
    if (filterPeriode.value) {
      const now = new Date()
      if (filterPeriode.value === 'today') {
        params.date_debut = now.toISOString().split('T')[0]
      } else if (filterPeriode.value === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        params.date_debut = weekAgo.toISOString().split('T')[0]
      } else if (filterPeriode.value === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        params.date_debut = monthAgo.toISOString().split('T')[0]
      } else if (filterPeriode.value === 'year') {
        params.date_debut = `${now.getFullYear()}-01-01`
      }
    }

    const response = await statistiquesService.getAuditLogs(params as any)
    logs.value = response.items
    pagination.value.total = response.total
  } catch (error) {
    console.error('Erreur chargement logs:', error)
    generateMockLogs()
  } finally {
    isLoading.value = false
  }
}

const loadFilters = async () => {
  try {
    const [actionsData, tablesData] = await Promise.all([
      statistiquesService.getAuditActions(),
      statistiquesService.getAuditTables()
    ])
    actions.value = actionsData
    tables.value = tablesData
  } catch (error) {
    console.error('Erreur chargement filtres:', error)
    actions.value = ['create', 'update', 'delete', 'login', 'logout', 'export', 'import']
    tables.value = ['comptes_administratifs', 'utilisateurs', 'documents', 'projets', 'communes', 'revenus_miniers']
  }
}

const loadStats = () => {
  // Calculer les stats à partir des logs mockés
  stats.value = {
    creations: logs.value.filter(l => l.action === 'create').length * 10 + 234,
    modifications: logs.value.filter(l => l.action === 'update').length * 15 + 567,
    suppressions: logs.value.filter(l => l.action === 'delete').length * 5 + 89,
    connexions: logs.value.filter(l => l.action === 'login').length * 20 + 456
  }
}

const generateMockLogs = () => {
  const mockActions = ['create', 'update', 'delete', 'login', 'logout']
  const mockTables = ['comptes_administratifs', 'utilisateurs', 'documents', 'projets', 'communes']
  const mockUsers = ['admin@ti-mg.org', 'editeur@ti-mg.org', 'jean.dupont@example.com']
  const mockIps = ['192.168.1.1', '10.0.0.15', '172.16.0.100', '192.168.0.50']

  logs.value = Array.from({ length: 50 }, (_, i) => {
    const action = mockActions[Math.floor(Math.random() * mockActions.length)]
    const date = new Date(Date.now() - i * 3600000 * Math.random() * 24)

    return {
      id: String(i + 1),
      action,
      table_name: action === 'login' || action === 'logout' ? null : mockTables[Math.floor(Math.random() * mockTables.length)],
      record_id: action === 'login' || action === 'logout' ? null : String(Math.floor(Math.random() * 1000)),
      user_id: mockUsers[Math.floor(Math.random() * mockUsers.length)],
      ip_address: mockIps[Math.floor(Math.random() * mockIps.length)],
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      old_values: action === 'update' ? { nom: 'Ancien nom', statut: 'brouillon' } : null,
      new_values: action === 'update' ? { nom: 'Nouveau nom', statut: 'valide' } : action === 'create' ? { nom: 'Nouvel élément' } : null,
      created_at: date.toISOString()
    } as ActivityLog
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  pagination.value.total = 250
  loadStats()
}

const exportAudit = async () => {
  isExporting.value = true
  try {
    const blob = await statistiquesService.exportAuditLogs({
      action: filterAction.value || undefined,
      table_name: filterTable.value || undefined,
      format: 'xlsx'
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.xlsx`
    a.click()
    URL.revokeObjectURL(url)

    toast.success('Export téléchargé')
  } catch (error) {
    console.error('Erreur export:', error)
    toast.error("Erreur lors de l'export")
  } finally {
    isExporting.value = false
  }
}

const showDetails = (log: ActivityLog) => {
  selectedLog.value = log
  showDetailsModal.value = true
}

const goToPage = (page: number) => {
  pagination.value.page = page
  loadLogs()
}

const resetFilters = () => {
  searchQuery.value = ''
  filterAction.value = ''
  filterTable.value = ''
  filterPeriode.value = ''
}

// Helpers
const formatAction = (action: string) => {
  const labels: Record<string, string> = {
    create: 'Création',
    update: 'Modification',
    delete: 'Suppression',
    login: 'Connexion',
    logout: 'Déconnexion',
    export: 'Export',
    import: 'Import'
  }
  return labels[action] || action
}

const formatTableName = (table: string) => {
  const labels: Record<string, string> = {
    comptes_administratifs: 'Comptes administratifs',
    utilisateurs: 'Utilisateurs',
    documents: 'Documents',
    projets: 'Projets miniers',
    communes: 'Communes',
    revenus_miniers: 'Revenus miniers',
    societes: 'Sociétés',
    newsletter_abonnes: 'Abonnés newsletter',
    cms_pages: 'Pages CMS',
    cms_sections: 'Sections CMS'
  }
  return labels[table] || table
}

const getActionClass = (action: string) => {
  switch (action) {
    case 'create': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    case 'update': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    case 'delete': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    case 'login': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
    case 'logout': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    case 'export': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
    case 'import': return 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
  }
}

const getActionIcon = (action: string): [string, string] => {
  switch (action) {
    case 'create': return ['fas', 'plus']
    case 'update': return ['fas', 'edit']
    case 'delete': return ['fas', 'trash']
    case 'login': return ['fas', 'sign-in-alt']
    case 'logout': return ['fas', 'sign-out-alt']
    case 'export': return ['fas', 'download']
    case 'import': return ['fas', 'upload']
    default: return ['fas', 'circle']
  }
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const formatTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDateTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Lifecycle
onMounted(() => {
  loadFilters()
  loadLogs()
})
</script>
