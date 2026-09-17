import type { OutputData } from '@editorjs/editorjs'

/**
 * Sauvegarde locale automatique (localStorage) des formulaires d'administration.
 *
 * Un brouillon n'est enregistré que lorsque le formulaire diffère de sa valeur de
 * référence (formulaire vide en création, données du serveur en édition) : tant
 * qu'aucun champ n'est saisi, rien n'est stocké. Le brouillon est restauré au
 * rechargement de la page puis supprimé après un enregistrement réussi ou une
 * annulation explicite.
 */

const STORAGE_PREFIX = 'mom-draft:'
// Les brouillons plus anciens sont ignorés et supprimés
const MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000

interface StoredDraft<T> {
  savedAt: number
  data: T
}

interface FormDraftOptions<T> {
  /** Identifiant du formulaire, unique dans l'administration (ex. 'news') */
  key: string
  /** Valeurs à sauvegarder */
  source: () => T
  /** Réinjecte des valeurs sauvegardées dans le formulaire */
  apply: (data: T) => void
  /** Valeurs de référence ; par défaut, instantané pris au démarrage du suivi */
  baseline?: () => T
}

// JSON à clés triées, pour comparer deux états indépendamment de l'ordre des clés
function stableStringify(value: unknown): string {
  return JSON.stringify(value, (_key, val) => {
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      return Object.fromEntries(Object.keys(val).sort().map(k => [k, val[k]]))
    }
    return val
  })
}

// Copie profonde détachée de la réactivité Vue
function cloneData<T>(value: T): T {
  return value === undefined ? value : JSON.parse(JSON.stringify(value))
}

function storageKey(key: string, context: string): string {
  return `${STORAGE_PREFIX}${key}:${context}`
}

