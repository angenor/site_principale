<template>
  <div
    :class="[
      'bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6 shadow-sm hover:shadow-md transition-shadow',
      clickable ? 'cursor-pointer' : '',
      wrapperClass
    ]"
    @click="clickable && $emit('click')"
  >
    <div class="flex items-start justify-between">
      <div class="flex-1 min-w-0">
        <!-- Label -->
        <p class="text-sm text-[var(--text-secondary)] mb-1 truncate">
          {{ label }}
        </p>

        <!-- Value -->
        <p :class="['font-bold text-[var(--text-primary)]', valueSizeClass, valueClass]">
          <span v-if="loading" class="inline-block w-20 h-8 bg-[var(--text-muted)]/20 rounded animate-pulse" />
          <template v-else>
            <span v-if="prefix" class="text-[var(--text-secondary)] font-normal">{{ prefix }}</span>
            {{ formattedValue }}
            <span v-if="suffix" class="text-sm text-[var(--text-secondary)] font-normal ml-1">{{ suffix }}</span>
          </template>
        </p>

        <!-- Trend -->
        <div
          v-if="trend !== undefined && !loading"
          :class="[
            'mt-2 text-xs font-medium flex items-center gap-1',
            trendColorClass
          ]"
        >
          <font-awesome-icon :icon="trendIcon" class="w-3 h-3" />
          <span>{{ formattedTrend }} {{ trendLabel }}</span>
        </div>

        <!-- Description -->
        <p v-if="description" class="mt-2 text-xs text-[var(--text-muted)]">
          {{ description }}
        </p>
      </div>

      <!-- Icon -->
      <div
        v-if="icon"
        :class="[
          'w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ml-4',
          iconBgClass
        ]"
      >
        <font-awesome-icon :icon="icon" :class="['text-xl', iconColorClass]" />
      </div>
    </div>

    <!-- Progress bar (optional) -->
    <div v-if="progress !== undefined" class="mt-4">
      <div class="flex items-center justify-between text-xs text-[var(--text-muted)] mb-1">
        <span>{{ progressLabel || 'Progression' }}</span>
        <span>{{ progress }}%</span>
      </div>
      <div class="w-full h-2 bg-[var(--text-muted)]/20 rounded-full overflow-hidden">
        <div
          :class="['h-full rounded-full transition-all duration-500', progressColorClass]"
          :style="{ width: `${Math.min(100, Math.max(0, progress))}%` }"
        />
      </div>
    </div>

    <!-- Slot for additional content -->
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  label: string
  value: number | string
  prefix?: string
  suffix?: string
  icon?: string[]
  iconVariant?: 'primary' | 'success' | 'warning' | 'error' | 'info'
  trend?: number
  trendLabel?: string
  trendInverted?: boolean // If true, negative is good (e.g., for expenses)
  description?: string
  loading?: boolean
  clickable?: boolean
  size?: 'sm' | 'md' | 'lg'
  format?: 'number' | 'currency' | 'percent' | 'none'
  progress?: number
  progressLabel?: string
  progressVariant?: 'primary' | 'success' | 'warning' | 'error'
  wrapperClass?: string
  valueClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  iconVariant: 'primary',
  trendLabel: 'vs mois dernier',
  trendInverted: false,
  loading: false,
  clickable: false,
  size: 'md',
  format: 'number',
  progressVariant: 'primary',
  wrapperClass: '',
  valueClass: '',
})

defineEmits<{
  'click': []
}>()

// Format value
const formattedValue = computed(() => {
  if (typeof props.value === 'string') return props.value

  switch (props.format) {
    case 'currency':
      return new Intl.NumberFormat('fr-MG', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(props.value)
    case 'percent':
      return `${props.value.toFixed(1)}%`
    case 'number':
      return new Intl.NumberFormat('fr-MG').format(props.value)
    default:
      return String(props.value)
  }
})

// Format trend
const formattedTrend = computed(() => {
  if (props.trend === undefined) return ''
  const sign = props.trend >= 0 ? '+' : ''
  return `${sign}${props.trend.toFixed(1)}%`
})

// Value size class
const valueSizeClass = computed(() => {
  const sizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  }
  return sizes[props.size]
})

// Trend icon
const trendIcon = computed(() => {
  if (props.trend === undefined) return ['fas', 'minus']
  return props.trend >= 0 ? ['fas', 'arrow-up'] : ['fas', 'arrow-down']
})

// Trend color based on value and inversion
const trendColorClass = computed(() => {
  if (props.trend === undefined) return 'text-[var(--text-muted)]'

  const isPositive = props.trend >= 0
  const isGood = props.trendInverted ? !isPositive : isPositive

  return isGood ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'
})

// Icon background class
const iconBgClass = computed(() => {
  const variants = {
    primary: 'bg-[var(--color-primary-50)]',
    success: 'bg-[var(--color-success-light)]',
    warning: 'bg-[var(--color-warning-light)]',
    error: 'bg-[var(--color-error-light)]',
    info: 'bg-[var(--color-info-light)]',
  }
  return variants[props.iconVariant]
})

// Icon color class
const iconColorClass = computed(() => {
  const variants = {
    primary: 'text-[var(--color-primary)]',
    success: 'text-[var(--color-success)]',
    warning: 'text-[var(--color-warning)]',
    error: 'text-[var(--color-error)]',
    info: 'text-[var(--color-info)]',
  }
  return variants[props.iconVariant]
})

// Progress bar color
const progressColorClass = computed(() => {
  const variants = {
    primary: 'bg-[var(--color-primary)]',
    success: 'bg-[var(--color-success)]',
    warning: 'bg-[var(--color-warning)]',
    error: 'bg-[var(--color-error)]',
  }
  return variants[props.progressVariant]
})
</script>
