<template>
  <div class="game-filters hs-scroll">
    <button
      v-for="opt in gameFilterOptions"
      :key="opt.id"
      class="game-filter font-body"
      :class="{ 'game-filter--active': uiStore.gameFilterId === opt.id }"
      @click="uiStore.setGameFilter(opt.id)"
    >
      {{ opt.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useUiStore } from '@/stores/ui';
import { useFilteredMatches } from '@/composables/useFilteredMatches';

const uiStore = useUiStore();
const { gameFilterOptions } = useFilteredMatches();
</script>

<style scoped>
.game-filters {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  margin: 0 -18px 16px;
  padding: 0 18px;
}

.game-filter {
  flex: 0 0 auto;
  border: none;
  cursor: pointer;
  padding: 9px 15px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.02em;
  background: var(--hs-elevated);
  color: var(--hs-text-muted);
  transition: all 0.15s;
}

.game-filter--active {
  background: var(--hs-accent);
  color: var(--hs-bg);
  box-shadow: 0 4px 14px -4px rgba(189, 147, 249, 0.5);
}
</style>
