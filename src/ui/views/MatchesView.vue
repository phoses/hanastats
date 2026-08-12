<template>
  <div class="tw:flex tw:flex-col tw:gap-3">
    <div class="tw:flex tw:items-end tw:gap-2">
      <div class="tw:grow">
        <UiTextInput
          v-model="search"
          label="search player"
          type="search"
          inputmode="search"
          placeholder="search player"
          icon="search"
          hide-label
          clearable
        />
      </div>

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

    <ActiveFilterChips />

    <p class="tw:text-xs tw:text-ink-muted" aria-live="polite">
      {{ visibleMatches.length }} of {{ searchedMatches.length }} matches
    </p>

    <div v-if="matches === null" class="tw:flex tw:flex-col tw:gap-2">
      <UiSkeleton v-for="index in 6" :key="index" height="4rem" />
    </div>

    <UiEmptyState
      v-else-if="searchedMatches.length === 0"
      title="no matches"
      description="try a different search or clear the filters"
      icon="list"
    />

    <template v-else>
      <ul class="tw:flex tw:flex-col tw:gap-2">
        <li v-for="match in visibleMatches" :key="match.id">
          <MatchCard
            :match="match"
            :expanded="expandedIds.includes(match.id ?? '')"
            @toggle="toggleMatch(match.id ?? '')"
          />
        </li>
      </ul>

      <UiButton v-if="visibleMatches.length < searchedMatches.length" variant="secondary" block @click="showMore">
        show more
      </UiButton>
    </template>

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
import { computed, ref, watch } from 'vue';
import UiButton from '../components/UiButton.vue';
import UiEmptyState from '../components/UiEmptyState.vue';
import UiIcon from '../components/UiIcon.vue';
import UiIconButton from '../components/UiIconButton.vue';
import UiSkeleton from '../components/UiSkeleton.vue';
import UiTextInput from '../components/UiTextInput.vue';
import ActiveFilterChips from '../features/ActiveFilterChips.vue';
import MatchCard from '../features/MatchCard.vue';
import StatsFilterSheet from '../features/StatsFilterSheet.vue';
import { useModernStats } from '../composables/useModernStats';

const PAGE_SIZE = 40;

const {
  allPlayers,
  distinctGames,
  distinctPlayedMatchesMonths,
  listOfPlayerCountOfMatches,
  activeFilterCount,
  matches,
} = useModernStats();

const search = ref('');
const filtersOpen = ref(false);
const visibleCount = ref(PAGE_SIZE);
const expandedIds = ref<string[]>([]);

const searchedMatches = computed(() => {
  const all = matches.value ?? [];
  const query = search.value.trim().toLowerCase();

  if (query.length === 0) {
    return all;
  }

  return all.filter((match) => [...match.homePlayers, ...match.awayPlayers]
    .some((player) => player.username.toLowerCase().includes(query)));
});

const visibleMatches = computed(() => searchedMatches.value.slice(0, visibleCount.value));

// Long lists stay cheap: reset paging whenever the result set changes.
watch([search, () => matches.value?.length, activeFilterCount], () => {
  visibleCount.value = PAGE_SIZE;
});

function showMore() {
  visibleCount.value += PAGE_SIZE;
}

function toggleMatch(id: string) {
  expandedIds.value = expandedIds.value.includes(id)
    ? expandedIds.value.filter((item) => item !== id)
    : [...expandedIds.value, id];
}
</script>
