import { reactive, computed, watch } from 'vue'

// ── Persistencia ───────────────────────────────────────────
const STORAGE_KEY = 'stockfusion-data'

const defaultProducts = [
  { id: 1, name: 'Pancho de langostinos',       cat: 'panchos',     emoji: '🦐', qty: 24, min: 10 },
  { id: 2, name: 'Pancho de salmón',             cat: 'panchos',     emoji: '🐟', qty: 8,  min: 10 },
  { id: 3, name: 'Ebi furai',                    cat: 'fritos',      emoji: '🍤', qty: 0,  min: 8  },
  { id: 4, name: 'Empanadita china de carne',    cat: 'empanaditas', emoji: '🥟', qty: 15, min: 12 },
  { id: 5, name: 'Empanadita china de verdura',  cat: 'empanaditas', emoji: '🥬', qty: 5,  min: 12 },
]

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { products: defaultProducts, history: [] }
    const parsed = JSON.parse(raw)
    return {
      products: Array.isArray(parsed.products) && parsed.products.length ? parsed.products : defaultProducts,
      history: Array.isArray(parsed.history) ? parsed.history : [],
    }
  } catch (e) {
    console.error('No se pudo leer el stock guardado, usando valores por defecto.', e)
    return { products: defaultProducts, history: [] }
  }
}

function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      products: state.products,
      history: state.history,
    }))
  } catch (e) {
    console.error('No se pudo guardar el stock.', e)
  }
}

// ── Helpers ────────────────────────────────────────────────
export function getStatus(p) {
  if (p.qty === 0) return 'low'
  if (p.qty < p.min) return 'warn'
  return 'ok'
}

export function getBarPct(p) {
  if (p.qty === 0) return 0
  return Math.min(100, Math.round(p.qty / Math.max(p.min * 2, p.qty) * 100))
}

function now() {
  const d = new Date()
  return (
    d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) +
    ' · ' +
    d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })
  )
}

// ── State (cargado desde localStorage si existe) ────────────
const initial = loadFromStorage()

const state = reactive({
  products: initial.products,
  history: initial.history,
})

// Guarda automáticamente cada vez que cambia algo en products o history
watch(
  () => state,
  () => saveToStorage(),
  { deep: true }
)

// ── Computed stats ─────────────────────────────────────────
export const stats = computed(() => {
  let ok = 0, warn = 0, low = 0
  state.products.forEach(p => {
    const s = getStatus(p)
    if (s === 'ok') ok++
    else if (s === 'warn') warn++
    else low++
  })
  return { ok, warn, low }
})

export const alertCount = computed(() => stats.value.warn + stats.value.low)

// ── Getters ────────────────────────────────────────────────
export function getProducts(cat = 'todos') {
  return cat === 'todos' ? state.products : state.products.filter(p => p.cat === cat)
}

export function getHistory() {
  return [...state.history].reverse()
}

export function getAlerts() {
  return state.products.filter(p => getStatus(p) !== 'ok')
}

// ── Actions ────────────────────────────────────────────────
export function adjustQty(id, delta) {
  const p = state.products.find(x => x.id === id)
  if (!p) return
  const newQty = Math.max(0, p.qty + delta)
  if (newQty === p.qty) return
  const actual = newQty - p.qty
  p.qty = newQty
  state.history.push({
    id: Date.now(),
    name: p.name,
    emoji: p.emoji,
    delta: Math.abs(actual),
    type: actual > 0 ? 'add' : 'rem',
    time: now(),
  })
}

export function updateProduct(id, qty, min) {
  const p = state.products.find(x => x.id === id)
  if (!p) return
  if (qty !== p.qty) {
    state.history.push({
      id: Date.now(),
      name: p.name,
      emoji: p.emoji,
      delta: qty,
      type: 'set',
      time: now(),
    })
  }
  p.qty = Math.max(0, qty)
  p.min = Math.max(0, min)
}

export function getProduct(id) {
  return state.products.find(x => x.id === id)
}

export function resetStock() {
  state.products = JSON.parse(JSON.stringify(defaultProducts))
  state.history = []
}

export { state }