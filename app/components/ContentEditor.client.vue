<script setup lang="ts">
import EditorJS, { type OutputData } from '@editorjs/editorjs'
import Header from '@editorjs/header'
import List from '@editorjs/list'
import Quote from '@editorjs/quote'
import Embed from '@editorjs/embed'
import Table from '@editorjs/table'
import Delimiter from '@editorjs/delimiter'
import Marker from '@editorjs/marker'
import InlineCode from '@editorjs/inline-code'
import Paragraph from '@editorjs/paragraph'
import ImageTool from '@editorjs/image'

interface Props {
  modelValue?: string | OutputData | null
  placeholder?: string
  readOnly?: boolean
  minHeight?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  placeholder: 'Commencez à écrire ou appuyez sur Tab pour choisir un bloc...',
  readOnly: false,
  minHeight: 300
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: OutputData): void
  (e: 'ready'): void
  (e: 'change', value: OutputData): void
}>()

const editorContainer = ref<HTMLElement | null>(null)
let editor: EditorJS | null = null

// Parse initial data
const getInitialData = (): OutputData | undefined => {
  if (!props.modelValue) return undefined

  if (typeof props.modelValue === 'string') {
    try {
      // Try to parse as JSON (Editor.js format)
      const parsed = JSON.parse(props.modelValue)
      if (parsed.blocks) return parsed
    } catch {
      // If it's HTML, convert to Editor.js format
      if (props.modelValue.trim()) {
        return htmlToEditorJs(props.modelValue)
      }
    }
  } else if (typeof props.modelValue === 'object' && props.modelValue.blocks) {
    return props.modelValue
  }

  return undefined
}

// Convert simple HTML to Editor.js blocks
const htmlToEditorJs = (html: string): OutputData => {
  const blocks: OutputData['blocks'] = []
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  const processNode = (node: Element) => {
    const tagName = node.tagName.toLowerCase()

    switch (tagName) {
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
        blocks.push({
          type: 'header',
          data: {
            text: node.innerHTML,
            level: parseInt(tagName[1])
          }
        })
        break
      case 'p':
        if (node.textContent?.trim()) {
          blocks.push({
            type: 'paragraph',
            data: { text: node.innerHTML }
          })
        }
        break
      case 'ul':
        blocks.push({
          type: 'list',
          data: {
            style: 'unordered',
            items: Array.from(node.querySelectorAll('li')).map(li => li.innerHTML)
          }
        })
        break
      case 'ol':
        blocks.push({
          type: 'list',
          data: {
            style: 'ordered',
            items: Array.from(node.querySelectorAll('li')).map(li => li.innerHTML)
          }
        })
        break
      case 'blockquote':
        blocks.push({
          type: 'quote',
          data: {
            text: node.innerHTML,
            caption: ''
          }
        })
        break
      case 'hr':
        blocks.push({ type: 'delimiter', data: {} })
        break
      case 'table':
        const rows = Array.from(node.querySelectorAll('tr')).map(tr =>
          Array.from(tr.querySelectorAll('td, th')).map(cell => cell.innerHTML)
        )
        if (rows.length) {
          blocks.push({
            type: 'table',
            data: { content: rows }
          })
        }
        break
      default:
        // For other elements, add as paragraph
        if (node.textContent?.trim()) {
          blocks.push({
            type: 'paragraph',
            data: { text: node.innerHTML }
          })
        }
    }
  }

  doc.body.childNodes.forEach(node => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      processNode(node as Element)
    } else if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
      blocks.push({
        type: 'paragraph',
        data: { text: node.textContent }
      })
    }
  })

  return {
    time: Date.now(),
    blocks: blocks.length ? blocks : [{ type: 'paragraph', data: { text: '' } }],
    version: '2.31.0'
  }
}

