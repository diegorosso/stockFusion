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
          <div
            v-for="day in report.days"
            :key="day.label"
            class="bar-col"
          >
            <div class="bar-value">{{ day.value > 0 ? day.value : '' }}</div>
            <div class="bar-track">
              <div
                class="bar-fill"
                :style="{ height: barHeight(day.value, report.maxValue) + '%' }"
              ></div>
            </div>
            <div class="bar-label">{{ day.label }}</div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../supabase.js'

const loading = ref(true)
const rawHistory = ref([])

onMounted(async () => {
  const { data, error } = await supabase
    .from('stock_history')
    .select('*')
    .eq('type', 'rem')
    .order('created_at', { ascending: true })

  if (!error) {
    rawHistory.value = data ?? []
  }
  loading.value = false
})

function dayLabel(isoString) {
  const d = new Date(isoString)
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })
}

function dayKey(isoString) {
  const d = new Date(isoString)
  return d.toISOString().slice(0, 10)
}

const productReports = computed(() => {
  // Agrupar por nombre de producto (usamos el nombre guardado en el historial,
  // así sigue funcionando aunque el producto se haya unificado o borrado después)
  const byProduct = {}

  rawHistory.value.forEach(h => {
    const key = h.name
    if (!byProduct[key]) {
      byProduct[key] = { name: h.name, emoji: h.emoji, days: {} }
    }
    const dk = dayKey(h.created_at)
    if (!byProduct[key].days[dk]) {
      byProduct[key].days[dk] = { label: dayLabel(h.created_at), value: 0, sortKey: dk }
    }
    byProduct[key].days[dk].value += h.delta
  })

  return Object.values(byProduct).map(p => {
    const days = Object.values(p.days).sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    const total = days.reduce((sum, d) => sum + d.value, 0)
    const maxValue = Math.max(...days.map(d => d.value), 1)
    return {
      productId: p.name,
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
}

.bar-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 0 0 32px;
  gap: 4px;
}

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

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>