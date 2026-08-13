<template>
  <div :class="['tw:flex tw:flex-col tw:gap-5', canSubmit ? 'tw:pb-24' : '']">
    <p v-if="savedMessage" class="tw:rounded-ui tw:border tw:border-win/40 tw:bg-win/15 tw:px-3 tw:py-2 tw:text-sm tw:text-win" role="status">
      {{ savedMessage }}
    </p>

    <section class="tw:flex tw:flex-col tw:gap-2">
      <h2 class="tw:text-sm tw:text-ink-muted">game</h2>
      <UiSegmented
        v-model="match.game"
        :options="games"
        option-label="name"
        option-key="id"
        fill
        fill-min-width="7.5rem"
        label="game"
      >
        <template #option="{ option, selected }">
          <span class="tw:flex tw:items-center tw:gap-2">
            <span :class="['tw:size-2.5 tw:shrink-0 tw:rounded-full', toneFor(option.id).dot, selected ? '' : 'tw:opacity-70']" />
            <span>{{ option.name }}</span>
          </span>
        </template>
      </UiSegmented>
      <p v-if="games.length === 0" class="tw:text-sm tw:text-ink-muted">no games available</p>
    </section>

    <template v-if="match.game">
      <section class="tw:flex tw:flex-col tw:gap-2">
        <UiRadioGroup v-model="teamMode" name="team-mode" label="team mode" :options="teamModeOptions" />
      </section>

      <section class="tw:flex tw:flex-col tw:gap-2">
        <div class="tw:flex tw:items-center tw:justify-between tw:gap-3">
          <h2 class="tw:text-sm tw:text-ink-muted">players</h2>
          <UiSwitch v-model="showAllPlayers" label="show all" />
        </div>
        <UiSegmented
          v-model="selectedPlayers"
          :options="players"
          option-label="username"
          option-key="id"
          multiple
          fill
          label="players"
        />
        <p v-if="players.length === 0" class="tw:text-sm tw:text-ink-muted">no players available for this game</p>
      </section>
    </template>

    <template v-if="canSubmit">
      <section class="tw:grid tw:grid-cols-2 tw:items-stretch tw:gap-3">
        <UiCard
          v-for="side in sides"
          :key="side.key"
          padding="sm"
          :class="['tw:flex tw:h-full tw:flex-col', side.accent.border]"
        >
          <div class="tw:flex tw:flex-1 tw:flex-col tw:items-center tw:text-center">
            <h2 :class="['tw:text-sm tw:font-semibold tw:uppercase', side.accent.text]">{{ side.key }}</h2>
            <p v-if="side.team" class="tw:font-medium">{{ side.team.name }}</p>

            <div class="tw:mt-3 tw:flex tw:w-full tw:flex-col tw:gap-1.5 tw:pb-5">
              <button
                v-for="player in side.playerList"
                :key="player.id"
                type="button"
                class="tw:flex tw:min-h-9 tw:w-full tw:items-center tw:justify-between tw:gap-2 tw:rounded-ui tw:border tw:border-line tw:bg-surface-2 tw:px-2.5 tw:text-sm tw:transition-colors tw:hover:border-line-strong tw:hover:bg-surface-3"
                :aria-label="`move ${player.username} to ${side.otherSide}`"
                :title="`move to ${side.otherSide}`"
                @click="movePlayerToOtherTeam(player.id, side.key)"
              >
                <span class="tw:truncate">{{ player.username }}</span>
                <UiIcon name="swap" :size="14" class="tw:shrink-0 tw:text-ink-subtle" />
              </button>
            </div>

            <div class="tw:mt-auto tw:flex tw:w-full tw:flex-col tw:items-center tw:gap-1">
              <p v-if="side.avgElo !== null" class="tw:text-xs tw:text-ink-muted">avg elo {{ side.avgElo }}</p>
              <p v-if="side.expectedGoals !== null" class="tw:text-xs tw:text-ink-muted">xG {{ side.expectedGoals }}</p>

              <div class="tw:mt-2 tw:w-full">
                <UiStepper
                  v-if="side.key === 'home'"
                  v-model="match.homeScore"
                  label="home score"
                />
                <UiStepper
                  v-else
                  v-model="match.awayScore"
                  label="away score"
                />
              </div>
            </div>
          </div>
        </UiCard>
      </section>

      <UiCard v-if="goalPrediction" padding="sm">
        <h2 class="tw:mb-2 tw:text-sm tw:font-semibold tw:text-ink-muted">prediction</h2>
        <div class="tw:flex tw:flex-col tw:gap-2 tw:text-sm">
          <div class="tw:grid tw:grid-cols-3 tw:gap-2 tw:text-center">
            <div v-for="outcome in outcomes" :key="outcome.label" :class="['tw:rounded-ui tw:py-2', outcome.tone]">
              <p class="tw:text-xs tw:text-ink-muted">{{ outcome.label }}</p>
              <p :class="['tw:font-semibold tw:tabular-nums', outcome.text]">{{ outcome.value }}%</p>
            </div>
          </div>

          <div>
            <p class="tw:mb-1 tw:text-xs tw:text-ink-muted">likely scores</p>
            <ul class="tw:flex tw:flex-wrap tw:gap-2">
              <li v-for="scoreline in goalPrediction.mostLikelyScorelines" :key="`${scoreline.home}-${scoreline.away}`">
                <UiBadge>{{ scoreline.home }}:{{ scoreline.away }} · {{ scoreline.probability }}%</UiBadge>
              </li>
            </ul>
          </div>

          <p class="tw:text-xs tw:text-ink-subtle">
            based on {{ goalPrediction.basedOnMatches }} matches<span v-if="goalPrediction.headToHeadMatches > 0">, {{ goalPrediction.headToHeadMatches }} head-to-head</span> · confidence {{ goalPrediction.confidence }}
          </p>
        </div>
      </UiCard>

      <UiCheckbox v-model="match.overtime" label="decided in overtime" />
    </template>

    <UiEmptyState
      v-else-if="match.game"
      title="pick at least two players"
      description="teams are formed automatically based on the selected mode"
      icon="user"
    />
  </div>

  <div
    v-if="canSubmit"
    class="tw:fixed tw:inset-x-0 tw:bottom-[calc(4.25rem+env(safe-area-inset-bottom))] tw:z-30 tw:border-t tw:border-line tw:bg-canvas/95 tw:backdrop-blur"
  >
    <div class="tw:mx-auto tw:w-full tw:max-w-3xl tw:px-3 tw:py-2">
      <UiButton variant="primary" size="lg" block :loading="submitting" @click="submit">add match</UiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import UiBadge from '../components/UiBadge.vue';
