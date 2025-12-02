<template>
  <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] shadow-sm overflow-hidden">
    <!-- Header with search and actions -->
    <div v-if="showHeader" class="p-4 border-b border-[var(--border-default)]">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <!-- Search -->
        <div v-if="searchable" class="relative flex-1 max-w-md">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
            <font-awesome-icon :icon="['fas', 'magnifying-glass']" class="text-sm" />
          </div>
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="searchPlaceholder"
            class="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-[var(--border-default)] bg-[var(--bg-input)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
          />
        </div>

        <!-- Actions slot -->
        <div class="flex items-center gap-2">
          <slot name="actions" />
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-[var(--color-gray-50)] dark:bg-[var(--color-gray-800)]">
          <tr>
            <!-- Checkbox column -->
            <th v-if="selectable" class="w-12 px-4 py-3">
              <input
                type="checkbox"
                :checked="allSelected"
                :indeterminate="someSelected && !allSelected"
                @change="toggleSelectAll"
                class="w-4 h-4 rounded border-[var(--border-default)] text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer"
              />
            </th>

            <!-- Data columns -->
            <th
              v-for="column in columns"
              :key="column.key"
              :class="[
                'px-4 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider',
                column.sortable ? 'cursor-pointer select-none hover:text-[var(--text-primary)]' : '',
                column.width ? `w-[${column.width}]` : ''
              ]"
              @click="column.sortable && toggleSort(column.key)"
            >
              <div class="flex items-center gap-2">
                <span>{{ column.label }}</span>
                <span v-if="column.sortable" class="text-[var(--text-muted)]">
                  <font-awesome-icon
                    v-if="sortKey === column.key"
                    :icon="['fas', sortOrder === 'asc' ? 'sort-up' : 'sort-down']"
                    class="text-[var(--color-primary)]"
                  />
                  <font-awesome-icon v-else :icon="['fas', 'sort']" class="opacity-50" />
                </span>
              </div>
            </th>

            <!-- Actions column -->
            <th v-if="$slots.rowActions" class="w-24 px-4 py-3 text-right text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-[var(--border-light)]">
          <!-- Loading state -->
          <tr v-if="loading">
            <td :colspan="totalColumns" class="px-4 py-12 text-center">
              <div class="flex flex-col items-center gap-3">
                <font-awesome-icon :icon="['fas', 'spinner']" class="text-3xl text-[var(--color-primary)] animate-spin" />
                <p class="text-sm text-[var(--text-muted)]">Chargement...</p>
              </div>
            </td>
          </tr>

          <!-- Empty state -->
          <tr v-else-if="!paginatedData.length">
            <td :colspan="totalColumns" class="px-4 py-12 text-center">
              <div class="flex flex-col items-center gap-3">
                <div class="w-16 h-16 rounded-full bg-[var(--color-gray-100)] dark:bg-[var(--color-gray-800)] flex items-center justify-center">
                  <font-awesome-icon :icon="['fas', 'inbox']" class="text-2xl text-[var(--text-muted)]" />
                </div>
                <div>
                  <p class="text-sm font-medium text-[var(--text-primary)]">{{ emptyTitle }}</p>
                  <p class="text-sm text-[var(--text-muted)]">{{ emptyMessage }}</p>
                </div>
                <slot name="empty-action" />
              </div>
            </td>
          </tr>

          <!-- Data rows -->
          <tr
            v-else
            v-for="(row, index) in paginatedData"
            :key="getRowKey(row, index)"
            :class="[
              'hover:bg-[var(--interactive-hover)] transition-colors',
              isSelected(row) ? 'bg-[var(--interactive-selected)]' : ''
            ]"
          >
            <!-- Checkbox -->
            <td v-if="selectable" class="px-4 py-3">
              <input
                type="checkbox"
                :checked="isSelected(row)"
                @change="toggleSelect(row)"
                class="w-4 h-4 rounded border-[var(--border-default)] text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer"
              />
            </td>

            <!-- Data cells -->
            <td
              v-for="column in columns"
              :key="column.key"
              class="px-4 py-3 text-sm text-[var(--text-primary)]"
            >
              <slot :name="`cell-${column.key}`" :row="row" :value="getNestedValue(row, column.key)">
                {{ formatValue(getNestedValue(row, column.key), column) }}
              </slot>
            </td>

            <!-- Row actions -->
            <td v-if="$slots.rowActions" class="px-4 py-3 text-right">
              <slot name="rowActions" :row="row" :index="index" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="paginated && !loading && paginatedData.length" class="px-4 py-3 border-t border-[var(--border-default)]">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <!-- Info -->
        <div class="text-sm text-[var(--text-secondary)]">
          Affichage de <span class="font-medium text-[var(--text-primary)]">{{ startIndex + 1 }}</span>
          à <span class="font-medium text-[var(--text-primary)]">{{ Math.min(endIndex, filteredData.length) }}</span>
          sur <span class="font-medium text-[var(--text-primary)]">{{ filteredData.length }}</span> résultats
        </div>

        <!-- Controls -->
        <div class="flex items-center gap-4">
          <!-- Per page -->
          <div class="flex items-center gap-2">
            <span class="text-sm text-[var(--text-secondary)]">Par page:</span>
            <select
              v-model="currentPerPage"
              class="px-2 py-1 text-sm rounded-lg border border-[var(--border-default)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] cursor-pointer"
            >
              <option v-for="size in pageSizes" :key="size" :value="size">{{ size }}</option>
            </select>
          </div>

          <!-- Pages -->
          <div class="flex items-center gap-1">
            <button
              @click="goToPage(1)"
              :disabled="currentPage === 1"
              class="p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--interactive-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <font-awesome-icon :icon="['fas', 'angles-left']" />
            </button>
            <button
              @click="goToPage(currentPage - 1)"
              :disabled="currentPage === 1"
              class="p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--interactive-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <font-awesome-icon :icon="['fas', 'chevron-left']" />
            </button>

            <template v-for="page in visiblePages" :key="page">
              <span v-if="page === '...'" class="px-2 text-[var(--text-muted)]">...</span>
              <button
                v-else
                @click="goToPage(page as number)"
                :class="[
                  'min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-colors cursor-pointer',
                  currentPage === page
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--interactive-hover)]'
                ]"
              >
                {{ page }}
              </button>
            </template>

            <button
              @click="goToPage(currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--interactive-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <font-awesome-icon :icon="['fas', 'chevron-right']" />
            </button>
            <button
              @click="goToPage(totalPages)"
              :disabled="currentPage === totalPages"
              class="p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--interactive-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <font-awesome-icon :icon="['fas', 'angles-right']" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface Column {
  key: string
  label: string
  sortable?: boolean
  width?: string
  format?: (value: any, row: any) => string
}

