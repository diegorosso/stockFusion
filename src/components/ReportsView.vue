<template>
  <div>
    <div v-if="loading" class="empty">
      <i class="ti ti-loader-2 spin" aria-hidden="true"></i>
      <p>Cargando historial...</p>
    </div>

    <div v-else-if="productReports.length === 0" class="empty">
      <i class="ti ti-chart-bar" aria-hidden="true"></i>
      <p>Todavía no hay movimientos de consumo registrados.<br>Sacá unidades de algún producto para ver reportes.</p>
    </div>

    <template v-else>
      <div class="section-eyebrow">Consumo por producto</div>

      <div class="report-card" v-for="report in productReports" :key="report.productId">
        <div class="report-header">
          <span class="report-emoji" aria-hidden="true">{{ report.emoji }}</span>
          <div class="report-info">
            <div class="report-name">{{ report.name }}</div>
            <div class="report-total">{{ report.total }} unidades consumidas en total</div>
          </div>
        </div>

        <div class="chart-wrap">
          <button
            v-for="day in report.days"
            :key="day.label"
            class="bar-col"
            @click="openEdit(report, day)"
            :aria-label="`Editar consumo del ${day.label}: ${day.value} unidades`"
          >
            <div class="bar-value">{{ day.value > 0 ? day.value : '' }}</div>
            <div class="bar-track">
              <div
                class="bar-fill"
                :style="{ height: barHeight(day.value, report.maxValue) + '%' }"
              ></div>
            </div>
            <div class="bar-label">{{ day.label }}</div>
          </button>
        </div>
      </div>
    </template>

    <!-- Sheet de edición de consumo diario -->
    <Teleport to="body">
      <div
        class="overlay"
        :class="{ open: sheetOpen }"
        @click.self="closeEdit"
        role="dialog"
        aria-modal="true"
      >
        <div class="sheet" v-if="editing">
          <div class="sheet-handle"></div>
          <div class="sheet-title">{{ editing.emoji }}&nbsp; {{ editing.name }}</div>
          <div class="sheet-sub">Consumo del {{ editing.label }}</div>

          <label class="field-label" for="inp-consumo">Unidades consumidas ese día</label>
          <div class="qty-big">
            <button class="qty-arrow" @click="localValue = Math.max(0, localValue - 1)" aria-label="Restar uno">
              <i class="ti ti-minus" aria-hidden="true"></i>
            </button>
            <input
              class="qty-input"
              id="inp-consumo"
              type="number"
              min="0"
              inputmode="numeric"
              v-model.number="localValue"
            />
            <button class="qty-arrow" @click="localValue++" aria-label="Sumar uno">
              <i class="ti ti-plus" aria-hidden="true"></i>
            </button>
          </div>

          <div class="sheet-actions">
            <button class="btn-cancel" @click="closeEdit">Cancelar</button>
            <button class="btn-save" :disabled="saving" @click="saveEdit">
              {{ saving ? 'Guardando...' : 'Guardar cambios' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../supabase.js'

const loading = ref(true)
const rawHistory = ref([])

const sheetOpen = ref(false)
const editing = ref(null)
const localValue = ref(0)
const saving = ref(false)

async function loadHistory() {
  loading.value = true
  const { data, error } = await supabase
    .from('stock_history')
    .select('*')
    .eq('type', 'rem')
    .order('created_at', { ascending: true })

  if (!error) {
    rawHistory.value = data ?? []
  }
  loading.value = false
}

onMounted(loadHistory)

function dayLabel(isoString) {
  const d = new Date(isoString)
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })
}

function dayKey(isoString) {
  const d = new Date(isoString)
  return d.toISOString().slice(0, 10)
}

const productReports = computed(() => {
  const byProduct = {}

  rawHistory.value.forEach(h => {
    const key = h.name
    if (!byProduct[key]) {
      byProduct[key] = { name: h.name, emoji: h.emoji, productId: h.product_id, days: {} }
    }
    const dk = dayKey(h.created_at)
    if (!byProduct[key].days[dk]) {
      byProduct[key].days[dk] = { label: dayLabel(h.created_at), value: 0, sortKey: dk, dayKey: dk }
    }
    byProduct[key].days[dk].value += h.delta
  })

  return Object.values(byProduct).map(p => {
    const days = Object.values(p.days).sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    const total = days.reduce((sum, d) => sum + d.value, 0)
    const maxValue = Math.max(...days.map(d => d.value), 1)
    return {
      productId: p.name,
      realProductId: p.productId,
      name: p.name,
      emoji: p.emoji,
      days,
      total,
      maxValue,
    }
  }).sort((a, b) => b.total - a.total)
})

function barHeight(value, max) {
  if (value === 0) return 2
  return Math.max(4, Math.round((value / max) * 100))
}

function openEdit(report, day) {
  editing.value = {
    name: report.name,
    emoji: report.emoji,
    realProductId: report.realProductId,
    label: day.label,
    dayKey: day.dayKey,
    currentValue: day.value,
  }
  localValue.value = day.value
  sheetOpen.value = true
}

function closeEdit() {
  sheetOpen.value = false
  editing.value = null
}

