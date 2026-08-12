<template>
  <div class="tw:flex tw:flex-col tw:gap-3">
    <UiCard>
      <h2 class="tw:mb-2 tw:font-semibold">account</h2>
      <div class="tw:flex tw:flex-wrap tw:items-center tw:justify-between tw:gap-3">
        <div class="tw:min-w-0 tw:text-sm">
          <p v-if="userStore.isLogged" class="tw:truncate">{{ userStore.currentUser?.email }}</p>
          <p v-else class="tw:text-ink-muted">not signed in</p>
          <p v-if="userStore.isLogged" class="tw:text-xs tw:text-ink-muted">role: {{ userStore.currentUser?.role || 'user' }}</p>
        </div>
        <UiButton v-if="userStore.isLogged" variant="secondary" @click="logout">
          <template #icon><UiIcon name="logout" /></template>
          sign out
        </UiButton>
        <UiButton v-else variant="primary" @click="login">
          <template #icon><UiIcon name="login" /></template>
          sign in
        </UiButton>
      </div>
    </UiCard>

    <UiCard>
      <h2 class="tw:mb-2 tw:font-semibold">interface</h2>
      <div class="tw:flex tw:flex-wrap tw:items-center tw:justify-between tw:gap-3">
        <p class="tw:text-sm tw:text-ink-muted">switch between the new and the classic interface</p>
        <UiModeToggle />
      </div>
      <RouterLink
        v-if="isDev"
        :to="{ name: 'modern-kitchen-sink' }"
        class="tw:mt-3 tw:inline-flex tw:min-h-9 tw:items-center tw:gap-1.5 tw:text-sm tw:text-accent tw:underline"
      >
        component gallery
        <UiIcon name="chevron-right" :size="14" />
      </RouterLink>
    </UiCard>

    <UiCollapsible title="overview">
      <dl class="tw:grid tw:grid-cols-2 tw:gap-x-4 tw:gap-y-1.5 tw:text-sm">
        <div v-for="stat in overviewStats" :key="stat.label" class="tw:flex tw:justify-between tw:gap-2">
          <dt class="tw:text-ink-muted">{{ stat.label }}</dt>
          <dd class="tw:tabular-nums">{{ stat.value }}</dd>
        </div>
      </dl>
    </UiCollapsible>

    <UiCollapsible :title="`players (${players.length})`">
      <ul class="tw:flex tw:flex-wrap tw:gap-2">
        <li v-for="player in players" :key="player.id">
          <UiBadge size="md">{{ player.username }}</UiBadge>
        </li>
      </ul>

      <form v-if="userStore.isAdmin" class="tw:mt-4 tw:flex tw:items-end tw:gap-2" @submit.prevent="addPlayer">
        <div class="tw:grow">
          <UiTextInput v-model="playerName" label="new player" placeholder="player name" />
        </div>
        <UiButton type="submit" variant="primary" :disabled="playerName.trim().length === 0">add</UiButton>
      </form>
    </UiCollapsible>

    <UiCollapsible :title="`games (${games.length})`">
      <ul class="tw:flex tw:flex-col tw:gap-2">
        <li v-for="game in games" :key="game.id">
          <UiCard padding="sm">
            <div class="tw:flex tw:items-center tw:justify-between tw:gap-2">
              <span class="tw:flex tw:min-w-0 tw:items-center tw:gap-2">
                <span :class="['tw:size-2.5 tw:shrink-0 tw:rounded-full', toneFor(game.id).dot]" />
                <span :class="['tw:truncate tw:font-medium', toneFor(game.id).text]">{{ game.name }}</span>
                <UiBadge :tone="game.disabled ? 'warn' : 'win'">{{ game.disabled ? 'disabled' : 'enabled' }}</UiBadge>
              </span>
              <UiIconButton
                :label="`${openGameId === game.id ? 'hide' : 'show'} details for ${game.name}`"
                @click="toggleGame(game.id)"
              >
                <UiIcon name="chevron-down" :class="openGameId === game.id ? 'tw:rotate-180' : ''" />
              </UiIconButton>
            </div>

            <div v-if="openGameId === game.id" class="tw:mt-3 tw:flex tw:flex-col tw:gap-3 tw:border-t tw:border-line tw:pt-3">
              <dl class="tw:grid tw:grid-cols-2 tw:gap-x-4 tw:gap-y-1 tw:text-sm">
                <div class="tw:flex tw:justify-between tw:gap-2">
                  <dt class="tw:text-ink-muted">win</dt>
                  <dd class="tw:tabular-nums">{{ game.pointsForWin }}</dd>
                </div>
                <div class="tw:flex tw:justify-between tw:gap-2">
                  <dt class="tw:text-ink-muted">draw</dt>
                  <dd class="tw:tabular-nums">{{ game.pointsForDraw }}</dd>
                </div>
                <div class="tw:flex tw:justify-between tw:gap-2">
                  <dt class="tw:text-ink-muted">ot win</dt>
                  <dd class="tw:tabular-nums">{{ game.pointsForOTWin }}</dd>
                </div>
                <div class="tw:flex tw:justify-between tw:gap-2">
                  <dt class="tw:text-ink-muted">ot loss</dt>
                  <dd class="tw:tabular-nums">{{ game.pointsForOTLose }}</dd>
                </div>
              </dl>

              <div>
                <p class="tw:mb-1 tw:text-sm tw:text-ink-muted">teams</p>
                <ul v-if="game.teams && game.teams.length > 0" class="tw:flex tw:flex-col tw:gap-1">
                  <li v-for="(team, index) in game.teams" :key="game.id + index" class="tw:flex tw:items-center tw:justify-between tw:gap-2 tw:text-sm">
                    <span>{{ team.name }} ({{ team.shortName }})</span>
                    <UiButton v-if="userStore.isAdmin" variant="danger" size="sm" @click="deleteTeam(game, team)">delete</UiButton>
                  </li>
                </ul>
                <p v-else class="tw:text-sm tw:text-ink-subtle">no teams added</p>
              </div>

              <template v-if="userStore.isAdmin">
                <form class="tw:flex tw:flex-col tw:gap-2" @submit.prevent="addTeam(game)">
                  <div class="tw:flex tw:gap-2">
                    <UiTextInput v-model="teamName" label="team name" placeholder="team name" />
                    <UiTextInput v-model="teamShortName" label="short name" placeholder="short" />
                  </div>
                  <UiButton type="submit" variant="secondary" :disabled="teamName.trim().length === 0">add team</UiButton>
                </form>

                <UiButton
                  :variant="game.disabled ? 'secondary' : 'danger'"
                  size="sm"
                  @click="changeStatus(game, { disabled: !game.disabled })"
                >
                  {{ game.disabled ? 'enable game' : 'disable game' }}
                </UiButton>
              </template>
            </div>
          </UiCard>
        </li>
      </ul>
    </UiCollapsible>

    <UiCollapsible v-if="userStore.isAdmin" title="admin">
      <div class="tw:flex tw:flex-col tw:gap-5">
        <section>
          <h3 class="tw:mb-1 tw:font-medium">matches cache</h3>
          <p class="tw:text-sm tw:text-ink-muted">current version: {{ matchesVersion }}</p>
          <p class="tw:mb-2 tw:text-xs tw:text-ink-subtle">
            bump the version after correcting or deleting matches in firebase to force all users to refresh their cached data
          </p>
          <UiButton variant="secondary" @click="invalidateMatchesCache">
            <template #icon><UiIcon name="refresh" /></template>
            invalidate cache
          </UiButton>
        </section>

        <section>
          <h3 class="tw:mb-2 tw:font-medium">add game</h3>
          <form class="tw:flex tw:flex-col tw:gap-2" @submit.prevent="addGame">
            <UiTextInput v-model="newGame.name" label="name" placeholder="game name" />
            <div class="tw:grid tw:grid-cols-2 tw:gap-2">
              <UiTextInput v-model="newGame.pointsForWin" label="points for win" type="number" inputmode="numeric" />
              <UiTextInput v-model="newGame.pointsForDraw" label="points for draw" type="number" inputmode="numeric" />
              <UiTextInput v-model="newGame.pointsForOTWin" label="points for ot win" type="number" inputmode="numeric" />
              <UiTextInput v-model="newGame.pointsForOTLose" label="points for ot loss" type="number" inputmode="numeric" />
            </div>
            <UiButton type="submit" variant="primary" :disabled="newGame.name.trim().length === 0">add game</UiButton>
          </form>
        </section>
      </div>
    </UiCollapsible>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import UiBadge from '../components/UiBadge.vue';
