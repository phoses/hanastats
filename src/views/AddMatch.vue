<template>
  <div class="text-center">
    <h2>add new match</h2>

    <h3>game
      <Dropdown v-model="match.game" :options="games" optionLabel="name" placeholder="Select game" :scrollHeight="gamesScrollHeightPx" />
    </h3>

    <template v-if="match.game !== null">

      <h3>team mode</h3>
      <div class="mb-3 flex gap-2 justify-content-center">
        <div class="flex align-items-center">
          <RadioButton v-model="teamMode" inputId="mode-elo" value="elo-based" />
          <label for="mode-elo" class="ml-2">elo-based</label>
        </div>
        <div class="flex align-items-center">
          <RadioButton v-model="teamMode" inputId="mode-random" value="random" />
          <label for="mode-random" class="ml-2">random</label>
        </div>
        <div class="flex align-items-center">
          <RadioButton v-model="teamMode" inputId="mode-fixed" value="fixed" />
          <label for="mode-fixed" class="ml-2">fixed</label>
        </div>
      </div>

      <h3 class="mt-5">players</h3>
      <SelectButton 
        v-model="selectedPlayers" 
        :options="players" 
        optionLabel="username" 
        multiple
      >
        <template #option="{ option }">
          <div class="text-center">{{ option.username }}</div>
        </template>
      </SelectButton>
    </template>

    <template v-if="selectedPlayers.length > 1">
      <h3 v-if="selectedPlayers.length > 0" class="mt-5">teams</h3>

      <div class="flex gap-2">
        <TeamScore v-model="match.homeScore" class="w-6">
          <template #teamName>home</template>
          <template #team v-if="match.homeTeam">{{match.homeTeam.name}}</template>
          <template #players>
            {{ match.homePlayers.map(p => p.username).join(', ') }}
            <div v-if="homeTeamAvgElo !== null" class="mt-2">avg elo: {{ homeTeamAvgElo }}</div>
          </template>
        </TeamScore>
        <TeamScore v-model="match.awayScore" class="w-6">
          <template #teamName>away</template>
          <template #team v-if="match.awayTeam">{{match.awayTeam.name}}</template>
          <template #players>
            {{ match.awayPlayers.map(p => p.username).join(', ') }}
            <div v-if="awayTeamAvgElo !== null" class="mt-2">avg elo: {{ awayTeamAvgElo }}</div>
          </template>
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
import { calculateEloRatings, BASE_ELO } from '@/utils/elo';
import Button from 'primevue/button';
import { ref, onMounted, computed, watch } from 'vue';
import Dropdown from 'primevue/dropdown';
import SelectButton from 'primevue/selectbutton';
import RadioButton from 'primevue/radiobutton';
import TeamScore from '@/components/TeamScore.vue';
import _ from 'lodash';
import Checkbox from 'primevue/checkbox';

const matchStore = useMatchStore();
const gameStore = useGamesStore();
const playerStore = usePlayersStore();
const loadingStore = useLoadingStore();
const games = computed(() => _.chain(gameStore.games)
  .filter(game => !game.disabled)
  .sortBy('id')
  .reverse()
  .value());
const players = computed(() => _.sortBy(playerStore.players, player => player.username.toLowerCase()));

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
const teamMode = ref('elo-based'); // 'elo-based', 'random', or 'fixed'

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

// Get current elo ratings for selected players for the current game
const getPlayerElos = (playersList: Player[]): { [key: string]: number } => {
  if (!match.value.game || !matchStore.matches) {
    return {};
  }

  // Filter matches for the selected game
  const gameMatches = matchStore.matches.filter(m => m.game?.id === match.value.game?.id);
  
  // Get all players who have played this game, plus the currently selected players
  const allPlayersInGame = _.chain(gameMatches)
    .flatMap(m => [...m.homePlayers, ...m.awayPlayers])
    .concat(playersList)
    .uniqBy('id')
    .map(p => [p])
    .value();

  // Calculate elo ratings (all players will be initialized with BASE_ELO)
  const { eloRatings } = calculateEloRatings(gameMatches, allPlayersInGame);
  
  return eloRatings;
};

// Balance teams based on elo to make them as even as possible
const balanceTeamsByElo = (playersList: Player[]): { home: Player[], away: Player[] } => {
  const eloRatings = getPlayerElos(playersList);

  // Add small random variance to elos to introduce some variety
  // Random value between -40 and +40
  const randomVariance = 40;
  const playersWithElo = playersList.map(p => ({
    player: p,
    elo: (eloRatings[p.id] || BASE_ELO) + (Math.random() * 2 - 1) * randomVariance
  }));

  // Sort by elo descending
  const sortedPlayers = _.orderBy(playersWithElo, ['elo'], ['desc']);

  // For small groups, try all combinations to find the most balanced split
  if (playersList.length <= 10) {
    return findBestTeamSplit(sortedPlayers);
  } else {
    // For larger groups, use greedy snake draft approach
    return snakeDraftTeams(sortedPlayers);
  }
};