async function saveEdit() {
  if (!editing.value) return
  saving.value = true

  const { name, dayKey: dk } = editing.value
  const newValue = Math.max(0, localValue.value)

  const startOfDay = `${dk}T00:00:00.000Z`
  const endOfDay = `${dk}T23:59:59.999Z`

  const { error: delErr } = await supabase
    .from('stock_history')
    .delete()
    .eq('type', 'rem')
    .eq('name', name)
    .gte('created_at', startOfDay)
    .lte('created_at', endOfDay)

  if (delErr) {
    saving.value = false
    alert('No se pudo actualizar el registro: ' + delErr.message)
    return
  }

  if (newValue > 0) {
    const { error: insErr } = await supabase.from('stock_history').insert({
      id: Date.now(),
      product_id: editing.value.realProductId ?? null,
      name: editing.value.name,
      emoji: editing.value.emoji,
      delta: newValue,
      type: 'rem',
      created_at: `${dk}T12:00:00.000Z`,
    })

    if (insErr) {
      saving.value = false
      alert('No se pudo guardar el nuevo valor: ' + insErr.message)
      return
    }
  }

  saving.value = false
  closeEdit()
  await loadHistory()
}
</script>

<style scoped>
.section-eyebrow {
  font-size: 10px;
  font-weight: 600;
  color: var(--text-m);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin: 4px 0 10px;
}

.report-card {
  background: var(--s2);
  border: 0.5px solid var(--border);
  border-radius: var(--r);
  padding: 16px 15px;
  margin-bottom: 14px;
}

.report-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.report-emoji { font-size: 24px; }

.report-info { flex: 1; }

.report-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-p);
}

.report-total {
  font-size: 11px;
  color: var(--text-m);
  margin-top: 2px;
}

.chart-wrap {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 2px;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-x;
}

.bar-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 0 0 40px;
  gap: 4px;
  background: none;
  border: none;
  padding: 6px 2px;
  margin: -6px -2px;
  cursor: pointer;
  transition: opacity 0.15s, background 0.15s;
  touch-action: manipulation;
  -webkit-tap-highlight-color: rgba(124,111,205,0.25);
  border-radius: 8px;
}

.bar-col:hover { opacity: 0.8; }
.bar-col:active { background: var(--accent-dd); opacity: 0.85; }

.bar-value {
  font-size: 10px;
  font-weight: 600;
  color: var(--accent-l);
  height: 14px;
}

.bar-track {
  width: 100%;
  height: 90px;
  background: var(--s3);
  border-radius: 4px;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}

.bar-fill {
  width: 100%;
  background: linear-gradient(180deg, var(--accent-l), var(--accent));
  border-radius: 4px 4px 0 0;
  transition: height 0.3s ease;
}

.bar-label {
  font-size: 9px;
  color: var(--text-m);
  white-space: nowrap;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--text-m);
  gap: 10px;
  text-align: center;
}

.empty i { font-size: 36px; }
.empty p { font-size: 13px; line-height: 1.7; }

.spin { animation: spin 1s linear infinite; }

@keyframes spin {
  to { transform: rotate(360deg); }
}

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.65);
  z-index: 100;
  display: none;
  align-items: flex-end;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.overlay.open { display: flex; }

.sheet {
  background: var(--s2);
  border: 0.5px solid var(--border2);
  border-radius: 20px 20px 0 0;
  width: 100%;
  max-width: 430px;
  padding: 0 20px 36px;
}

.sheet-handle {
  width: 38px;
  height: 4px;
  background: var(--s4);
  border-radius: 2px;
  margin: 14px auto 18px;
}

.sheet-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-p);
  text-align: center;
  margin-bottom: 6px;
}

.sheet-sub {
  font-size: 12px;
  color: var(--text-m);
  text-align: center;
  margin-bottom: 20px;
}

.field-label {
  font-size: 11px;
  color: var(--text-s);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 6px;
  display: block;
}

.qty-big {
  display: flex;
  align-items: center;
  background: var(--s3);
  border: 0.5px solid var(--border);
  border-radius: var(--r2);
  margin-bottom: 14px;
  overflow: hidden;
}

.qty-arrow {
  width: 44px;
  height: 46px;
  background: none;
  border: none;
  color: var(--text-s);
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s;
  flex-shrink: 0;
}

.qty-arrow:hover { color: var(--text-p); }

.qty-input {
  flex: 1;
  background: none;
  border: none;
  color: var(--text-p);
  font-size: 22px;
  font-weight: 600;
  text-align: center;
  outline: none;
  -webkit-appearance: none;
}

.sheet-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 6px;
}

.btn-cancel {
  background: var(--s3);
  border: 0.5px solid var(--border);
  border-radius: var(--r2);
  color: var(--text-s);
  font-size: 14px;
  font-weight: 500;
  padding: 12px;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-cancel:hover { background: var(--s4); color: var(--text-p); }

.btn-save {
  background: var(--accent);
  border: none;
  border-radius: var(--r2);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  padding: 12px;
  cursor: pointer;
  transition: opacity 0.15s;
}

.btn-save:hover { opacity: 0.88; }
.btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
</style>