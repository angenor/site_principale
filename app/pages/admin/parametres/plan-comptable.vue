<template>
  <div class="space-y-6">
    <!-- En-tête -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex items-center gap-2">
        <NuxtLink
          to="/admin/parametres"
          class="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
          style="color: var(--text-muted)"
        >
          <font-awesome-icon :icon="['fas', 'arrow-left']" class="w-4 h-4" />
        </NuxtLink>
        <div>
          <h1 class="text-2xl font-semibold" style="color: var(--text-primary)">
            Plan comptable
          </h1>
          <p class="text-sm" style="color: var(--text-muted)">
            Structure hiérarchique des comptes budgétaires
          </p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <button
          class="px-4 py-2 border rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
          :class="expandAll ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300' : ''"
          style="border-color: var(--border-primary); color: var(--text-secondary)"
          @click="toggleExpandAll"
        >
          <font-awesome-icon :icon="expandAll ? ['fas', 'compress-alt'] : ['fas', 'expand-alt']" class="w-4 h-4" />
          <span>{{ expandAll ? 'Tout réduire' : 'Tout déplier' }}</span>
        </button>
      </div>
    </div>

    <!-- Recherche -->
    <div
      class="p-4 rounded-lg border"
      style="background-color: var(--bg-secondary); border-color: var(--border-primary)"
    >
      <div class="relative">
        <font-awesome-icon
          :icon="['fas', 'search']"
          class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
          style="color: var(--text-muted)"
        />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher par code ou libellé..."
          class="w-full pl-10 pr-4 py-2 border rounded-lg"
          style="background-color: var(--bg-primary); border-color: var(--border-primary); color: var(--text-primary)"
        />
      </div>
      <div v-if="searchQuery" class="mt-2 text-sm" style="color: var(--text-muted)">
        {{ filteredCount }} résultat(s) trouvé(s)
      </div>
    </div>

    <!-- Onglets Recettes / Dépenses -->
    <div class="flex gap-2">
      <button
        class="px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer"
        :class="activeSection === 'recettes' ? 'text-white' : ''"
        :style="{
          backgroundColor: activeSection === 'recettes' ? 'var(--color-primary)' : 'var(--bg-secondary)',
          color: activeSection === 'recettes' ? 'white' : 'var(--text-secondary)'
        }"
        @click="activeSection = 'recettes'"
      >
        <font-awesome-icon :icon="['fas', 'arrow-down']" class="w-4 h-4 mr-2" />
        Recettes
      </button>
      <button
        class="px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer"
        :class="activeSection === 'depenses' ? 'text-white' : ''"
        :style="{
          backgroundColor: activeSection === 'depenses' ? '#ef4444' : 'var(--bg-secondary)',
          color: activeSection === 'depenses' ? 'white' : 'var(--text-secondary)'
        }"
        @click="activeSection = 'depenses'"
      >
        <font-awesome-icon :icon="['fas', 'arrow-up']" class="w-4 h-4 mr-2" />
        Dépenses
      </button>
    </div>

    <!-- Arborescence -->
    <div
      class="rounded-lg border"
      style="background-color: var(--bg-secondary); border-color: var(--border-primary)"
    >
      <!-- Chargement -->
      <div v-if="isLoading" class="p-8 text-center">
        <font-awesome-icon :icon="['fas', 'spinner']" class="w-8 h-8 animate-spin" style="color: var(--color-primary)" />
        <p class="mt-2 text-sm" style="color: var(--text-muted)">Chargement du plan comptable...</p>
      </div>

      <!-- Arborescence -->
      <div v-else class="p-4">
        <div v-if="filteredTree.length === 0" class="text-center py-8">
          <font-awesome-icon :icon="['fas', 'search']" class="w-12 h-12 mb-4" style="color: var(--text-muted)" />
          <p class="font-medium" style="color: var(--text-primary)">Aucun résultat</p>
          <p class="text-sm mt-1" style="color: var(--text-muted)">
            Essayez une autre recherche
          </p>
        </div>

        <div v-else class="space-y-1">
          <TreeNode
            v-for="node in filteredTree"
            :key="node.code"
            :node="node"
            :level="0"
            :search-query="searchQuery"
            :is-admin="isAdmin"
            @edit="editNode"
          />
        </div>
      </div>
    </div>

    <!-- Modal édition -->
    <UiModal v-model="showEditModal" title="Modifier le libellé" size="md">
      <div v-if="editingNode" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2" style="color: var(--text-secondary)">Code</label>
          <input
            :value="editingNode.code"
            type="text"
            class="w-full px-3 py-2 border rounded-lg"
            style="background-color: var(--bg-tertiary); border-color: var(--border-primary); color: var(--text-muted)"
            disabled
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2" style="color: var(--text-secondary)">Libellé</label>
          <input
            v-model="editingNode.libelle"
            type="text"
            class="w-full px-3 py-2 border rounded-lg"
            style="background-color: var(--bg-primary); border-color: var(--border-primary); color: var(--text-primary)"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2" style="color: var(--text-secondary)">Description (optionnel)</label>
          <textarea
            v-model="editingNode.description"
            rows="3"
            class="w-full px-3 py-2 border rounded-lg resize-none"
            style="background-color: var(--bg-primary); border-color: var(--border-primary); color: var(--text-primary)"
            placeholder="Description ou note explicative..."
          />
        </div>
      </div>
      <div class="mt-6 flex justify-end gap-3">
        <button
          class="px-4 py-2 border rounded-lg transition-colors cursor-pointer"
          style="border-color: var(--border-primary); color: var(--text-secondary)"
          @click="showEditModal = false"
        >
          Annuler
        </button>
        <button
          class="px-4 py-2 rounded-lg text-white transition-colors cursor-pointer"
          style="background-color: var(--color-primary)"
          :disabled="isSaving"
          @click="saveNode"
        >
          {{ isSaving ? 'Enregistrement...' : 'Enregistrer' }}
        </button>
      </div>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
