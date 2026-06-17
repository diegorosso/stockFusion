<template>
  <Teleport to="body">
    <div
      class="overlay"
      :class="{ open: modelValue }"
      @click.self="$emit('update:modelValue', false)"
      role="dialog"
      aria-modal="true"
      :aria-label="`Editar ${product?.name ?? ''}`"
    >
      <div class="sheet" v-if="product">
        <div class="sheet-handle"></div>
        <div class="sheet-title">{{ product.emoji }}&nbsp; {{ product.name }}</div>
        <div class="sheet-sub">Ajustá el stock y el mínimo de alerta</div>

        <label class="field-label" for="inp-qty">Cantidad actual</label>
        <div class="qty-big">
          <button class="qty-arrow" @click="localQty = Math.max(0, localQty - 1)" aria-label="Restar uno">
            <i class="ti ti-minus" aria-hidden="true"></i>
          </button>
          <input
            class="qty-input"
            id="inp-qty"
            type="number"
            min="0"
            inputmode="numeric"
            v-model.number="localQty"
          />
          <button class="qty-arrow" @click="localQty++" aria-label="Sumar uno">
            <i class="ti ti-plus" aria-hidden="true"></i>
          </button>
        </div>

        <label class="field-label" for="inp-min">Mínimo de alerta</label>
        <input
          class="field-input"
          id="inp-min"
          type="number"
          min="0"
          inputmode="numeric"
          placeholder="10"
          v-model.number="localMin"
        />

        <div class="sheet-actions">
          <button class="btn-cancel" @click="$emit('update:modelValue', false)">Cancelar</button>
          <button class="btn-save" @click="handleSave">Guardar cambios</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  product:    { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'save'])

const localQty = ref(0)
const localMin = ref(0)

watch(() => props.product, (p) => {
  if (p) {
    localQty.value = p.qty
    localMin.value = p.min
  }
}, { immediate: true })

function handleSave() {
  emit('save', { id: props.product.id, qty: localQty.value, min: localMin.value })
  emit('update:modelValue', false)
}
</script>

<style scoped>
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
  letter-spacing: -0.2px;
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

.field-input {
  width: 100%;
  background: var(--s3);
  border: 0.5px solid var(--border);
  border-radius: var(--r2);
  color: var(--text-p);
  font-size: 15px;
  padding: 11px 13px;
  margin-bottom: 14px;
  outline: none;
  transition: border-color 0.15s;
  -webkit-appearance: none;
}

.field-input:focus { border-color: var(--accent); }

/* qty big stepper */
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
  letter-spacing: -0.5px;
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
  letter-spacing: 0.01em;
  transition: opacity 0.15s;
}

.btn-save:hover { opacity: 0.88; }
</style>
