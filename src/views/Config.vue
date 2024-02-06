<script setup lang="ts">
import { useGamesStore } from '@/stores/game';
import { usePlayersStore } from '@/stores/player';

const gameStore = useGamesStore();
const playerStore = usePlayersStore();

const { games } = gameStore;
const { players } = playerStore;

</script>

<template>
  <h2>players</h2>
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

<style scoped>

</style>
