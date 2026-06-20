<template>
  <nav class="bottom-nav" aria-label="Navegación principal">
    <button
      v-for="item in items"
      :key="item.id"
      class="nav-btn"
      :class="{ active: modelValue === item.id }"
      @click="$emit('update:modelValue', item.id)"
    >
      <div class="nav-icon-wrap">
        <i :class="`ti ${item.icon}`" aria-hidden="true"></i>
        <span
          v-if="item.id === 'alertas' && alertCount > 0"
          class="notif-dot"
          aria-label="Hay alertas de stock"
        ></span>
      </div>
      {{ item.label }}
    </button>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { alertCount } from '../stores/stock.js'

defineProps({ modelValue: { type: String, required: true } })
defineEmits(['update:modelValue'])

const items = [
  { id: 'stock',     label: 'Stock',     icon: 'ti-package' },
  { id: 'historial', label: 'Historial', icon: 'ti-history' },
  { id: 'alertas',   label: 'Alertas',   icon: 'ti-bell'    },
  { id: 'reportes',  label: 'Reportes',  icon: 'ti-chart-bar' },
]
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 430px;
  background: var(--s1);
  border-top: 0.5px solid var(--border);
  display: flex;
  z-index: 50;
}

.nav-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 10px 0 12px;
  background: none;
  border: none;
  color: var(--text-m);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: color 0.15s;
  text-transform: uppercase;
}

.nav-btn i { font-size: 20px; }
.nav-btn.active { color: var(--accent-l); }

.nav-icon-wrap { position: relative; display: inline-flex; }

.notif-dot {
  position: absolute;
  top: -2px;
  right: -4px;
  width: 8px;
  height: 8px;
  background: var(--low);
  border-radius: 50%;
  border: 1.5px solid var(--s1);
}
</style>