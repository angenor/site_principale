<script setup lang="ts">
interface Props {
  variant?: 'spinner' | 'dots' | 'skeleton'
  size?: 'sm' | 'md' | 'lg'
  text?: string
  // Skeleton props
  skeletonType?: 'text' | 'title' | 'avatar' | 'image' | 'card' | 'custom'
  lines?: number
  width?: string
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'spinner',
  size: 'md',
  skeletonType: 'text',
  lines: 3
})

const spinnerSizes = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12'
}

const dotSizes = {
  sm: 'w-2 h-2',
  md: 'w-3 h-3',
  lg: 'w-4 h-4'
}
</script>

<template>
  <!-- Spinner -->
  <div v-if="variant === 'spinner'" class="flex flex-col items-center justify-center gap-3">
    <div :class="['animate-spin text-ti-blue', spinnerSizes[size]]">
      <svg viewBox="0 0 24 24" fill="none" class="w-full h-full">
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
    <span v-if="text" class="text-sm text-gray-600 dark:text-gray-400">{{ text }}</span>
  </div>

  <!-- Dots -->
  <div v-else-if="variant === 'dots'" class="flex items-center justify-center gap-2">
    <div
      v-for="i in 3"
      :key="i"
      :class="[
        'rounded-full bg-ti-blue animate-bounce',
        dotSizes[size]
      ]"
      :style="{ animationDelay: `${(i - 1) * 0.15}s` }"
    />
    <span v-if="text" class="ml-3 text-sm text-gray-600 dark:text-gray-400">{{ text }}</span>
  </div>

  <!-- Skeleton -->
  <div v-else-if="variant === 'skeleton'" class="animate-pulse">
    <!-- Text skeleton -->
    <template v-if="skeletonType === 'text'">
      <div class="space-y-3">
        <div
          v-for="i in lines"
          :key="i"
          class="h-4 bg-gray-200 dark:bg-gray-700 rounded"
          :class="i === lines ? 'w-3/4' : 'w-full'"
        />
      </div>
    </template>

    <!-- Title skeleton -->
    <template v-else-if="skeletonType === 'title'">
      <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
    </template>

    <!-- Avatar skeleton -->
    <template v-else-if="skeletonType === 'avatar'">
      <div
        :class="[
          'rounded-full bg-gray-200 dark:bg-gray-700',
          size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-16 h-16' : 'w-12 h-12'
        ]"
      />
    </template>

    <!-- Image skeleton -->
    <template v-else-if="skeletonType === 'image'">
      <div
        class="bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center"
        :style="{ width: width || '100%', height: height || '200px' }"
      >
        <font-awesome-icon icon="image" class="w-10 h-10 text-gray-400" />
      </div>
    </template>

    <!-- Card skeleton -->
    <template v-else-if="skeletonType === 'card'">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div class="h-48 bg-gray-200 dark:bg-gray-700" />
        <div class="p-4 space-y-3">
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          <div class="space-y-2">
            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded" />
            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
          </div>
        </div>
      </div>
    </template>

    <!-- Custom skeleton (uses slot) -->
    <template v-else-if="skeletonType === 'custom'">
      <slot />
    </template>
  </div>
</template>

<style scoped>
@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.animate-bounce {
  animation: bounce 1.4s infinite ease-in-out both;
}
</style>