function readDraft<T>(fullKey: string): StoredDraft<T> | null {
  try {
    const raw = localStorage.getItem(fullKey)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredDraft<T>
    if (!parsed || typeof parsed.savedAt !== 'number' || Date.now() - parsed.savedAt > MAX_AGE_MS) {
      localStorage.removeItem(fullKey)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

function writeDraft(fullKey: string, data: unknown) {
  try {
    localStorage.setItem(fullKey, JSON.stringify({ savedAt: Date.now(), data }))
  } catch {
    // Stockage indisponible ou plein : la sauvegarde locale est un simple confort
  }
}

function removeDraft(fullKey: string) {
  try {
    localStorage.removeItem(fullKey)
  } catch {
    // Stockage indisponible
  }
}

/**
 * Normalise un contenu Editor.js pour la sauvegarde et la comparaison :
 * ignore les métadonnées (time, version, id) et les paragraphes vides.
 */
export function normalizeEditorContent(content: string | OutputData | null | undefined): string | OutputData {
  if (!content) return ''

  let data: OutputData
  if (typeof content === 'string') {
    if (!content.trim()) return ''
    try {
      const parsed = JSON.parse(content)
      if (!parsed?.blocks) return content
      data = parsed
    } catch {
      // Contenu HTML historique
      return content
    }
  } else {
    data = content
  }

  if (!Array.isArray(data.blocks)) return ''

  const blocks = data.blocks
    .filter((block) => {
      if (block.type !== 'paragraph') return true
      const text = String((block.data as { text?: string })?.text ?? '')
      return text.replace(/<[^>]*>|&nbsp;/g, '').trim().length > 0
    })
    .map(block => ({
      type: block.type,
      data: block.data,
      ...(block.tunes ? { tunes: block.tunes } : {})
    }))

  return blocks.length ? { blocks } : ''
}

export function useFormDraft<T>(options: FormDraftOptions<T>) {
  const context = ref<string | null>(null)
  /** Date du brouillon restauré (null si aucun brouillon n'a été restauré) */
  const restoredAt = ref<number | null>(null)
  let snapshot: T | null = null

  function currentKey(): string | null {
    return context.value ? storageKey(options.key, context.value) : null
  }

  function baselineValue(): T | null {
    return options.baseline ? options.baseline() : snapshot
  }

  function persist() {
    const fullKey = currentKey()
    if (!fullKey || !import.meta.client) return

    const current = options.source()
    if (stableStringify(current) === stableStringify(baselineValue())) {
      removeDraft(fullKey)
    } else {
      writeDraft(fullKey, current)
    }
  }

  watch(() => options.source(), persist, { deep: true })

  /**
   * Démarre le suivi du formulaire pour un contexte ('new', identifiant d'un
   * élément…) et restaure le brouillon correspondant s'il existe.
   * À appeler une fois le formulaire initialisé.
   */
  function start(ctx = 'default'): boolean {
    context.value = ctx
    restoredAt.value = null
    snapshot = cloneData(options.source())
    if (!import.meta.client) return false

    const stored = readDraft<T>(storageKey(options.key, ctx))
    if (!stored) return false

    options.apply(stored.data)
    restoredAt.value = stored.savedAt
    return true
  }

  /** Arrête le suivi en conservant le brouillon stocké */
  function stop() {
    context.value = null
    restoredAt.value = null
  }

  /** Supprime le brouillon et arrête le suivi (enregistrement réussi, annulation) */
  function clear() {
    const fullKey = currentKey()
    if (fullKey) removeDraft(fullKey)
    stop()
  }

  /** Supprime le brouillon et prend l'état actuel comme nouvelle référence */
  function commit() {
    const fullKey = currentKey()
    if (fullKey) removeDraft(fullKey)
    snapshot = cloneData(options.source())
    restoredAt.value = null
  }

  /**
   * Met à jour une partie de la référence après un enregistrement partiel côté
   * serveur (ex. changement du statut de publication), sans perdre le reste
   * de la saisie en cours.
   */
  function updateBaseline(update: (reference: T) => void) {
    if (snapshot === null) return
    update(snapshot)
    persist()
  }

  /** Abandonne le brouillon restauré et revient aux valeurs de référence */
  function discard() {
    const fullKey = currentKey()
    if (fullKey) removeDraft(fullKey)
    const reference = baselineValue()
    if (reference !== null) options.apply(cloneData(reference))
    restoredAt.value = null
  }

  /**
   * Au montage de la page, rouvre le formulaire (modale, édition en ligne…)
   * pour lequel un brouillon est en attente. `open` reçoit le contexte du
   * brouillon le plus récent et renvoie false si ce contexte n'existe plus
   * (élément supprimé) ; le brouillon est alors effacé.
   */
  function resume(open: (ctx: string) => boolean | void, ready: () => boolean = () => true) {
    onMounted(() => {
      const ctx = findPendingContext()
      if (!ctx) return

      const run = () => {
        if (open(ctx) === false) removeDraft(storageKey(options.key, ctx))
      }

      if (ready()) {
        run()
        return
      }
      const unwatch = watch(ready, (isReady) => {
        if (!isReady) return
        unwatch()
        run()
      })
    })
  }

  function findPendingContext(): string | null {
    const prefix = storageKey(options.key, '')
    let latest: { ctx: string; savedAt: number } | null = null
    let keys: string[]
    try {
      keys = Object.keys(localStorage).filter(k => k.startsWith(prefix))
    } catch {
      return null
    }
    // readDraft peut supprimer des entrées expirées : on parcourt une copie des clés
    for (const fullKey of keys) {
      const stored = readDraft<T>(fullKey)
      if (stored && (!latest || stored.savedAt > latest.savedAt)) {
        latest = { ctx: fullKey.slice(prefix.length), savedAt: stored.savedAt }
      }
    }
    return latest?.ctx ?? null
  }

  return {
    restoredAt: readonly(restoredAt),
    start,
    stop,
    clear,
    commit,
    updateBaseline,
    discard,
    resume
  }
}
