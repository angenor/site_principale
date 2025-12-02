<template>
  <div
    v-show="isActive"
    :id="`tabpanel-${value}`"
    role="tabpanel"
    :aria-labelledby="`tab-${value}`"
    :class="wrapperClass"
  >
    <slot v-if="keepAlive || isActive" />
  </div>
</template>

<script setup lang="ts">
interface Props {
  value: string
  activeTab: string
  keepAlive?: boolean
  wrapperClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  keepAlive: false,
  wrapperClass: '',
})

const isActive = computed(() => props.activeTab === props.value)
</script>
