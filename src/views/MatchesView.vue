<template>
  <section class="matches-view hs-animate-fade">
    <ScreenHeader :subtitle="`Recent results · ${gameLabel}`" accent-color="#FF5B39">
      <template #title-before>MATCH</template>
      <template #title-accent>ES</template>
    </ScreenHeader>

    <div class="match-list">
      <article
        v-for="match in matches"
        :key="match.id"
        class="match-card"
        :class="{ 'hs-animate-pop': match.isNew }"
      >
        <div class="match-card__top">
          <span class="match-card__tag">{{ match.tag }}</span>
          <span class="match-card__when">{{ match.when }}</span>
        </div>
        <div class="match-card__body">
          <div class="match-card__team match-card__team--left">
            <div
              class="match-card__names font-heading"
              :style="{ color: match.homeWins || match.isDraw ? '#F2F5F7' : '#6B7683' }"
            >
              {{ match.homeNames }}
            </div>
            <div
              class="match-card__delta font-heading"
              :style="{ color: match.homeDelta >= 0 ? '#C6FF3D' : '#FF5B39' }"
            >
              {{ formatDelta(match.homeDelta) }} ELO
            </div>
          </div>
          <div class="match-card__score font-display">
            <span :style="{ color: scoreColor(match.homeScore, match.awayScore, true) }">{{
              match.homeScore
            }}</span>
            <span class="match-card__colon">:</span>
            <span :style="{ color: scoreColor(match.homeScore, match.awayScore, false) }">{{
              match.awayScore
            }}</span>
          </div>
          <div class="match-card__team match-card__team--right">
            <div
              class="match-card__names font-heading"
              :style="{ color: match.awayWins || match.isDraw ? '#F2F5F7' : '#6B7683' }"
            >
              {{ match.awayNames }}
            </div>
            <div
              class="match-card__delta font-heading"
              :style="{ color: match.awayDelta >= 0 ? '#C6FF3D' : '#FF5B39' }"
            >
              {{ formatDelta(match.awayDelta) }} ELO
            </div>
          </div>
        </div>
        <div v-if="match.isUpset" class="match-card__upset">
          ⚡ UPSET OF THE WEEK
        </div>
      </article>
      <p v-if="matches.length === 0" class="empty-state">No matches yet.</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ScreenHeader from '@/components/ui/ScreenHeader.vue';
import { useMatchFeed } from '@/composables/useMatchFeed';
import { useUiStore } from '@/stores/ui';

const { matches, gameName } = useMatchFeed();
const uiStore = useUiStore();

const gameLabel = computed(() => {
  if (uiStore.gameFilterId === 'all') return gameName.value?.name ?? 'All games';
  return gameName.value?.name ?? 'Game';
});

function formatDelta(delta: number): string {
  return `${delta >= 0 ? '+' : ''}${delta}`;
}

function scoreColor(home: number, away: number, isHome: boolean): string {
  if (home === away) return '#F2F5F7';
  if (isHome) return home > away ? '#C6FF3D' : '#5A646F';
  return away > home ? '#C6FF3D' : '#5A646F';
}
</script>

<style scoped>
.matches-view {
  padding: 14px 18px 0;
}

.match-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.match-card {
  background: var(--hs-surface);
  border: 1px solid var(--hs-border);
  border-radius: 18px;
  padding: 13px 14px;
}

.match-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 11px;
}

.match-card__tag {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  padding: 3px 8px;
  border-radius: 7px;
  background: rgba(255, 255, 255, 0.06);
  color: var(--hs-text-muted);
}

.match-card__when {
  color: var(--hs-text-dim);
  font-size: 12px;
  font-weight: 500;
}

.match-card__body {
  display: flex;
  align-items: center;
  gap: 10px;
}

.match-card__team {
  flex: 1;
}

.match-card__team--right {
  text-align: right;
}

.match-card__names {
  font-weight: 700;
  font-size: 15px;
  line-height: 1.2;
}

.match-card__delta {
  font-size: 12px;
  font-weight: 700;
  margin-top: 2px;
}

.match-card__score {
  flex: none;
  display: flex;
  align-items: center;
  gap: 9px;
  font-weight: 900;
  font-size: 26px;
  color: var(--hs-text);
}

.match-card__colon {
  color: #3a434d;
  font-size: 16px;
}

.match-card__upset {
  margin-top: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 203, 69, 0.1);
  border-radius: 9px;
  padding: 5px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: var(--hs-gold);
}

.empty-state {
  text-align: center;
  color: var(--hs-text-faint);
  font-size: 14px;
  padding: 32px 0;
}
</style>
