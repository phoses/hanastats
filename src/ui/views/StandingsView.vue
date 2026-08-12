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

      <div class="tw:flex tw:shrink-0 tw:items-center tw:gap-1">
        <UiIconButton label="elo graph" :pressed="showGraph" @click="showGraph = !showGraph">
          <UiIcon name="graph" />
        </UiIconButton>

        <div class="tw:relative">
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
    </div>

    <ActiveFilterChips />

    <p class="tw:text-xs tw:text-ink-muted">
      {{ summary }}
    </p>

    <UiCard v-if="showGraph" padding="sm">
      <EloGraph v-if="filteredMatches && filteredMatches.length > 0" :matches="filteredMatches" :players="players" height="65dvh" />
      <UiEmptyState v-else title="no matches" description="adjust the filters to see elo history" icon="graph" />
    </UiCard>

    <div v-else-if="standings === null" class="tw:flex tw:flex-col tw:gap-2">
      <UiSkeleton v-for="index in 8" :key="index" height="2.25rem" />
    </div>

    <UiTable
      v-else
      :columns="columns"
      :rows="rows"
      row-key="player"
      :sort="sort"
      expandable
      :expanded-keys="expandedKeys"
      caption="standings"
      @update:sort="sort = $event"
      @toggle-row="toggleRow"
    >
      <template #cell-player="{ row, index }">
        <span class="tw:flex tw:min-w-0 tw:items-center tw:gap-1">
          <span :class="['tw:truncate tw:font-semibold', medalClass(index)]">{{ row.player }}</span>
          <UiIcon
            v-if="row.loseOrWinStreakLatestStreak > 4 && row.loseOrWinStreakLatestStreakType === 'W'"
            name="flame"
            :size="15"
            :label="`winning streak of ${row.loseOrWinStreakLatestStreak}`"
            class="tw:shrink-0 tw:text-amber-400"
          />
          <UiIcon
            v-if="row.loseOrWinStreakLatestStreak > 4 && row.loseOrWinStreakLatestStreakType === 'L'"
            name="snowflake"
            :size="15"
            :label="`losing streak of ${row.loseOrWinStreakLatestStreak}`"
            class="tw:shrink-0 tw:text-accent"
          />
          <UiIcon v-if="row.ownsGame" name="gamepad" :size="15" label="owns the game" class="tw:shrink-0 tw:text-ink-subtle" />
          <UiBadge v-if="!row.validResult" tone="warn">low gp</UiBadge>
        </span>
      </template>

      <template #cell-record="{ row }">
        <span class="tw:font-medium">
          <span class="tw:text-win">{{ row.wins }}</span>
          <span class="tw:text-ink-subtle">-</span>
          <span class="tw:text-loss">{{ row.losses }}</span>
        </span>
      </template>

      <template #cell-goalsDiff="{ row }">
        <span :class="diffClass(row.goalsDiff)">{{ signed(row.goalsDiff) }}</span>
      </template>

      <template #cell-elo="{ row }">
        <span :class="['tw:font-semibold', eloClass(row.elo)]">{{ row.elo }}</span>
      </template>

      <template #cell-streak="{ row }">
        <span :class="row.loseOrWinStreakLatestStreakType === 'W' ? 'tw:text-win' : 'tw:text-loss'">
          {{ row.loseOrWinStreakLatestStreak }}{{ row.loseOrWinStreakLatestStreakType }}
        </span>
      </template>

      <template #empty>no players match the filters</template>

      <template #expansion="{ row }">
        <dl class="tw:grid tw:grid-cols-1 tw:gap-x-6 tw:gap-y-1.5 tw:text-sm tw:sm:grid-cols-2 tw:lg:grid-cols-3">
          <div v-for="detail in detailsOf(row)" :key="detail.label" class="tw:flex tw:justify-between tw:gap-2">
            <dt class="tw:text-ink-muted">{{ detail.label }}</dt>
            <dd class="tw:tabular-nums">{{ detail.value }}</dd>
          </div>
        </dl>
      </template>
    </UiTable>

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
import _ from 'lodash';
import EloGraph from '@/components/EloGraph.vue';
import UiBadge from '../components/UiBadge.vue';
import UiButton from '../components/UiButton.vue';
import UiCard from '../components/UiCard.vue';
import UiEmptyState from '../components/UiEmptyState.vue';
import UiIcon from '../components/UiIcon.vue';
import UiIconButton from '../components/UiIconButton.vue';
import UiSegmented from '../components/UiSegmented.vue';
import UiSkeleton from '../components/UiSkeleton.vue';
import UiTable from '../components/UiTable.vue';
import ActiveFilterChips from '../features/ActiveFilterChips.vue';
import StatsFilterSheet from '../features/StatsFilterSheet.vue';
import { useModernStats } from '../composables/useModernStats';
import { medalTextClasses, toneFor } from '../palette';
import type { TableColumn, TableSort } from '../components/types';
import type { StandingRow } from '@/composables/useStandings';

const {
  filters,
  standingsAsWholeTeam,
  allPlayers,
  filteredMatches,
  distinctGames,
  enabledGames,
  distinctPlayedMatchesMonths,
  listOfPlayerCountOfMatches,
  players,
  activeFilterCount,
  standings,
  showDraws,
} = useModernStats();

const { gameFilter, enabledGamesFilter } = filters;