interface Props {
  data: any[]
  columns: Column[]
  loading?: boolean
  searchable?: boolean
  searchPlaceholder?: string
  searchKeys?: string[]
  selectable?: boolean
  rowKey?: string
  paginated?: boolean
  perPage?: number
  pageSizes?: number[]
  showHeader?: boolean
  emptyTitle?: string
  emptyMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  searchable: true,
  searchPlaceholder: 'Rechercher...',
  searchKeys: () => [],
  selectable: false,
  rowKey: 'id',
  paginated: true,
  perPage: 10,
  pageSizes: () => [10, 25, 50, 100],
  showHeader: true,
  emptyTitle: 'Aucune donnée',
  emptyMessage: 'Aucun élément à afficher pour le moment.',
})

const emit = defineEmits<{
  'update:selected': [selected: any[]]
  'row-click': [row: any]
  'sort-change': [key: string, order: 'asc' | 'desc']
}>()

// State
const searchQuery = ref('')
const sortKey = ref<string | null>(null)
const sortOrder = ref<'asc' | 'desc'>('asc')
const currentPage = ref(1)
const currentPerPage = ref(props.perPage)
const selectedRows = ref<any[]>([])

// Computed
const totalColumns = computed(() => {
  let count = props.columns.length
  if (props.selectable) count++
  // Check if rowActions slot is provided
  return count + 1 // +1 for actions column
})

