<template>
  <section class="add-match-view">
    <header class="add-match-view__header">
      <button class="add-match-view__icon-btn" aria-label="Back" @click="goBack">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M10 3L5 8L10 13"
            stroke="currentColor"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <div class="add-match-view__title font-heading">{{ stepTitle }}</div>
      <div class="add-match-view__icon-btn add-match-view__icon-btn--spacer" />
    </header>

    <div class="add-match-view__progress">
      <div
        v-for="n in 4"
        :key="n"
        class="add-match-view__progress-seg"
        :class="{ 'add-match-view__progress-seg--done': n <= add.step }"
      />
    </div>

    <div class="add-match-view__body">
      <div v-if="add.step === 1" class="add-match-step hs-animate-fade">
        <div class="section-label">GAME</div>
        <div class="game-cards">
          <button
            v-for="game in games"
            :key="game.id"
            class="game-card"
            :class="{ 'game-card--selected': add.game?.id === game.id }"
            @click="selectGame(game)"
          >
            <div class="game-card__icon">{{ gameIcon(game.name) }}</div>
            <div class="game-card__text">
              <div class="game-card__name font-heading">{{ game.name }}</div>
              <div class="game-card__sub">{{ gameSub(game.name) }}</div>
            </div>
            <div class="game-card__radio">
              <div class="game-card__radio-fill" />
            </div>
          </button>
        </div>
      </div>

      <div v-if="add.step === 2" class="add-match-step hs-animate-fade">
        <div class="teams-header">
          <span class="section-label">TEAMS · {{ add.teamA.length }} v {{ add.teamB.length }} · any size</span>
          <div class="teams-actions">
            <button class="action-btn action-btn--blue" @click="randomizeTeams">🎲 Randomize</button>
            <button class="action-btn action-btn--accent" @click="autoBalance">⚡ Auto-balance</button>
          </div>
        </div>

        <div class="teams-columns">
          <TeamColumn
            side="home"
            :players="add.teamA"
            :avg-elo="teamAvgA"
            @swap="swapPlayer"
            @remove="removePlayer"
          />
          <TeamColumn
            side="away"
            :players="add.teamB"
            :avg-elo="teamAvgB"
            @swap="swapPlayer"
            @remove="removePlayer"
          />
        </div>

        <div
          class="balance-meter"
          :class="{ 'balance-meter--pending': !predictionDisplay }"
        >
          <div class="balance-meter__row">
            <span class="balance-meter__home">
              {{ predictionDisplay ? `${predictionDisplay.homeWinProbability}%` : '—' }}
            </span>
            <span class="balance-meter__label">win / draw / loss</span>
            <span class="balance-meter__away">
              {{ predictionDisplay ? `${predictionDisplay.awayWinProbability}%` : '—' }}
            </span>
          </div>
          <div class="balance-meter__bar">
            <template v-if="predictionDisplay">
              <div
                class="balance-meter__seg balance-meter__seg--home"
                :style="{ width: `${predictionDisplay.homeWinProbability}%` }"
              />
              <div
                class="balance-meter__seg balance-meter__seg--draw"
                :style="{ width: `${predictionDisplay.drawProbability}%` }"
              />
              <div
                class="balance-meter__seg balance-meter__seg--away"
                :style="{ width: `${predictionDisplay.awayWinProbability}%` }"
              />
            </template>
            <div v-else class="balance-meter__seg balance-meter__seg--pending" />
          </div>
          <div class="balance-meter__draw">
            <template v-if="predictionDisplay">
              Draw {{ predictionDisplay.drawProbability }}% · confidence
              {{ predictionDisplay.confidence }}
            </template>
            <template v-else>Add one player per team for prediction</template>
          </div>
          <div class="balance-meter__xg">
            <template v-if="predictionDisplay">
              Expected goals {{ predictionDisplay.homeExpectedGoals }} –
              {{ predictionDisplay.awayExpectedGoals }}
            </template>
            <template v-else>Expected goals — – —</template>
          </div>
          <div v-if="predictionDisplay?.mostLikelyScorelines.length" class="balance-meter__scores">
            Likely:
            {{
              predictionDisplay.mostLikelyScorelines
                .slice(0, 3)
                .map((s) => `${s.home}-${s.away}`)
                .join(', ')
            }}
          </div>
        </div>

        <div class="roster-header">
          <div class="section-label section-label--spaced">TAP TO ADD PLAYER</div>
          <button class="roster-toggle" @click="showAllPlayers = !showAllPlayers">
            {{ showAllPlayers ? 'Active only' : 'Show all' }}
          </button>
        </div>
        <div class="roster">
          <button
            v-for="player in roster"
            :key="player.id"
            class="roster-chip"
            @click="pickPlayer(player)"
          >
            <PlayerAvatar
              :initials="player.initials"
              :color="player.color"
              :size="26"
              :radius="8"
              :font-size="11"
            />
            <span class="roster-chip__name font-heading">{{ player.shortName }}</span>
            <span class="roster-chip__elo">{{ player.elo }}</span>
          </button>
        </div>
      </div>

      <div v-if="add.step === 3" class="add-match-step hs-animate-fade">
        <div class="section-label">FINAL SCORE</div>
        <div class="score-panels">
          <ScorePanel
            side="home"
            :names="teamANames"
            :score="add.homeScore"
            @inc="incScore('homeScore')"
            @dec="decScore('homeScore')"
          />
          <ScorePanel
            side="away"
            :names="teamBNames"
            :score="add.awayScore"
            @inc="incScore('awayScore')"
            @dec="decScore('awayScore')"
          />
        </div>
        <div class="result-line" :style="{ color: resultColor }">{{ resultLabel }}</div>
        <button class="ot-row" :class="{ 'ot-row--on': add.overtime }" @click="toggleOvertime">
          <div class="ot-row__box">
            <span v-if="add.overtime">✓</span>
          </div>
          <div class="ot-row__text">
            <div class="font-heading">Went to overtime</div>
            <div class="ot-row__sub">Match was decided in extra time</div>
          </div>
        </button>
      </div>

      <div v-if="add.step === 4" class="add-match-step hs-animate-fade">
        <div class="review-score">
          <div class="review-score__nums font-display">{{ add.homeScore }} : {{ add.awayScore }}</div>
          <div class="review-score__label" :style="{ color: resultColor }">{{ resultLabel }}</div>
        </div>
        <div class="section-label">PROJECTED ELO CHANGES</div>
        <div class="projections">
          <div v-for="proj in projections" :key="proj.playerId" class="projection-row">
            <PlayerAvatar
              :initials="getInitials(proj.playerName)"
              :color="getPlayerColor(proj.playerId, allPlayerIds)"
              :size="34"
              :radius="11"
              :font-size="13"
            />
            <div class="projection-row__info">
              <div class="font-heading">{{ proj.playerName }}</div>
              <div class="projection-row__team">{{ proj.team }}</div>
            </div>
            <div class="projection-row__elo">
              <div
                class="font-display"
                :style="{ color: proj.delta >= 0 ? 'var(--hs-lime)' : 'var(--hs-red)' }"
              >
                {{ proj.delta >= 0 ? '+' : '' }}{{ proj.delta }}
              </div>
              <div class="projection-row__new">{{ proj.newElo }} ELO</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="add-match-view__footer">
      <button
        class="add-match-view__primary font-heading"
        :class="{ 'add-match-view__primary--disabled': !primaryEnabled }"
        :disabled="!primaryEnabled"
        @click="primaryAction"
      >
        {{ primaryLabel }}
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import _ from 'lodash';
import TeamColumn from '@/components/log-match/TeamColumn.vue';
import ScorePanel from '@/components/log-match/ScorePanel.vue';
import PlayerAvatar from '@/components/ui/PlayerAvatar.vue';
import { useUiStore } from '@/stores/ui';
import { useGamesStore, type Game } from '@/stores/game';
import { usePlayersStore, type Player } from '@/stores/player';
import { useMatchStore, type Match } from '@/stores/match';
import { useLoadingStore } from '@/stores/loading';
import { calculateEloRatings, BASE_ELO } from '@/utils/elo';
import { projectEloChanges, teamAvgElo } from '@/utils/eloPreview';
import { predictMatchGoals } from '@/utils/goalPrediction';
import { getInitials, getPlayerColor, getShortName } from '@/utils/playerUi';

