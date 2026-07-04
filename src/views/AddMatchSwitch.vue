<template>
  <AddMatch v-if="uiStore.design === 'old'" />
  <AddMatchView v-else />
</template>

<script setup lang="ts">
import { useUiStore } from '@/stores/ui';
import AddMatch from './AddMatch.vue';
import AddMatchView from './AddMatchView.vue';

const uiStore = useUiStore();
</script>
