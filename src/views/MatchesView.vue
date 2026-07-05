<template>
  <section class="matches-view hs-animate-fade">
    <ScreenHeader :subtitle="`Recent results · ${gameLabel}`" accent-color="var(--hs-accent)">
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
        <div class="match-card__body" @click="toggleExpanded(match.id)">
          <div class="match-card__team match-card__team--left">
            <div
              class="match-card__names font-heading"
              :style="{ color: match.homeWins || match.isDraw ? 'var(--hs-text)' : 'var(--hs-text-dim)' }"
            >
              {{ match.homeNames }}
            </div>
            <div
              class="match-card__delta font-heading"
              :style="{ color: match.homeDelta >= 0 ? 'var(--hs-lime)' : 'var(--hs-red)' }"
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
              :style="{ color: match.awayWins || match.isDraw ? 'var(--hs-text)' : 'var(--hs-text-dim)' }"
            >
              {{ match.awayNames }}
            </div>
            <div
              class="match-card__delta font-heading"
              :style="{ color: match.awayDelta >= 0 ? 'var(--hs-lime)' : 'var(--hs-red)' }"
            >
              {{ formatDelta(match.awayDelta) }} ELO
            </div>
          </div>
        </div>
        <div v-if="match.isUpset" class="match-card__upset">⚡ UPSET OF THE WEEK</div>
        <div v-if="expandedMatchId === match.id && match.eloChanges.length" class="match-card__elo">
          <div class="match-card__elo-title">ELO changes</div>
          <div class="match-card__elo-team">
            Home (avg {{ Math.round(match.homeTeamAvgElo) }})
            <div
              v-for="change in match.eloChanges.filter((c) => c.team === 'home')"
              :key="change.playerId"
              class="match-card__elo-line"
            >
              {{ change.playerName }}: {{ change.oldElo }}
              <span :class="change.change >= 0 ? 'pos' : 'neg'">
                {{ change.change >= 0 ? '+' : '' }}{{ change.change }}
              </span>
              = {{ change.newElo }}
            </div>
          </div>
          <div class="match-card__elo-team">
            Away (avg {{ Math.round(match.awayTeamAvgElo) }})
            <div
              v-for="change in match.eloChanges.filter((c) => c.team === 'away')"
              :key="change.playerId"
              class="match-card__elo-line"
            >
              {{ change.playerName }}: {{ change.oldElo }}
              <span :class="change.change >= 0 ? 'pos' : 'neg'">
                {{ change.change >= 0 ? '+' : '' }}{{ change.change }}
              </span>
              = {{ change.newElo }}
            </div>
          </div>
        </div>
      </article>
      <p v-if="matches.length === 0" class="empty-state">No matches yet.</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import ScreenHeader from '@/components/ui/ScreenHeader.vue';
import { useMatchFeed } from '@/composables/useMatchFeed';
import { useUiStore } from '@/stores/ui';

const { matches: feedMatches, gameName } = useMatchFeed();
const uiStore = useUiStore();
const expandedMatchId = ref<string | null>(null);

const matches = computed(() => feedMatches.value);
const gameLabel = computed(() => {
  if (uiStore.gameFilterId === 'all') return gameName.value?.name ?? 'All games';
  return gameName.value?.name ?? 'Game';
});

function toggleExpanded(matchId?: string) {
  if (!matchId) return;
  expandedMatchId.value = expandedMatchId.value === matchId ? null : matchId;
}

function formatDelta(delta: number): string {
  return `${delta >= 0 ? '+' : ''}${delta}`;
}

function scoreColor(home: number, away: number, isHome: boolean): string {
  if (home === away) return 'var(--hs-text)';
  if (isHome) return home > away ? 'var(--hs-lime)' : 'var(--hs-text-faint)';
  return away > home ? 'var(--hs-lime)' : 'var(--hs-text-faint)';
}
</script>

<style scoped>
.matches-view {
  padding: 0;
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
  cursor: pointer;
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
  color: var(--hs-text-faint);
  font-size: 16px;
}

.match-card__upset {
  margin-top: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(241, 250, 140, 0.1);
  border-radius: 9px;
  padding: 5px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: var(--hs-gold);
}

.match-card__elo {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--hs-border);
  font-size: 13px;
  color: var(--hs-text-muted);
}

.match-card__elo-title {
  font-weight: 800;
  margin-bottom: 8px;
  color: var(--hs-text);
}

.match-card__elo-team + .match-card__elo-team {
  margin-top: 10px;
}

.match-card__elo-line {
  margin-top: 4px;
}

.pos {
  color: var(--hs-lime);
}

.neg {
  color: var(--hs-red);
}

.empty-state {
  text-align: center;
  color: var(--hs-text-faint);
  font-size: 14px;
  padding: 32px 0;
}
</style>