onMounted(async () => {
  if (!editorContainer.value) return

  const initialData = getInitialData()

  editor = new EditorJS({
    holder: editorContainer.value,
    placeholder: props.placeholder,
    readOnly: props.readOnly,
    minHeight: props.minHeight,
    data: initialData,
    tools: {
      header: {
        class: Header,
        inlineToolbar: true,
        config: {
          placeholder: 'Titre',
          levels: [2, 3, 4],
          defaultLevel: 2
        }
      },
      paragraph: {
        class: Paragraph,
        inlineToolbar: true
      },
      list: {
        class: List,
        inlineToolbar: true,
        config: {
          defaultStyle: 'unordered'
        }
      },
      quote: {
        class: Quote,
        inlineToolbar: true,
        config: {
          quotePlaceholder: 'Citation',
          captionPlaceholder: 'Auteur'
        }
      },
      embed: {
        class: Embed,
        config: {
          services: {
            youtube: true,
            vimeo: true
          }
        }
      },
      table: {
        class: Table,
        inlineToolbar: true
      },
      delimiter: Delimiter,
      marker: {
        class: Marker
      },
      inlineCode: {
        class: InlineCode
      },
      image: {
        class: ImageTool,
        config: {
          uploader: {
            async uploadByFile(file: File) {
              const formData = new FormData()
              formData.append('file', file)

              try {
                const response = await $fetch<{ success: boolean; url: string }>('/api/admin/upload', {
                  method: 'POST',
                  body: formData
                })

                if (response.success && response.url) {
                  return {
                    success: 1,
                    file: {
                      url: response.url
                    }
                  }
                }
                return { success: 0 }
              } catch {
                return { success: 0 }
              }
            },
            async uploadByUrl(url: string) {
              return {
                success: 1,
                file: {
                  url
                }
              }
            }
          },
          captionPlaceholder: 'Légende de l\'image',
          buttonContent: 'Sélectionner une image'
        }
      }
    },
    onChange: async () => {
      if (editor) {
        const data = await editor.save()
        emit('update:modelValue', data)
        emit('change', data)
      }
    },
    onReady: () => {
      emit('ready')
    }
  })
})

onBeforeUnmount(() => {
  if (editor) {
    editor.destroy()
    editor = null
  }
})

// Expose save method
const save = async (): Promise<OutputData | null> => {
  if (editor) {
    return await editor.save()
  }
  return null
}

defineExpose({ save })
</script>

<template>
  <div class="content-editor">
    <div
      ref="editorContainer"
      class="editor-container"
      :style="{ minHeight: `${minHeight}px` }"
    />
  </div>
</template>

<style scoped>
.content-editor {
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  overflow: hidden;
  background-color: white;
}

.dark .content-editor {
  border-color: #4b5563;
  background-color: #1f2937;
}

.editor-container {
  padding: 1rem;
}

/* Editor.js styles */
:deep(.codex-editor) {
  color: #111827;
}

.dark :deep(.codex-editor) {
  color: white;
}

:deep(.codex-editor__redactor) {
  padding-bottom: 1rem;
}

:deep(.ce-block__content),
:deep(.ce-toolbar__content) {
  max-width: none;
}

:deep(.ce-toolbar__plus),
:deep(.ce-toolbar__settings-btn) {
  color: #4b5563;
  background-color: #f3f4f6;
  border-radius: 0.25rem;
}

.dark :deep(.ce-toolbar__plus),
.dark :deep(.ce-toolbar__settings-btn) {
  color: #9ca3af;
  background-color: #374151;
}

:deep(.ce-toolbar__plus:hover),
:deep(.ce-toolbar__settings-btn:hover) {
  background-color: #e5e7eb;
}

.dark :deep(.ce-toolbar__plus:hover),
.dark :deep(.ce-toolbar__settings-btn:hover) {
  background-color: #4b5563;
}

:deep(.ce-inline-toolbar),
:deep(.ce-conversion-toolbar),
:deep(.ce-settings) {
  background-color: white;
  border-color: #e5e7eb;
}

.dark :deep(.ce-inline-toolbar),
.dark :deep(.ce-conversion-toolbar),
.dark :deep(.ce-settings) {
  background-color: #374151;
  border-color: #4b5563;
}

:deep(.ce-inline-tool),
:deep(.ce-conversion-tool),
:deep(.cdx-settings-button) {
  color: #374151;
}

