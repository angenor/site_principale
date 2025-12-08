<template>
  <div class="tree-node group">
    <div
      :class="[
        'flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer transition-colors hover:bg-[var(--interactive-hover)]',
        node.niveau === 1 ? 'bg-[var(--bg-page)]' : ''
      ]"
      :style="{ marginLeft: depth * 24 + 'px' }"
    >
      <button
        v-if="hasChildren"
        @click="toggle"
        class="w-5 h-5 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)]"
      >
        <font-awesome-icon :icon="['fas', isExpanded ? 'chevron-down' : 'chevron-right']" class="text-xs" />
      </button>
      <span v-else class="w-5" />

      <span class="font-mono text-sm font-medium text-[var(--color-primary)]">{{ node.code }}</span>
      <span :class="['flex-1', node.niveau === 1 ? 'font-semibold' : '']">{{ node.intitule }}</span>

      <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          v-if="node.niveau < 3"
          @click.stop="$emit('add-child', node)"
          class="p-1 text-[var(--text-muted)] hover:text-[var(--color-primary)]"
          title="Ajouter sous-rubrique"
        >
          <font-awesome-icon :icon="['fas', 'plus']" class="text-xs" />
        </button>
        <button
          @click.stop="$emit('edit', node)"
          class="p-1 text-[var(--text-muted)] hover:text-[var(--color-primary)]"
          title="Modifier"
        >
          <font-awesome-icon :icon="['fas', 'edit']" class="text-xs" />
        </button>
        <button
          @click.stop="$emit('delete', node)"
          class="p-1 text-[var(--text-muted)] hover:text-[var(--color-error)]"
          title="Supprimer"
        >
          <font-awesome-icon :icon="['fas', 'trash']" class="text-xs" />
        </button>
      </div>
    </div>

    <div v-if="hasChildren && isExpanded">
      <AdminPlanComptableTreeNode
        v-for="child in node.children"
        :key="child.code"
        :node="child"
        :depth="depth + 1"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
        @add-child="$emit('add-child', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface TreeNodeData {
  code: string
  intitule: string
  niveau: number
  children?: TreeNodeData[]
}

const props = withDefaults(defineProps<{
  node: TreeNodeData
  depth?: number
}>(), {
  depth: 0
})

defineEmits<{
  edit: [node: TreeNodeData]
  delete: [node: TreeNodeData]
  'add-child': [node: TreeNodeData]
}>()

const isExpanded = ref(true)

const hasChildren = computed(() => props.node.children && props.node.children.length > 0)

const toggle = () => {
  isExpanded.value = !isExpanded.value
}
</script>
