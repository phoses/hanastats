import { computed, ref, type Ref } from 'vue';
import _ from 'lodash';
import moment from 'moment';
import { useGamesStore, type Game } from '@/stores/game';
import { useMatchStore, type Match } from '@/stores/match';
import type { Player } from '@/stores/player';

export interface PlayerCountOption {
  name: string;
  value: number;
}

/**
 * Filter state shared by the classic and the modern stats views. The state is
 * created per consumer so that each UI owns its own selections, while the
 * derived data below stays a single implementation.
 */
export interface MatchFilters {
  gameFilter: Ref<Game[]>;
  enabledGamesFilter: Ref<Game[]>;
  playerCountFilter: Ref<PlayerCountOption[]>;
  playersInSameTeam: Ref<Player[]>;
  playedMatchMonthFilter: Ref<string[]>;
}

export function createMatchFilters(): MatchFilters {
  return {
    gameFilter: ref([] as Game[]),
    enabledGamesFilter: ref([] as Game[]),
    playerCountFilter: ref([] as PlayerCountOption[]),
    playersInSameTeam: ref([] as Player[]),
    playedMatchMonthFilter: ref([] as string[]),
  };
}

export function useFilteredMatches(filters: MatchFilters) {
  const matchStore = useMatchStore();
  const gameStore = useGamesStore();

  const games = computed(() => gameStore.games);
  const allMatches = computed(() => matchStore.matches);

  const filteredGames = computed(() => {
    return _.uniqBy([...filters.gameFilter.value, ...filters.enabledGamesFilter.value], 'id');
  });

  const filteredMatches = computed(() => {
    if (allMatches.value === null) {
      return null;
    }

    return _.chain(allMatches.value)
      .filter(match => filters.playerCountFilter.value.length === 0 || _.map(filters.playerCountFilter.value, 'value').includes([...match.homePlayers, ...match.awayPlayers].length))
      .filter(match => filteredGames.value.length === 0 || filteredGames.value.map(g => g.id).includes(match.game!.id))
      .filter(match => filters.playersInSameTeam.value.length === 0 || filters.playersInSameTeam.value.every(player => match.homePlayers.map(p => p.id).includes(player.id)) || filters.playersInSameTeam.value.every(player => match.awayPlayers.map(p => p.id).includes(player.id)))
      .filter(match => filters.playedMatchMonthFilter.value.length === 0 || filters.playedMatchMonthFilter.value.includes(moment(match.played).format('YYYY-MM')))
      .map(match => {
        return {
          ...match,
          game: _.find(games.value, g => g.id === match.game!.id),
          homePlayers: _.sortBy(match.homePlayers, 'id'),
          awayPlayers: _.sortBy(match.awayPlayers, 'id'),
        }
      })
      .value() as Match[];
  });

  const distinctGames = computed(() => {
    if (allMatches.value === null) {
      return null;
    }

    return _.chain(allMatches.value)
      .map(match => match.game)
      .uniqBy('id')
      .value() as Game[];
  });

  const enabledGames = computed(() => {
    return _.filter(games.value, game => !game.disabled);
  });

  const distinctPlayedMatchesMonths = computed(() => {
    if (allMatches.value === null) {
      return null;
    }

    return _.chain(allMatches.value)
      .map(match => moment(match.played).format('YYYY-MM'))
      .uniq()
      .reverse()
      .value();
  });

  const listOfPlayerCountOfMatches = computed(() => {
    if (allMatches.value === null) {
      return null;
    }

    return _.chain(allMatches.value)
      .map(match => {
        return [...match.homePlayers, ...match.awayPlayers].length;
      })
      .flatten()
      .uniq()
      .map(count => {
        return {
          name: count + ' players',
          value: count
        };
      })
      .sortBy('value')
      .value();
  });

  /** One entry per player, shaped the way the elo utilities expect. */
  const players = computed(() => {
    return _.chain(filteredMatches.value)
      .flatMap(match => {
        return [...match.homePlayers, ...match.awayPlayers];
      })
      .uniqBy('id')
      .map(player => [player])
      .value();
  });

  const activeFilterCount = computed(() => {
    return filters.gameFilter.value.length
      + filters.enabledGamesFilter.value.length
      + filters.playerCountFilter.value.length
      + filters.playersInSameTeam.value.length
      + filters.playedMatchMonthFilter.value.length;
  });

  function clearFilters() {
    filters.gameFilter.value = [];
    filters.enabledGamesFilter.value = [];
    filters.playerCountFilter.value = [];
    filters.playersInSameTeam.value = [];
    filters.playedMatchMonthFilter.value = [];
  }

  return {
    games,
    allMatches,
    filteredGames,
    filteredMatches,
    distinctGames,
    enabledGames,
    distinctPlayedMatchesMonths,
    listOfPlayerCountOfMatches,
    players,
    activeFilterCount,
    clearFilters,
  };
}
