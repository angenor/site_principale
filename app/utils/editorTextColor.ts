import type { API, InlineTool, SanitizerConfig } from '@editorjs/editorjs'

const COLOR_CLASS = 'cdx-text-color'

const PALETTE: Array<{ label: string; value: string }> = [
  { label: 'Noir', value: '#111827' },
  { label: 'Gris', value: '#6b7280' },
  { label: 'Rouge', value: '#dc2626' },
  { label: 'Orange', value: '#ea580c' },
  { label: 'Jaune', value: '#ca8a04' },
  { label: 'Vert', value: '#16a34a' },
  { label: 'Bleu', value: '#3695d8' },
  { label: 'Bleu foncé', value: '#1e40af' },
  { label: 'Violet', value: '#7c3aed' },
  { label: 'Rose', value: '#db2777' }
]

/**
 * Outil en ligne Editor.js : change la couleur du texte sélectionné.
 * Le texte coloré est enveloppé dans <span class="cdx-text-color" style="color: …">.
 */
export default class TextColorTool implements InlineTool {
  private api: API
  private button: HTMLButtonElement | null = null
  private savedRange: Range | null = null

  static get isInline() {
    return true
  }

  static get title() {
    return 'Couleur du texte'
  }

  static get sanitize(): SanitizerConfig {
    return {
      span: {
        class: COLOR_CLASS,
        style: true
      }
    }
  }

  constructor({ api }: { api: API }) {
    this.api = api
  }

  render() {
    // La barre d'outils ouvre directement la palette : on mémorise la sélection dès maintenant
    this.saveSelection()

    this.button = document.createElement('button')
    this.button.type = 'button'
    this.button.classList.add(this.api.styles.inlineToolButton)
    this.button.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 15.5L12 5l4 10.5M9.3 12h5.4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <rect x="5" y="18" width="14" height="3" rx="1" fill="#dc2626"/>
      </svg>
    `
    return this.button
  }

  surround(range: Range | null) {
    if (range) {
      this.savedRange = range.cloneRange()
    }
  }

  checkState(selection: Selection) {
    if (selection?.rangeCount) {
      this.savedRange = selection.getRangeAt(0).cloneRange()
    }
    const active = !!this.findColorSpan(selection?.anchorNode ?? null)
    this.button?.classList.toggle(this.api.styles.inlineToolButtonActive, active)
    return active
  }

  renderActions() {
    const wrapper = document.createElement('div')
    wrapper.classList.add('cdx-text-color-actions')

    const swatches = document.createElement('div')
    swatches.classList.add('cdx-text-color-swatches')

    PALETTE.forEach(({ label, value }) => {
      const swatch = document.createElement('button')
      swatch.type = 'button'
      swatch.title = label
      swatch.setAttribute('aria-label', label)
      swatch.classList.add('cdx-text-color-swatch')
      swatch.style.backgroundColor = value
      // mousedown.preventDefault conserve la sélection de l'utilisateur
      swatch.addEventListener('mousedown', event => event.preventDefault())
      swatch.addEventListener('click', () => this.applyColor(value))
      swatches.appendChild(swatch)
    })
    wrapper.appendChild(swatches)

    const footer = document.createElement('div')
    footer.classList.add('cdx-text-color-footer')

    const customLabel = document.createElement('label')
    customLabel.classList.add('cdx-text-color-custom')
    customLabel.title = 'Couleur personnalisée'
    const picker = document.createElement('input')
    picker.type = 'color'
    picker.value = '#3695d8'
    picker.addEventListener('change', () => this.applyColor(picker.value))
    customLabel.appendChild(picker)
    customLabel.appendChild(document.createTextNode('Autre'))
    footer.appendChild(customLabel)

    const reset = document.createElement('button')
    reset.type = 'button'
    reset.classList.add('cdx-text-color-reset')
    reset.textContent = 'Par défaut'
    reset.addEventListener('mousedown', event => event.preventDefault())
    reset.addEventListener('click', () => this.applyColor(null))
    footer.appendChild(reset)

    wrapper.appendChild(footer)
    return wrapper
  }

  private saveSelection() {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      this.savedRange = selection.getRangeAt(0).cloneRange()
    }
  }

  private findColorSpan(node: Node | null): HTMLSpanElement | null {
    let current: Node | null = node
    while (current) {
      if (current instanceof HTMLElement) {
        if (current.classList.contains(COLOR_CLASS)) return current as HTMLSpanElement
        if (current.isContentEditable === false || current.getAttribute('contenteditable') === 'true') {
          return null
        }
      }
      current = current.parentNode
    }
    return null
  }

  private unwrap(element: Element) {
    const parent = element.parentNode
    if (!parent) return
    while (element.firstChild) {
      parent.insertBefore(element.firstChild, element)
    }
    parent.removeChild(element)
  }

  private applyColor(color: string | null) {
    const range = this.savedRange
    if (!range || range.collapsed) return

    const selection = window.getSelection()
    const parentSpan = this.findColorSpan(range.commonAncestorContainer)

    // Sélection couvrant exactement un texte déjà coloré : on modifie ce span
    if (parentSpan && parentSpan.textContent === range.toString()) {
      if (color) {
        parentSpan.style.color = color
      } else {
        this.unwrap(parentSpan)
      }
    } else {
      const fragment = range.extractContents()
      // Retirer les couleurs imbriquées pour éviter l'empilement de spans
      fragment.querySelectorAll(`span.${COLOR_CLASS}`).forEach(span => this.unwrap(span))

      if (color) {
        const span = document.createElement('span')
        span.classList.add(COLOR_CLASS)
        span.style.color = color
        span.appendChild(fragment)
        range.insertNode(span)
        range.selectNodeContents(span)
      } else if (parentSpan) {
        // Retrait partiel : on scinde le span coloré autour de la sélection
        const tail = document.createRange()
        tail.setStart(range.startContainer, range.startOffset)
        tail.setEnd(parentSpan, parentSpan.childNodes.length)
        const tailContent = tail.extractContents()

        const plain = document.createElement('span')
        plain.appendChild(fragment)
        parentSpan.after(plain)
        if (tailContent.textContent) {
          const tailSpan = parentSpan.cloneNode(false) as HTMLSpanElement
          tailSpan.appendChild(tailContent)
          plain.after(tailSpan)
        }
        if (!parentSpan.textContent) parentSpan.remove()

        range.selectNodeContents(plain)
        // Le span neutre n'est qu'un repère de sélection : on le déplie
        const first = plain.firstChild
        const last = plain.lastChild
        this.unwrap(plain)
        if (first && last) {
          range.setStartBefore(first)
          range.setEndAfter(last)
        }
      } else {
        range.insertNode(fragment)
      }

      selection?.removeAllRanges()
      selection?.addRange(range)
    }

    this.savedRange = null
    this.api.inlineToolbar.close()
  }
}