const router = useRouter();
const uiStore = useUiStore();
const gameStore = useGamesStore();
const playerStore = usePlayersStore();
const matchStore = useMatchStore();
const loadingStore = useLoadingStore();

const showAllPlayers = ref(false);

onMounted(() => {
  uiStore.add = {
    open: true,
    step: 1,
    game: null,
    teamA: [],
    teamB: [],
    homeScore: 0,
    awayScore: 0,
    overtime: false,
  };
});

const add = computed(() => uiStore.add);
const games = computed(() => _.filter(gameStore.games ?? [], (g) => !g.disabled));

const stepTitle = computed(() => {
  const titles = ['', 'New match', 'Pick teams', 'Enter score', 'Review'];
  return titles[add.value.step];
});

const allPlayerIds = computed(() => playerStore.players.map((p) => p.id));

const gameMatches = computed(() => {
  const gameId = add.value.game?.id;
  return (matchStore.matches ?? []).filter((m) => m.game?.id === gameId);
});

const averagePlayedGamesByPlayer = computed(() =>
  Math.floor(gameMatches.value.length * 0.122)
);

const getPlayerGameMatchCount = (player: Player) =>
  gameMatches.value.filter(
    (m) =>
      m.homePlayers.some((p) => p.id === player.id) ||
      m.awayPlayers.some((p) => p.id === player.id)
  ).length;

