<template>
  <div id="app-shell">
    <AppHeader />

    <CategoryTabs
      v-if="activeView === 'stock'"
      v-model="activeTab"
    />

    <main class="scroll-area">
      <StockView
        v-if="activeView === 'stock'"
        :activeTab="activeTab"
        @edit="openEdit"
      />
      <HistoryView v-else-if="activeView === 'historial'" />
      <AlertsView
        v-else-if="activeView === 'alertas'"
        @edit="openEdit"
      />
    </main>

    <BottomNav v-model="activeView" />

    <EditSheet
      v-model="sheetOpen"
      :product="editingProduct"
      @save="onSave"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import AppHeader     from './components/AppHeader.vue'
import CategoryTabs  from './components/CategoryTabs.vue'
import BottomNav     from './components/BottomNav.vue'
import StockView     from './components/StockView.vue'
import HistoryView   from './components/HistoryView.vue'
import AlertsView    from './components/AlertsView.vue'
import EditSheet     from './components/EditSheet.vue'
import { getProduct, updateProduct } from './stores/stock.js'

const activeView = ref('stock')
const activeTab  = ref('todos')
const sheetOpen  = ref(false)
const editingId  = ref(null)

const editingProduct = computed(() =>
  editingId.value ? getProduct(editingId.value) : null
)

function openEdit(id) {
  editingId.value = id
  sheetOpen.value = true
}

function onSave({ id, qty, min }) {
  updateProduct(id, qty, min)
}
</script>

<style scoped>
#app-shell {
  max-width: 430px;
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  background: var(--bg);
}

.scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 16px 16px 80px;
  -webkit-overflow-scrolling: touch;
}
</style>
