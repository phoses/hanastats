<template>
  <section class="standings-view hs-animate-fade">
    <ScreenHeader subtitle="Ranked by ELO · updated live" accent-color="var(--hs-accent)">
      <template #title-before>STAND</template>
      <template #title-accent>INGS</template>
      <template #meta>
        Season 4<br />
        <span class="meta-accent">{{ validStandings.length }} ranked</span>
      </template>
    </ScreenHeader>

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

const uiStore = useUiStore();
const { standings, validStandings } = usePlayerStandings();
</script>

<style scoped>
.standings-view {
  padding: 0;
}

.meta-accent {
  color: var(--hs-accent);
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
