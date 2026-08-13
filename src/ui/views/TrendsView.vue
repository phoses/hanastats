<template>
  <div class="tw:flex tw:flex-col tw:gap-3">
    <div class="tw:flex tw:items-start tw:gap-2">
      <div class="tw:flex tw:min-w-0 tw:grow tw:flex-wrap tw:items-center tw:gap-2">
        <UiButton size="sm" :variant="noGameFilter ? 'primary' : 'secondary'" @click="clearGameFilters">all</UiButton>
        <UiSegmented
          v-model="enabledGamesFilter"
          :options="enabledGames"
          option-label="name"
          option-key="id"
          multiple
          size="sm"
          label="game quick filter"
        >
          <template #option="{ option, selected }">
            <span class="tw:flex tw:items-center tw:gap-1.5">
              <span :class="['tw:size-2 tw:shrink-0 tw:rounded-full', toneFor(option.id).dot, selected ? '' : 'tw:opacity-70']" />
              <span>{{ option.name }}</span>
            </span>
          </template>
        </UiSegmented>
      </div>

      <div class="tw:relative tw:shrink-0">
        <UiIconButton label="filters" @click="filtersOpen = true">
          <UiIcon name="filter" />
        </UiIconButton>
        <span
          v-if="activeFilterCount > 0"
          class="tw:pointer-events-none tw:absolute tw:top-1 tw:right-1 tw:flex tw:min-w-4 tw:justify-center tw:rounded-full tw:bg-accent-strong tw:px-1 tw:text-[0.6rem] tw:leading-4 tw:text-white"
        >
          {{ activeFilterCount }}
        </span>
      </div>
    </div>

    <ActiveFilterChips />

    <p class="tw:text-xs tw:text-ink-muted">
      {{ summary }}
    </p>

    <div v-if="trends === null" class="tw:flex tw:flex-col tw:gap-2">
      <UiSkeleton v-for="index in 5" :key="index" height="6.5rem" />
    </div>

    <UiEmptyState
      v-else-if="!matchCount"
      title="no matches"
      description="adjust the filters to see streaks, pairs, and form"
      icon="trend"
    />

    <UiEmptyState
      v-else-if="groups.length === 0"
      title="quiet stretch"
      description="not enough of a pattern in the current filters yet"
      icon="trend"
    />

    <UiCard v-for="group in groups" :key="group.id" padding="md">
      <h2 class="tw:text-balance tw:font-semibold">{{ group.title }}</h2>
      <p class="tw:mt-0.5 tw:text-sm tw:text-ink-muted">{{ group.description }}</p>

      <div
        v-for="(section, index) in group.sections"
        :key="section.id"
        :class="index === 0 ? 'tw:mt-4' : 'tw:mt-5 tw:border-t tw:border-line tw:pt-4'"
      >
        <h3 class="tw:mb-1.5 tw:flex tw:items-center tw:gap-1.5 tw:text-sm tw:font-medium">
          <UiIcon :name="section.icon" :size="16" :class="section.iconClass" />
          <span>{{ section.title }}</span>
        </h3>
        <ul>
          <li
            v-for="row in section.rows"
            :key="row.id"
            class="tw:flex tw:items-baseline tw:justify-between tw:gap-3 tw:py-1.5 tw:text-sm"
          >
            <span class="tw:min-w-0">
              <span class="tw:font-medium">{{ row.names }}</span>
              <span v-if="row.note" class="tw:mt-0.5 tw:block tw:text-xs tw:text-ink-muted">{{ row.note }}</span>
            </span>
            <span v-if="section.form" class="tw:shrink-0 tw:font-mono tw:text-xs tw:tracking-wide tw:tabular-nums">
              <span
                v-for="(mark, markIndex) in row.detail"
                :key="markIndex"
                :class="markClass(mark)"
              >{{ mark }}</span>
            </span>
            <span v-else class="tw:shrink-0 tw:tabular-nums tw:text-ink">{{ row.detail }}</span>
          </li>
        </ul>
      </div>
    </UiCard>

    <StatsFilterSheet
      v-model="filtersOpen"
      :distinct-games="distinctGames || []"
      :player-counts="listOfPlayerCountOfMatches || []"
      :months="distinctPlayedMatchesMonths || []"
      :all-players="allPlayers"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import UiButton from '../components/UiButton.vue';
import UiCard from '../components/UiCard.vue';
import UiEmptyState from '../components/UiEmptyState.vue';
import UiIcon from '../components/UiIcon.vue';
import UiIconButton from '../components/UiIconButton.vue';
import UiSegmented from '../components/UiSegmented.vue';
import UiSkeleton from '../components/UiSkeleton.vue';
import ActiveFilterChips from '../features/ActiveFilterChips.vue';
import StatsFilterSheet from '../features/StatsFilterSheet.vue';
import { useModernStats } from '../composables/useModernStats';
import { toneFor } from '../palette';
import { useTrends, type TrendRow } from '@/composables/useTrends';
import type { IconName } from '../components/icons';

