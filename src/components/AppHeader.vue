<template>
  <header class="header">
    <div class="header-row1">
      <div class="brand">
        <div class="brand-mark" aria-hidden="true">
          <i class="ti ti-package"></i>
        </div>
        <div>
          <div class="brand-name">StockFusion</div>
          <div class="brand-sub">Control de inventario</div>
        </div>
      </div>
      <div class="header-date">{{ dateLabel }}</div>
    </div>

    <div class="stat-row">
      <div class="stat-pill">
        <div class="stat-num ok">{{ stats.ok }}</div>
        <div class="stat-lbl">En stock</div>
      </div>
      <div class="stat-pill">
        <div class="stat-num warn">{{ stats.warn }}</div>
        <div class="stat-lbl">Stock bajo</div>
      </div>
      <div class="stat-pill">
        <div class="stat-num low">{{ stats.low }}</div>
        <div class="stat-lbl">Sin stock</div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { stats } from '../stores/stock.js'

const dateLabel = computed(() => {
  const d = new Date()
  return d.toLocaleDateString('es-AR', { weekday: 'short', day: '2-digit', month: 'short' })
})
</script>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 40;
  background: var(--s1);
  border-bottom: 0.5px solid var(--border);
  padding: 14px 18px 0;
}

.header-row1 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-mark {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: var(--accent-d);
  border: 0.5px solid rgba(124,111,205,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-l);
  font-size: 18px;
}

.brand-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-p);
  letter-spacing: -0.3px;
}

.brand-sub {
  font-size: 11px;
  color: var(--text-m);
  margin-top: 1px;
}

.header-date {
  font-size: 11px;
  color: var(--text-m);
  background: var(--s3);
  border: 0.5px solid var(--border);
  border-radius: 20px;
  padding: 4px 10px;
  text-transform: capitalize;
}

.stat-row {
  display: flex;
  gap: 8px;
  padding-bottom: 14px;
}

.stat-pill {
  flex: 1;
  background: var(--s2);
  border: 0.5px solid var(--border);
  border-radius: var(--r2);
  padding: 8px 10px;
  text-align: center;
}

.stat-num {
  font-size: 22px;
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: -0.5px;
}

.stat-num.ok   { color: var(--ok); }
.stat-num.warn { color: var(--warn); }
.stat-num.low  { color: var(--low); }

.stat-lbl {
  font-size: 10px;
  color: var(--text-m);
  margin-top: 2px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
</style>
