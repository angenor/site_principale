<script setup lang="ts">
interface Props {
  imageFile: File
  aspectRatio?: number | null // null = free, 1 = square, 16/9, 4/3, etc.
  maxFileSize?: number // in bytes, default 2MB
  minQuality?: number // minimum quality before warning (0-100)
}

const props = withDefaults(defineProps<Props>(), {
  aspectRatio: null,
  maxFileSize: 2 * 1024 * 1024, // 2MB
  minQuality: 30
})

const emit = defineEmits<{
  (e: 'save', blob: Blob): void
  (e: 'cancel'): void
}>()

// Refs
const canvasRef = ref<HTMLCanvasElement | null>(null)
const previewCanvasRef = ref<HTMLCanvasElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)

// State
const imageUrl = ref('')
const originalImage = ref<HTMLImageElement | null>(null)
const quality = ref(85)
const outputFormat = ref<'jpeg' | 'png' | 'webp'>('jpeg')

// Crop state
const cropX = ref(0)
const cropY = ref(0)
const cropWidth = ref(100)
const cropHeight = ref(100)
const isDragging = ref(false)
const isResizing = ref(false)
const resizeHandle = ref<string | null>(null)
const dragStartX = ref(0)
const dragStartY = ref(0)
const cropStartX = ref(0)
const cropStartY = ref(0)
const cropStartWidth = ref(0)
const cropStartHeight = ref(0)

// Computed values
const estimatedSize = ref(0)
const isProcessing = ref(false)

// Warnings
const sizeWarning = computed(() => {
  if (estimatedSize.value > props.maxFileSize) {
    return `Fichier trop lourd (${formatSize(estimatedSize.value)}). Maximum: ${formatSize(props.maxFileSize)}`
  }
  return null
})

const qualityWarning = computed(() => {
  if (quality.value < props.minQuality) {
    return `Qualité très basse - l'image risque d'être pixelisée`
  }
  return null
})

