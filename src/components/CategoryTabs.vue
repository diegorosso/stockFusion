<template>
  <div class="tabs" role="tablist" aria-label="Categorías">
    <button
      v-for="cat in CATS"
      :key="cat.id"
      class="tab"
      :class="{ active: modelValue === cat.id }"
      role="tab"
      :aria-selected="modelValue === cat.id"
      @click="$emit('update:modelValue', cat.id)"
    >
      {{ cat.label }}
    </button>
  </div>
</template>

<script setup>
defineProps({ modelValue: { type: String, required: true } })
defineEmits(['update:modelValue'])

const CATS = [
  { id: 'todos',       label: 'Todos' },
  { id: 'panchos',     label: 'Panchos' },
  { id: 'fritos',      label: 'Fritos' },
  { id: 'empanaditas', label: 'Empanaditas' },
  { id: 'burgers',     label: 'Burgers' },
]
</script>

<style scoped>
.tabs {
  display: flex;
  background: var(--s1);
  border-bottom: 0.5px solid var(--border);
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}

.tabs::-webkit-scrollbar { display: none; }

.tab {
  flex: 0 0 auto;
  padding: 10px 16px;
  font-size: 12.5px;
  font-weight: 500;
  color: var(--text-m);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.15s;
  letter-spacing: 0.02em;
}

.tab.active {
  color: var(--accent-l);
  border-bottom-color: var(--accent);
}
</style>