// TreeNode component inline
const TreeNode = defineComponent({
  name: 'TreeNode',
  props: {
    node: { type: Object, required: true },
    level: { type: Number, default: 0 },
    searchQuery: { type: String, default: '' },
    isAdmin: { type: Boolean, default: false }
  },
  emits: ['edit'],
  setup(props, { emit }) {
    const isExpanded = ref(props.level < 2 || !!props.searchQuery)

    const hasChildren = computed(() => props.node.children && props.node.children.length > 0)

    const toggleExpand = () => {
      if (hasChildren.value) {
        isExpanded.value = !isExpanded.value
      }
    }

    const highlightText = (text: string) => {
      if (!props.searchQuery) return text
      const regex = new RegExp(`(${props.searchQuery})`, 'gi')
      return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-900/50">$1</mark>')
    }

    watch(() => props.searchQuery, (query) => {
      if (query) {
        isExpanded.value = true
      }
    })

    return () => h('div', { class: 'select-none' }, [
      // Ligne du nœud
      h('div', {
        class: [
          'flex items-center gap-2 py-2 px-3 rounded-lg transition-colors',
          hasChildren.value ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/50' : ''
        ],
        style: { paddingLeft: `${props.level * 24 + 8}px` },
        onClick: toggleExpand
      }, [
        // Icône expand/collapse
        hasChildren.value
          ? h('font-awesome-icon', {
              icon: ['fas', isExpanded.value ? 'chevron-down' : 'chevron-right'],
              class: 'w-3 h-3 text-gray-400 transition-transform'
            })
          : h('span', { class: 'w-3' }),

        // Code
        h('span', {
          class: 'font-mono text-sm px-2 py-0.5 rounded',
          style: 'background-color: var(--bg-tertiary); color: var(--color-primary)',
          innerHTML: highlightText(props.node.code)
        }),

        // Libellé
        h('span', {
          class: 'flex-1 text-sm',
          style: 'color: var(--text-primary)',
          innerHTML: highlightText(props.node.libelle)
        }),

        // Bouton édition (admin seulement)
        props.isAdmin && h('button', {
          class: 'p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer',
          style: 'color: var(--text-muted)',
          onClick: (e: Event) => {
            e.stopPropagation()
            emit('edit', props.node)
          }
        }, [
          h('font-awesome-icon', { icon: ['fas', 'edit'], class: 'w-3 h-3' })
        ])
      ]),

      // Enfants
      hasChildren.value && isExpanded.value && h('div', { class: 'ml-3 border-l border-gray-200 dark:border-gray-700' },
        props.node.children.map((child: any) =>
          h(TreeNode, {
            key: child.code,
            node: child,
            level: props.level + 1,
            searchQuery: props.searchQuery,
            isAdmin: props.isAdmin,
            onEdit: (node: any) => emit('edit', node)
          })
        )
      )
    ])
  }
})

