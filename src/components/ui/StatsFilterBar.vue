<template>
  <div class="stats-filters">
    <div v-if="playerCountOptions.length" class="stats-filters__group">
      <div class="stats-filters__label">Players</div>
      <div class="stats-filters__chips">
        <button
          v-for="opt in playerCountOptions"
          :key="opt.id"
          class="stats-filters__chip"
          :class="{ 'stats-filters__chip--active': uiStore.playerCountFilter.includes(opt.id) }"
          @click="uiStore.togglePlayerCountFilter(opt.id)"
        >
          {{ opt.label }}
        </button>
      </div>
    </div>

    <div v-if="monthOptions.length" class="stats-filters__group">
      <div class="stats-filters__label">Month</div>
      <div class="stats-filters__chips">
        <button
          v-for="opt in monthOptions"
          :key="opt.id"
          class="stats-filters__chip"
          :class="{ 'stats-filters__chip--active': uiStore.playedMatchMonthFilter.includes(opt.id) }"
          @click="uiStore.toggleMonthFilter(opt.id)"
        >
          {{ opt.label }}
        </button>
      </div>
    </div>

    <div class="stats-filters__group">
      <button
        class="stats-filters__toggle"
        :class="{ 'stats-filters__toggle--active': uiStore.standingsAsWholeTeam }"
        @click="uiStore.toggleStandingsAsWholeTeam()"
      >
        Whole teams
      </button>
    </div>

    <div v-if="playerOptions.length" class="stats-filters__group">
      <div class="stats-filters__label">Same team includes</div>
      <div class="stats-filters__chips">
        <button
          v-for="opt in playerOptions"
          :key="opt.id"
          class="stats-filters__chip"
          :class="{ 'stats-filters__chip--active': uiStore.playersInSameTeam.some((p) => p.id === opt.id) }"
          @click="uiStore.toggleSameTeamPlayer(opt.player)"
        >
          {{ opt.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUiStore } from '@/stores/ui';
import { useMatchFilters } from '@/composables/useMatchFilters';

const uiStore = useUiStore();
const { playerCountOptions, monthOptions, playerOptions } = useMatchFilters();
</script>

<style scoped>
.stats-filters {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.stats-filters__group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stats-filters__label {
  color: var(--hs-text-dim);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.stats-filters__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.stats-filters__chip,
.stats-filters__toggle {
  border: none;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 12px;
  background: var(--hs-elevated);
  color: var(--hs-text-muted);
}

.stats-filters__chip--active,
.stats-filters__toggle--active {
  background: var(--hs-accent);
  color: var(--hs-bg);
}

.stats-filters__toggle {
  align-self: flex-start;
}
</style>
