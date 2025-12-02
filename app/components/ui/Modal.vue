<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[var(--z-modal-backdrop)] overflow-y-auto"
        @click.self="closeOnBackdrop && close()"
      >
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black/50" aria-hidden="true" />

        <!-- Modal container -->
        <div class="flex min-h-full items-center justify-center p-4">
          <Transition
            enter-active-class="transition ease-out duration-200"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition ease-in duration-150"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
          >
            <div
              v-if="modelValue"
              ref="modalRef"
              :class="[
                'relative bg-[var(--bg-card)] rounded-xl shadow-xl w-full transform transition-all',
                sizeClasses
              ]"
              role="dialog"
              aria-modal="true"
              :aria-labelledby="title ? 'modal-title' : undefined"
            >
              <!-- Header -->
              <div v-if="title || $slots.header || closable" class="flex items-start justify-between p-6 border-b border-[var(--border-default)]">
                <slot name="header">
                  <div>
                    <h3 id="modal-title" class="font-heading text-xl font-bold text-[var(--text-primary)] uppercase tracking-wide">
                      {{ title }}
                    </h3>
                    <p v-if="description" class="mt-1 text-sm text-[var(--text-secondary)]">
                      {{ description }}
                    </p>
                  </div>
                </slot>

                <button
                  v-if="closable"
                  @click="close"
                  class="ml-4 p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--interactive-hover)] transition-colors cursor-pointer"
                  aria-label="Fermer"
                >
                  <font-awesome-icon :icon="['fas', 'xmark']" class="text-lg" />
                </button>
              </div>

              <!-- Body -->
              <div :class="['p-6', bodyClass]">
                <slot />
              </div>

              <!-- Footer -->
              <div v-if="$slots.footer || showDefaultFooter" class="flex items-center justify-end gap-3 p-6 border-t border-[var(--border-default)]">
                <slot name="footer">
                  <button
                    v-if="cancelText"
                    @click="cancel"
                    class="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg hover:bg-[var(--interactive-hover)] transition-colors cursor-pointer"
                  >
                    {{ cancelText }}
                  </button>
                  <button
                    v-if="confirmText"
                    @click="confirm"
                    :disabled="confirmDisabled || confirmLoading"
                    :class="[
                      'px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-2',
                      confirmVariant === 'danger'
                        ? 'bg-[var(--color-error)] text-white hover:bg-[var(--color-error-dark)] disabled:opacity-50'
                        : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-600)] disabled:opacity-50'
                    ]"
                  >
                    <font-awesome-icon v-if="confirmLoading" :icon="['fas', 'spinner']" class="animate-spin" />
                    {{ confirmText }}
                  </button>
                </slot>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  title?: string
  description?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closable?: boolean
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
  bodyClass?: string
  // Footer props
  showDefaultFooter?: boolean
  cancelText?: string
  confirmText?: string
  confirmVariant?: 'primary' | 'danger'
  confirmDisabled?: boolean
  confirmLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  closable: true,
  closeOnBackdrop: true,
  closeOnEscape: true,
  bodyClass: '',
  showDefaultFooter: false,
  confirmVariant: 'primary',
  confirmDisabled: false,
  confirmLoading: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'close': []
  'cancel': []
  'confirm': []
}>()

const modalRef = ref<HTMLElement | null>(null)

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[90vw] max-h-[90vh]',
  }
  return sizes[props.size]
})

const close = () => {
  emit('update:modelValue', false)
  emit('close')
}

const cancel = () => {
  emit('cancel')
  close()
}

const confirm = () => {
  emit('confirm')
}

// Handle escape key
const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.closeOnEscape && props.modelValue) {
    close()
  }
}

// Focus trap
const handleTab = (event: KeyboardEvent) => {
  if (!props.modelValue || !modalRef.value) return

  const focusableElements = modalRef.value.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )

  const firstElement = focusableElements[0] as HTMLElement
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault()
    lastElement.focus()
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault()
    firstElement.focus()
  }
}

// Lock body scroll when modal is open
watch(() => props.modelValue, (isOpen) => {
  if (import.meta.client) {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      document.addEventListener('keydown', handleEscape)
      document.addEventListener('keydown', handleTab)

      // Focus first focusable element
      nextTick(() => {
        const firstFocusable = modalRef.value?.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as HTMLElement
        firstFocusable?.focus()
      })
    } else {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('keydown', handleTab)
    }
  }
})

onUnmounted(() => {
  if (import.meta.client) {
    document.body.style.overflow = ''
    document.removeEventListener('keydown', handleEscape)
    document.removeEventListener('keydown', handleTab)
  }
})
</script>
