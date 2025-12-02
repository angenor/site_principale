<template>
  <div
    :class="[
      'flex flex-col items-center justify-center text-center py-12 px-6',
      wrapperClass
    ]"
  >
    <!-- Icon -->
    <div
      :class="[
        'flex items-center justify-center rounded-full mb-4',
        'bg-[var(--color-error-light)]',
        iconSizeClass
      ]"
    >
      <font-awesome-icon
        :icon="icon"
        :class="['text-[var(--color-error)]', iconFontClass]"
      />
    </div>

    <!-- Title -->
    <h3
      v-if="title"
      class="font-heading text-lg font-bold text-[var(--text-primary)] uppercase tracking-wide mb-2"
    >
      {{ title }}
    </h3>

    <!-- Error message -->
    <p
      v-if="message"
      class="text-sm text-[var(--text-secondary)] max-w-md mb-2"
    >
      {{ message }}
    </p>

    <!-- Error code -->
    <p
      v-if="code"
      class="text-xs text-[var(--text-muted)] font-mono mb-6"
    >
      Code erreur: {{ code }}
    </p>

    <!-- Custom content -->
    <slot />

    <!-- Action buttons -->
    <div class="flex flex-wrap items-center justify-center gap-3 mt-4">
      <slot name="actions">
        <!-- Default retry button -->
        <button
          v-if="showRetry"
          @click="$emit('retry')"
          class="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-600)] transition-colors cursor-pointer"
        >
          <font-awesome-icon :icon="['fas', 'rotate-right']" />
          Réessayer
        </button>

        <!-- Default go back button -->
        <button
          v-if="showGoBack"
          @click="goBack"
          class="inline-flex items-center gap-2 px-4 py-2 bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-default)] rounded-lg hover:bg-[var(--interactive-hover)] transition-colors cursor-pointer"
        >
          <font-awesome-icon :icon="['fas', 'arrow-left']" />
          Retour
        </button>
      </slot>
    </div>

    <!-- Technical details (collapsible) -->
    <details
      v-if="details"
      class="mt-6 w-full max-w-lg text-left"
    >
      <summary class="text-xs text-[var(--text-muted)] cursor-pointer hover:text-[var(--text-secondary)]">
        Détails techniques
      </summary>
      <pre class="mt-2 p-3 bg-[var(--bg-page)] rounded-lg text-xs text-[var(--text-secondary)] overflow-x-auto font-mono">{{ details }}</pre>
    </details>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  message?: string
  code?: string | number
  details?: string
  icon?: string[]
  showRetry?: boolean
  showGoBack?: boolean
  size?: 'sm' | 'md' | 'lg'
  wrapperClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Une erreur est survenue',
  message: 'Nous n\'avons pas pu charger les données demandées.',
  icon: () => ['fas', 'circle-exclamation'],
  showRetry: true,
  showGoBack: false,
  size: 'md',
  wrapperClass: '',
})

defineEmits<{
  'retry': []
}>()

const router = useRouter()

// Icon size classes
const iconSizeClass = computed(() => {
  const sizes = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  }
  return sizes[props.size]
})

// Icon font size
const iconFontClass = computed(() => {
  const sizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  }
  return sizes[props.size]
})

// Go back navigation
const goBack = () => {
  router.back()
}
</script>
