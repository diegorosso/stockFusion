<template>
  <div class="pcard" :class="`st-${status}`">
    <div class="pcard-top">
      <span class="pcard-emoji" aria-hidden="true">{{ product.emoji }}</span>
      <div class="pcard-info">
        <div class="pcard-name">{{ product.name }}</div>
        <div class="pcard-cat">
          <i class="ti ti-tag" aria-hidden="true"></i>
          {{ CAT_LABELS[product.cat] }}
        </div>
      </div>
      <span class="status-chip" :class="`chip-${status}`">{{ chipLabel }}</span>
    </div>

    <div class="prog-row">
      <div class="prog-track">
        <div
          class="prog-fill"
          :class="`fill-${status}`"
          :style="{ width: barPct + '%' }"
        ></div>
      </div>
      <span class="prog-val">{{ product.qty }} u.</span>
    </div>

    <div class="ctrl-row">
      <button class="btn-adj minus" @click="$emit('adjust', product.id, -1)">
        <i class="ti ti-minus" aria-hidden="true"></i> Sacar
      </button>
      <button class="btn-adj plus" @click="$emit('adjust', product.id, 1)">
        <i class="ti ti-plus" aria-hidden="true"></i> Agregar
      </button>
      <button
        class="btn-edit"
        :aria-label="`Editar ${product.name}`"
        @click="$emit('edit', product.id)"
      >
        <i class="ti ti-adjustments-horizontal" aria-hidden="true"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getStatus, getBarPct } from '../stores/stock.js'

const props = defineProps({
  product: { type: Object, required: true },
})

defineEmits(['adjust', 'edit'])

const CAT_LABELS = { panchos: 'Panchos', fritos: 'Fritos', empanaditas: 'Empanaditas' }

const CHIP_LABELS = { ok: 'OK', warn: 'Stock bajo', low: 'Sin stock' }

const status   = computed(() => getStatus(props.product))
const barPct   = computed(() => getBarPct(props.product))
const chipLabel = computed(() => CHIP_LABELS[status.value])
</script>

<style scoped>
.pcard {
  background: var(--s2);
  border: 0.5px solid var(--border);
  border-radius: var(--r);
  padding: 14px 15px;
  margin-bottom: 10px;
  transition: border-color 0.2s;
}

.pcard.st-ok   { border-color: rgba(63,201,126,0.2); }
.pcard.st-warn { border-color: rgba(240,160,64,0.25); }
.pcard.st-low  { border-color: rgba(224,92,92,0.28); }

.pcard-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12px;
}

.pcard-emoji {
  font-size: 22px;
  margin-right: 10px;
  line-height: 1;
}

.pcard-info { flex: 1; }

.pcard-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-p);
  letter-spacing: -0.1px;
}

.pcard-cat {
  font-size: 11px;
  color: var(--text-m);
  display: flex;
  align-items: center;
  gap: 3px;
  margin-top: 2px;
}

.pcard-cat i { font-size: 12px; }

.status-chip {
  font-size: 10.5px;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 20px;
  letter-spacing: 0.04em;
  white-space: nowrap;
  flex-shrink: 0;
}

.chip-ok   { background: var(--ok-d);   color: var(--ok);   border: 0.5px solid var(--ok-b); }
.chip-warn { background: var(--warn-d); color: var(--warn); border: 0.5px solid var(--warn-b); }
.chip-low  { background: var(--low-d);  color: var(--low);  border: 0.5px solid var(--low-b); }

/* progress */
.prog-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.prog-track {
  flex: 1;
  height: 3px;
  background: var(--s4);
  border-radius: 2px;
  overflow: hidden;
}

.prog-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s ease;
}

.fill-ok   { background: var(--ok); }
.fill-warn { background: var(--warn); }
.fill-low  { background: var(--low); }

.prog-val {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-p);
  min-width: 36px;
  text-align: right;
  letter-spacing: -0.3px;
}

/* controls */
.ctrl-row {
  display: flex;
  gap: 7px;
}

.btn-adj {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  background: var(--s3);
  border: 0.5px solid var(--border);
  border-radius: var(--r2);
  color: var(--text-s);
  font-size: 13px;
  font-weight: 500;
  padding: 8px 0;
  cursor: pointer;
  transition: all 0.15s;
  letter-spacing: 0.01em;
}

.btn-adj i { font-size: 14px; }
.btn-adj:hover { background: var(--s4); color: var(--text-p); }
.btn-adj.minus:hover { color: var(--low); border-color: var(--low-b); }
.btn-adj.plus:hover  { color: var(--ok);  border-color: var(--ok-b); }

.btn-edit {
  width: 38px;
  background: var(--accent-dd);
  border: 0.5px solid rgba(124,111,205,0.25);
  border-radius: var(--r2);
  color: var(--accent-l);
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;
}

.btn-edit:hover { background: var(--accent-d); }
</style>
