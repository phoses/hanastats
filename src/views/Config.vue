<template>
  <div>
    <h2>players</h2>
  </div>
  <ul>
    <li v-for="player in players" :key="player.id">
      {{ player.username }}
    </li>
  </ul>

  <div v-if="userStore.currentUser?.role === 'admin'" class="flex">
    <InputText type="text" v-model="playername" />
    <Button @click="addPlayer" icon="pi pi-plus" size="large"/>
  </div>

  <h2>games</h2>
  <div v-for="game in games" :key="game.id" class="flex mb-3">
    <div class="name">{{ game.name }}</div>
    <Button v-if="!game.disabled" label="disable" @click="changeStatus(game, { disabled: true })" class="p-button-danger p-button-text p-0"/>
    <Button v-if="game.disabled" label="enable" @click="changeStatus(game, { disabled: false })" class="p-button-text p-0"/>
  </div>

  <template v-if="userStore.currentUser?.role === 'admin'">
    <h2>add game</h2>

    <label>name</label>
    <InputText type="text" v-model="game.name" />

    <label class="mt-2">points for win</label>
    <InputNumber type="text" v-model="game.pointsForWin" />

    <label class="mt-2">points for draw</label>
    <InputNumber type="text" v-model="game.pointsForDraw" />

    <label class="mt-2">points for OT winner</label>
    <InputNumber type="text" v-model="game.pointsForOTWin" />

    <label class="mt-2">points for OT lose</label>
    <InputNumber type="text" v-model="game.pointsForOTLose" />

    <Button @click="addGame" class="mt-2" label="add game"/>
  </template>
</template>

<script setup lang="ts">
import { useGamesStore, type Game } from '@/stores/game';
import { useLoadingStore } from '@/stores/loading';
import { usePlayersStore } from '@/stores/player';
import { useUserStore } from '@/stores/user';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import { ref, onMounted, computed } from 'vue';
import InputNumber from 'primevue/inputnumber';

const gameStore = useGamesStore();
const playerStore = usePlayersStore();
const userStore = useUserStore();
const loadingStore = useLoadingStore();

const games = computed(() => gameStore.games);
const players = computed(() => playerStore.players);
const playername = ref('');
const game = ref({} as Game);

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
    await gameStore.addGame(game.value);
    await gameStore.getGames();
    game.value = {} as Game;
  });
}

async function changeStatus(game: Game, newStatus: { disabled: boolean }) {
  loadingStore.doLoading(async () => {
    await gameStore.updateGame({ ...game, ...newStatus });
    await gameStore.getGames();
  });
}


</script>

<style scoped>

  .name {
    width: 7rem;
  }
</style>
