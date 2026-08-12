import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useFilteredMatches, type MatchFilters } from '@/composables/useMatchFilters';
import { useEloCalculation } from '@/composables/useEloCalculation';
import { useMiscStatistics, useStandings } from '@/composables/useStandings';
import { useMatchList } from '@/composables/useMatchList';
import { useModernFiltersStore } from '@/stores/modernFilters';
import { usePlayersStore } from '@/stores/player';

/**
 * Wires the shared stats logic to the modern UI filter store so that the
 * standings and matches views stay in sync.
 */
export function useModernStats() {
  const filtersStore = useModernFiltersStore();
  const playerStore = usePlayersStore();

  const {
    gameFilter,
    enabledGamesFilter,
    playerCountFilter,
    playersInSameTeam,
    playedMatchMonthFilter,
    standingsAsWholeTeam,
  } = storeToRefs(filtersStore);

  const filters: MatchFilters = {
    gameFilter,
    enabledGamesFilter,
    playerCountFilter,
    playersInSameTeam,
    playedMatchMonthFilter,
  };

  const allPlayers = computed(() => playerStore.players);

  const {
    filteredGames,
    filteredMatches,
    distinctGames,
    enabledGames,
    distinctPlayedMatchesMonths,
    listOfPlayerCountOfMatches,
    players,
    activeFilterCount,
    clearFilters,
  } = useFilteredMatches(filters);

  const { eloRatings, matchEloChanges } = useEloCalculation(filteredMatches, players);

  const { standings, uniqueTeams, showDraws } = useStandings({
    filteredMatches,
    filteredGames,
    players,
    allPlayers,
    standingsAsWholeTeam,
    eloRatings,
  });

  const matches = useMatchList(filteredMatches, matchEloChanges);
  const miscStatistics = useMiscStatistics(filteredMatches, players, uniqueTeams);

  return {
    filters,
    standingsAsWholeTeam,
    allPlayers,
    filteredGames,
    filteredMatches,
    distinctGames,
    enabledGames,
    distinctPlayedMatchesMonths,
    listOfPlayerCountOfMatches,
    players,
    activeFilterCount,
    clearFilters,
    standings,
    showDraws,
    matches,
    miscStatistics,
  };
}