import UiButton from '../components/UiButton.vue';
import UiCard from '../components/UiCard.vue';
import UiCollapsible from '../components/UiCollapsible.vue';
import UiIcon from '../components/UiIcon.vue';
import UiIconButton from '../components/UiIconButton.vue';
import UiTextInput from '../components/UiTextInput.vue';
import UiModeToggle from '../layout/UiModeToggle.vue';
import { useModernStats } from '../composables/useModernStats';
import { toneFor } from '../palette';
import { useGamesStore, type Game, type Team } from '@/stores/game';
import { useLoadingStore } from '@/stores/loading';
import { useMatchStore } from '@/stores/match';
import { usePlayersStore } from '@/stores/player';
import { useUserStore } from '@/stores/user';
import _ from 'lodash';

const gameStore = useGamesStore();
const playerStore = usePlayersStore();
const matchStore = useMatchStore();
const userStore = useUserStore();
const loadingStore = useLoadingStore();

const { miscStatistics } = useModernStats();

const isDev = import.meta.env.DEV;
const games = computed(() => _.sortBy(gameStore.games, game => game.disabled ? 1 : 0));
const players = computed(() => _.sortBy(playerStore.players, player => player.username.toLowerCase()));

const playerName = ref('');
const teamName = ref('');
const teamShortName = ref('');
const openGameId = ref('');
const matchesVersion = ref(0);
const newGame = ref({
  name: '',
  pointsForWin: '3',
  pointsForDraw: '1',
  pointsForOTWin: '2',
  pointsForOTLose: '1',
});

