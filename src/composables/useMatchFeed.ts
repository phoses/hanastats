import { computed } from 'vue';
import _ from 'lodash';
import moment from 'moment';
import { calculateEloRatings } from '@/utils/elo';
import { useFilteredMatches } from './useFilteredMatches';
import { useUiStore } from '@/stores/ui';

export function useMatchFeed() {
  const { filteredMatches, selectedGame } = useFilteredMatches();
  const uiStore = useUiStore();

  const matches = computed(() => {
    const list = filteredMatches.value;
    if (list.length === 0) return [];

    const players = _.chain(list)
      .flatMap((m) => [...m.homePlayers, ...m.awayPlayers])
      .uniqBy('id')
      .map((p) => [p])
      .value();

    const { matchEloChanges } = calculateEloRatings(list, players);

    return _.chain(list)
      .sortBy('played')
      .reverse()
      .map((match) => {
        const homeWins = match.homeScore > match.awayScore;
        const awayWins = match.awayScore > match.homeScore;
        const isDraw = match.homeScore === match.awayScore;
        const changes = match.id ? matchEloChanges[match.id] ?? [] : [];
        const homeDelta = changes.find((c) => c.team === 'home')?.change ?? 0;
        const awayDelta = changes.find((c) => c.team === 'away')?.change ?? 0;
        const playerCount = match.homePlayers.length + match.awayPlayers.length;
        const fmt = `${match.homePlayers.length}v${match.awayPlayers.length}`;
        const gameName = match.game?.name ?? selectedGame.value?.name ?? 'Game';

        const played = match.played ?? Date.now();
        const isToday = moment(played).isSame(moment(), 'day');
        const isYesterday = moment(played).isSame(moment().subtract(1, 'day'), 'day');
        let when: string;
        if (uiStore.newlyAddedMatchId && match.id === uiStore.newlyAddedMatchId) {
          when = 'Just now';
        } else if (isToday) {
          when = `Today · ${moment(played).format('HH:mm')}`;
        } else if (isYesterday) {
          when = `Yesterday · ${moment(played).format('HH:mm')}`;
        } else {
          const days = moment().diff(moment(played), 'days');
          when = days === 1 ? '1 day ago' : `${days} days ago`;
        }

        const homeAvgBefore = changes[0]?.teamAvgElo ?? 0;
        const awayAvgBefore = changes[0]?.opponentTeamAvgElo ?? 0;
        const expectedHome = 1 / (1 + Math.pow(10, (awayAvgBefore - homeAvgBefore) / 400));
        const isUpset =
          (homeWins && homeAvgBefore < awayAvgBefore - 50 && expectedHome < 0.35) ||
          (awayWins && awayAvgBefore < homeAvgBefore - 50 && expectedHome > 0.65);

        return {
          id: match.id,
          tag: `${fmt} · ${gameName}`,
          when,
          homeNames: match.homePlayers.map((p) => p.username.split(' ')[0]).join(' & '),
          awayNames: match.awayPlayers.map((p) => p.username.split(' ')[0]).join(' & '),
          homeScore: match.homeScore,
          awayScore: match.awayScore,
          homeWins,
          awayWins,
          isDraw,
          homeDelta,
          awayDelta,
          eloChanges: changes,
          homeTeamAvgElo: homeAvgBefore,
          awayTeamAvgElo: awayAvgBefore,
          isUpset,
          isNew: when === 'Just now',
          overtime: match.overtime,
        };
      })
      .value();
  });

  return { matches, gameName: selectedGame };
}
