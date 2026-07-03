<template>
  <Teleport to="body">
    <div v-if="add.open" class="sheet-overlay">
      <div class="sheet-backdrop" @click="close" />
      <div class="sheet hs-scroll hs-animate-slide-up">
        <div class="sheet__header">
          <div class="sheet__handle" />
          <div class="sheet__nav">
            <button class="sheet__icon-btn" aria-label="Back" @click="goBack">
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
            <div class="sheet__title font-heading">{{ stepTitle }}</div>
            <button class="sheet__icon-btn sheet__icon-btn--muted" aria-label="Close" @click="close">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <path
                  d="M4 4L12 12M12 4L4 12"
                  stroke="currentColor"
                  stroke-width="2.2"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </div>
          <div class="sheet__progress">
            <div
              v-for="n in 4"
              :key="n"
              class="sheet__progress-seg"
              :class="{ 'sheet__progress-seg--done': n <= add.step }"
            />
          </div>
        </div>

        <div class="sheet__body">
          <!-- Step 1 -->
          <div v-if="add.step === 1" class="sheet-step hs-animate-fade">
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

          <!-- Step 2 -->
          <div v-if="add.step === 2" class="sheet-step hs-animate-fade">
            <div class="teams-header">
              <span class="section-label"
                >TEAMS · {{ add.teamA.length }} v {{ add.teamB.length }} · any size</span
              >
              <div class="teams-actions">
                <button class="action-btn action-btn--blue" @click="randomizeTeams">🎲 Randomize</button>
                <button class="action-btn action-btn--lime" @click="autoBalance">⚡ Auto-balance</button>
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

            <div v-if="bothTeamsHavePlayers" class="balance-meter">
              <div class="balance-meter__row">
                <span style="color: #c6ff3d">{{ winA }}%</span>
                <span style="color: #6b7683">win probability</span>
                <span style="color: #38a6ff">{{ winB }}%</span>
              </div>
              <div class="balance-meter__bar">
                <div class="balance-meter__fill" :style="{ width: winA + '%' }" />
              </div>
              <div class="balance-meter__msg" :style="{ color: balanceMsgColor }">{{ balanceMsg }}</div>
            </div>

            <div class="section-label section-label--spaced">TAP TO ADD PLAYER</div>
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

          <!-- Step 3 -->
          <div v-if="add.step === 3" class="sheet-step hs-animate-fade">
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

          <!-- Step 4 -->
          <div v-if="add.step === 4" class="sheet-step hs-animate-fade">
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
                    :style="{ color: proj.delta >= 0 ? '#C6FF3D' : '#FF5B39' }"
                  >
                    {{ proj.delta >= 0 ? '+' : '' }}{{ proj.delta }}
                  </div>
                  <div class="projection-row__new">{{ proj.newElo }} ELO</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="sheet__footer">
          <button
            class="sheet__primary font-heading"
            :class="{ 'sheet__primary--disabled': !primaryEnabled }"
            :disabled="!primaryEnabled"
            @click="primaryAction"
          >
            {{ primaryLabel }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import _ from 'lodash';
import TeamColumn from './log-match/TeamColumn.vue';
import ScorePanel from './log-match/ScorePanel.vue';
import PlayerAvatar from '@/components/ui/PlayerAvatar.vue';
import { useUiStore } from '@/stores/ui';
import { useGamesStore, type Game } from '@/stores/game';
import { usePlayersStore, type Player } from '@/stores/player';
import { useMatchStore, type Match } from '@/stores/match';
import { useLoadingStore } from '@/stores/loading';
import { calculateEloRatings, BASE_ELO } from '@/utils/elo';
import { projectEloChanges, teamAvgElo, winProbability } from '@/utils/eloPreview';
import { getInitials, getPlayerColor, getShortName } from '@/utils/playerUi';
import { useFilteredMatches } from '@/composables/useFilteredMatches';

const uiStore = useUiStore();
const gameStore = useGamesStore();
const playerStore = usePlayersStore();
const matchStore = useMatchStore();
const loadingStore = useLoadingStore();
const { filteredMatches } = useFilteredMatches();

const add = computed(() => uiStore.add);

const games = computed(() => _.filter(gameStore.games ?? [], (g) => !g.disabled));

const stepTitle = computed(() => {
  const titles = ['', 'New match', 'Pick teams', 'Enter score', 'Review'];
  return titles[add.value.step];
});

const allPlayerIds = computed(() => playerStore.players.map((p) => p.id));

const eloRatings = computed(() => {
  const gameId = add.value.game?.id;
  const gameMatches = (matchStore.matches ?? []).filter((m) => m.game?.id === gameId);
  const players = _.chain(gameMatches)
    .flatMap((m) => [...m.homePlayers, ...m.awayPlayers])
    .concat([...add.value.teamA, ...add.value.teamB])
    .uniqBy('id')
    .map((p) => [p])
    .value();
  const { eloRatings: ratings } = calculateEloRatings(gameMatches, players);
  return ratings;
});

const roster = computed(() => {
  const assigned = new Set([
    ...add.value.teamA.map((p) => p.id),
    ...add.value.teamB.map((p) => p.id),
  ]);
  return playerStore.players
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

const winProb = computed(() => winProbability(teamAvgA.value, teamAvgB.value));
const winA = computed(() => Math.round(winProb.value * 100));
const winB = computed(() => 100 - winA.value);

const balanceDiff = computed(() => Math.abs(winA.value - 50));
const balanceMsg = computed(() => {
  if (balanceDiff.value <= 6) return '⚖ Well balanced';
  if (balanceDiff.value <= 15) return 'Slight edge one side';
  return 'Lopsided — try auto-balance';
});
const balanceMsgColor = computed(() => {
  if (balanceDiff.value <= 6) return '#C6FF3D';
  if (balanceDiff.value <= 15) return '#FFCB45';
  return '#FF5B39';
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

const resultColor = computed(() => (matchResult.value === 'draw' ? '#8A94A0' : '#C6FF3D'));

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
    if (totalA <= totalB) {
      teamA.push(p);
      totalA += elo;
    } else {
      teamB.push(p);
      totalB += elo;
    }
  });
  add.value.teamA = teamA;
  add.value.teamB = teamB;
}

function randomizeTeams() {
  let pool = [...add.value.teamA, ...add.value.teamB];
  if (pool.length < 2) {
    const avail = playerStore.players.filter((p) => !pool.some((x) => x.id === p.id));
    const shuffled = _.shuffle(avail);
    while (pool.length < 4 && shuffled.length) pool.push(shuffled.pop()!);
  }
  const shuffled = _.shuffle(pool);
  const half = Math.floor(shuffled.length / 2);
  add.value.teamA = shuffled.slice(0, half);
  add.value.teamB = shuffled.slice(half);
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

function close() {
  uiStore.closeAddMatch();
}

function goBack() {
  if (add.value.step <= 1) close();
  else add.value.step = (add.value.step - 1) as 1 | 2 | 3 | 4;
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
  });
}
</script>

<style scoped>
.sheet-overlay {
  position: fixed;
  inset: 0;
  z-index: 70;
}

.sheet-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(4, 6, 9, 0.55);
  backdrop-filter: blur(3px);
}

