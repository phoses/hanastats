<template>
  <div class="home-view">
    <StandingsView v-if="uiStore.tab === 'standings'" />
    <TrendsView v-else-if="uiStore.tab === 'trends'" />
    <MatchesView v-else-if="uiStore.tab === 'matches'" />
    <StatsHighlightsView v-else-if="uiStore.tab === 'stats'" />
  </div>
</template>

<script setup lang="ts">
import { useUiStore } from '@/stores/ui';
import StandingsView from './StandingsView.vue';
import TrendsView from './TrendsView.vue';
import MatchesView from './MatchesView.vue';
import StatsHighlightsView from './StatsHighlightsView.vue';

const uiStore = useUiStore();
</script>

<style scoped>
.home-view {
  min-height: 100%;
}
</style>
