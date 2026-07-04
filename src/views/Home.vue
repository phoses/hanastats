<template>
  <div class="home-view">
    <GameFilterBar />
    <StandingsView v-if="uiStore.tab === 'standings'" />
    <TrendsView v-else-if="uiStore.tab === 'trends'" />
    <MatchesView v-else-if="uiStore.tab === 'matches'" />
    <StatsHighlightsView v-else-if="uiStore.tab === 'stats'" />
  </div>
</template>

<script setup lang="ts">
import { useUiStore } from '@/stores/ui';
import GameFilterBar from '@/components/ui/GameFilterBar.vue';
import StandingsView from './StandingsView.vue';
import TrendsView from './TrendsView.vue';
import MatchesView from './MatchesView.vue';
import StatsHighlightsView from './StatsHighlightsView.vue';

const uiStore = useUiStore();
</script>

<style scoped>
.home-view {
  min-height: 100%;
  padding: 14px 18px 0;
}
</style>