const eloRatings = computed(() => {
  const players = _.chain(gameMatches.value)
    .flatMap((m) => [...m.homePlayers, ...m.awayPlayers])
    .concat([...add.value.teamA, ...add.value.teamB])
    .uniqBy('id')
    .map((p) => [p])
    .value();
  const { eloRatings: ratings } = calculateEloRatings(gameMatches.value, players);
  return ratings;
});

const roster = computed(() => {
  const assigned = new Set([
    ...add.value.teamA.map((p) => p.id),
    ...add.value.teamB.map((p) => p.id),
  ]);

  const allPlayers = _.sortBy(playerStore.players, (p) => p.username.toLowerCase());
  const threshold = averagePlayedGamesByPlayer.value;
  const filtered = showAllPlayers.value
    ? allPlayers
    : allPlayers.filter(
        (p) => getPlayerGameMatchCount(p) > threshold || assigned.has(p.id)
      );

  return filtered
    .filter((p) => !assigned.has(p.id))
    .map((p) => ({
      ...p,
      shortName: getShortName(p.username),
      initials: getInitials(p.username),
      color: getPlayerColor(p.id, allPlayerIds.value),
      elo: Math.round(eloRatings.value[p.id] ?? BASE_ELO),
    }));
});

const teamAvgA = computed(() => teamAvgElo(add.value.teamA, eloRatings.value));
const teamAvgB = computed(() => teamAvgElo(add.value.teamB, eloRatings.value));
const bothTeamsHavePlayers = computed(
  () => add.value.teamA.length >= 1 && add.value.teamB.length >= 1
);

const predictionDisplay = computed(() => {
  if (!bothTeamsHavePlayers.value) return null;
  return predictMatchGoals(gameMatches.value, add.value.teamA, add.value.teamB);
});

const teamANames = computed(() =>
  add.value.teamA.map((p) => getShortName(p.username)).join(' & ') || '—'
);
const teamBNames = computed(() =>
  add.value.teamB.map((p) => getShortName(p.username)).join(' & ') || '—'
);

const matchResult = computed(() => {
  if (add.value.homeScore > add.value.awayScore) return 'home';
  if (add.value.homeScore < add.value.awayScore) return 'away';
  return 'draw';
});

const resultLabel = computed(() => {
  const base =
    matchResult.value === 'draw'
      ? 'Draw — points split'
      : matchResult.value === 'home'
        ? 'Home wins'
        : 'Away wins';
  return base + (add.value.overtime ? ' · OT' : '');
});

const resultColor = computed(() =>
  matchResult.value === 'draw' ? 'var(--hs-text-muted)' : 'var(--hs-lime)'
);

const projections = computed(() =>
  projectEloChanges(
    add.value.teamA,
    add.value.teamB,
    add.value.homeScore,
    add.value.awayScore,
    eloRatings.value
  )
);

const primaryEnabled = computed(() => {
  if (add.value.step === 1) return !!add.value.game;
  if (add.value.step === 2) return bothTeamsHavePlayers.value;
  return true;
});

const primaryLabel = computed(() => {
  if (add.value.step === 1) return 'Choose players';
  if (add.value.step === 2)
    return bothTeamsHavePlayers.value ? 'Set the score' : 'Add at least one per team';
  if (add.value.step === 3) return 'Review match';
  return 'Confirm & save';
});

