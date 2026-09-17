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

interface ListItem {
  content?: string
  meta?: { checked?: boolean }
  items?: Array<ListItem | string>
}

function renderList(data: { style: string; items: Array<ListItem | string> }): string {
  if (!data.items?.length) return ''
  const tag = data.style === 'ordered' ? 'ol' : 'ul'
  const listClass = data.style === 'checklist' ? ' class="checklist"' : ''

  // Les listes Editor.js 2.x contiennent des objets avec sous-listes imbriquées
  const items = data.items.map((item) => {
    if (typeof item === 'string') return `<li>${item}</li>`
    const content = item.content || ''
    const nested = item.items?.length ? renderList({ style: data.style, items: item.items }) : ''
    if (data.style === 'checklist') {
      const checked = item.meta?.checked
      return `<li class="checklist-item${checked ? ' checked' : ''}"><input type="checkbox" ${checked ? 'checked' : ''} disabled /><span>${content}</span>${nested}</li>`
    }
    return `<li>${content}${nested}</li>`
  }).join('')

  return `<${tag}${listClass}>${items}</${tag}>`
}

function renderQuote(data: { text: string; caption?: string; alignment?: string }): string {
  if (!data.text?.trim()) return ''
  const alignClass = data.alignment === 'center' ? ' class="text-center"' : ''
  let html = `<blockquote${alignClass}><p>${data.text}</p>`
  if (data.caption?.trim()) {
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

function renderEmbed(data: { service?: string; embed?: string; caption?: string }): string {
  // Sans adresse valide, une iframe afficherait la page elle-même : le bloc est ignoré
  if (!data.embed || !/^https:\/\//.test(data.embed)) return ''

  const src = data.embed.replace(/"/g, '&quot;')
  let html = '<figure class="content-video">'
  html += '<div class="embed-responsive">'
  html += `<iframe src="${src}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen></iframe>`
  html += '</div>'
  if (data.caption?.trim()) {
    html += `<figcaption>${data.caption}</figcaption>`
  }
  html += '</figure>'
  return html
}

// Minutage YouTube : « 90 », « 90s » ou « 1m30s »
function parseStartTime(value: string | null): number {
  if (!value) return 0
  if (/^\d+s?$/.test(value)) return parseInt(value, 10)
  const match = value.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/)
  if (!match) return 0
  return (Number(match[1] || 0) * 3600) + (Number(match[2] || 0) * 60) + Number(match[3] || 0)
}

export interface VideoEmbedData {
  service: 'youtube' | 'vimeo'
  source: string
  embed: string
  width: number
  height: number
  caption: string
}

/**
 * Convertit un lien YouTube ou Vimeo en données de bloc « embed » Editor.js.
 * Retourne null si le lien n'est pas reconnu.
 */
export function parseVideoUrl(input: string): VideoEmbedData | null {
  let url: URL
  try {
    url = new URL(input.trim())
  } catch {
    return null
  }
  const host = url.hostname.replace(/^(www\.|m\.)/, '')
  const base = { source: url.toString(), width: 580, height: 320, caption: '' }

  // YouTube : watch?v=, youtu.be/, embed/, shorts/, live/
  let youtubeId: string | null = null
  if (host === 'youtu.be') {
    youtubeId = url.pathname.slice(1).split('/')[0] || null
  } else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    youtubeId = url.searchParams.get('v')
      || url.pathname.match(/^\/(?:embed|shorts|live)\/([^/?#]+)/)?.[1]
      || null
  }
  if (youtubeId && /^[\w-]{6,}$/.test(youtubeId)) {
    const start = parseStartTime(url.searchParams.get('t') || url.searchParams.get('start'))
    return {
      ...base,
      service: 'youtube',
      embed: `https://www.youtube.com/embed/${youtubeId}${start > 0 ? `?start=${start}` : ''}`
    }
  }

  // Vimeo : vimeo.com/ID ou player.vimeo.com/video/ID
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const vimeoId = url.pathname.match(/(?:^|\/)(\d+)(?:\/|$)/)?.[1]
    if (vimeoId) {
      return { ...base, service: 'vimeo', embed: `https://player.vimeo.com/video/${vimeoId}` }
    }
  }

  return null
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
