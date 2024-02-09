<template>
  <div class="d-flex">
    <h2>players</h2>
    <Button label="New" icon="pi pi-plus" />
  </div>
  <ul>
    <li v-for="player in players" :key="player.id">
      {{ player.name }}
    </li>
  </ul>

  <h2>games</h2>
  <ul>
    <li v-for="game in games" :key="game.id">
      {{ game.name }}
    </li>
  </ul>


</template>

<script setup lang="ts">
import { useGamesStore } from '@/stores/game';
import { usePlayersStore } from '@/stores/player';
import Button from 'primevue/button';

const gameStore = useGamesStore();
const playerStore = usePlayersStore();

const { games } = gameStore;
const { players } = playerStore;

</script>

<style scoped>

</style>
