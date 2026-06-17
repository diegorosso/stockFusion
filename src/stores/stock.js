import { reactive, computed } from 'vue'
import { supabase } from '../supabase.js'

// ── State ──────────────────────────────────────────────────
const state = reactive({
  products: [],
  history: [],
  loading: true,
  error: null,
})

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

function formatTime(isoString) {
  const d = new Date(isoString)
  return (
    d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) +
    ' · ' +
    d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })
  )
}

// ── Carga inicial desde Supabase ─────────────────────────────
export async function initStock() {
  state.loading = true
  state.error = null

  const { data: products, error: prodErr } = await supabase
    .from('products')
    .select('*')
    .order('id', { ascending: true })

  if (prodErr) {
    state.error = prodErr.message
    state.loading = false
    return
  }

  const { data: history, error: histErr } = await supabase
    .from('stock_history')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  if (histErr) {
    state.error = histErr.message
  }

  state.products = products ?? []
  state.history = (history ?? []).map(h => ({
    ...h,
    time: formatTime(h.created_at),
  }))

  state.loading = false

  subscribeToChanges()
}

// ── Realtime: escucha cambios de otros dispositivos ──────────
let subscribed = false

function subscribeToChanges() {
  if (subscribed) return
  subscribed = true

  supabase
    .channel('stock-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
      const idx = state.products.findIndex(p => p.id === payload.new?.id ?? payload.old?.id)
      if (payload.eventType === 'UPDATE' && idx !== -1) {
        state.products[idx] = payload.new
      } else if (payload.eventType === 'INSERT') {
        state.products.push(payload.new)
      } else if (payload.eventType === 'DELETE' && idx !== -1) {
        state.products.splice(idx, 1)
      }
    })
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'stock_history' }, (payload) => {
      const exists = state.history.some(h => h.id === payload.new.id)
      if (!exists) {
        state.history.unshift({ ...payload.new, time: formatTime(payload.new.created_at) })
      }
    })
    .subscribe()
}

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
  return state.history
}

export function getAlerts() {
  return state.products.filter(p => getStatus(p) !== 'ok')
}

export function getProduct(id) {
  return state.products.find(x => x.id === id)
}

// ── Actions (escriben en Supabase) ───────────────────────────
export async function adjustQty(id, delta) {
  const p = state.products.find(x => x.id === id)
  if (!p) return
  const newQty = Math.max(0, p.qty + delta)
  if (newQty === p.qty) return
  const actual = newQty - p.qty

  // Actualización local optimista (se ve al instante en este dispositivo)
  p.qty = newQty

  const { error: updErr } = await supabase
    .from('products')
    .update({ qty: newQty, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (updErr) {
    state.error = updErr.message
    return
  }

  const { error: histErr } = await supabase.from('stock_history').insert({
    id: Date.now(),
    product_id: id,
    name: p.name,
    emoji: p.emoji,
    delta: Math.abs(actual),
    type: actual > 0 ? 'add' : 'rem',
  })

  if (histErr) state.error = histErr.message
}

export async function updateProduct(id, qty, min) {
  const p = state.products.find(x => x.id === id)
  if (!p) return

  const safeQty = Math.max(0, qty)
  const safeMin = Math.max(0, min)
  const qtyChanged = safeQty !== p.qty

  p.qty = safeQty
  p.min = safeMin

  const { error: updErr } = await supabase
    .from('products')
    .update({ qty: safeQty, min: safeMin, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (updErr) {
    state.error = updErr.message
    return
  }

  if (qtyChanged) {
    const { error: histErr } = await supabase.from('stock_history').insert({
      id: Date.now(),
      product_id: id,
      name: p.name,
      emoji: p.emoji,
      delta: safeQty,
      type: 'set',
    })
    if (histErr) state.error = histErr.message
  }
}

export { state }