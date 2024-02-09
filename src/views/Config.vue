<template>
  <div>
    <h2>players</h2>
  </div>
  <ul>
    <li v-for="player in players" :key="player.id">
      {{ player.username }}
    </li>
  </ul>


  <InputText type="text" v-model="playername" />
  <Button @click="addPlayer" icon="pi pi-plus" size="large"/>

  <h2>games</h2>
  <ul>
    <li v-for="game in games" :key="game.id">
      {{ game.name }}
    </li>
  </ul>

  <InputText type="text" v-model="gamename" />
  <Button @click="addGame" icon="pi pi-plus" size="large"/>

</template>

<script setup lang="ts">
import { useGamesStore } from '@/stores/game';
import { usePlayersStore } from '@/stores/player';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import { ref, onMounted, computed } from 'vue';

const gameStore = useGamesStore();
const playerStore = usePlayersStore();

const games = computed(() => gameStore.games);
const players = computed(() => playerStore.players);
const playername = ref('');
const gamename = ref('');

onMounted(async () => {
  if (players.value === null) {
    await playerStore.getPlayers();
    await gameStore.getGames();
  }
});

async function addPlayer() {
  await playerStore.addplayer(playername.value);
  await playerStore.getPlayers();
  playername.value = '';
}

async function addGame() {
  await gameStore.addGame(gamename.value);
  await gameStore.getGames();
  gamename.value = '';
}


</script>

<style scoped>

</style>
