import { computed } from 'vue';
import _ from 'lodash';
import { useGamesStore } from '@/stores/game';
import { useMatchStore } from '@/stores/match';
import { useUiStore } from '@/stores/ui';
import type { Match } from '@/stores/match';
import type { Game } from '@/stores/game';

export function useFilteredMatches() {
  const matchStore = useMatchStore();
  const gameStore = useGamesStore();
  const uiStore = useUiStore();

  const enabledGames = computed(() =>
    _.filter(gameStore.games ?? [], (g) => !g.disabled)
  );

  const filteredMatches = computed((): Match[] => {
    if (!matchStore.matches) return [];

    const filterId = uiStore.gameFilterId;
    return _.chain(matchStore.matches)
      .filter((match) => {
        if (filterId === 'all') return true;
        return match.game?.id === filterId;
      })
      .map((match) => ({
        ...match,
        game: _.find(gameStore.games ?? [], (g) => g.id === match.game?.id) ?? match.game,
        homePlayers: _.sortBy(match.homePlayers, 'id'),
        awayPlayers: _.sortBy(match.awayPlayers, 'id'),
      }))
      .value();
  });

  const selectedGame = computed((): Game | null => {
    if (uiStore.gameFilterId === 'all') {
      return enabledGames.value[0] ?? null;
    }
    return _.find(enabledGames.value, { id: uiStore.gameFilterId }) ?? null;
  });

  const gameFilterOptions = computed(() => {
    const games = enabledGames.value;
    return [
      ...games.map((g) => ({ id: g.id, label: g.name })),
      { id: 'all' as const, label: 'All games' },
    ];
  });

  return {
    filteredMatches,
    enabledGames,
    selectedGame,
    gameFilterOptions,
  };
}
