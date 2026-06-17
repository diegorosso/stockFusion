<template>
  <div>
    <template v-if="activeTab === 'todos'">
      <template v-for="cat in CATS" :key="cat.id">
        <template v-if="productsByCategory(cat.id).length">
          <div class="section-eyebrow">{{ cat.label }}</div>
          <ProductCard
            v-for="p in productsByCategory(cat.id)"
            :key="p.id"
            :product="p"
            @adjust="onAdjust"
            @edit="onEdit"
          />
          <div class="cat-spacer"></div>
        </template>
      </template>
    </template>

    <template v-else>
      <ProductCard
        v-for="p in filteredProducts"
        :key="p.id"
        :product="p"
        @adjust="onAdjust"
        @edit="onEdit"
      />
    </template>

    <div class="empty" v-if="filteredProducts.length === 0">
      <i class="ti ti-package-off" aria-hidden="true"></i>
      <p>Sin productos en esta categoría</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ProductCard from './ProductCard.vue'
import { getProducts, adjustQty } from '../stores/stock.js'

const props = defineProps({
  activeTab: { type: String, required: true },
})

const emit = defineEmits(['edit'])

const CATS = [
  { id: 'panchos',     label: 'Panchos' },
  { id: 'fritos',      label: 'Fritos' },
  { id: 'empanaditas', label: 'Empanaditas' },
]

const filteredProducts = computed(() => getProducts(props.activeTab))

function productsByCategory(cat) {
  return getProducts('todos').filter(p => p.cat === cat)
}

function onAdjust(id, delta) {
  adjustQty(id, delta)
}

function onEdit(id) {
  emit('edit', id)
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

.cat-spacer { height: 4px; }

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--text-m);
  gap: 10px;
}

.empty i { font-size: 36px; }
.empty p { font-size: 13px; text-align: center; }
</style>
