<template>
  <div v-if="chips.length > 0" class="tw:flex tw:flex-wrap tw:items-center tw:gap-2">
    <button
      v-for="chip in chips"
      :key="chip.id"
      type="button"
      :class="[
        'tw:inline-flex tw:min-h-9 tw:items-center tw:gap-1.5 tw:rounded-full tw:border tw:px-3 tw:text-sm tw:transition-colors',
        chip.tone,
      ]"
      :aria-label="`remove filter ${chip.label}`"
      @click="chip.remove()"
    >
      <span v-if="chip.dot" :class="['tw:size-2 tw:rounded-full', chip.dot]" />
      <span>{{ chip.label }}</span>
      <UiIcon name="close" :size="14" />
    </button>

    <UiButton variant="ghost" size="sm" @click="clearAll">clear all</UiButton>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import UiButton from '../components/UiButton.vue';
import UiIcon from '../components/UiIcon.vue';
import { toneFor } from '../palette';
import { useModernFiltersStore } from '@/stores/modernFilters';

interface Chip {
  id: string;
  label: string;
  tone: string;
  dot?: string;
  remove: () => void;
}

/** Each filter kind gets its own colour so chips are scannable at a glance. */
const chipTones = {
  game: 'tw:border-cyan-400/50 tw:bg-cyan-400/12 tw:text-cyan-200 tw:hover:border-cyan-300',
  count: 'tw:border-violet-400/50 tw:bg-violet-400/12 tw:text-violet-200 tw:hover:border-violet-300',
  player: 'tw:border-amber-400/50 tw:bg-amber-400/12 tw:text-amber-200 tw:hover:border-amber-300',
  month: 'tw:border-emerald-400/50 tw:bg-emerald-400/12 tw:text-emerald-200 tw:hover:border-emerald-300',
  mode: 'tw:border-pink-400/50 tw:bg-pink-400/12 tw:text-pink-200 tw:hover:border-pink-300',
};

const filtersStore = useModernFiltersStore();
const {
  gameFilter,
  enabledGamesFilter,
  playerCountFilter,
  playersInSameTeam,
  playedMatchMonthFilter,
  standingsAsWholeTeam,
} = storeToRefs(filtersStore);

const chips = computed<Chip[]>(() => {
  const result: Chip[] = [];

  gameFilter.value.forEach((game) => {
    result.push({
      id: `game-${game.id}`,
      label: game.name,
      tone: chipTones.game,
      dot: toneFor(game.id).dot,
      remove: () => {
        gameFilter.value = gameFilter.value.filter((item) => item.id !== game.id);
      },
    });
  });

  enabledGamesFilter.value.forEach((game) => {
    result.push({
      id: `enabled-game-${game.id}`,
      label: game.name,
      tone: chipTones.game,
      dot: toneFor(game.id).dot,
      remove: () => {
        enabledGamesFilter.value = enabledGamesFilter.value.filter((item) => item.id !== game.id);
      },
    });
  });

  playerCountFilter.value.forEach((option) => {
    result.push({
      id: `count-${option.value}`,
      label: option.name,
      tone: chipTones.count,
      remove: () => {
        playerCountFilter.value = playerCountFilter.value.filter((item) => item.value !== option.value);
      },
    });
  });

  playersInSameTeam.value.forEach((player) => {
    result.push({
      id: `player-${player.id}`,
      label: `with ${player.username}`,
      tone: chipTones.player,
      remove: () => {
        playersInSameTeam.value = playersInSameTeam.value.filter((item) => item.id !== player.id);
      },
    });
  });

  playedMatchMonthFilter.value.forEach((month) => {
    result.push({
      id: `month-${month}`,
      label: month,
      tone: chipTones.month,
      remove: () => {
        playedMatchMonthFilter.value = playedMatchMonthFilter.value.filter((item) => item !== month);
      },
    });
  });

  if (standingsAsWholeTeam.value) {
    result.push({
      id: 'whole-teams',
      label: 'whole teams',
      tone: chipTones.mode,
      remove: () => {
        standingsAsWholeTeam.value = false;
      },
    });
  }

  return result;
});

function clearAll() {
  gameFilter.value = [];
  enabledGamesFilter.value = [];
  playerCountFilter.value = [];
  playersInSameTeam.value = [];
  playedMatchMonthFilter.value = [];
  standingsAsWholeTeam.value = false;
}
</script>
