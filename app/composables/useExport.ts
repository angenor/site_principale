/**
 * Composable pour l'export de données côté client
 * Supporte Excel (xlsx), CSV, PDF et impression
 */

import * as XLSX from 'xlsx'

// Types pour html2pdf.js (importé dynamiquement pour éviter les erreurs SSR)
type Html2PdfOptions = {
  margin?: number | number[]
  filename?: string
  image?: { type?: string; quality?: number }
  html2canvas?: { scale?: number; useCORS?: boolean; logging?: boolean }
  jsPDF?: { unit?: string; format?: string | number[]; orientation?: 'portrait' | 'landscape' }
  pagebreak?: { mode?: string | string[]; before?: string[]; after?: string[]; avoid?: string[] }
}

export interface ExportColumn {
  key: string
  label: string
  format?: (value: any, row: any) => string | number
  width?: number
}

export interface ExportOptions {
  filename?: string
  sheetName?: string
  title?: string
  subtitle?: string
  includeDate?: boolean
  columns?: ExportColumn[]
}

export interface PdfExportOptions {
  filename?: string
  orientation?: 'portrait' | 'landscape'
  format?: 'a4' | 'a3' | 'letter' | 'legal'
  margin?: number | [number, number, number, number]
  scale?: number
  title?: string
  pageBreakBefore?: string[]
  pageBreakAfter?: string[]
  pageBreakAvoid?: string[]
}

export interface PrintOptions {
  title?: string
  styles?: string
  removeElements?: string[]
}

export interface ExportProgress {
  status: 'idle' | 'preparing' | 'generating' | 'downloading' | 'completed' | 'error'
  progress: number
  message: string
}