import UiButton from '../components/UiButton.vue';
import UiCard from '../components/UiCard.vue';
import UiCheckbox from '../components/UiCheckbox.vue';
import UiEmptyState from '../components/UiEmptyState.vue';
import UiIcon from '../components/UiIcon.vue';
import UiRadioGroup from '../components/UiRadioGroup.vue';
import UiSegmented from '../components/UiSegmented.vue';
import UiStepper from '../components/UiStepper.vue';
import UiSwitch from '../components/UiSwitch.vue';
import { useAddMatchForm } from '@/composables/useAddMatchForm';
import { toneFor } from '../palette';
import type { RadioOption } from '../components/types';

const {
  games,
  match,
  selectedPlayers,
  teamMode,
  showAllPlayers,
  players,
  homeTeamAvgElo,
  awayTeamAvgElo,
  goalPrediction,
  addMatch,
  movePlayerToOtherTeam,
} = useAddMatchForm();

const teamModeOptions: RadioOption[] = [
  { value: 'elo-based', label: 'elo-based' },
  { value: 'random', label: 'random' },
  { value: 'fixed', label: 'fixed' },
];

const submitting = ref(false);
const savedMessage = ref('');

const canSubmit = computed(() => selectedPlayers.value.length > 1);

const homeAccent = { text: 'tw:text-cyan-300', border: 'tw:border-cyan-400/40' };
const awayAccent = { text: 'tw:text-pink-300', border: 'tw:border-pink-400/40' };

const sides = computed(() => [
  {
    key: 'home' as const,
    otherSide: 'away',
    accent: homeAccent,
    team: match.value.homeTeam ?? null,
    playerList: match.value.homePlayers,
    avgElo: homeTeamAvgElo.value,
    expectedGoals: goalPrediction.value?.homeExpectedGoals ?? null,
  },
  {
    key: 'away' as const,
    otherSide: 'home',
    accent: awayAccent,
    team: match.value.awayTeam ?? null,
    playerList: match.value.awayPlayers,
    avgElo: awayTeamAvgElo.value,
    expectedGoals: goalPrediction.value?.awayExpectedGoals ?? null,
  },
]);

const outcomes = computed(() => [
  { label: 'home', value: goalPrediction.value?.homeWinProbability ?? 0, tone: 'tw:bg-cyan-400/12', text: 'tw:text-cyan-300' },
  { label: 'draw', value: goalPrediction.value?.drawProbability ?? 0, tone: 'tw:bg-amber-400/12', text: 'tw:text-amber-300' },
  { label: 'away', value: goalPrediction.value?.awayWinProbability ?? 0, tone: 'tw:bg-pink-400/12', text: 'tw:text-pink-300' },
]);

async function submit() {
  submitting.value = true;
  try {
    await addMatch();
    savedMessage.value = 'match added';
    window.setTimeout(() => {
      savedMessage.value = '';
    }, 4000);
  } finally {
    submitting.value = false;
  }
}
</script>