interface TrendSection {
  id: string;
  title: string;
  icon: IconName;
  iconClass: string;
  rows: TrendRow[];
  form?: boolean;
}

interface TrendGroup {
  id: string;
  title: string;
  description: string;
  sections: TrendSection[];
}

const {
  filters,
  allPlayers,
  filteredMatches,
  distinctGames,
  enabledGames,
  distinctPlayedMatchesMonths,
  listOfPlayerCountOfMatches,
  activeFilterCount,
} = useModernStats();

const { gameFilter, enabledGamesFilter } = filters;

const filtersOpen = ref(false);
const trends = useTrends(filteredMatches);

const noGameFilter = computed(() => gameFilter.value.length === 0 && enabledGamesFilter.value.length === 0);
const matchCount = computed(() => filteredMatches.value?.length ?? 0);

const summary = computed(() => {
  const count = matchCount.value;
  return `${count} match${count === 1 ? '' : 'es'} · streaks and form from the current filters`;
});

function withRows(sections: TrendSection[]): TrendSection[] {
  return sections.filter((section) => section.rows.length > 0);
}

const groups = computed<TrendGroup[]>(() => {
  if (!trends.value) {
    return [];
  }

  const result: TrendGroup[] = [
    {
      id: 'now',
      title: 'right now',
      description: 'who is rolling, who is stuck, and how the last ten went',
      sections: withRows([
        {
          id: 'hot',
          title: 'on fire',
          icon: 'flame',
          iconClass: 'tw:text-amber-400',
          rows: trends.value.hot,
        },
        {
          id: 'cold',
          title: 'ice cold',
          icon: 'snowflake',
          iconClass: 'tw:text-sky-300',
          rows: trends.value.cold,
        },
        {
          id: 'form',
          title: 'recent form',
          icon: 'graph',
          iconClass: 'tw:text-fuchsia-300',
          rows: trends.value.form,
          form: true,
        },
      ]),
    },
    {
      id: 'streaks',
      title: 'streaks',
      description: 'longest runs and who has barely left the table',
      sections: withRows([
        {
          id: 'longest-win',
          title: 'longest win streak',
          icon: 'trophy',
          iconClass: 'tw:text-amber-400',
          rows: trends.value.longestWin,
        },
        {
          id: 'longest-loss',
          title: 'longest losing streak',
          icon: 'snowflake',
          iconClass: 'tw:text-sky-300',
          rows: trends.value.longestLoss,
        },
        {
          id: 'calendar',
          title: 'days in a row',
          icon: 'calendar',
          iconClass: 'tw:text-emerald-300',
          rows: trends.value.calendarStreak,
        },
        {
          id: 'ironman',
          title: 'ironman, last 7 days',
          icon: 'flame',
          iconClass: 'tw:text-orange-300',
          rows: trends.value.ironman,
        },
      ]),
    },
    {
      id: 'pairs',
      title: 'chemistry',
      description: 'pairs that keep landing on the same side',
      sections: withRows([
        {
          id: 'inseparable',
          title: 'inseparable lately',
          icon: 'user',
          iconClass: 'tw:text-cyan-300',
          rows: trends.value.inseparable,
        },
        {
          id: 'duo',
          title: 'winning duo',
          icon: 'trophy',
          iconClass: 'tw:text-emerald-300',
          rows: trends.value.winningDuo,
        },
      ]),
    },
    {
      id: 'spice',
      title: 'side plots',
      description: 'rivalries, nail-biters, and late sessions',
      sections: withRows([
        {
          id: 'nemesis',
          title: 'nemesis',
          icon: 'alert',
          iconClass: 'tw:text-loss',
          rows: trends.value.nemesis,
        },
        {
          id: 'nail',
          title: 'nail-biters',
          icon: 'alert',
          iconClass: 'tw:text-warn',
          rows: trends.value.nailBiter,
        },
        {
          id: 'night',
          title: 'night shift',
          icon: 'moon',
          iconClass: 'tw:text-violet-300',
          rows: trends.value.nightShift,
        },
      ]),
    },
  ];

  return result.filter((group) => group.sections.length > 0);
});

function markClass(mark: string): string {
  if (mark === 'W') {
    return 'tw:text-win';
  }
  if (mark === 'L') {
    return 'tw:text-loss';
  }
  return 'tw:text-ink-muted';
}

function clearGameFilters() {
  gameFilter.value = [];
  enabledGamesFilter.value = [];
}
</script>
