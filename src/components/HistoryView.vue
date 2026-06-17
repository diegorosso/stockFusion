<template>
  <div>
    <div v-if="history.length === 0" class="empty">
      <i class="ti ti-history" aria-hidden="true"></i>
      <p>Todavía no hay movimientos registrados.<br>Sumá o sacá unidades para ver el historial.</p>
    </div>

    <template v-else>
      <div class="section-eyebrow">Últimos movimientos</div>
      <div class="hist-item" v-for="item in history" :key="item.id">
        <div class="hist-icon" :class="iconClass(item.type)">
          <i class="ti" :class="iconName(item.type)" aria-hidden="true"></i>
        </div>
        <div class="hist-body">
          <div class="hist-name">{{ item.emoji }} {{ item.name }}</div>
          <div class="hist-meta">{{ item.time }}</div>
        </div>
        <div class="hist-qty" :class="qtyClass(item.type)">
          {{ qtyPrefix(item.type) }}{{ item.delta }} u.
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getHistory } from '../stores/stock.js'

const history = computed(() => getHistory())

function iconClass(type) {
  return { add: 'hi-add', rem: 'hi-rem', set: 'hi-set' }[type]
}

function iconName(type) {
  return { add: 'ti-arrow-up', rem: 'ti-arrow-down', set: 'ti-adjustments-horizontal' }[type]
}

function qtyClass(type) {
  return { add: 'plus', rem: 'minus', set: 'edited' }[type]
}

function qtyPrefix(type) {
  return { add: '+', rem: '-', set: '→ ' }[type]
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

.hist-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 0;
  border-bottom: 0.5px solid var(--border);
}

.hist-icon {
  width: 34px;
  height: 34px;
  border-radius: var(--r2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  flex-shrink: 0;
}

.hi-add { background: var(--ok-d);   color: var(--ok); }
.hi-rem { background: var(--low-d);  color: var(--low); }
.hi-set { background: var(--accent-d); color: var(--accent-l); }

.hist-body { flex: 1; min-width: 0; }

.hist-name {
  font-size: 13px;
  color: var(--text-p);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hist-meta {
  font-size: 11px;
  color: var(--text-m);
  margin-top: 2px;
}

.hist-qty {
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

.hist-qty.plus   { color: var(--ok); }
.hist-qty.minus  { color: var(--low); }
.hist-qty.edited { color: var(--accent-l); }

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
</style>