const filteredData = computed(() => {
  let result = [...props.data]

  // Search filter
  if (searchQuery.value && props.searchable) {
    const query = searchQuery.value.toLowerCase()
    const keys = props.searchKeys.length > 0 ? props.searchKeys : props.columns.map(c => c.key)

    result = result.filter(row => {
      return keys.some(key => {
        const value = getNestedValue(row, key)
        return value && String(value).toLowerCase().includes(query)
      })
    })
  }

  // Sort
  if (sortKey.value) {
    result.sort((a, b) => {
      const aVal = getNestedValue(a, sortKey.value!)
      const bVal = getNestedValue(b, sortKey.value!)

      if (aVal === bVal) return 0
      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1

      const comparison = aVal < bVal ? -1 : 1
      return sortOrder.value === 'asc' ? comparison : -comparison
    })
  }

  return result
})

const totalPages = computed(() => Math.ceil(filteredData.value.length / currentPerPage.value))

const startIndex = computed(() => (currentPage.value - 1) * currentPerPage.value)
const endIndex = computed(() => startIndex.value + currentPerPage.value)

const paginatedData = computed(() => {
  if (!props.paginated) return filteredData.value
  return filteredData.value.slice(startIndex.value, endIndex.value)
})

const visiblePages = computed(() => {
  const pages: (number | string)[] = []
  const total = totalPages.value
  const current = currentPage.value

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    if (current <= 3) {
      pages.push(1, 2, 3, 4, '...', total)
    } else if (current >= total - 2) {
      pages.push(1, '...', total - 3, total - 2, total - 1, total)
    } else {
      pages.push(1, '...', current - 1, current, current + 1, '...', total)
    }
  }

  return pages
})

const allSelected = computed(() => {
  return paginatedData.value.length > 0 && paginatedData.value.every(row => isSelected(row))
})

const someSelected = computed(() => {
  return selectedRows.value.length > 0
})

// Methods
const getRowKey = (row: any, index: number) => {
  return row[props.rowKey] ?? index
}

const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((acc, part) => acc?.[part], obj)
}

const formatValue = (value: any, column: Column) => {
  if (column.format) {
    return column.format(value, {})
  }
  if (value === null || value === undefined) return '-'
  return value
}

const toggleSort = (key: string) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
  emit('sort-change', key, sortOrder.value)
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const isSelected = (row: any) => {
  const key = getRowKey(row, -1)
  return selectedRows.value.some(r => getRowKey(r, -1) === key)
}

const toggleSelect = (row: any) => {
  const key = getRowKey(row, -1)
  const index = selectedRows.value.findIndex(r => getRowKey(r, -1) === key)

  if (index === -1) {
    selectedRows.value.push(row)
  } else {
    selectedRows.value.splice(index, 1)
  }

  emit('update:selected', selectedRows.value)
}

const toggleSelectAll = () => {
  if (allSelected.value) {
    // Deselect all visible
    paginatedData.value.forEach(row => {
      const key = getRowKey(row, -1)
      const index = selectedRows.value.findIndex(r => getRowKey(r, -1) === key)
      if (index !== -1) {
        selectedRows.value.splice(index, 1)
      }
    })
  } else {
    // Select all visible
    paginatedData.value.forEach(row => {
      if (!isSelected(row)) {
        selectedRows.value.push(row)
      }
    })
  }

  emit('update:selected', selectedRows.value)
}

// Reset page when search changes
watch(searchQuery, () => {
  currentPage.value = 1
})

// Reset page when per page changes
watch(currentPerPage, () => {
  currentPage.value = 1
})
</script>