const showGraph = ref(false);
const filtersOpen = ref(false);
const sort = ref<TableSort | null>(null);
const expandedKeys = ref<(string | number)[]>([]);

const noGameFilter = computed(() => gameFilter.value.length === 0 && enabledGamesFilter.value.length === 0);

const summary = computed(() => {
  const matchCount = filteredMatches.value?.length ?? 0;
  const rowLabel = standingsAsWholeTeam.value ? 'teams' : 'players';
  return `${matchCount} matches · ${standings.value?.length ?? 0} ${rowLabel}`;
});

const columns = computed<TableColumn[]>(() => {
  const result: TableColumn[] = [
    { key: 'player', label: standingsAsWholeTeam.value ? 'team' : 'player', sortable: true },
    { key: 'matches', label: 'gp', description: 'games played', align: 'center', numeric: true, sortable: true },
    { key: 'record', label: 'w-l', description: 'wins and losses', align: 'center', numeric: true, priority: 'mobile' },
    { key: 'wins', label: 'w', description: 'wins', align: 'center', numeric: true, sortable: true, priority: 'md' },
    { key: 'losses', label: 'l', description: 'losses', align: 'center', numeric: true, sortable: true, priority: 'md' },
  ];

  if (showDraws.value) {
    result.push({ key: 'draws', label: 'd', description: 'draws', align: 'center', numeric: true, priority: 'md' });
  }

  result.push(
    { key: 'overtimelosses', label: 'ot', description: 'overtime losses', align: 'center', numeric: true, priority: 'md' },
    { key: 'goalsDiff', label: 'g-diff', description: 'goal difference', align: 'center', numeric: true, sortable: true, priority: 'md' },
    { key: 'streak', label: 's', description: 'current streak', align: 'center', priority: 'md' },
    { key: 'playerPointsOfPercantage', label: 'p%', description: 'share of maximum points', align: 'center', numeric: true, sortable: true, priority: 'xs' },
  );

  if (!standingsAsWholeTeam.value) {
    result.push({ key: 'elo', label: 'elo', description: 'elo rating', align: 'center', numeric: true, sortable: true });
  }

  result.push(
    { key: 'points', label: 'pts', description: 'points', align: 'center', numeric: true, sortable: true, priority: 'lg' },
    { key: 'maximumPoints', label: 'max', description: 'maximum points', align: 'center', numeric: true, priority: 'lg' },
    { key: 'goalsFor', label: 'gf', description: 'goals for', align: 'center', numeric: true, priority: 'lg' },
    { key: 'goalsAgainst', label: 'ga', description: 'goals against', align: 'center', numeric: true, priority: 'lg' },
  );

  return result;
});

const rows = computed(() => {
  const base = (standings.value ?? []).map((row) => ({
    ...row,
    record: `${row.wins}-${row.losses}`,
    pointsPercentage: Number(row.playerPointsOfPercantage) || 0,
  }));

  if (!sort.value) {
    return base;
  }

  const sortKey = sort.value.key === 'playerPointsOfPercantage' ? 'pointsPercentage' : sort.value.key;
  return _.orderBy(base, [sortKey], [sort.value.direction]);
});

/** Podium colours only make sense while the default ranking order is intact. */
function medalClass(index: number): string {
  if (sort.value || index > 2) {
    return '';
  }
  return medalTextClasses[index];
}

function signed(value: number): string {
  return value > 0 ? `+${value}` : String(value);
}

function diffClass(value: number): string {
  if (value > 0) {
    return 'tw:text-win';
  }
  return value < 0 ? 'tw:text-loss' : 'tw:text-ink-muted';
}

function eloClass(elo: number): string {
  if (elo >= 1600) {
    return 'tw:text-cyan-300';
  }
  if (elo >= 1500) {
    return 'tw:text-violet-300';
  }
  return 'tw:text-ink-muted';
}

function clearGameFilters() {
  gameFilter.value = [];
  enabledGamesFilter.value = [];
}

function toggleRow(row: Record<string, any>) {
  const key = row.player as string;
  expandedKeys.value = expandedKeys.value.includes(key)
    ? expandedKeys.value.filter((item) => item !== key)
    : [...expandedKeys.value, key];
}

function detailsOf(tableRow: Record<string, any>) {
  const row = tableRow as StandingRow;
  const details = [
    { label: 'games played', value: row.matches },
    { label: 'wins', value: row.wins },
    { label: 'regular wins', value: `${row.regularTimeWins} (${row.pointsForRegularTimeWins} pts)` },
    { label: 'overtime wins', value: `${row.overtimewins} (${row.pointsForOverTimeWin} pts)` },
    { label: 'losses', value: row.losses },
    { label: 'regular losses', value: row.regularTimeLosses },
    { label: 'overtime losses', value: `${row.overtimelosses} (${row.pointsForOverTimeLose} pts)` },
    { label: 'goals for', value: row.goalsFor },
    { label: 'goals against', value: row.goalsAgainst },
    { label: 'goal difference', value: row.goalsDiff },
    { label: 'points', value: `${row.points} / ${row.maximumPoints}` },
    { label: 'points %', value: row.playerPointsOfPercantage },
  ];

  if (showDraws.value && row.draws > 0) {
    details.push({ label: 'draws', value: `${row.draws} (${row.pointsForDraws} pts)` });
  }

  if (!standingsAsWholeTeam.value) {
    details.push({ label: 'elo rating', value: row.elo });
  }

  return details;
}
</script>