.sheet {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 0;
  width: 100%;
  max-width: 390px;
  height: min(770px, 92vh);
  background: var(--hs-sheet);
  border-radius: 34px 34px 0 0;
  box-shadow: 0 -20px 60px -10px rgba(0, 0, 0, 0.7);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.sheet__header {
  position: sticky;
  top: 0;
  z-index: 5;
  background: var(--hs-sheet);
  padding: 14px 20px 10px;
}

.sheet__handle {
  width: 40px;
  height: 5px;
  border-radius: 3px;
  background: #2a323c;
  margin: 0 auto 14px;
}

.sheet__nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sheet__icon-btn {
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

.sheet__icon-btn--muted {
  color: var(--hs-text-muted);
}

.sheet__title {
  font-weight: 800;
  font-size: 16px;
  color: var(--hs-text);
}

.sheet__progress {
  display: flex;
  gap: 6px;
  margin-top: 14px;
}

.sheet__progress-seg {
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: #252c35;
  transition: background 0.2s;
}

.sheet__progress-seg--done {
  background: var(--hs-lime);
}

.sheet__body {
  flex: 1;
  padding: 6px 20px 24px;
}

.sheet__footer {
  position: sticky;
  bottom: 0;
  background: linear-gradient(to top, var(--hs-sheet) 70%, rgba(14, 19, 25, 0));
  padding: 12px 20px 26px;
}

.sheet__primary {
  width: 100%;
  border: none;
  cursor: pointer;
  background: var(--hs-lime);
  color: var(--hs-bg);
  font-weight: 800;
  font-size: 16px;
  padding: 16px;
  border-radius: 16px;
  box-shadow: 0 8px 22px -6px rgba(198, 255, 61, 0.5);
  transition: all 0.15s;
}

.sheet__primary--disabled {
  background: #252c35;
  color: #5a646f;
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
  margin-bottom: 10px;
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
  border-color: var(--hs-lime);
  background: rgba(198, 255, 61, 0.06);
}

.game-card--selected .game-card__icon {
  background: var(--hs-lime);
  color: var(--hs-bg);
}

.game-card--selected .game-card__radio {
  border-color: var(--hs-lime);
}

.game-card--selected .game-card__radio-fill {
  background: var(--hs-lime);
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
  border: 2px solid #3a434d;
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
  background: rgba(56, 166, 255, 0.12);
  color: var(--hs-blue);
}

.action-btn--lime {
  background: rgba(198, 255, 61, 0.12);
  color: var(--hs-lime);
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
}

.balance-meter__row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 7px;
}

.balance-meter__bar {
  height: 8px;
  border-radius: 5px;
  overflow: hidden;
  display: flex;
  background: var(--hs-blue);
}

.balance-meter__fill {
  background: var(--hs-lime);
  transition: width 0.2s;
}

.balance-meter__msg {
  text-align: center;
  margin-top: 8px;
  font-size: 12px;
  font-weight: 700;
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
  background: rgba(198, 255, 61, 0.08);
  border-color: rgba(198, 255, 61, 0.45);
}

.ot-row__box {
  width: 22px;
  height: 22px;
  border-radius: 7px;
  flex: none;
  background: transparent;
  border: 1.5px solid #3a434d;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--hs-bg);
  font-size: 14px;
  font-weight: 900;
}

.ot-row--on .ot-row__box {
  background: var(--hs-lime);
  border-color: var(--hs-lime);
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