.dark :deep(.ce-inline-tool),
.dark :deep(.ce-conversion-tool),
.dark :deep(.cdx-settings-button) {
  color: #d1d5db;
}

:deep(.ce-inline-tool:hover),
:deep(.ce-conversion-tool:hover),
:deep(.cdx-settings-button:hover) {
  background-color: #f3f4f6;
}

.dark :deep(.ce-inline-tool:hover),
.dark :deep(.ce-conversion-tool:hover),
.dark :deep(.cdx-settings-button:hover) {
  background-color: #4b5563;
}

:deep(.ce-block--selected .ce-block__content) {
  background-color: #eff6ff;
}

.dark :deep(.ce-block--selected .ce-block__content) {
  background-color: rgba(59, 130, 246, 0.2);
}

:deep(.ce-paragraph) {
  line-height: 1.625;
}

:deep(.ce-header) {
  font-weight: 700;
}

:deep(.cdx-list) {
  padding-left: 1.5rem;
}

:deep(.cdx-list__item) {
  padding: 0.25rem 0;
}

:deep(.cdx-quote) {
  border-left: 4px solid #3695d8;
  padding-left: 1rem;
  font-style: italic;
}

:deep(.cdx-quote__caption) {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.5rem;
}

.dark :deep(.cdx-quote__caption) {
  color: #9ca3af;
}

:deep(.ce-delimiter) {
  text-align: center;
  margin: 1.5rem 0;
}

:deep(.ce-delimiter::before) {
  content: '***';
  color: #9ca3af;
  font-size: 1.5rem;
  letter-spacing: 0.1em;
}

.dark :deep(.ce-delimiter::before) {
  color: #6b7280;
}

:deep(.tc-table) {
  width: 100%;
  border-collapse: collapse;
}

:deep(.tc-table td) {
  border: 1px solid #d1d5db;
  padding: 0.5rem;
}

.dark :deep(.tc-table td) {
  border-color: #4b5563;
}

:deep(.cdx-marker) {
  background-color: #fef08a;
  padding: 0 0.25rem;
  border-radius: 0.25rem;
}

.dark :deep(.cdx-marker) {
  background-color: rgba(202, 138, 4, 0.5);
}

:deep(.inline-code) {
  background-color: #f3f4f6;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  font-family: ui-monospace, monospace;
  color: #db2777;
}

.dark :deep(.inline-code) {
  background-color: #374151;
  color: #f472b6;
}

/* Image tool styles */
:deep(.image-tool) {
  padding: 0;
}

:deep(.image-tool__image) {
  border-radius: 0.5rem;
  overflow: hidden;
}

:deep(.image-tool__image-picture) {
  max-width: 100%;
  vertical-align: bottom;
}

:deep(.image-tool__caption) {
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.5rem;
}

.dark :deep(.image-tool__caption) {
  border-color: #4b5563;
  background-color: #374151;
  color: #9ca3af;
}

:deep(.cdx-button) {
  background-color: #f3f4f6;
  border: 1px dashed #d1d5db;
  border-radius: 0.5rem;
  padding: 1rem;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

:deep(.cdx-button:hover) {
  background-color: #e5e7eb;
  border-color: #9ca3af;
}

.dark :deep(.cdx-button) {
  background-color: #374151;
  border-color: #4b5563;
  color: #9ca3af;
}

.dark :deep(.cdx-button:hover) {
  background-color: #4b5563;
  border-color: #6b7280;
}

:deep(.image-tool--withBorder .image-tool__image) {
  border: 1px solid #e5e7eb;
}

.dark :deep(.image-tool--withBorder .image-tool__image) {
  border-color: #4b5563;
}

:deep(.image-tool--withBackground .image-tool__image) {
  background-color: #f3f4f6;
  padding: 1rem;
}

.dark :deep(.image-tool--withBackground .image-tool__image) {
  background-color: #374151;
}

:deep(.image-tool--stretched .image-tool__image-picture) {
  width: 100%;
}
</style>