function gameIcon(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('fifa') || lower.includes('football')) return '⚽';
  if (lower.includes('foos')) return '🥅';
  if (lower.includes('ping') || lower.includes('pong') || lower.includes('table tennis'))
    return '🏓';
  return '🎮';
}

function gameSub(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('fifa')) return 'Head-to-head or 2v2';
  if (lower.includes('foos')) return 'Table football';
  if (lower.includes('ping') || lower.includes('pong')) return 'Table tennis';
  return 'Office league game';
}

function selectGame(game: Game) {
  add.value.game = game;
}

function pickPlayer(player: Player) {
  if (add.value.teamA.length <= add.value.teamB.length) {
    add.value.teamA.push(player);
  } else {
    add.value.teamB.push(player);
  }
}

function swapPlayer(player: Player) {
  if (add.value.teamA.some((p) => p.id === player.id)) {
    add.value.teamA = add.value.teamA.filter((p) => p.id !== player.id);
    add.value.teamB.push(player);
  } else {
    add.value.teamB = add.value.teamB.filter((p) => p.id !== player.id);
    add.value.teamA.push(player);
  }
}

function removePlayer(player: Player) {
  add.value.teamA = add.value.teamA.filter((p) => p.id !== player.id);
  add.value.teamB = add.value.teamB.filter((p) => p.id !== player.id);
}

function autoBalance() {
  let pool = [...add.value.teamA, ...add.value.teamB];
  if (pool.length < 2) {
    const avail = playerStore.players.filter((p) => !pool.some((x) => x.id === p.id));
    const sorted = _.orderBy(avail, [(p) => eloRatings.value[p.id] ?? BASE_ELO], ['desc']);
    pool = [...pool, ...sorted.slice(0, Math.max(0, 4 - pool.length))];
  }
  const sorted = _.orderBy(pool, [(p) => eloRatings.value[p.id] ?? BASE_ELO], ['desc']);
  const teamA: Player[] = [];
  const teamB: Player[] = [];
  let totalA = 0;
  let totalB = 0;
  sorted.forEach((p) => {
    const elo = eloRatings.value[p.id] ?? BASE_ELO;
    if (totalA < totalB) {
      teamA.push(p);
      totalA += elo;
    } else if (totalB < totalA) {
      teamB.push(p);
      totalB += elo;
    } else if (Math.random() < 0.5) {
      teamA.push(p);
      totalA += elo;
    } else {
      teamB.push(p);
      totalB += elo;
    }
  });
  if (teamA.length !== teamB.length && Math.random() < 0.5) {
    add.value.teamA = teamB;
    add.value.teamB = teamA;
  } else {
    add.value.teamA = teamA;
    add.value.teamB = teamB;
  }
}

function randomizeTeams() {
  let pool = [...add.value.teamA, ...add.value.teamB];
  if (pool.length < 2) {
    const avail = playerStore.players.filter((p) => !pool.some((x) => x.id === p.id));
    const shuffled = _.shuffle(avail);
    while (pool.length < 4 && shuffled.length) pool.push(shuffled.pop()!);
  }
  const shuffled = _.shuffle(pool);
  const smallCount = Math.floor(shuffled.length / 2);
  const bigCount = shuffled.length - smallCount;
  const bigTeamIsHome = Math.random() < 0.5;
  if (bigTeamIsHome) {
    add.value.teamA = shuffled.slice(0, bigCount);
    add.value.teamB = shuffled.slice(bigCount);
  } else {
    add.value.teamA = shuffled.slice(0, smallCount);
    add.value.teamB = shuffled.slice(smallCount);
  }
}

function incScore(field: 'homeScore' | 'awayScore') {
  add.value[field] = Math.min(20, add.value[field] + 1);
}

function decScore(field: 'homeScore' | 'awayScore') {
  add.value[field] = Math.max(0, add.value[field] - 1);
}

function toggleOvertime() {
  add.value.overtime = !add.value.overtime;
}

function goBack() {
  if (add.value.step <= 1) {
    router.push('/');
    return;
  }
  add.value.step = (add.value.step - 1) as 1 | 2 | 3 | 4;
}

function primaryAction() {
  if (!primaryEnabled.value) return;
  if (add.value.step < 4) {
    add.value.step = (add.value.step + 1) as 1 | 2 | 3 | 4;
    return;
  }
  confirmMatch();
}

