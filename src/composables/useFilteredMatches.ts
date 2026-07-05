import { useMatchFilters } from './useMatchFilters';

export function useFilteredMatches() {
  const {
    filteredMatches,
    enabledGames,
    selectedGame,
    gameFilterOptions,
  } = useMatchFilters();

  return {
    filteredMatches,
    enabledGames,
    selectedGame,
    gameFilterOptions,
  };
}
