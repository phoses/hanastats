import { computed } from 'vue';
import _ from 'lodash';
import moment from 'moment';
import { useGamesStore } from '@/stores/game';
import { useMatchStore } from '@/stores/match';
import { usePlayersStore } from '@/stores/player';
import { useUiStore } from '@/stores/ui';
import type { Match } from '@/stores/match';
import type { Player } from '@/stores/player';

function teamKey(players: Player[]): string {
  return players
    .map((p) => p.id)
    .sort()
    .join(',');
}

function teamContainsPlayer(team: Player[], playerId: string): boolean {
  return team.some((p) => p.id === playerId);
}

function samePlayerSet(playersA: Player[], playersB: Player[]): boolean {
  const idsA = new Set(playersA.map((p) => p.id));
  const idsB = new Set(playersB.map((p) => p.id));
  return idsA.size === idsB.size && [...idsA].every((id) => idsB.has(id));
}

export function useMatchFilters() {
  const matchStore = useMatchStore();
  const gameStore = useGamesStore();
  const playerStore = usePlayersStore();
  const uiStore = useUiStore();

  const enabledGames = computed(() =>
    _.filter(gameStore.games ?? [], (g) => !g.disabled)
  );

  const baseMatches = computed((): Match[] => {
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

  const playerCountOptions = computed(() => {
    const counts = _.chain(baseMatches.value)
      .map((match) => match.homePlayers.length + match.awayPlayers.length)
      .uniq()
      .sortBy()
      .value();
    return counts.map((count) => ({ id: count, label: `${count} players` }));
  });

  const monthOptions = computed(() => {
    return _.chain(baseMatches.value)
      .map((match) => moment(match.played).format('YYYY-MM'))
      .uniq()
      .sortBy()
      .reverse()
      .map((month) => ({ id: month, label: moment(month, 'YYYY-MM').format('MMM YYYY') }))
      .value();
  });

  const playerOptions = computed(() =>
    (playerStore.players ?? []).map((p) => ({ id: p.id, label: p.username, player: p }))
  );

  const filteredMatches = computed((): Match[] => {
    let matches = baseMatches.value;

    if (uiStore.playerCountFilter.length > 0) {
      const allowed = new Set(uiStore.playerCountFilter);
      matches = matches.filter(
        (m) => allowed.has(m.homePlayers.length + m.awayPlayers.length)
      );
    }

    if (uiStore.playedMatchMonthFilter.length > 0) {
      const allowed = new Set(uiStore.playedMatchMonthFilter);
      matches = matches.filter((m) =>
        allowed.has(moment(m.played).format('YYYY-MM'))
      );
    }

    if (uiStore.playersInSameTeam.length > 0) {
      const selected = uiStore.playersInSameTeam;
      matches = matches.filter((match) => {
        const homeHasAll = selected.every((p) => teamContainsPlayer(match.homePlayers, p.id));
        const awayHasAll = selected.every((p) => teamContainsPlayer(match.awayPlayers, p.id));
        return homeHasAll || awayHasAll;
      });
    }

    return matches;
  });

  const selectedGame = computed(() => {
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

  const uniqueTeams = computed(() =>
    _.uniqBy(
      [
        ...filteredMatches.value.map((m) => m.homePlayers),
        ...filteredMatches.value.map((m) => m.awayPlayers),
      ],
      (players) => teamKey(players)
    )
  );

  const miscStats = computed(() => {
    const matches = filteredMatches.value;
    const total = matches.length || 1;

    const homeWins = matches.filter((m) => m.homeScore > m.awayScore).length;
    const pct = (count: number) => `${Math.round((count / total) * 100)}%`;

    const teamSizeWinPct = (size: number) => {
      const wins = matches.filter(
        (m) =>
          (m.homePlayers.length === size && m.homeScore > m.awayScore) ||
          (m.awayPlayers.length === size && m.awayScore > m.homeScore)
      ).length;
      return pct(wins);
    };

    const players = _.chain(matches)
      .flatMap((m) => [...m.homePlayers, ...m.awayPlayers])
      .uniqBy('id')
      .value();

    return {
      matches: matches.length,
      players: players.length,
      teams: uniqueTeams.value.length,
      homeTeamWinPercentage: pct(homeWins),
      onePlayerTeamWinPercentage: teamSizeWinPct(1),
      twoPlayerTeamWinPercentage: teamSizeWinPct(2),
      threePlayerTeamWinPercentage: teamSizeWinPct(3),
    };
  });

  return {
    filteredMatches,
    baseMatches,
    enabledGames,
    selectedGame,
    gameFilterOptions,
    playerCountOptions,
    monthOptions,
    playerOptions,
    uniqueTeams,
    miscStats,
    teamKey,
    samePlayerSet,
    teamContainsPlayer,
  };
}