// Find the best team split by trying all combinations (for small groups)
const findBestTeamSplit = (playersWithElo: { player: Player, elo: number }[]): { home: Player[], away: Player[] } => {
  const n = playersWithElo.length;
  const halfSize = Math.floor(n / 2);
  
  let bestSplit = { home: [] as Player[], away: [] as Player[], diff: Infinity, homeAvgElo: 0, awayAvgElo: 0 };
  
  // For odd numbers, try both possible team sizes to find best balance
  const sizesToTry = n % 2 === 0 ? [halfSize] : [halfSize, halfSize + 1];
  
  for (const teamSize of sizesToTry) {
    // Generate all combinations for home team of this size
    const combinations = getCombinations(playersWithElo, teamSize);
    
    for (const homeTeam of combinations) {
      const homeIds = new Set(homeTeam.map(p => p.player.id));
      const awayTeam = playersWithElo.filter(p => !homeIds.has(p.player.id));
      
      const homeAvgElo = _.meanBy(homeTeam, 'elo');
      const awayAvgElo = _.meanBy(awayTeam, 'elo');
      const diff = Math.abs(homeAvgElo - awayAvgElo);
      
      if (diff < bestSplit.diff) {
        bestSplit = {
          home: homeTeam.map(p => p.player),
          away: awayTeam.map(p => p.player),
          diff,
          homeAvgElo,
          awayAvgElo
        };
      }
    }
  }

  const { home, away, homeAvgElo, awayAvgElo } = bestSplit;
  const betterElo = Math.max(homeAvgElo, awayAvgElo);
  const worseElo = Math.min(homeAvgElo, awayAvgElo);
  const pWorseHome = Math.min(1, (betterElo / Math.max(worseElo, 1)) * 100 / 2 / 100);
  const worsePlayers = homeAvgElo <= awayAvgElo ? home : away;
  const betterPlayers = homeAvgElo <= awayAvgElo ? away : home;
  if (Math.random() < pWorseHome) {
    return { home: worsePlayers, away: betterPlayers };
  }
  return { home: betterPlayers, away: worsePlayers };
};

// Generate all combinations of size k from array
const getCombinations = <T,>(array: T[], k: number): T[][] => {
  if (k === 0) return [[]];
  if (array.length === 0) return [];
  
  const [first, ...rest] = array;
  const withFirst = getCombinations(rest, k - 1).map(combo => [first, ...combo]);
  const withoutFirst = getCombinations(rest, k);
  
  return [...withFirst, ...withoutFirst];
};

// Snake draft approach for larger groups
const snakeDraftTeams = (playersWithElo: { player: Player, elo: number }[]): { home: Player[], away: Player[] } => {
  const home: Player[] = [];
  const away: Player[] = [];
  
  // Snake draft: 1st to home, 2nd to away, 3rd to away, 4th to home, etc.
  playersWithElo.forEach((p, index) => {
    const round = Math.floor(index / 2);
    if (round % 2 === 0) {
      // Even rounds: home, away
      if (index % 2 === 0) {
        home.push(p.player);
      } else {
        away.push(p.player);
      }
    } else {
      // Odd rounds: away, home (snake back)
      if (index % 2 === 0) {
        away.push(p.player);
      } else {
        home.push(p.player);
      }
    }
  });

  const homeIds = new Set(home.map(p => p.id));
  const homeAvgElo = _.meanBy(playersWithElo.filter(pe => homeIds.has(pe.player.id)), 'elo');
  const awayAvgElo = _.meanBy(playersWithElo.filter(pe => !homeIds.has(pe.player.id)), 'elo');
  const betterElo = Math.max(homeAvgElo, awayAvgElo);
  const worseElo = Math.min(homeAvgElo, awayAvgElo);
  const pWorseHome = Math.min(1, (betterElo / Math.max(worseElo, 1)) * 100 / 2 / 100);
  const worsePlayers = homeAvgElo <= awayAvgElo ? home : away;
  const betterPlayers = homeAvgElo <= awayAvgElo ? away : home;
  if (Math.random() < pWorseHome) {
    return { home: _.shuffle(worsePlayers), away: _.shuffle(betterPlayers) };
  }
  return { home: _.shuffle(betterPlayers), away: _.shuffle(worsePlayers) };
};

watch(selectedPlayers, (newVal: Player[]) => {
  if (teamMode.value === 'fixed') {
    // Fixed teams: alternate adding players to each team
    if (match.value.homePlayers.length === match.value.awayPlayers.length) {
      match.value.homePlayers.push(newVal[newVal.length - 1]);
    } else {
      match.value.awayPlayers.push(newVal[newVal.length - 1]);
    }
  } else if (teamMode.value === 'elo-based' && newVal.length > 1) {
    // Use elo-based balancing
    const balanced = balanceTeamsByElo(newVal);
    match.value.homePlayers = balanced.home;
    match.value.awayPlayers = balanced.away;
  } else if (teamMode.value === 'random') {
    // Random teams
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

// Calculate average ELO for home team
const homeTeamAvgElo = computed(() => {
  if (!match.value.game || match.value.homePlayers.length === 0) {
    return null;
  }
  const eloRatings = getPlayerElos([...match.value.homePlayers, ...match.value.awayPlayers]);
  const homeElos = match.value.homePlayers.map(p => eloRatings[p.id] || BASE_ELO);
  return Math.round(_.mean(homeElos));
});

// Calculate average ELO for away team
const awayTeamAvgElo = computed(() => {
  if (!match.value.game || match.value.awayPlayers.length === 0) {
    return null;
  }
  const eloRatings = getPlayerElos([...match.value.homePlayers, ...match.value.awayPlayers]);
  const awayElos = match.value.awayPlayers.map(p => eloRatings[p.id] || BASE_ELO);
  return Math.round(_.mean(awayElos));
});

</script>

<style scoped>

:deep(.p-highlight) {
  background-color: white;
  color: #1c1c1c;
}

:deep(.p-button.p-component) {
  width:100px;
  margin: 0.25rem;
  text-align: center;
  display: inline-block;
}

</style>