definePageMeta({
  layout: 'admin'
})

const { user } = useAuth()
const toast = useAppToast()

// État
const isLoading = ref(true)
const isSaving = ref(false)
const searchQuery = ref('')
const activeSection = ref<'recettes' | 'depenses'>('recettes')
const expandAll = ref(false)
const showEditModal = ref(false)
const editingNode = ref<{ code: string; libelle: string; description?: string } | null>(null)

// Données
const planComptableRecettes = ref<any[]>([])
const planComptableDepenses = ref<any[]>([])

// Computed
const isAdmin = computed(() => user.value?.role?.code === 'admin')

const currentTree = computed(() =>
  activeSection.value === 'recettes' ? planComptableRecettes.value : planComptableDepenses.value
)

const filteredTree = computed(() => {
  if (!searchQuery.value) return currentTree.value

  const filterNodes = (nodes: any[]): any[] => {
    return nodes.reduce((acc, node) => {
      const matchesSearch =
        node.code.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        node.libelle.toLowerCase().includes(searchQuery.value.toLowerCase())

      const filteredChildren = node.children ? filterNodes(node.children) : []

      if (matchesSearch || filteredChildren.length > 0) {
        acc.push({
          ...node,
          children: filteredChildren.length > 0 ? filteredChildren : node.children
        })
      }

      return acc
    }, [] as any[])
  }

  return filterNodes(currentTree.value)
})

const filteredCount = computed(() => {
  const countNodes = (nodes: any[]): number => {
    return nodes.reduce((count, node) => {
      return count + 1 + (node.children ? countNodes(node.children) : 0)
    }, 0)
  }
  return countNodes(filteredTree.value)
})

