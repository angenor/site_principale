<template>
  <Teleport to="body">
    <div
      :class="[
        'fixed z-[var(--z-toast)] pointer-events-none',
        positionClasses
      ]"
    >
      <TransitionGroup
        tag="div"
        :class="['flex gap-3 pointer-events-auto', stackDirection]"
        enter-active-class="transition-all duration-300 ease-out"
        leave-active-class="transition-all duration-200 ease-in"
        enter-from-class="opacity-0 translate-y-2 scale-95"
        enter-to-class="opacity-100 translate-y-0 scale-100"
        leave-from-class="opacity-100 translate-y-0 scale-100"
        leave-to-class="opacity-0 translate-y-2 scale-95"
        move-class="transition-all duration-300"
      >
        <UiToast
          v-for="toast in toasts"
          :key="toast.id"
          :toast="toast"
          @dismiss="removeToast(toast.id)"
        />
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const { toasts, position, removeToast } = useToast()

// Position classes for the container
const positionClasses = computed(() => {
  const positions: Record<string, string> = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  }
  const pos = position?.value ?? 'top-right'
  return positions[pos] || positions['top-right']
})

// Stack direction based on position
const stackDirection = computed(() => {
  const pos = position?.value ?? 'top-right'
  if (pos.startsWith('bottom')) {
    return 'flex-col-reverse'
  }
  return 'flex-col'
})
</script>
