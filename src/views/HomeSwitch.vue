<template>
  <Stats v-if="uiStore.design === 'old'" />
  <Home v-else />
</template>

<script setup lang="ts">
import { useUiStore } from '@/stores/ui';
import Home from './Home.vue';
import Stats from './Stats.vue';

const uiStore = useUiStore();
</script>