// Format file size
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(2)} Mo`
}

// Load image on mount
onMounted(async () => {
  imageUrl.value = URL.createObjectURL(props.imageFile)

  const img = new Image()
  img.onload = () => {
    originalImage.value = img
    initializeCrop()
    drawCanvas()
    updatePreview()
  }
  img.src = imageUrl.value
})

onUnmounted(() => {
  if (imageUrl.value) {
    URL.revokeObjectURL(imageUrl.value)
  }
})

// Initialize crop area
function initializeCrop() {
  if (!originalImage.value || !containerRef.value) return

  const img = originalImage.value
  const container = containerRef.value
  const containerWidth = container.clientWidth
  const containerHeight = 400

  // Scale image to fit container
  const scale = Math.min(containerWidth / img.width, containerHeight / img.height)
  const displayWidth = img.width * scale
  const displayHeight = img.height * scale

  // Initialize crop to full image or aspect ratio
  if (props.aspectRatio) {
    const targetRatio = props.aspectRatio
    const imageRatio = displayWidth / displayHeight

    if (imageRatio > targetRatio) {
      // Image is wider than target ratio
      cropHeight.value = displayHeight
      cropWidth.value = displayHeight * targetRatio
      cropX.value = (displayWidth - cropWidth.value) / 2
      cropY.value = 0
    } else {
      // Image is taller than target ratio
      cropWidth.value = displayWidth
      cropHeight.value = displayWidth / targetRatio
      cropX.value = 0
      cropY.value = (displayHeight - cropHeight.value) / 2
    }
  } else {
    cropX.value = 0
    cropY.value = 0
    cropWidth.value = displayWidth
    cropHeight.value = displayHeight
  }
}

// Draw main canvas with crop overlay
function drawCanvas() {
  if (!canvasRef.value || !originalImage.value || !containerRef.value) return

  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const img = originalImage.value
  const container = containerRef.value
  const containerWidth = container.clientWidth
  const containerHeight = 400

  // Scale image to fit
  const scale = Math.min(containerWidth / img.width, containerHeight / img.height)
  const displayWidth = img.width * scale
  const displayHeight = img.height * scale

  canvas.width = containerWidth
  canvas.height = containerHeight

  // Center image
  const offsetX = (containerWidth - displayWidth) / 2
  const offsetY = (containerHeight - displayHeight) / 2

  // Draw darkened image
  ctx.fillStyle = '#1f2937'
  ctx.fillRect(0, 0, containerWidth, containerHeight)

  ctx.globalAlpha = 0.5
  ctx.drawImage(img, offsetX, offsetY, displayWidth, displayHeight)
  ctx.globalAlpha = 1.0

  // Draw crop area (full brightness)
  ctx.save()
  ctx.beginPath()
  ctx.rect(offsetX + cropX.value, offsetY + cropY.value, cropWidth.value, cropHeight.value)
  ctx.clip()
  ctx.drawImage(img, offsetX, offsetY, displayWidth, displayHeight)
  ctx.restore()

  // Draw crop border
  ctx.strokeStyle = '#3695d8'
  ctx.lineWidth = 2
  ctx.strokeRect(offsetX + cropX.value, offsetY + cropY.value, cropWidth.value, cropHeight.value)

  // Draw resize handles
  const handleSize = 10
  const handles = [
    { x: cropX.value, y: cropY.value, cursor: 'nw-resize', name: 'nw' },
    { x: cropX.value + cropWidth.value, y: cropY.value, cursor: 'ne-resize', name: 'ne' },
    { x: cropX.value, y: cropY.value + cropHeight.value, cursor: 'sw-resize', name: 'sw' },
    { x: cropX.value + cropWidth.value, y: cropY.value + cropHeight.value, cursor: 'se-resize', name: 'se' }
  ]

  ctx.fillStyle = '#ffffff'
  ctx.strokeStyle = '#3695d8'
  ctx.lineWidth = 2

  handles.forEach(handle => {
    ctx.fillRect(
      offsetX + handle.x - handleSize / 2,
      offsetY + handle.y - handleSize / 2,
      handleSize,
      handleSize
    )
    ctx.strokeRect(
      offsetX + handle.x - handleSize / 2,
      offsetY + handle.y - handleSize / 2,
      handleSize,
      handleSize
    )
  })

  // Draw grid lines (rule of thirds)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
  ctx.lineWidth = 1

  for (let i = 1; i < 3; i++) {
    // Vertical lines
    ctx.beginPath()
    ctx.moveTo(offsetX + cropX.value + (cropWidth.value * i / 3), offsetY + cropY.value)
    ctx.lineTo(offsetX + cropX.value + (cropWidth.value * i / 3), offsetY + cropY.value + cropHeight.value)
    ctx.stroke()

    // Horizontal lines
    ctx.beginPath()
    ctx.moveTo(offsetX + cropX.value, offsetY + cropY.value + (cropHeight.value * i / 3))
    ctx.lineTo(offsetX + cropX.value + cropWidth.value, offsetY + cropY.value + (cropHeight.value * i / 3))
    ctx.stroke()
  }
}

// Update preview and calculate size
async function updatePreview() {
  if (!previewCanvasRef.value || !originalImage.value || !containerRef.value) return

  const preview = previewCanvasRef.value
  const ctx = preview.getContext('2d')
  if (!ctx) return

  const img = originalImage.value
  const container = containerRef.value
  const containerWidth = container.clientWidth
  const containerHeight = 400

  // Calculate scale used in main canvas
  const scale = Math.min(containerWidth / img.width, containerHeight / img.height)

  // Calculate actual crop coordinates on original image
  const actualCropX = cropX.value / scale
  const actualCropY = cropY.value / scale
  const actualCropWidth = cropWidth.value / scale
  const actualCropHeight = cropHeight.value / scale

  // Set preview canvas size (max 300px for preview)
  const previewScale = Math.min(300 / actualCropWidth, 200 / actualCropHeight)
  preview.width = actualCropWidth * previewScale
  preview.height = actualCropHeight * previewScale

  // Draw cropped image
  ctx.drawImage(
    img,
    actualCropX, actualCropY, actualCropWidth, actualCropHeight,
    0, 0, preview.width, preview.height
  )

  // Calculate estimated file size
  await calculateSize()
}

async function calculateSize() {
  if (!originalImage.value || !containerRef.value) return

  const img = originalImage.value
  const container = containerRef.value
  const containerWidth = container.clientWidth
  const containerHeight = 400
  const scale = Math.min(containerWidth / img.width, containerHeight / img.height)

  // Create temp canvas for size calculation
  const tempCanvas = document.createElement('canvas')
  const ctx = tempCanvas.getContext('2d')
  if (!ctx) return

  const actualCropX = cropX.value / scale
  const actualCropY = cropY.value / scale
  const actualCropWidth = cropWidth.value / scale
  const actualCropHeight = cropHeight.value / scale

  tempCanvas.width = actualCropWidth
  tempCanvas.height = actualCropHeight

  ctx.drawImage(
    img,
    actualCropX, actualCropY, actualCropWidth, actualCropHeight,
    0, 0, actualCropWidth, actualCropHeight
  )

  // Get blob to calculate size
  const mimeType = outputFormat.value === 'png' ? 'image/png' :
                   outputFormat.value === 'webp' ? 'image/webp' : 'image/jpeg'
  const qualityValue = outputFormat.value === 'png' ? undefined : quality.value / 100

  tempCanvas.toBlob((blob) => {
    if (blob) {
      estimatedSize.value = blob.size
    }
  }, mimeType, qualityValue)
}

// Mouse event handlers
function handleMouseDown(e: MouseEvent) {
  if (!canvasRef.value || !containerRef.value) return

  const canvas = canvasRef.value
  const rect = canvas.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  const container = containerRef.value
  const containerWidth = container.clientWidth
  const containerHeight = 400
  const img = originalImage.value
  if (!img) return

  const scale = Math.min(containerWidth / img.width, containerHeight / img.height)
  const displayWidth = img.width * scale
  const displayHeight = img.height * scale
  const offsetX = (containerWidth - displayWidth) / 2
  const offsetY = (containerHeight - displayHeight) / 2

  const handleSize = 10
  const handles = [
    { x: cropX.value, y: cropY.value, name: 'nw' },
    { x: cropX.value + cropWidth.value, y: cropY.value, name: 'ne' },
    { x: cropX.value, y: cropY.value + cropHeight.value, name: 'sw' },
    { x: cropX.value + cropWidth.value, y: cropY.value + cropHeight.value, name: 'se' }
  ]

  // Check if clicking on a handle
  for (const handle of handles) {
    const hx = offsetX + handle.x
    const hy = offsetY + handle.y
    if (Math.abs(x - hx) < handleSize && Math.abs(y - hy) < handleSize) {
      isResizing.value = true
      resizeHandle.value = handle.name
      dragStartX.value = x
      dragStartY.value = y
      cropStartX.value = cropX.value
      cropStartY.value = cropY.value
      cropStartWidth.value = cropWidth.value
      cropStartHeight.value = cropHeight.value
      return
    }
  }

  // Check if clicking inside crop area
  if (
    x >= offsetX + cropX.value &&
    x <= offsetX + cropX.value + cropWidth.value &&
    y >= offsetY + cropY.value &&
    y <= offsetY + cropY.value + cropHeight.value
  ) {
    isDragging.value = true
    dragStartX.value = x
    dragStartY.value = y
    cropStartX.value = cropX.value
    cropStartY.value = cropY.value
  }
}

function handleMouseMove(e: MouseEvent) {
  if (!canvasRef.value || !containerRef.value || !originalImage.value) return
  if (!isDragging.value && !isResizing.value) return

  const canvas = canvasRef.value
  const rect = canvas.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  const deltaX = x - dragStartX.value
  const deltaY = y - dragStartY.value

  const container = containerRef.value
  const containerWidth = container.clientWidth
  const containerHeight = 400
  const img = originalImage.value

  const scale = Math.min(containerWidth / img.width, containerHeight / img.height)
  const displayWidth = img.width * scale
  const displayHeight = img.height * scale

  if (isDragging.value) {
    // Move crop area
    cropX.value = Math.max(0, Math.min(displayWidth - cropWidth.value, cropStartX.value + deltaX))
    cropY.value = Math.max(0, Math.min(displayHeight - cropHeight.value, cropStartY.value + deltaY))
  } else if (isResizing.value) {
    // Resize crop area
    let newX = cropStartX.value
    let newY = cropStartY.value
    let newWidth = cropStartWidth.value
    let newHeight = cropStartHeight.value

    switch (resizeHandle.value) {
      case 'se':
        newWidth = Math.max(50, Math.min(displayWidth - cropX.value, cropStartWidth.value + deltaX))
        newHeight = props.aspectRatio
          ? newWidth / props.aspectRatio
          : Math.max(50, Math.min(displayHeight - cropY.value, cropStartHeight.value + deltaY))
        break
      case 'sw':
        newWidth = Math.max(50, cropStartWidth.value - deltaX)
        newX = cropStartX.value + cropStartWidth.value - newWidth
        newHeight = props.aspectRatio
          ? newWidth / props.aspectRatio
          : Math.max(50, Math.min(displayHeight - cropY.value, cropStartHeight.value + deltaY))
        break
      case 'ne':
        newWidth = Math.max(50, Math.min(displayWidth - cropX.value, cropStartWidth.value + deltaX))
        newHeight = props.aspectRatio
          ? newWidth / props.aspectRatio
          : Math.max(50, cropStartHeight.value - deltaY)
        newY = props.aspectRatio ? cropY.value : cropStartY.value + cropStartHeight.value - newHeight
        break
      case 'nw':
        newWidth = Math.max(50, cropStartWidth.value - deltaX)
        newX = cropStartX.value + cropStartWidth.value - newWidth
        newHeight = props.aspectRatio
          ? newWidth / props.aspectRatio
          : Math.max(50, cropStartHeight.value - deltaY)
        newY = props.aspectRatio ? cropStartY.value : cropStartY.value + cropStartHeight.value - newHeight
        break
    }

    // Ensure bounds
    newX = Math.max(0, newX)
    newY = Math.max(0, newY)
    if (newX + newWidth > displayWidth) newWidth = displayWidth - newX
    if (newY + newHeight > displayHeight) newHeight = displayHeight - newY

    cropX.value = newX
    cropY.value = newY
    cropWidth.value = newWidth
    cropHeight.value = newHeight
  }

  drawCanvas()
  updatePreview()
}

function handleMouseUp() {
  isDragging.value = false
  isResizing.value = false
  resizeHandle.value = null
}

// Watch quality changes
watch([quality, outputFormat], () => {
  updatePreview()
})

// Save cropped image
async function save() {
  if (!originalImage.value || !containerRef.value) return

  isProcessing.value = true

  try {
    const img = originalImage.value
    const container = containerRef.value
    const containerWidth = container.clientWidth
    const containerHeight = 400
    const scale = Math.min(containerWidth / img.width, containerHeight / img.height)

    const actualCropX = cropX.value / scale
    const actualCropY = cropY.value / scale
    const actualCropWidth = cropWidth.value / scale
    const actualCropHeight = cropHeight.value / scale

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = actualCropWidth
    canvas.height = actualCropHeight

    ctx.drawImage(
      img,
      actualCropX, actualCropY, actualCropWidth, actualCropHeight,
      0, 0, actualCropWidth, actualCropHeight
    )

    const mimeType = outputFormat.value === 'png' ? 'image/png' :
                     outputFormat.value === 'webp' ? 'image/webp' : 'image/jpeg'
    const qualityValue = outputFormat.value === 'png' ? undefined : quality.value / 100

    canvas.toBlob((blob) => {
      if (blob) {
        emit('save', blob)
      }
      isProcessing.value = false
    }, mimeType, qualityValue)
  } catch (error) {
    console.error('Error saving image:', error)
    isProcessing.value = false
  }
}

// Preset aspect ratios
const aspectRatios = [
  { label: 'Libre', value: null },
  { label: '1:1', value: 1 },
  { label: '16:9', value: 16/9 },
  { label: '4:3', value: 4/3 },
  { label: '3:2', value: 3/2 }
]

function setAspectRatio(ratio: number | null) {
  if (!containerRef.value || !originalImage.value) return

  const img = originalImage.value
  const container = containerRef.value
  const containerWidth = container.clientWidth
  const containerHeight = 400
  const scale = Math.min(containerWidth / img.width, containerHeight / img.height)
  const displayWidth = img.width * scale
  const displayHeight = img.height * scale

  if (ratio === null) {
    // Free aspect ratio - keep current crop
    return
  }

  // Adjust crop to new aspect ratio, keeping center
  const centerX = cropX.value + cropWidth.value / 2
  const centerY = cropY.value + cropHeight.value / 2

  let newWidth: number
  let newHeight: number

  if (cropWidth.value / cropHeight.value > ratio) {
    // Current crop is wider, adjust width
    newHeight = cropHeight.value
    newWidth = newHeight * ratio
  } else {
    // Current crop is taller, adjust height
    newWidth = cropWidth.value
    newHeight = newWidth / ratio
  }

  // Ensure it fits in image
  if (newWidth > displayWidth) {
    newWidth = displayWidth
    newHeight = newWidth / ratio
  }
  if (newHeight > displayHeight) {
    newHeight = displayHeight
    newWidth = newHeight * ratio
  }

  cropWidth.value = newWidth
  cropHeight.value = newHeight
  cropX.value = Math.max(0, Math.min(displayWidth - newWidth, centerX - newWidth / 2))
  cropY.value = Math.max(0, Math.min(displayHeight - newHeight, centerY - newHeight / 2))

  drawCanvas()
  updatePreview()
}
</script>

<template>
  <div class="image-editor bg-gray-900 rounded-xl overflow-hidden">
    <!-- Toolbar -->
    <div class="flex items-center justify-between p-3 bg-gray-800 border-b border-gray-700">
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-400">Ratio:</span>
        <div class="flex gap-1">
          <button
            v-for="ar in aspectRatios"
            :key="ar.label"
            @click="setAspectRatio(ar.value)"
            class="px-2 py-1 text-xs rounded transition-colors cursor-pointer"
            :class="[
              'bg-gray-700 text-gray-300 hover:bg-gray-600'
            ]"
          >
            {{ ar.label }}
          </button>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <button
          @click="emit('cancel')"
          class="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          Annuler
        </button>
        <button
          @click="save"
          :disabled="isProcessing || !!sizeWarning"
          class="px-4 py-1.5 text-sm bg-ti-blue text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <font-awesome-icon v-if="isProcessing" icon="spinner" class="animate-spin" />
          Appliquer
        </button>
      </div>
    </div>

    <!-- Main content -->
    <div class="flex">
      <!-- Canvas area -->
      <div ref="containerRef" class="flex-1 p-4">
        <canvas
          ref="canvasRef"
          class="w-full cursor-move"
          @mousedown="handleMouseDown"
          @mousemove="handleMouseMove"
          @mouseup="handleMouseUp"
          @mouseleave="handleMouseUp"
        />
      </div>

      <!-- Sidebar -->
      <div class="w-72 bg-gray-800 p-4 space-y-6">
        <!-- Preview -->
        <div>
          <h4 class="text-sm font-medium text-white mb-2">Aperçu</h4>
          <div class="bg-gray-900 rounded-lg p-2 flex items-center justify-center min-h-[150px]">
            <canvas ref="previewCanvasRef" class="max-w-full max-h-[150px] rounded" />
          </div>
        </div>

        <!-- Format -->
        <div>
          <h4 class="text-sm font-medium text-white mb-2">Format</h4>
          <div class="flex gap-2">
            <button
              v-for="fmt in ['jpeg', 'png', 'webp'] as const"
              :key="fmt"
              @click="outputFormat = fmt"
              class="px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer"
              :class="[
                outputFormat === fmt
                  ? 'bg-ti-blue text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              ]"
            >
              {{ fmt.toUpperCase() }}
            </button>
          </div>
        </div>

        <!-- Quality -->
        <div v-if="outputFormat !== 'png'">
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-sm font-medium text-white">Qualité</h4>
            <span class="text-sm text-gray-400">{{ quality }}%</span>
          </div>
          <input
            v-model="quality"
            type="range"
            min="10"
            max="100"
            step="5"
            class="w-full accent-ti-blue"
          />
          <div class="flex justify-between text-xs text-gray-500 mt-1">
            <span>Compressé</span>
            <span>Original</span>
          </div>
        </div>

        <!-- File size -->
        <div>
          <h4 class="text-sm font-medium text-white mb-2">Taille estimée</h4>
          <div
            class="text-lg font-mono"
            :class="[
              sizeWarning ? 'text-red-400' : 'text-green-400'
            ]"
          >
            {{ formatSize(estimatedSize) }}
          </div>
          <div class="text-xs text-gray-500 mt-1">
            Maximum: {{ formatSize(maxFileSize) }}
          </div>
        </div>

        <!-- Warnings -->
        <div v-if="sizeWarning || qualityWarning" class="space-y-2">
          <div v-if="sizeWarning" class="p-3 bg-red-900/50 border border-red-700 rounded-lg">
            <div class="flex items-start gap-2">
              <font-awesome-icon icon="circle-exclamation" class="text-red-400 mt-0.5" />
              <p class="text-sm text-red-300">{{ sizeWarning }}</p>
            </div>
          </div>
          <div v-if="qualityWarning" class="p-3 bg-yellow-900/50 border border-yellow-700 rounded-lg">
            <div class="flex items-start gap-2">
              <font-awesome-icon icon="triangle-exclamation" class="text-yellow-400 mt-0.5" />
              <p class="text-sm text-yellow-300">{{ qualityWarning }}</p>
            </div>
          </div>
        </div>

        <!-- Tips -->
        <div class="text-xs text-gray-500">
          <p class="mb-1"><strong>Astuce:</strong></p>
          <ul class="list-disc list-inside space-y-1">
            <li>Glissez pour déplacer la zone</li>
            <li>Utilisez les coins pour redimensionner</li>
            <li>Réduisez la qualité pour un fichier plus léger</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.image-editor {
  max-width: 100%;
  overflow: hidden;
}

canvas {
  display: block;
}

input[type="range"] {
  height: 6px;
  border-radius: 3px;
  background: #374151;
  appearance: none;
}

input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #3695d8;
  cursor: pointer;
}

input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #3695d8;
  cursor: pointer;
  border: none;
}
</style>
