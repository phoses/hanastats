<template>
  <div>
    <h2>players</h2>
  </div>
  <ul>
    <li v-for="player in players" :key="player.id">
      {{ player.username }}
    </li>
  </ul>

  <template v-if="userStore.currentUser?.role === 'admin'">
    <InputText type="text" v-model="playername" />
    <Button @click="addPlayer" icon="pi pi-plus" size="large"/>
  </template>

  <h2>games</h2>
  <ul>
    <li v-for="game in games" :key="game.id">
      {{ game.name }}
    </li>
  </ul>

  <template v-if="userStore.currentUser?.role === 'admin'">
    <InputText type="text" v-model="gamename" />
    <Button @click="addGame" icon="pi pi-plus" size="large"/>
  </template>

</template>

<script setup lang="ts">
import { useGamesStore } from '@/stores/game';
import { useLoadingStore } from '@/stores/loading';
import { usePlayersStore } from '@/stores/player';
import { useUserStore } from '@/stores/user';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import { ref, onMounted, computed } from 'vue';

const gameStore = useGamesStore();
const playerStore = usePlayersStore();
const userStore = useUserStore();
const loadingStore = useLoadingStore();

const games = computed(() => gameStore.games);
const players = computed(() => playerStore.players);
const playername = ref('');
const gamename = ref('');

onMounted(async () => {
  if (players.value === null) {
    loadingStore.doLoading(async () => {
      await playerStore.getPlayers();
      await gameStore.getGames();
    });
  }
});

async function addPlayer() {
  loadingStore.doLoading(async () => {
    await playerStore.addplayer(playername.value);
    await playerStore.getPlayers();
    playername.value = '';
  });
}

async function addGame() {
  loadingStore.doLoading(async () => {
    await gameStore.addGame(gamename.value);
    await gameStore.getGames();
    gamename.value = '';
  });
}


</script>

<style scoped>

</style>
