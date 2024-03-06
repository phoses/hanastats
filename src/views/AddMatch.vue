<template>
  <h2>add new match</h2>

  <h3>game</h3>
  <Dropdown v-model="match.game" :options="games" optionLabel="name" placeholder="Select game" />

  <template v-if="match.game !== null">
    <h3>players</h3>
    <SelectButton v-model="selectedPlayers" :options="players" optionLabel="username" multiple/>
  </template>

  <template v-if="selectedPlayers.length > 0">
    <h3>teams</h3>

    home: {{ match.homePlayers.map(p => p.username).join(', ') }} <br/>
    away: {{ match.awayPlayers.map(p => p.username).join(', ') }}

    <h3 v-if="selectedPlayers.length > 0">score</h3>

    <div class="flex gap-7">
      <div>
        <div>home</div>
        <InputNumber v-model="match.homeScore" showButtons buttonLayout="vertical" style="width: 3rem" :min="0" :max="99">
          <template #incrementbuttonicon>
              <span class="pi pi-plus" />
          </template>
          <template #decrementbuttonicon>
              <span class="pi pi-minus" />
          </template>
        </InputNumber>
      </div>

      <div>
        <div>away</div>
        <InputNumber v-model="match.awayScore" showButtons buttonLayout="vertical" style="width: 3rem" :min="0" :max="99">
          <template #incrementbuttonicon>
              <span class="pi pi-plus" />
          </template>
          <template #decrementbuttonicon>
              <span class="pi pi-minus" />
          </template>
        </InputNumber>
      </div>
    </div>

    <h3>overtime</h3>

    <ToggleButton v-model="match.overtime" onLabel="yes" offLabel="no"/>

    <div>
      <Button @click="addMatch" label="add match" class="mt-5"/>
    </div>

  </template>


</template>

<script setup lang="ts">
import { useGamesStore, type Game } from '@/stores/game';
import { useMatchStore, type Match } from '@/stores/match';
import { useLoadingStore } from '@/stores/loading';
import { usePlayersStore, type Player } from '@/stores/player';
import Button from 'primevue/button';
import { ref, onMounted, computed, watch } from 'vue';
import Dropdown from 'primevue/dropdown';
import SelectButton from 'primevue/selectbutton';
import InputNumber from 'primevue/inputnumber';
import ToggleButton from 'primevue/togglebutton';
import _ from 'lodash';

const matchStore = useMatchStore();
const gameStore = useGamesStore();
const playerStore = usePlayersStore();
const loadingStore = useLoadingStore();
const games = computed(() => gameStore.games);
const players = computed(() => playerStore.players);

const match = ref({
    game: null as Game | null,
    homePlayers: [] as Player[],
    awayPlayers: [] as Player[],
    homeScore: 0,
    awayScore: 0,
    overtime: false,
  } as Match);

const selectedPlayers = ref([]);

onMounted(async () => {
  clear();
  if (players.value === null) {
    loadingStore.doLoading(async () => {
      await playerStore.getPlayers();
      await gameStore.getGames();
    });
  }
});

const clear = () => {
  match.value = {
    game: null as Game | null,
    homePlayers: [],
    awayPlayers: [],
    homeScore: 0,
    awayScore: 0,
    overtime: false,
  } as Match;

  selectedPlayers.value = [];
};

watch(selectedPlayers, (newVal: Player[]) => {
  match.value.homePlayers = [];
  match.value.awayPlayers = [];
  const shuffled = _.shuffle(newVal);
  _.forEach(shuffled, player => {
    if (match.value.homePlayers.length < match.value.awayPlayers.length) {
      match.value.homePlayers.push(player);
    } else if (match.value.homePlayers.length > match.value.awayPlayers.length){
      match.value.awayPlayers.push(player);
    } else {
      const random = Math.random() >= 0.5;
      if (random) {
        match.value.homePlayers.push(player);
      } else {
        match.value.awayPlayers.push(player);
      }
    }
  });
});

async function addMatch() {
  loadingStore.doLoading(async () => {
    await matchStore.addMatch(match.value);
    clear();
  });
}

</script>

<style scoped>

:deep(.p-highlight) {
  background-color: white;
  color: #1c1c1c;
}

</style>
