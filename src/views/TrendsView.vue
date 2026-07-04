<template>
  <section class="trends-view hs-animate-fade">
    <ScreenHeader subtitle="ELO over last 10 matches" accent-color="var(--hs-accent)">
      <template #title-before>TR</template>
      <template #title-accent>ENDS</template>
    </ScreenHeader>

    <div class="chart-card">
      <EloTrendChart :lines="chartLines" />
    </div>

    <div class="legend">
      <button
        v-for="player in legendPlayers"
        :key="player.id"
        class="legend-btn"
        :class="{ 'legend-btn--on': uiStore.chartSelectedIds.includes(player.id) }"
        @click="uiStore.toggleChartPlayer(player.id)"
      >
        <span class="legend-btn__dot" :style="{ background: player.color }" />
        <span class="legend-btn__name font-heading">{{ player.shortName }}</span>
      </button>
    </div>

    <div class="movers-label">BIGGEST MOVERS · THIS WEEK</div>
    <div class="movers-list">
      <div v-for="mover in biggestMovers" :key="mover.id" class="mover-row">
        <PlayerAvatar
          :initials="mover.initials"
          :color="mover.color"
          :size="34"
          :radius="11"
          :font-size="13"
        />
        <div class="mover-row__name font-heading">{{ mover.name }}</div>
        <div
          class="mover-row__delta font-display"
          :style="{ color: mover.delta >= 0 ? 'var(--hs-lime)' : 'var(--hs-red)' }"
        >
          {{ mover.deltaLabel }}
        </div>
      </div>
      <p v-if="biggestMovers.length === 0" class="empty-state">No movement this week yet.</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import ScreenHeader from '@/components/ui/ScreenHeader.vue';
import EloTrendChart from '@/components/ui/EloTrendChart.vue';
import PlayerAvatar from '@/components/ui/PlayerAvatar.vue';
import { useUiStore } from '@/stores/ui';
import { usePlayerStandings } from '@/composables/usePlayerStandings';
import { useHighlights } from '@/composables/useHighlights';

const uiStore = useUiStore();
const { standings, validStandings } = usePlayerStandings();
const { biggestMovers } = useHighlights();

const legendPlayers = computed(() => validStandings.value.slice(0, 6));

watch(
  () => validStandings.value.map((p) => p.id),
  (ids) => uiStore.initChartSelection(ids),
  { immediate: true }
);

const chartLines = computed(() =>
  standings.value
    .filter((p) => uiStore.chartSelectedIds.includes(p.id))
    .map((p) => ({
      id: p.id,
      color: p.color,
      hist: p.hist.length ? p.hist : [p.elo],
    }))
);
</script>

<style scoped>
.trends-view {
  padding: 0;
}

.chart-card {
  background: var(--hs-surface);
  border: 1px solid var(--hs-border);
  border-radius: 20px;
  padding: 14px 12px 12px;
  margin-bottom: 14px;
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 22px;
}

.legend-btn {
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 7px 12px 7px 9px;
  border-radius: 11px;
  background: var(--hs-surface);
  transition: all 0.15s;
}

.legend-btn--on {
  background: #1d242d;
}

.legend-btn__dot {
  width: 11px;
  height: 11px;
  border-radius: 4px;
}

.legend-btn__name {
  font-size: 13px;
  font-weight: 700;
  color: #5a646f;
}

.legend-btn--on .legend-btn__name {
  color: var(--hs-text);
}

.movers-label {
  color: var(--hs-text-dim);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  margin-bottom: 10px;
}

.movers-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mover-row {
  display: flex;
  align-items: center;
  gap: 11px;
  background: var(--hs-surface);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  padding: 10px 13px;
}

.mover-row__name {
  flex: 1;
  font-weight: 700;
  font-size: 15px;
  color: var(--hs-text);
}

.mover-row__delta {
  font-weight: 800;
  font-size: 17px;
}

.empty-state {
  text-align: center;
  color: var(--hs-text-faint);
  font-size: 13px;
  padding: 16px 0;
}
</style>
