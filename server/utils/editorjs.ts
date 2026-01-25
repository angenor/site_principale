interface OutputData {
  time?: number
  blocks: Array<{
    id?: string
    type: string
    data: any
  }>
  version?: string
}

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
        return renderImage(block.data)
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

function renderTable(data: { content: string[][] }): string {
  if (!data.content || !data.content.length) return ''

  const rows = data.content.map((row, index) => {
    const cells = row.map(cell => {
      const tag = index === 0 ? 'th' : 'td'
      return `<${tag}>${cell}</${tag}>`
    }).join('')
    return `<tr>${cells}</tr>`
  }).join('')

  return `<table><tbody>${rows}</tbody></table>`
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

function renderImage(data: { file?: { url: string }; url?: string; caption?: string; withBorder?: boolean; withBackground?: boolean; stretched?: boolean }): string {
  const url = data.file?.url || data.url || ''
  if (!url) return ''

  const classes: string[] = ['content-image']
  if (data.withBorder) classes.push('with-border')
  if (data.withBackground) classes.push('with-background')
  if (data.stretched) classes.push('stretched')

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
