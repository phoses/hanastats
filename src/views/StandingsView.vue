<template>
  <section class="standings-view hs-animate-fade">
    <ScreenHeader subtitle="Ranked by ELO · updated live" accent-color="#C6FF3D">
      <template #title-before>STAND</template>
      <template #title-accent>INGS</template>
      <template #meta>
        Season 4<br />
        <span style="color: #c6ff3d">{{ standings.length }} players</span>
      </template>
    </ScreenHeader>

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

    <div class="leaderboard">
      <PlayerCard
        v-for="(player, index) in standings"
        :key="player.id"
        :player="player"
        :rank="index + 1"
        :expanded="uiStore.expandedPlayerId === player.id"
        :highlighted="uiStore.justAddedIds.includes(player.id)"
        @toggle="uiStore.toggleExpanded(player.id)"
      />
      <p v-if="standings.length === 0" class="empty-state">No matches yet for this filter.</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import ScreenHeader from '@/components/ui/ScreenHeader.vue';
import PlayerCard from '@/components/ui/PlayerCard.vue';
import { useUiStore } from '@/stores/ui';
import { usePlayerStandings } from '@/composables/usePlayerStandings';
import { useFilteredMatches } from '@/composables/useFilteredMatches';

const uiStore = useUiStore();
const { standings } = usePlayerStandings();
const { gameFilterOptions } = useFilteredMatches();
</script>

<style scoped>
.standings-view {
  padding: 14px 18px 0;
}

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
  background: var(--hs-lime);
  color: var(--hs-bg);
  box-shadow: 0 4px 14px -4px rgba(198, 255, 61, 0.5);
}

.leaderboard {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.empty-state {
  text-align: center;
  color: var(--hs-text-faint);
  font-size: 14px;
  padding: 32px 0;
}
</style>
