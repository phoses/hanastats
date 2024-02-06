<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink, RouterView } from 'vue-router';
import { useRouter } from 'vue-router';
import Menubar from 'primevue/menubar';
import { PrimeIcons } from 'primevue/api';

const router = useRouter()

const items = ref([
  { label: 'stats', icon: PrimeIcons.CHART_BAR, command: () => router.push('/')},
  { label: 'addgame', icon: PrimeIcons.PLUS, command: () => router.push('/addgame')},
  { label: 'config', icon: PrimeIcons.PLUS_CIRCLE, command: () => router.push('/config')},
]);

</script>

<template>
  <header>
    <Menubar :model="items" />
  </header>

  <RouterView />
</template>

<style scoped>

</style>
