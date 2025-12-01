<script setup lang="ts">
interface Props {
  currentPage: number
  totalPages: number
  totalItems?: number
  itemsPerPage?: number
  maxVisiblePages?: number
  showInfo?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  maxVisiblePages: 5,
  showInfo: true
})

const emit = defineEmits<{
  (e: 'update:currentPage', page: number): void
  (e: 'change', page: number): void
}>()

// Calculer les pages visibles
const visiblePages = computed(() => {
  const pages: (number | 'ellipsis')[] = []
  const total = props.totalPages
  const current = props.currentPage
  const maxVisible = props.maxVisiblePages

  if (total <= maxVisible + 2) {
    // Afficher toutes les pages si peu nombreuses
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    // Toujours montrer la première page
    pages.push(1)

    // Calculer la plage autour de la page courante
    let startPage = Math.max(2, current - Math.floor(maxVisible / 2))
    let endPage = Math.min(total - 1, startPage + maxVisible - 1)

    // Ajuster si on est près du début
    if (startPage <= 2) {
      startPage = 2
      endPage = Math.min(total - 1, maxVisible)
    }

    // Ajuster si on est près de la fin
    if (endPage >= total - 1) {
      endPage = total - 1
      startPage = Math.max(2, total - maxVisible)
    }

    // Ajouter ellipsis si nécessaire au début
    if (startPage > 2) {
      pages.push('ellipsis')
    }

    // Ajouter les pages du milieu
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    // Ajouter ellipsis si nécessaire à la fin
    if (endPage < total - 1) {
      pages.push('ellipsis')
    }

    // Toujours montrer la dernière page
    if (total > 1) {
      pages.push(total)
    }
  }

  return pages
})

function goToPage(page: number) {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('update:currentPage', page)
    emit('change', page)
  }
}

function previousPage() {
  if (props.currentPage > 1) {
    goToPage(props.currentPage - 1)
  }
}

function nextPage() {
  if (props.currentPage < props.totalPages) {
    goToPage(props.currentPage + 1)
  }
}

// Info affichée
const infoText = computed(() => {
  if (!props.totalItems || !props.itemsPerPage) return ''
  const start = (props.currentPage - 1) * props.itemsPerPage + 1
  const end = Math.min(props.currentPage * props.itemsPerPage, props.totalItems)
  return `${start}-${end} sur ${props.totalItems}`
})
</script>

<template>
  <nav
    v-if="totalPages > 1"
    class="flex flex-col sm:flex-row items-center justify-between gap-4"
    aria-label="Pagination"
  >
    <!-- Info -->
    <p v-if="showInfo && infoText" class="text-sm text-gray-600 dark:text-gray-400">
      Affichage {{ infoText }}
    </p>

    <!-- Contrôles de pagination -->
    <div class="flex items-center gap-1">
      <!-- Bouton précédent -->
      <button
        :disabled="currentPage === 1"
        class="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
        @click="previousPage"
      >
        <font-awesome-icon icon="chevron-left" class="w-4 h-4" />
      </button>

      <!-- Pages -->
      <template v-for="(page, index) in visiblePages" :key="index">
        <span
          v-if="page === 'ellipsis'"
          class="px-2 py-1 text-gray-400"
        >
          ...
        </span>
        <button
          v-else
          :class="[
            'min-w-[40px] h-10 rounded-lg font-medium transition-colors cursor-pointer',
            page === currentPage
              ? 'bg-ti-blue text-white'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          ]"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>
      </template>

      <!-- Bouton suivant -->
      <button
        :disabled="currentPage >= totalPages"
        class="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
        @click="nextPage"
      >
        <font-awesome-icon icon="chevron-right" class="w-4 h-4" />
      </button>
    </div>
  </nav>
</template>
