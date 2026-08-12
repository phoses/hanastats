<template>
  <UiSheet :model-value="modelValue" title="filters" @update:model-value="emit('update:modelValue', $event)">
    <div class="tw:flex tw:flex-col tw:gap-6">
      <section v-if="distinctGames.length > 0">
        <h3 class="tw:mb-2 tw:text-sm tw:text-ink-muted">game</h3>
        <UiSegmented v-model="gameFilter" :options="distinctGames" option-label="name" option-key="id" multiple size="sm" label="game" />
      </section>

      <section v-if="playerCounts.length > 0">
        <h3 class="tw:mb-2 tw:text-sm tw:text-ink-muted">team size</h3>
        <UiSegmented v-model="playerCountFilter" :options="playerCounts" option-label="name" option-key="value" multiple size="sm" label="team size" />
      </section>

      <section v-if="allPlayers.length > 0">
        <h3 class="tw:mb-2 tw:text-sm tw:text-ink-muted">players in the same team</h3>
        <UiSegmented v-model="playersInSameTeam" :options="allPlayers" option-label="username" option-key="id" multiple size="sm" label="players in the same team" />
      </section>

      <section v-if="months.length > 0">
        <h3 class="tw:mb-2 tw:text-sm tw:text-ink-muted">month</h3>
        <UiSegmented v-model="playedMatchMonthFilter" :options="months" multiple size="sm" label="month" />
      </section>

      <section>
        <h3 class="tw:mb-2 tw:text-sm tw:text-ink-muted">grouping</h3>
        <UiSwitch v-model="standingsAsWholeTeam">rank whole teams instead of players</UiSwitch>
      </section>
    </div>

    <template #footer>
      <div class="tw:flex tw:items-center tw:gap-2">
        <UiButton variant="ghost" class="tw:shrink-0 tw:whitespace-nowrap" @click="clear">clear all</UiButton>
        <UiButton variant="primary" block @click="emit('update:modelValue', false)">show results</UiButton>
      </div>
    </template>
  </UiSheet>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import UiButton from '../components/UiButton.vue';
import UiSegmented from '../components/UiSegmented.vue';
import UiSheet from '../components/UiSheet.vue';
import UiSwitch from '../components/UiSwitch.vue';
import { useModernFiltersStore } from '@/stores/modernFilters';
import type { PlayerCountOption } from '@/composables/useMatchFilters';
import type { Game } from '@/stores/game';
import type { Player } from '@/stores/player';

defineProps<{
  modelValue: boolean;
  distinctGames: Game[];
  playerCounts: PlayerCountOption[];
  months: string[];
  allPlayers: Player[];
}>();

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>();

const filtersStore = useModernFiltersStore();
const {
  gameFilter,
  playerCountFilter,
  playersInSameTeam,
  playedMatchMonthFilter,
  standingsAsWholeTeam,
} = storeToRefs(filtersStore);

function clear() {
  gameFilter.value = [];
  playerCountFilter.value = [];
  playersInSameTeam.value = [];
  playedMatchMonthFilter.value = [];
  filtersStore.enabledGamesFilter = [];
}
</script>
