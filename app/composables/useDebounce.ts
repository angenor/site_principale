/**
 * Crée une ref avec debounce
 */
export function refDebounced<T>(source: Ref<T>, delay: number = 300): Ref<T> {
  const debounced = ref(source.value) as Ref<T>
  let timeout: ReturnType<typeof setTimeout> | null = null

  watch(source, (newValue) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => {
      debounced.value = newValue
    }, delay)
  })

  return debounced
}

/**
 * Debounce une fonction
 */
export function useDebounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delay: number = 300
): T {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return ((...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => {
      fn(...args)
    }, delay)
  }) as T
}
