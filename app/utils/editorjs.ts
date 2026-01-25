import type { OutputData } from '@editorjs/editorjs'

/**
 * Convert Editor.js output data to HTML
 */
export function editorJsToHtml(data: OutputData | string | null | undefined): string {
  if (!data) return ''

  // If it's a string, try to parse it
  let outputData: OutputData
  if (typeof data === 'string') {
    try {
      outputData = JSON.parse(data)
      if (!outputData.blocks) {
        // It's already HTML
        return data
      }
    } catch {
      // It's already HTML
      return data
    }
  } else {
    outputData = data
  }

  if (!outputData.blocks || !Array.isArray(outputData.blocks)) {
    return ''
  }

  const htmlBlocks = outputData.blocks.map(block => {
    switch (block.type) {
      case 'header':
        return renderHeader(block.data)
      case 'paragraph':
        return renderParagraph(block.data)
      case 'list':
        return renderList(block.data)
      case 'quote':
        return renderQuote(block.data)
      case 'delimiter':
        return renderDelimiter()
      case 'table':
        return renderTable(block.data)
      case 'embed':
        return renderEmbed(block.data)
      case 'image':
        return renderImage(block.data, block.tunes)
      case 'checklist':
        return renderChecklist(block.data)
      default:
        return ''
    }
  })

  return htmlBlocks.join('\n')
}

function renderHeader(data: { text: string; level: number }): string {
  const level = data.level || 2
  return `<h${level}>${data.text}</h${level}>`
}

function renderParagraph(data: { text: string }): string {
  if (!data.text?.trim()) return ''
  return `<p>${data.text}</p>`
}

function renderList(data: { style: string; items: string[] | any[] }): string {
  const tag = data.style === 'ordered' ? 'ol' : 'ul'
  const items = data.items.map(item => {
    // Handle nested list items (Editor.js 2.0 format)
    const content = typeof item === 'string' ? item : item.content || ''
    return `<li>${content}</li>`
  }).join('')
  return `<${tag}>${items}</${tag}>`
}

function renderQuote(data: { text: string; caption?: string }): string {
  let html = `<blockquote>${data.text}`
  if (data.caption) {
    html += `<cite>${data.caption}</cite>`
  }
  html += '</blockquote>'
  return html
}

function renderDelimiter(): string {
  return '<hr />'
}

function renderTable(data: { content: string[][]; withHeadings?: boolean; stretched?: boolean }): string {
  if (!data.content || !data.content.length) return ''

  const tableClass = data.stretched ? 'editor-table stretched' : 'editor-table'

  if (data.withHeadings && data.content.length > 1) {
    // First row is header
    const headerRow = data.content[0]
    const headerCells = headerRow.map(cell => `<th>${cell}</th>`).join('')
    const thead = `<thead><tr>${headerCells}</tr></thead>`

    // Rest are body rows
    const bodyRows = data.content.slice(1).map(row => {
      const cells = row.map(cell => `<td>${cell}</td>`).join('')
      return `<tr>${cells}</tr>`
    }).join('')
    const tbody = `<tbody>${bodyRows}</tbody>`

    return `<table class="${tableClass}">${thead}${tbody}</table>`
  }

  // No headers - all rows in tbody
  const rows = data.content.map(row => {
    const cells = row.map(cell => `<td>${cell}</td>`).join('')
    return `<tr>${cells}</tr>`
  }).join('')

  return `<table class="${tableClass}"><tbody>${rows}</tbody></table>`
}

function renderEmbed(data: { service: string; embed: string; caption?: string }): string {
  let html = `<div class="embed-responsive">`

  if (data.service === 'youtube') {
    html += `<iframe src="${data.embed}" frameborder="0" allowfullscreen></iframe>`
  } else if (data.service === 'vimeo') {
    html += `<iframe src="${data.embed}" frameborder="0" allowfullscreen></iframe>`
  } else {
    html += `<iframe src="${data.embed}" frameborder="0"></iframe>`
  }

  if (data.caption) {
    html += `<p class="caption">${data.caption}</p>`
  }

  html += '</div>'
  return html
}

function renderImage(
  data: { file?: { url: string }; url?: string; caption?: string; withBorder?: boolean; withBackground?: boolean; stretched?: boolean },
  tunes?: { imagePosition?: { position?: 'center' | 'left' | 'right' } }
): string {
  const url = data.file?.url || data.url || ''
  if (!url) return ''

  const classes: string[] = ['content-image']
  if (data.withBorder) classes.push('with-border')
  if (data.withBackground) classes.push('with-background')
  if (data.stretched) classes.push('stretched')

  // Handle image position tune
  const position = tunes?.imagePosition?.position
  if (position === 'left') classes.push('float-left')
  else if (position === 'right') classes.push('float-right')

  let html = `<figure class="${classes.join(' ')}">`
  html += `<img src="${url}" alt="${data.caption || ''}" />`
  if (data.caption) {
    html += `<figcaption>${data.caption}</figcaption>`
  }
  html += '</figure>'

  return html
}

function renderChecklist(data: { items: Array<{ text: string; checked: boolean }> }): string {
  if (!data.items || !data.items.length) return ''

  const items = data.items.map(item => {
    const checkedClass = item.checked ? 'checked' : ''
    const checkedAttr = item.checked ? 'checked' : ''
    return `<li class="checklist-item ${checkedClass}">
      <input type="checkbox" ${checkedAttr} disabled />
      <span>${item.text}</span>
    </li>`
  }).join('')

  return `<ul class="checklist">${items}</ul>`
}

/**
 * Check if content is in Editor.js format
 */
export function isEditorJsFormat(content: string | OutputData | null | undefined): boolean {
  if (!content) return false

  if (typeof content === 'object' && content.blocks) {
    return true
  }

  if (typeof content === 'string') {
    try {
      const parsed = JSON.parse(content)
      return Boolean(parsed.blocks)
    } catch {
      return false
    }
  }

  return false
}

/**
 * Stringify Editor.js data for storage
 */
export function stringifyEditorData(data: OutputData | null | undefined): string | null {
  if (!data) return null
  return JSON.stringify(data)
}

/**
 * Parse Editor.js data from string
 */
export function parseEditorData(content: string | null | undefined): OutputData | null {
  if (!content) return null

  try {
    const parsed = JSON.parse(content)
    if (parsed.blocks) {
      return parsed
    }
  } catch {
    // Not valid JSON
  }

  return null
}
