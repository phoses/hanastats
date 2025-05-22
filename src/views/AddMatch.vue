<template>
  <div class="text-center">
    <h2>add new match</h2>

    <h3>game
      <Dropdown v-model="match.game" :options="games" optionLabel="name" placeholder="Select game" :scrollHeight="gamesScrollHeightPx" />
    </h3>

    <template v-if="match.game !== null">

      <h3 class="mt-5">players</h3>
      <div class="mb-3">
        <label for="fixedteams" class="mr-2">fixed teams</label><Checkbox v-model="fixedTeams" binary inputId="fixedteams"/>
      </div>
      <SelectButton v-model="selectedPlayers" :options="players" optionLabel="username" multiple/>
    </template>

    <template v-if="selectedPlayers.length > 1">
      <h3 v-if="selectedPlayers.length > 0" class="mt-5">teams</h3>

      <div class="flex">
        <TeamScore v-model="match.homeScore" class="w-6">
          <template #teamName>home</template>
          <template #team v-if="match.homeTeam">{{match.homeTeam.name}}</template>
          <template #players>{{ match.homePlayers.map(p => p.username).join(', ') }}</template>
        </TeamScore>
        <TeamScore v-model="match.awayScore" class="w-6">
          <template #teamName>away</template>
          <template #team v-if="match.awayTeam">{{match.awayTeam.name}}</template>
          <template #players>{{ match.awayPlayers.map(p => p.username).join(', ') }}</template>
        </TeamScore>
      </div>

      <div class="mt-5">
        <label for="overtime" class="mr-2">overtime win</label><Checkbox v-model="match.overtime" binary inputId="overtime"/>
      </div>

      <div>
        <Button @click="addMatch" label="add match" class="mt-5"/>
      </div>
    </template>
  </div>

</template>

<script setup lang="ts">
import { useGamesStore, type Game, type Team } from '@/stores/game';
import { useMatchStore, type Match } from '@/stores/match';
import { useLoadingStore } from '@/stores/loading';
import { usePlayersStore, type Player } from '@/stores/player';
import Button from 'primevue/button';
import { ref, onMounted, computed, watch } from 'vue';
import Dropdown from 'primevue/dropdown';
import SelectButton from 'primevue/selectbutton';
import Checkbox from 'primevue/checkbox';
import TeamScore from '@/components/TeamScore.vue';
import _ from 'lodash';

const matchStore = useMatchStore();
const gameStore = useGamesStore();
const playerStore = usePlayersStore();
const loadingStore = useLoadingStore();
const games = computed(() => _.chain(gameStore.games)
  .filter(game => !game.disabled)
  .sortBy('id')
  .reverse()
  .value());
const players = computed(() => playerStore.players);

const match = ref({
    game: null as Game | null,
    homePlayers: [] as Player[],
    awayPlayers: [] as Player[],
    homeScore: 0,
    awayScore: 0,
    overtime: false,
    homeTeam: null as Team | null,
    awayTeam: null as Team | null,
  } as Match);

const selectedPlayers = ref([]);
const fixedTeams = ref(false);

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
  if (fixedTeams.value) {
    if (match.value.homePlayers.length === match.value.awayPlayers.length) {
      match.value.homePlayers.push(newVal[newVal.length - 1]);
    } else {
      match.value.awayPlayers.push(newVal[newVal.length - 1]);
    }
  } else {
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
  }

  if (match.value?.game?.teams?.length! > 1) {
    const teams = _.shuffle(match.value?.game?.teams);
    match.value.homeTeam = teams[0];
    match.value.awayTeam = teams[1];
  } 
});

async function addMatch() {
  loadingStore.doLoading(async () => {
    await matchStore.addMatch(match.value);
    clear();
  });
}

const gamesScrollHeightPx = computed(() => {
  return games.value.length * 50 + 'px';
});

</script>

<style scoped>

:deep(.p-highlight) {
  background-color: white;
  color: #1c1c1c;
}

</style>