// Méthodes
const loadPlanComptable = async () => {
  isLoading.value = true
  try {
    // Simuler le chargement
    await new Promise(resolve => setTimeout(resolve, 500))

    // Plan comptable des recettes (structure Madagascar)
    planComptableRecettes.value = [
      {
        code: '70',
        libelle: 'Recettes de fonctionnement',
        children: [
          {
            code: '70.1',
            libelle: 'Recettes fiscales',
            children: [
              { code: '70.1.1', libelle: 'Impôts directs' },
              { code: '70.1.2', libelle: 'Impôts indirects' },
              { code: '70.1.3', libelle: 'Taxes locales' }
            ]
          },
          {
            code: '70.2',
            libelle: 'Recettes non fiscales',
            children: [
              { code: '70.2.1', libelle: 'Revenus du domaine' },
              { code: '70.2.2', libelle: 'Produits des services' },
              { code: '70.2.3', libelle: 'Recettes diverses' }
            ]
          },
          {
            code: '70.3',
            libelle: 'Transferts reçus',
            children: [
              { code: '70.3.1', libelle: "Dotations de l'État" },
              { code: '70.3.2', libelle: 'Subventions' },
              { code: '70.3.3', libelle: 'Ristournes minières' }
            ]
          }
        ]
      },
      {
        code: '71',
        libelle: "Recettes d'investissement",
        children: [
          {
            code: '71.1',
            libelle: 'Emprunts et dettes',
            children: [
              { code: '71.1.1', libelle: 'Emprunts intérieurs' },
              { code: '71.1.2', libelle: 'Emprunts extérieurs' }
            ]
          },
          {
            code: '71.2',
            libelle: 'Subventions équipement',
            children: [
              { code: '71.2.1', libelle: "Subventions de l'État" },
              { code: '71.2.2', libelle: 'Aides extérieures' }
            ]
          },
          {
            code: '71.3',
            libelle: 'Cessions actifs',
            children: [
              { code: '71.3.1', libelle: 'Ventes immobilières' },
              { code: '71.3.2', libelle: 'Ventes mobilières' }
            ]
          }
        ]
      }
    ]

    // Plan comptable des dépenses
    planComptableDepenses.value = [
      {
        code: '60',
        libelle: 'Dépenses de fonctionnement',
        children: [
          {
            code: '60.1',
            libelle: 'Personnel',
            children: [
              { code: '60.1.1', libelle: 'Rémunérations' },
              { code: '60.1.2', libelle: 'Charges sociales' },
              { code: '60.1.3', libelle: 'Autres charges personnel' }
            ]
          },
          {
            code: '60.2',
            libelle: 'Biens et services',
            children: [
              { code: '60.2.1', libelle: 'Fournitures' },
              { code: '60.2.2', libelle: 'Services extérieurs' },
              { code: '60.2.3', libelle: 'Entretien et réparations' }
            ]
          },
          {
            code: '60.3',
            libelle: 'Transferts versés',
            children: [
              { code: '60.3.1', libelle: 'Subventions accordées' },
              { code: '60.3.2', libelle: 'Aides sociales' }
            ]
          },
          {
            code: '60.4',
            libelle: 'Charges financières',
            children: [
              { code: '60.4.1', libelle: 'Intérêts emprunts' },
              { code: '60.4.2', libelle: 'Autres charges financières' }
            ]
          }
        ]
      },
      {
        code: '61',
        libelle: "Dépenses d'investissement",
        children: [
          {
            code: '61.1',
            libelle: 'Immobilisations',
            children: [
              { code: '61.1.1', libelle: 'Acquisitions terrains' },
              { code: '61.1.2', libelle: 'Constructions' },
              { code: '61.1.3', libelle: 'Équipements' },
              { code: '61.1.4', libelle: 'Infrastructures' }
            ]
          },
          {
            code: '61.2',
            libelle: 'Remboursement emprunts',
            children: [
              { code: '61.2.1', libelle: 'Principal emprunts' }
            ]
          }
        ]
      }
    ]

  } catch (error) {
    console.error('Erreur chargement plan comptable:', error)
    toast.error('Erreur lors du chargement')
  } finally {
    isLoading.value = false
  }
}

const toggleExpandAll = () => {
  expandAll.value = !expandAll.value
  // La logique d'expansion est gérée par le composant TreeNode via la prop
}

const editNode = (node: any) => {
  editingNode.value = { ...node }
  showEditModal.value = true
}

const saveNode = async () => {
  if (!editingNode.value) return

  isSaving.value = true
  try {
    // Simuler la sauvegarde
    await new Promise(resolve => setTimeout(resolve, 500))

    // Mettre à jour le nœud dans l'arborescence
    const updateNode = (nodes: any[]): boolean => {
      for (const node of nodes) {
        if (node.code === editingNode.value?.code) {
          node.libelle = editingNode.value.libelle
          node.description = editingNode.value.description
          return true
        }
        if (node.children && updateNode(node.children)) {
          return true
        }
      }
      return false
    }

    updateNode(planComptableRecettes.value)
    updateNode(planComptableDepenses.value)

    toast.success('Libellé modifié avec succès')
    showEditModal.value = false
  } catch (error) {
    console.error('Erreur sauvegarde:', error)
    toast.error('Erreur lors de la sauvegarde')
  } finally {
    isSaving.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadPlanComptable()
})
</script>
