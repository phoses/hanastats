<template>
  <div class="config-view">
    <button class="config-back font-heading" @click="router.push('/')">← Back</button>
    <h2>players</h2>
  </div>
  <ul>
    <li v-for="player in players" :key="player.id">
      {{ player.username }}
    </li>
  </ul>

  <div v-if="userStore.currentUser?.role === 'admin'">
    <InputText type="text" v-model="playername" placeholder="player name" />
    <Button @click="addPlayer" label="add player" class="mt-2 block"/>
  </div>

  <h2>games</h2>
  <div v-for="game in games" :key="game.id" class="mb-3">

    <a class="name" href="javascript:;" @click="open(game.id)">{{ game.name }}</a>

    <div v-if="gameOpen === game.id">
      <span class="mr-4">game status: {{ game.disabled ? 'disabled' : 'enabled' }}</span>
      <Button v-if="!game.disabled" label="disable" @click="changeStatus(game, { disabled: true })" class="p-button-danger p-button-text p-0"/>
      <Button v-if="game.disabled" label="enable" @click="changeStatus(game, { disabled: false })" class="p-button-text p-0"/>
      <span>game</span>

      <div class="mt-3">
        <div>points for win: {{ game.pointsForWin }}</div>
        <div>points for draw: {{ game.pointsForDraw }}</div>
        <div>points for OT winner: {{ game.pointsForOTWin }}</div>
        <div>points for OT lose: {{ game.pointsForOTLose }}</div>
      </div>

      <div class="mt-3">
        <template v-if="game.teams && game.teams.length > 0">
          <div>teams</div>
          <ul v-if="game.teams && game.teams.length > 0">
            <li v-for="(team, index) in game.teams" :key="game.id + index">
              {{ team.name }} ({{ team.shortName }})
              <Button label="delete" @click="deleteTeam(game, team)" class="p-button-danger p-button-text p-0"/>
            </li>
          </ul>
        </template>
        <div v-else>
          no teams added
        </div>

        <div class="mt-2">
          <InputText type="text" v-model="teamName" placeholder="team name" />
          <InputText type="text" v-model="teamNameShort" placeholder="short name" />
          <Button @click="addTeam(game)" label="add team" class="block mt-2"/>
        </div>
      </div>
      <hr/>
    </div>
  </div>

  <template v-if="userStore.currentUser?.role === 'admin'">
    <h2>matches cache</h2>
    <p>Current version: {{ matchesVersion }}</p>
    <p class="text-sm opacity-80">Bump version after correcting or deleting matches in Firebase to force all users to refresh their cached data.</p>
    <Button @click="invalidateMatchesCache" label="invalidate matches cache" class="mt-2"/>
  </template>

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
import { useGamesStore, type Game, type Team } from '@/stores/game';
import { useLoadingStore } from '@/stores/loading';
import { useMatchStore } from '@/stores/match';
import { usePlayersStore } from '@/stores/player';
import { useUserStore } from '@/stores/user';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import InputNumber from 'primevue/inputnumber';
import _ from 'lodash';

const gameStore = useGamesStore();
const playerStore = usePlayersStore();
const matchStore = useMatchStore();
const userStore = useUserStore();
const loadingStore = useLoadingStore();
const router = useRouter();

const games = computed(() => _.sortBy(gameStore.games, game => game.disabled ? 1 : 0));
const players = computed(() => playerStore.players);
const playername = ref('');
const teamName = ref('');
const teamNameShort = ref('');
const game = ref({} as Game);
const gameOpen = ref('');
const matchesVersion = ref(0);

onMounted(async () => {
  matchesVersion.value = await matchStore.getMatchesVersion();
});

async function invalidateMatchesCache() {
  loadingStore.doLoading(async () => {
    await matchStore.bumpMatchesVersion();
    matchesVersion.value = await matchStore.getMatchesVersion();
    await matchStore.getMatches(playerStore.players);
  });
}

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

function open(gameId: string) {
  gameOpen.value = gameId;
}

async function addTeam(game: Game) {
  loadingStore.doLoading(async () => {
    await gameStore.addTeam(game, { name: teamName.value, shortName: teamNameShort.value });
    await gameStore.getGames();
    teamName.value = '';
    teamNameShort.value = '';
  });
}

async function deleteTeam(game: Game, team: Team) {
  loadingStore.doLoading(async () => {
    await gameStore.deleteTeam(game, team);
    await gameStore.getGames();
  });
}

</script>

<style scoped>
.config-view {
  padding: 0 18px 24px;
  color: var(--hs-text);
}

.config-back {
  border: none;
  background: rgba(255, 255, 255, 0.06);
  color: var(--hs-text);
  cursor: pointer;
  padding: 8px 14px;
  border-radius: 11px;
  font-weight: 700;
  font-size: 13px;
  margin-bottom: 16px;
}

.name {
  width: 7rem;
}
</style>
