/**
 * Composable pour gérer les instances Editor.js
 */
import EditorJS, { type OutputData, type EditorConfig, type API } from '@editorjs/editorjs'
import Header from '@editorjs/header'
import List from '@editorjs/list'
import Quote from '@editorjs/quote'
import Delimiter from '@editorjs/delimiter'
import Paragraph from '@editorjs/paragraph'

export interface EditorJSOptions {
  holder: string | HTMLElement
  data?: OutputData
  placeholder?: string
  readOnly?: boolean
  onChange?: (data: OutputData) => void
  onReady?: () => void
}

export interface EditorJSInstance {
  editor: Ref<EditorJS | null>
  isReady: Ref<boolean>
  save: () => Promise<OutputData | undefined>
  clear: () => Promise<void>
  destroy: () => void
  render: (data: OutputData) => Promise<void>
}

/**
 * Configuration par défaut des outils Editor.js
 */
const getDefaultTools = () => ({
  header: {
    class: Header,
    inlineToolbar: true,
    config: {
      placeholder: 'Titre...',
      levels: [1, 2, 3, 4],
      defaultLevel: 2,
    },
  },
  paragraph: {
    class: Paragraph,
    inlineToolbar: true,
    config: {
      placeholder: 'Commencez à écrire ou appuyez sur Tab pour ajouter un bloc...',
    },
  },
  list: {
    class: List,
    inlineToolbar: true,
    config: {
      defaultStyle: 'unordered',
    },
  },
  quote: {
    class: Quote,
    inlineToolbar: true,
    config: {
      quotePlaceholder: 'Citation...',
      captionPlaceholder: 'Auteur (optionnel)',
    },
  },
  delimiter: {
    class: Delimiter,
  },
})

/**
 * Composable pour créer et gérer une instance Editor.js
 */
export const useEditorJS = (options: EditorJSOptions): EditorJSInstance => {
  const editor = ref<EditorJS | null>(null)
  const isReady = ref(false)

  const initEditor = async () => {
    // Ensure we're on client side
    if (import.meta.server) return

    // Destroy existing instance if any
    if (editor.value) {
      await editor.value.isReady
      editor.value.destroy()
      editor.value = null
      isReady.value = false
    }

    const config: EditorConfig = {
      holder: options.holder,
      tools: getDefaultTools(),
      data: options.data || { blocks: [] },
      placeholder: options.placeholder || 'Commencez à écrire...',
      readOnly: options.readOnly || false,
      minHeight: 200,
      onChange: async (api: API) => {
        if (options.onChange) {
          try {
            const data = await api.saver.save()
            options.onChange(data)
          } catch (e) {
            console.error('Error saving editor data:', e)
          }
        }
      },
      onReady: () => {
        isReady.value = true
        if (options.onReady) {
          options.onReady()
        }
      },
    }

    try {
      editor.value = new EditorJS(config)
      await editor.value.isReady
    } catch (error) {
      console.error('Error initializing EditorJS:', error)
    }
  }

  const save = async (): Promise<OutputData | undefined> => {
    if (!editor.value || !isReady.value) return undefined
    try {
      return await editor.value.save()
    } catch (error) {
      console.error('Error saving editor:', error)
      return undefined
    }
  }

  const clear = async (): Promise<void> => {
    if (!editor.value || !isReady.value) return
    try {
      await editor.value.clear()
    } catch (error) {
      console.error('Error clearing editor:', error)
    }
  }

  const destroy = (): void => {
    if (editor.value) {
      editor.value.destroy()
      editor.value = null
      isReady.value = false
    }
  }

  const render = async (data: OutputData): Promise<void> => {
    if (!editor.value || !isReady.value) return
    try {
      await editor.value.render(data)
    } catch (error) {
      console.error('Error rendering editor:', error)
    }
  }

  // Initialize on mount
  onMounted(() => {
    nextTick(() => {
      initEditor()
    })
  })

  // Cleanup on unmount
  onUnmounted(() => {
    destroy()
  })

  return {
    editor,
    isReady,
    save,
    clear,
    destroy,
    render,
  }
}

/**
 * Types pour le contenu Editor.js
 */
export type { OutputData, API }
