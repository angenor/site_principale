/**
 * Toast notification system composable
 * Provides a global toast notification system with multiple types and positions
 */

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  duration?: number
  dismissible?: boolean
  action?: {
    label: string
    onClick: () => void
  }
}

export interface ToastOptions {
  title?: string
  message: string
  type?: Toast['type']
  duration?: number
  dismissible?: boolean
  action?: Toast['action']
}

interface ToastState {
  toasts: Toast[]
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
  maxToasts: number
}

const DEFAULT_DURATION = 5000
const DEFAULT_MAX_TOASTS = 5

export const useToast = () => {
  const state = useState<ToastState>('toasts', () => ({
    toasts: [],
    position: 'top-right',
    maxToasts: DEFAULT_MAX_TOASTS,
  }))

  /**
   * Generate unique ID for toast
   */
  const generateId = (): string => {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Add a new toast notification
   */
  const addToast = (options: ToastOptions): string => {
    const id = generateId()

    const toast: Toast = {
      id,
      type: options.type || 'info',
      title: options.title,
      message: options.message,
      duration: options.duration ?? DEFAULT_DURATION,
      dismissible: options.dismissible ?? true,
      action: options.action,
    }

    // Remove oldest toast if we've reached the limit
    if (state.value.toasts.length >= state.value.maxToasts) {
      state.value.toasts.shift()
    }

    state.value.toasts.push(toast)

    // Auto-dismiss after duration (if duration > 0)
    if (toast.duration && toast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, toast.duration)
    }

    return id
  }

  /**
   * Remove a toast by ID
   */
  const removeToast = (id: string): void => {
    const index = state.value.toasts.findIndex(t => t.id === id)
    if (index !== -1) {
      state.value.toasts.splice(index, 1)
    }
  }

  /**
   * Clear all toasts
   */
  const clearAll = (): void => {
    state.value.toasts = []
  }

  /**
   * Set toast container position
   */
  const setPosition = (position: ToastState['position']): void => {
    state.value.position = position
  }

  /**
   * Set maximum number of toasts
   */
  const setMaxToasts = (max: number): void => {
    state.value.maxToasts = max
  }

  // Convenience methods for different toast types
  const success = (message: string, options?: Omit<ToastOptions, 'message' | 'type'>): string => {
    return addToast({ ...options, message, type: 'success' })
  }

  const error = (message: string, options?: Omit<ToastOptions, 'message' | 'type'>): string => {
    return addToast({ ...options, message, type: 'error', duration: options?.duration ?? 7000 })
  }

  const warning = (message: string, options?: Omit<ToastOptions, 'message' | 'type'>): string => {
    return addToast({ ...options, message, type: 'warning' })
  }

  const info = (message: string, options?: Omit<ToastOptions, 'message' | 'type'>): string => {
    return addToast({ ...options, message, type: 'info' })
  }

  return {
    // State
    toasts: computed(() => state.value.toasts),
    position: computed(() => state.value.position),

    // Methods
    addToast,
    removeToast,
    clearAll,
    setPosition,
    setMaxToasts,

    // Convenience methods
    success,
    error,
    warning,
    info,
  }
}