async function confirmMatch() {
  const match: Match = {
    game: add.value.game!,
    homePlayers: add.value.teamA,
    awayPlayers: add.value.teamB,
    homeScore: add.value.homeScore,
    awayScore: add.value.awayScore,
    overtime: add.value.overtime,
  };

  if (add.value.game?.teams && add.value.game.teams.length > 1) {
    const teams = _.shuffle(add.value.game.teams);
    match.homeTeam = teams[0];
    match.awayTeam = teams[1];
  }

  await loadingStore.doLoading(async () => {
    const matchId = await matchStore.addMatch(match);
    const playerIds = [...add.value.teamA, ...add.value.teamB].map((p) => p.id);
    uiStore.onMatchSaved(playerIds, matchId);
    router.push('/');
  });
}
</script>

<style scoped>
.add-match-view {
  min-height: calc(100dvh - var(--hs-scroll-top) - 24px);
  display: flex;
  flex-direction: column;
  padding: 14px 18px 0;
  background: var(--hs-bg);
}

.add-match-view__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.add-match-view__icon-btn {
  border: none;
  background: rgba(255, 255, 255, 0.06);
  cursor: pointer;
  width: 34px;
  height: 34px;
  border-radius: 11px;
  color: var(--hs-text);
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-match-view__icon-btn--spacer {
  visibility: hidden;
}

.add-match-view__title {
  font-weight: 800;
  font-size: 16px;
  color: var(--hs-text);
}

.add-match-view__progress {
  display: flex;
  gap: 6px;
  margin-bottom: 16px;
}

.add-match-view__progress-seg {
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: var(--hs-elevated);
  transition: background 0.2s;
}

.add-match-view__progress-seg--done {
  background: var(--hs-accent);
}

.add-match-view__body {
  flex: 1;
  min-height: 0;
  padding-bottom: 8px;
}

.add-match-view__footer {
  position: sticky;
  bottom: 0;
  margin-top: auto;
  z-index: 1;
  padding: 16px 0 calc(16px + env(safe-area-inset-bottom, 0px));
  background: linear-gradient(to bottom, rgba(40, 42, 54, 0), var(--hs-bg) 16px);
}

.add-match-view__primary {
  width: 100%;
  border: none;
  cursor: pointer;
  background: var(--hs-accent);
  color: var(--hs-bg);
  font-weight: 800;
  font-size: 16px;
  padding: 16px;
  border-radius: 16px;
  box-shadow: 0 8px 22px -6px rgba(189, 147, 249, 0.5);
  transition: all 0.15s;
}

.add-match-view__primary--disabled {
  background: var(--hs-elevated);
  color: var(--hs-text-faint);
  box-shadow: none;
  cursor: default;
}

.section-label {
  color: var(--hs-text-dim);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.05em;
  margin: 8px 0 10px;
}

.section-label--spaced {
  margin-bottom: 0;
}

.game-cards {
  display: flex;
  flex-direction: column;
  gap: 9px;
  margin-bottom: 22px;
}

.game-card {
  border: 1.5px solid rgba(255, 255, 255, 0.09);
  cursor: pointer;
  background: var(--hs-surface);
  border-radius: 15px;
  padding: 15px 16px;
  display: flex;
  align-items: center;
  gap: 13px;
  text-align: left;
  color: inherit;
}

.game-card--selected {
  border-color: var(--hs-accent);
  background: var(--hs-accent-soft);
}

.game-card--selected .game-card__icon {
  background: var(--hs-accent);
  color: var(--hs-bg);
}

.game-card--selected .game-card__radio {
  border-color: var(--hs-accent);
}

.game-card--selected .game-card__radio-fill {
  background: var(--hs-accent);
}

.game-card__icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: var(--hs-text-muted);
}

.game-card__text {
  flex: 1;
}

.game-card__name {
  font-weight: 700;
  font-size: 16px;
  color: var(--hs-text);
}

.game-card__sub {
  color: var(--hs-text-dim);
  font-size: 12.5px;
  font-weight: 500;
}

.game-card__radio {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid var(--hs-text-faint);
  display: flex;
  align-items: center;
  justify-content: center;
}

.game-card__radio-fill {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: transparent;
}

.teams-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 8px 0 12px;
  gap: 8px;
  flex-wrap: wrap;
}

.teams-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  border: none;
  cursor: pointer;
  font-weight: 800;
  font-size: 12px;
  padding: 7px 12px;
  border-radius: 10px;
}

.action-btn--blue {
  background: rgba(139, 233, 253, 0.12);
  color: var(--hs-blue);
}

