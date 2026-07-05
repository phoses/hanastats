<template>
  <section class="stats-view hs-animate-fade">
    <ScreenHeader subtitle="Filters, standings & highlights" accent-color="var(--hs-accent)">
      <template #title-before>ST</template>
      <template #title-accent>ATS</template>
    </ScreenHeader>

    <StatsFilterBar />

    <div class="stats-grid">
      <div
        v-for="(card, i) in statCards"
        :key="i"
        class="stat-card"
        :class="{
          'stat-card--full': card.spanFull,
          'stat-card--gradient': card.gradient,
        }"
      >
        <div class="stat-card__tag" :style="{ color: card.tagColor }">{{ card.tag }}</div>
        <div>
          <div class="stat-card__value font-display" :style="{ fontSize: card.valueSize }">
            {{ card.value }}
          </div>
          <div class="stat-card__sub font-heading">{{ card.sub }}</div>
        </div>
      </div>
    </div>

    <div class="section-title">DETAILED STANDINGS</div>
    <div class="standings-table">
      <div class="standings-table__head">
        <span>Player</span>
        <span>GP</span>
        <span>W</span>
        <span>L</span>
        <span>D</span>
        <span>OT W/L</span>
        <span>G±</span>
        <span>S</span>
        <span>P%</span>
        <span v-if="!uiStore.standingsAsWholeTeam">ELO</span>
      </div>
      <div
        v-for="player in standings"
        :key="player.id"
        class="standings-table__row"
        :class="{ 'standings-table__row--invalid': !player.validResult }"
      >
        <button class="standings-table__player" @click="toggleExpanded(player.id)">
          <span>{{ player.name }}</span>
          <span v-if="player.ownsGame">🎮</span>
          <span v-if="player.streakCount > 4 && player.streakType === 'W'">🔥</span>
          <span v-if="player.streakCount > 4 && player.streakType === 'L'">❄️</span>
        </button>
        <span>{{ player.matches }}</span>
        <span>{{ player.wins }}</span>
        <span>{{ player.losses }}</span>
        <span>{{ player.draws }}</span>
        <span>{{ player.overtimeWins }}/{{ player.overtimeLosses }}</span>
        <span>{{ player.goalsDiff >= 0 ? '+' : '' }}{{ player.goalsDiff }}</span>
        <span>{{ player.streakCount }}{{ player.streakType }}</span>
        <span>{{ player.pointsPct }}</span>
        <span v-if="!uiStore.standingsAsWholeTeam">{{ player.elo }}</span>
        <div v-if="expandedId === player.id" class="standings-table__detail">
          <div>Regular wins: {{ player.regularTimeWins }} · OT wins: {{ player.overtimeWins }}</div>
          <div>Regular losses: {{ player.regularTimeLosses }} · OT losses: {{ player.overtimeLosses }}</div>
          <div>Goals for/against: {{ player.goalsFor }} / {{ player.goalsAgainst }}</div>
          <div>Points: {{ player.points }} / {{ player.maximumPoints }}</div>
        </div>
      </div>
      <p v-if="standings.length === 0" class="empty-state">No matches for current filters.</p>
    </div>

    <div class="section-title">MISCELLANEOUS</div>
    <div class="misc-grid">
      <div class="misc-card">Matches: {{ miscStats.matches }}</div>
      <div class="misc-card">Players: {{ miscStats.players }}</div>
      <div class="misc-card">Unique teams: {{ miscStats.teams }}</div>
      <div class="misc-card">Home win %: {{ miscStats.homeTeamWinPercentage }}</div>
      <div class="misc-card">1-player team win %: {{ miscStats.onePlayerTeamWinPercentage }}</div>
      <div class="misc-card">2-player team win %: {{ miscStats.twoPlayerTeamWinPercentage }}</div>
      <div class="misc-card">3-player team win %: {{ miscStats.threePlayerTeamWinPercentage }}</div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ScreenHeader from '@/components/ui/ScreenHeader.vue';
import StatsFilterBar from '@/components/ui/StatsFilterBar.vue';
import { useHighlights } from '@/composables/useHighlights';
import { usePlayerStandings } from '@/composables/usePlayerStandings';
import { useMatchFilters } from '@/composables/useMatchFilters';
import { useUiStore } from '@/stores/ui';

const uiStore = useUiStore();
const { statCards } = useHighlights();
const { standings } = usePlayerStandings();
const { miscStats } = useMatchFilters();
const expandedId = ref<string | null>(null);

function toggleExpanded(id: string) {
  expandedId.value = expandedId.value === id ? null : id;
}
</script>

<style scoped>
.stats-view {
  padding: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 11px;
  margin-bottom: 18px;
}

.stat-card {
  min-height: 118px;
  border-radius: 18px;
  padding: 15px 14px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: var(--hs-surface);
  border: 1px solid var(--hs-border);
}

.stat-card--full {
  grid-column: 1 / -1;
}

.stat-card--gradient {
  background: linear-gradient(135deg, rgba(255, 85, 85, 0.14), rgba(255, 85, 85, 0.03));
  border-color: rgba(255, 85, 85, 0.25);
}

.stat-card__tag {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.06em;
}

.stat-card__value {
  font-weight: 900;
  color: var(--hs-text);
  line-height: 1;
  letter-spacing: -0.01em;
}

.stat-card__sub {
  color: var(--hs-text-muted);
  font-size: 13px;
  font-weight: 600;
  margin-top: 5px;
}

.section-title {
  color: var(--hs-text-dim);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  margin: 8px 0 10px;
}

.standings-table {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 18px;
}

.standings-table__head,
.standings-table__row {
  display: grid;
  grid-template-columns: 1.6fr repeat(9, minmax(28px, 0.6fr));
  gap: 6px;
  align-items: center;
  font-size: 12px;
}

.standings-table__head {
  color: var(--hs-text-dim);
  font-weight: 700;
  padding: 0 4px 6px;
  border-bottom: 1px solid var(--hs-border);
}

.standings-table__row {
  background: var(--hs-surface);
  border: 1px solid var(--hs-border);
  border-radius: 12px;
  padding: 10px 8px;
}

.standings-table__row--invalid {
  opacity: 0.55;
  color: rgba(255, 170, 170, 0.85);
}

.standings-table__player {
  border: none;
  background: none;
  cursor: pointer;
  text-align: left;
  color: var(--hs-text);
  font-weight: 700;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.standings-table__detail {
  grid-column: 1 / -1;
  padding-top: 8px;
  color: var(--hs-text-dim);
  font-size: 12px;
  line-height: 1.5;
}

.misc-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 12px;
}

.misc-card {
  background: var(--hs-surface);
  border: 1px solid var(--hs-border);
  border-radius: 12px;
  padding: 12px;
  font-size: 13px;
  font-weight: 600;
  color: var(--hs-text-muted);
}

.empty-state {
  text-align: center;
  color: var(--hs-text-faint);
  font-size: 14px;
  padding: 24px 0;
}
</style>