export const useExport = () => {
  const toast = useAppToast()

  // État de progression
  const exportProgress = reactive<ExportProgress>({
    status: 'idle',
    progress: 0,
    message: '',
  })

  // Reset de la progression
  const resetProgress = () => {
    exportProgress.status = 'idle'
    exportProgress.progress = 0
    exportProgress.message = ''
  }

  // Mise à jour de la progression
  const updateProgress = (status: ExportProgress['status'], progress: number, message: string) => {
    exportProgress.status = status
    exportProgress.progress = progress
    exportProgress.message = message
  }

  // ============================================================================
  // UTILITAIRES
  // ============================================================================

  /**
   * Génère un nom de fichier avec date
   */
  const generateFilename = (prefix: string, extension: string): string => {
    const date = new Date().toISOString().split('T')[0]
    const time = new Date().toTimeString().split(' ')[0].replace(/:/g, '-')
    return `${prefix}_${date}_${time}.${extension}`
  }

  /**
   * Formate une valeur pour l'export
   */
  const formatValue = (value: any): string | number => {
    if (value === null || value === undefined) return ''
    if (typeof value === 'boolean') return value ? 'Oui' : 'Non'
    if (value instanceof Date) return value.toLocaleDateString('fr-FR')
    if (typeof value === 'number') return value
    return String(value)
  }

  /**
   * Prépare les données pour l'export
   */
  const prepareData = <T extends Record<string, any>>(
    data: T[],
    columns?: ExportColumn[]
  ): { headers: string[]; rows: (string | number)[][] } => {
    if (!data.length) {
      return { headers: [], rows: [] }
    }

    // Déterminer les colonnes
    const cols: ExportColumn[] = columns || Object.keys(data[0]).map(key => ({
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
    }))

    // Headers
    const headers = cols.map(col => col.label)

    // Rows
    const rows = data.map(row =>
      cols.map(col => {
        const value = row[col.key]
        if (col.format) {
          return col.format(value, row)
        }
        return formatValue(value)
      })
    )

    return { headers, rows }
  }

  /**
   * Déclenche le téléchargement d'un fichier
   */
  const downloadFile = (blob: Blob, filename: string): void => {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  // ============================================================================
  // EXPORT EXCEL
  // ============================================================================

  /**
   * Exporte les données au format Excel (.xlsx)
   */
  const exportToExcel = async <T extends Record<string, any>>(
    data: T[],
    options: ExportOptions = {}
  ): Promise<boolean> => {
    const {
      filename = generateFilename('export', 'xlsx'),
      sheetName = 'Données',
      title,
      subtitle,
      includeDate = true,
      columns,
    } = options

    try {
      resetProgress()
      updateProgress('preparing', 10, 'Préparation des données...')

      if (!data.length) {
        toast.warning('Aucune donnée à exporter')
        resetProgress()
        return false
      }

      const { headers, rows } = prepareData(data, columns)

      updateProgress('generating', 30, 'Génération du fichier Excel...')

      // Créer les données du worksheet
      const wsData: any[][] = []

      // Ajouter le titre si présent
      if (title) {
        wsData.push([title])
        wsData.push([]) // Ligne vide
      }

      // Ajouter le sous-titre si présent
      if (subtitle) {
        wsData.push([subtitle])
        wsData.push([]) // Ligne vide
      }

      // Ajouter la date si demandé
      if (includeDate) {
        wsData.push([`Exporté le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`])
        wsData.push([]) // Ligne vide
      }

      // Ajouter les headers et les données
      wsData.push(headers)
      wsData.push(...rows)

      updateProgress('generating', 60, 'Création du classeur...')

      // Créer le workbook et worksheet
      const ws = XLSX.utils.aoa_to_sheet(wsData)

      // Appliquer les largeurs de colonnes
      if (columns) {
        ws['!cols'] = columns.map(col => ({ wch: col.width || 15 }))
      } else {
        // Largeur automatique basée sur le contenu
        const maxWidths = headers.map((h, i) => {
          const headerWidth = h.length
          const maxDataWidth = Math.max(...rows.map(r => String(r[i]).length))
          return Math.min(Math.max(headerWidth, maxDataWidth) + 2, 50)
        })
        ws['!cols'] = maxWidths.map(w => ({ wch: w }))
      }

      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, sheetName)

      updateProgress('downloading', 80, 'Téléchargement...')

      // Générer et télécharger le fichier
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      downloadFile(blob, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`)

      updateProgress('completed', 100, 'Export terminé')
      toast.success('Fichier Excel exporté avec succès')

      setTimeout(resetProgress, 2000)
      return true
    } catch (error) {
      console.error('Erreur export Excel:', error)
      updateProgress('error', 0, 'Erreur lors de l\'export')
      toast.error('Erreur lors de l\'export Excel')
      setTimeout(resetProgress, 3000)
      return false
    }
  }

  // ============================================================================
  // EXPORT CSV
  // ============================================================================

  /**
   * Exporte les données au format CSV
   */
  const exportToCsv = async <T extends Record<string, any>>(
    data: T[],
    options: ExportOptions = {}
  ): Promise<boolean> => {
    const {
      filename = generateFilename('export', 'csv'),
      columns,
    } = options

    try {
      resetProgress()
      updateProgress('preparing', 10, 'Préparation des données...')

      if (!data.length) {
        toast.warning('Aucune donnée à exporter')
        resetProgress()
        return false
      }

      const { headers, rows } = prepareData(data, columns)

      updateProgress('generating', 50, 'Génération du fichier CSV...')

      // Fonction pour échapper les valeurs CSV
      const escapeCSV = (value: string | number): string => {
        const str = String(value)
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`
        }
        return str
      }

      // Générer le contenu CSV
      const csvContent = [
        headers.map(escapeCSV).join(','),
        ...rows.map(row => row.map(escapeCSV).join(',')),
      ].join('\n')

      updateProgress('downloading', 80, 'Téléchargement...')

      // Créer le Blob avec BOM pour Excel
      const BOM = '\uFEFF'
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8' })
      downloadFile(blob, filename.endsWith('.csv') ? filename : `${filename}.csv`)

      updateProgress('completed', 100, 'Export terminé')
      toast.success('Fichier CSV exporté avec succès')

      setTimeout(resetProgress, 2000)
      return true
    } catch (error) {
      console.error('Erreur export CSV:', error)
      updateProgress('error', 0, 'Erreur lors de l\'export')
      toast.error('Erreur lors de l\'export CSV')
      setTimeout(resetProgress, 3000)
      return false
    }
  }

  // ============================================================================
  // EXPORT PDF
  // ============================================================================

  /**
   * Exporte un élément HTML au format PDF
   */
  const exportToPdf = async (
    element: HTMLElement | string,
    options: PdfExportOptions = {}
  ): Promise<boolean> => {
    const {
      filename = generateFilename('export', 'pdf'),
      orientation = 'portrait',
      format = 'a4',
      margin = 10,
      scale = 2,
      pageBreakBefore = [],
      pageBreakAfter = [],
      pageBreakAvoid = [],
    } = options

    try {
      resetProgress()
      updateProgress('preparing', 10, 'Préparation du document...')

      // Récupérer l'élément DOM
      const targetElement = typeof element === 'string'
        ? document.querySelector(element) as HTMLElement
        : element

      if (!targetElement) {
        toast.error('Élément non trouvé pour l\'export PDF')
        resetProgress()
        return false
      }

      updateProgress('generating', 30, 'Chargement du générateur PDF...')

      // Import dynamique de html2pdf pour éviter les erreurs SSR
      const html2pdf = (await import('html2pdf.js')).default

      updateProgress('generating', 50, 'Génération du PDF...')

      // Configuration html2pdf
      const pdfOptions: Html2PdfOptions = {
        margin: Array.isArray(margin) ? margin : margin,
        filename: filename.endsWith('.pdf') ? filename : `${filename}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale,
          useCORS: true,
          logging: false,
        },
        jsPDF: {
          unit: 'mm',
          format,
          orientation,
        },
        pagebreak: {
          mode: ['avoid-all', 'css', 'legacy'],
          before: pageBreakBefore,
          after: pageBreakAfter,
          avoid: pageBreakAvoid,
        },
      }

      updateProgress('generating', 70, 'Rendu du PDF...')

      // Générer le PDF
      await html2pdf().set(pdfOptions).from(targetElement).save()

      updateProgress('completed', 100, 'Export terminé')
      toast.success('Fichier PDF exporté avec succès')

      setTimeout(resetProgress, 2000)
      return true
    } catch (error) {
      console.error('Erreur export PDF:', error)
      updateProgress('error', 0, 'Erreur lors de l\'export')
      toast.error('Erreur lors de l\'export PDF')
      setTimeout(resetProgress, 3000)
      return false
    }
  }

  /**
   * Exporte des données tabulaires au format PDF
   */
  const exportTableToPdf = async <T extends Record<string, any>>(
    data: T[],
    options: PdfExportOptions & ExportOptions = {}
  ): Promise<boolean> => {
    const {
      title,
      subtitle,
      columns,
      ...pdfOptions
    } = options

    try {
      resetProgress()
      updateProgress('preparing', 10, 'Préparation des données...')

      if (!data.length) {
        toast.warning('Aucune donnée à exporter')
        resetProgress()
        return false
      }

      const { headers, rows } = prepareData(data, columns)

      updateProgress('generating', 30, 'Création du tableau HTML...')

      // Créer un élément HTML temporaire pour le tableau
      const container = document.createElement('div')
      container.style.cssText = 'font-family: Arial, sans-serif; padding: 20px; background: white;'

      // Ajouter le titre
      if (title) {
        const titleEl = document.createElement('h1')
        titleEl.textContent = title
        titleEl.style.cssText = 'font-size: 24px; margin-bottom: 10px; color: #1a1a1a;'
        container.appendChild(titleEl)
      }

      // Ajouter le sous-titre
      if (subtitle) {
        const subtitleEl = document.createElement('h2')
        subtitleEl.textContent = subtitle
        subtitleEl.style.cssText = 'font-size: 16px; margin-bottom: 10px; color: #666;'
        container.appendChild(subtitleEl)
      }

      // Ajouter la date
      const dateEl = document.createElement('p')
      dateEl.textContent = `Exporté le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`
      dateEl.style.cssText = 'font-size: 12px; margin-bottom: 20px; color: #888;'
      container.appendChild(dateEl)

      // Créer le tableau
      const table = document.createElement('table')
      table.style.cssText = 'width: 100%; border-collapse: collapse; font-size: 12px;'

      // Headers
      const thead = document.createElement('thead')
      const headerRow = document.createElement('tr')
      headers.forEach(header => {
        const th = document.createElement('th')
        th.textContent = header
        th.style.cssText = 'border: 1px solid #ddd; padding: 8px; background: #3695d8; color: white; text-align: left;'
        headerRow.appendChild(th)
      })
      thead.appendChild(headerRow)
      table.appendChild(thead)

      // Body
      const tbody = document.createElement('tbody')
      rows.forEach((row, index) => {
        const tr = document.createElement('tr')
        tr.style.cssText = index % 2 === 0 ? 'background: #f9f9f9;' : 'background: white;'
        row.forEach(cell => {
          const td = document.createElement('td')
          td.textContent = String(cell)
          td.style.cssText = 'border: 1px solid #ddd; padding: 6px;'
          tr.appendChild(td)
        })
        tbody.appendChild(tr)
      })
      table.appendChild(tbody)

      container.appendChild(table)

      // Ajouter temporairement au DOM (hors vue)
      container.style.position = 'absolute'
      container.style.left = '-9999px'
      document.body.appendChild(container)

      updateProgress('generating', 50, 'Génération du PDF...')

      // Générer le PDF
      const result = await exportToPdf(container, pdfOptions)

      // Nettoyer
      document.body.removeChild(container)

      return result
    } catch (error) {
      console.error('Erreur export PDF:', error)
      updateProgress('error', 0, 'Erreur lors de l\'export')
      toast.error('Erreur lors de l\'export PDF')
      setTimeout(resetProgress, 3000)
      return false
    }
  }

  // ============================================================================
  // IMPRESSION
  // ============================================================================

  /**
   * Imprime un élément HTML
   */
  const printElement = (
    element: HTMLElement | string,
    options: PrintOptions = {}
  ): boolean => {
    const {
      title = document.title,
      styles = '',
      removeElements = [],
    } = options

    try {
      // Récupérer l'élément DOM
      const targetElement = typeof element === 'string'
        ? document.querySelector(element) as HTMLElement
        : element

      if (!targetElement) {
        toast.error('Élément non trouvé pour l\'impression')
        return false
      }

      // Cloner l'élément pour ne pas modifier l'original
      const clone = targetElement.cloneNode(true) as HTMLElement

      // Supprimer les éléments non désirés
      removeElements.forEach(selector => {
        clone.querySelectorAll(selector).forEach(el => el.remove())
      })

      // Créer une fenêtre d'impression
      const printWindow = window.open('', '_blank', 'width=800,height=600')
      if (!printWindow) {
        toast.error('Impossible d\'ouvrir la fenêtre d\'impression')
        return false
      }

      // Récupérer les styles de la page
      const styleSheets = Array.from(document.styleSheets)
        .map(sheet => {
          try {
            return Array.from(sheet.cssRules).map(rule => rule.cssText).join('\n')
          } catch {
            return ''
          }
        })
        .join('\n')

      // Construire le HTML d'impression
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>${title}</title>
            <style>
              ${styleSheets}
              ${styles}
              @media print {
                body { margin: 0; padding: 20px; }
                .no-print { display: none !important; }
              }
            </style>
          </head>
          <body>
            ${clone.outerHTML}
          </body>
        </html>
      `)

      printWindow.document.close()

      // Attendre le chargement puis imprimer
      printWindow.onload = () => {
        printWindow.focus()
        printWindow.print()
        printWindow.close()
      }

      return true
    } catch (error) {
      console.error('Erreur impression:', error)
      toast.error('Erreur lors de l\'impression')
      return false
    }
  }

  /**
   * Imprime des données tabulaires
   */
  const printTable = <T extends Record<string, any>>(
    data: T[],
    options: PrintOptions & ExportOptions = {}
  ): boolean => {
    const {
      title = 'Tableau de données',
      columns,
      styles = '',
    } = options

    try {
      if (!data.length) {
        toast.warning('Aucune donnée à imprimer')
        return false
      }

      const { headers, rows } = prepareData(data, columns)

      // Créer un élément temporaire
      const container = document.createElement('div')

      // Ajouter le titre
      const titleEl = document.createElement('h1')
      titleEl.textContent = title
      titleEl.style.cssText = 'font-size: 24px; margin-bottom: 10px; color: #1a1a1a;'
      container.appendChild(titleEl)

      // Ajouter la date
      const dateEl = document.createElement('p')
      dateEl.textContent = `Imprimé le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`
      dateEl.style.cssText = 'font-size: 12px; margin-bottom: 20px; color: #666;'
      container.appendChild(dateEl)

      // Créer le tableau
      const table = document.createElement('table')
      table.style.cssText = 'width: 100%; border-collapse: collapse; font-size: 12px;'

      // Headers
      const thead = document.createElement('thead')
      const headerRow = document.createElement('tr')
      headers.forEach(header => {
        const th = document.createElement('th')
        th.textContent = header
        th.style.cssText = 'border: 1px solid #000; padding: 8px; background: #f0f0f0; text-align: left;'
        headerRow.appendChild(th)
      })
      thead.appendChild(headerRow)
      table.appendChild(thead)

      // Body
      const tbody = document.createElement('tbody')
      rows.forEach(row => {
        const tr = document.createElement('tr')
        row.forEach(cell => {
          const td = document.createElement('td')
          td.textContent = String(cell)
          td.style.cssText = 'border: 1px solid #000; padding: 6px;'
          tr.appendChild(td)
        })
        tbody.appendChild(tr)
      })
      table.appendChild(tbody)

      container.appendChild(table)

      // Ajouter temporairement au DOM
      container.style.position = 'absolute'
      container.style.left = '-9999px'
      document.body.appendChild(container)

      // Imprimer
      const result = printElement(container, { title, styles })

      // Nettoyer
      document.body.removeChild(container)

      return result
    } catch (error) {
      console.error('Erreur impression:', error)
      toast.error('Erreur lors de l\'impression')
      return false
    }
  }

  // ============================================================================
  // TÉLÉCHARGEMENT AVEC PROGRESSION
  // ============================================================================

  /**
   * Télécharge un fichier depuis une URL avec progression
   */
  const downloadWithProgress = async (
    url: string,
    filename: string,
    onProgress?: (progress: number) => void
  ): Promise<boolean> => {
    try {
      resetProgress()
      updateProgress('preparing', 0, 'Démarrage du téléchargement...')

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const contentLength = response.headers.get('content-length')
      const total = contentLength ? parseInt(contentLength, 10) : 0

      if (!response.body) {
        throw new Error('ReadableStream not supported')
      }

      const reader = response.body.getReader()
      const chunks: Uint8Array[] = []
      let received = 0

      updateProgress('downloading', 0, 'Téléchargement en cours...')

      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        chunks.push(value)
        received += value.length

        if (total) {
          const progress = Math.round((received / total) * 100)
          updateProgress('downloading', progress, `Téléchargement: ${progress}%`)
          onProgress?.(progress)
        }
      }

      updateProgress('generating', 95, 'Finalisation...')

      const blob = new Blob(chunks)
      downloadFile(blob, filename)

      updateProgress('completed', 100, 'Téléchargement terminé')
      toast.success('Fichier téléchargé avec succès')

      setTimeout(resetProgress, 2000)
      return true
    } catch (error) {
      console.error('Erreur téléchargement:', error)
      updateProgress('error', 0, 'Erreur lors du téléchargement')
      toast.error('Erreur lors du téléchargement')
      setTimeout(resetProgress, 3000)
      return false
    }
  }

  /**
   * Télécharge un Blob avec progression simulée
   */
  const downloadBlobWithProgress = async (
    blob: Blob,
    filename: string
  ): Promise<boolean> => {
    try {
      resetProgress()
      updateProgress('preparing', 30, 'Préparation du téléchargement...')

      await new Promise(resolve => setTimeout(resolve, 200))
      updateProgress('downloading', 60, 'Téléchargement...')

      await new Promise(resolve => setTimeout(resolve, 200))
      updateProgress('downloading', 90, 'Finalisation...')

      downloadFile(blob, filename)

      updateProgress('completed', 100, 'Téléchargement terminé')
      toast.success('Fichier téléchargé avec succès')

      setTimeout(resetProgress, 2000)
      return true
    } catch (error) {
      console.error('Erreur téléchargement:', error)
      updateProgress('error', 0, 'Erreur lors du téléchargement')
      toast.error('Erreur lors du téléchargement')
      setTimeout(resetProgress, 3000)
      return false
    }
  }

  return {
    // État
    exportProgress: readonly(exportProgress),

    // Utilitaires
    generateFilename,
    formatValue,
    downloadFile,

    // Export Excel
    exportToExcel,

    // Export CSV
    exportToCsv,

    // Export PDF
    exportToPdf,
    exportTableToPdf,

    // Impression
    printElement,
    printTable,

    // Téléchargement
    downloadWithProgress,
    downloadBlobWithProgress,
  }
}