.action-btn--accent {
  background: var(--hs-accent-soft);
  color: var(--hs-accent);
}

.teams-columns {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.balance-meter {
  background: var(--hs-surface);
  border-radius: 14px;
  padding: 12px 14px;
  margin-bottom: 16px;
  min-height: 118px;
}

.balance-meter--pending .balance-meter__home,
.balance-meter--pending .balance-meter__away {
  color: var(--hs-text-faint);
}

.balance-meter--pending .balance-meter__bar {
  background: rgba(255, 255, 255, 0.06);
}

.balance-meter__row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 7px;
}

.balance-meter__home {
  color: var(--hs-lime);
}

.balance-meter__away {
  color: var(--hs-blue);
}

.balance-meter__label {
  color: var(--hs-text-dim);
}

.balance-meter__bar {
  height: 8px;
  border-radius: 5px;
  overflow: hidden;
  display: flex;
}

.balance-meter__seg {
  height: 100%;
  min-width: 0;
  transition: width 0.2s;
}

.balance-meter__seg--home {
  background: var(--hs-lime);
}

.balance-meter__seg--draw {
  background: var(--hs-gold);
}

.balance-meter__seg--away {
  background: var(--hs-blue);
}

.balance-meter__seg--pending {
  flex: 1;
  background: var(--hs-text-faint);
  opacity: 0.35;
}

.balance-meter__draw,
.balance-meter__xg,
.balance-meter__scores {
  text-align: center;
  margin-top: 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--hs-text-dim);
}

.roster-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}

.roster-toggle {
  border: none;
  cursor: pointer;
  background: var(--hs-elevated);
  color: var(--hs-accent);
  font-weight: 700;
  font-size: 12px;
  padding: 7px 12px;
  border-radius: 10px;
}

.roster {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.roster-chip {
  border: 1px solid rgba(255, 255, 255, 0.09);
  cursor: pointer;
  background: var(--hs-elevated);
  border-radius: 12px;
  padding: 7px 11px 7px 7px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: inherit;
}

.roster-chip__name {
  font-weight: 700;
  font-size: 13px;
  color: var(--hs-text);
}

.roster-chip__elo {
  font-size: 11px;
  font-weight: 600;
  color: var(--hs-text-dim);
}

.result-line {
  text-align: center;
  margin-top: 18px;
  font-size: 14px;
  font-weight: 700;
}

.ot-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  background: var(--hs-surface);
  border: 1.5px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  padding: 13px 15px;
  cursor: pointer;
  width: 100%;
  text-align: left;
  color: inherit;
  transition: background 0.15s, border-color 0.15s;
}

.ot-row--on {
  background: var(--hs-accent-soft);
  border-color: rgba(189, 147, 249, 0.45);
}

.ot-row__box {
  width: 22px;
  height: 22px;
  border-radius: 7px;
  flex: none;
  background: transparent;
  border: 1.5px solid var(--hs-text-faint);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--hs-bg);
  font-size: 14px;
  font-weight: 900;
}

.ot-row--on .ot-row__box {
  background: var(--hs-accent);
  border-color: var(--hs-accent);
}

.ot-row__text {
  flex: 1;
  font-size: 14px;
  font-weight: 700;
  color: var(--hs-text);
}

.ot-row__sub {
  color: var(--hs-text-dim);
  font-size: 12px;
  font-weight: 600;
  margin-top: 1px;
}

.score-panels {
  display: flex;
  align-items: stretch;
  gap: 12px;
}

.review-score {
  text-align: center;
  margin: 6px 0 18px;
}

.review-score__nums {
  font-weight: 900;
  font-size: 46px;
  color: var(--hs-text);
  line-height: 1;
}

.review-score__label {
  font-size: 14px;
  font-weight: 700;
  margin-top: 8px;
}

.projections {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.projection-row {
  display: flex;
  align-items: center;
  gap: 11px;
  background: var(--hs-surface);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  padding: 11px 13px;
}

.projection-row__info {
  flex: 1;
  font-size: 15px;
  font-weight: 700;
  color: var(--hs-text);
}

.projection-row__team {
  font-size: 12px;
  font-weight: 600;
  color: var(--hs-text-dim);
}

.projection-row__elo {
  text-align: right;
}

.projection-row__elo .font-display {
  font-weight: 800;
  font-size: 16px;
}

.projection-row__new {
  font-size: 11px;
  font-weight: 600;
  color: var(--hs-text-dim);
}
</style>
