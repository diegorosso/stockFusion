<template>
  <div>
    <div v-if="alerts.length === 0" class="empty">
      <i class="ti ti-circle-check" aria-hidden="true"></i>
      <p>Todo el stock está en nivel óptimo.<br>¡Sin alertas por ahora!</p>
    </div>

    <template v-else>
      <div class="alert-banner">
        <i class="ti ti-alert-triangle" aria-hidden="true"></i>
        <p>
          {{ alerts.length }} producto{{ alerts.length > 1 ? 's' : '' }}
          requiere{{ alerts.length === 1 ? '' : 'n' }} atención
        </p>
      </div>

      <div class="section-eyebrow">Requieren reposición</div>

      <ProductCard
        v-for="p in alerts"
        :key="p.id"
        :product="p"
        @adjust="onAdjust"
        @edit="$emit('edit', $event)"
      />
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ProductCard from './ProductCard.vue'
import { getAlerts, adjustQty } from '../stores/stock.js'

defineEmits(['edit'])

const alerts = computed(() => getAlerts())

function onAdjust(id, delta) {
  adjustQty(id, delta)
}
</script>

<style scoped>
.alert-banner {
  background: var(--low-d);
  border: 0.5px solid var(--low-b);
  border-radius: var(--r2);
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.alert-banner i { color: var(--low); font-size: 18px; flex-shrink: 0; }
.alert-banner p { font-size: 12.5px; color: var(--low); line-height: 1.4; }

.section-eyebrow {
  font-size: 10px;
  font-weight: 600;
  color: var(--text-m);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin: 4px 0 10px;
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
</style>