const overviewStats = computed(() => [
  { label: 'matches', value: miscStatistics.value.matches },
  { label: 'players', value: miscStatistics.value.players },
  { label: 'unique teams', value: miscStatistics.value.teams },
  { label: 'home win %', value: miscStatistics.value.homeTeamWinPercentage },
  { label: '1 player team win %', value: miscStatistics.value.onePlayerTeamWinPercentage },
  { label: '2 player team win %', value: miscStatistics.value.twoPlayerTeamWinPercentage },
  { label: '3 player team win %', value: miscStatistics.value.threePlayerTeamWinPercentage },
]);

onMounted(async () => {
  matchesVersion.value = await matchStore.getMatchesVersion();
});

function toggleGame(gameId: string) {
  openGameId.value = openGameId.value === gameId ? '' : gameId;
}

async function login() {
  loadingStore.doLoading(async () => (await userStore.login()));
}

async function logout() {
  loadingStore.doLoading(async () => (await userStore.logout()));
}

async function addPlayer() {
  loadingStore.doLoading(async () => {
    await playerStore.addplayer(playerName.value);
    await playerStore.getPlayers();
    playerName.value = '';
  });
}

async function addGame() {
  loadingStore.doLoading(async () => {
    await gameStore.addGame({
      name: newGame.value.name,
      pointsForWin: Number(newGame.value.pointsForWin),
      pointsForDraw: Number(newGame.value.pointsForDraw),
      pointsForOTWin: Number(newGame.value.pointsForOTWin),
      pointsForOTLose: Number(newGame.value.pointsForOTLose),
    } as Game);
    await gameStore.getGames();
    newGame.value.name = '';
  });
}

async function changeStatus(game: Game, newStatus: { disabled: boolean }) {
  loadingStore.doLoading(async () => {
    await gameStore.updateGame({ ...game, ...newStatus });
    await gameStore.getGames();
  });
}

async function addTeam(game: Game) {
  loadingStore.doLoading(async () => {
    await gameStore.addTeam(game, { name: teamName.value, shortName: teamShortName.value });
    await gameStore.getGames();
    teamName.value = '';
    teamShortName.value = '';
  });
}

async function deleteTeam(game: Game, team: Team) {
  loadingStore.doLoading(async () => {
    await gameStore.deleteTeam(game, team);
    await gameStore.getGames();
  });
}

async function invalidateMatchesCache() {
  loadingStore.doLoading(async () => {
    await matchStore.bumpMatchesVersion();
    matchesVersion.value = await matchStore.getMatchesVersion();
    await matchStore.getMatches(playerStore.players);
  });
}
</script>
