import { computed } from 'vue';
import _ from 'lodash';
import type { Player } from '@/stores/player';
import type { Match } from '@/stores/match';
import { calculateEloHistory, calculateEloRatings, BASE_ELO } from '@/utils/elo';
import { getInitials, getPlayerColor, getShortName } from '@/utils/playerUi';
import { useFilteredMatches } from './useFilteredMatches';

export interface PlayerStanding {
  id: string;
  name: string;
  shortName: string;
  initials: string;
  color: string;
  elo: number;
  wins: number;
  losses: number;
  draws: number;
  winPct: number;
  streakType: 'W' | 'L' | 'D';
  streakCount: number;
  form: ('W' | 'L' | 'D')[];
  hist: number[];
  peakElo: number;
  avgMargin: string;
  topRival: string;
  trendUp: boolean;
}

function teamHasPlayer(team: Player[], playerId: string): boolean {
  return team.some((p) => p.id === playerId);
}

function getResultForPlayer(match: Match, playerId: string): 'W' | 'L' | 'D' {
  const onHome = teamHasPlayer(match.homePlayers, playerId);
  const onAway = teamHasPlayer(match.awayPlayers, playerId);
  if (!onHome && !onAway) return 'L';

  if (match.homeScore === match.awayScore) return 'D';
  if (onHome) return match.homeScore > match.awayScore ? 'W' : 'L';
  return match.awayScore > match.homeScore ? 'W' : 'L';
}

function calcStreak(form: ('W' | 'L' | 'D')[]): { type: 'W' | 'L' | 'D'; count: number } {
  if (form.length === 0) return { type: 'W', count: 0 };
  const type = form[0];
  let count = 0;
  for (const r of form) {
    if (r === type) count++;
    else break;
  }
  return { type, count };
}

function findTopRival(playerId: string, matches: Match[]): string {
  const rivalCounts: Record<string, number> = {};

  matches.forEach((match) => {
    const onHome = teamHasPlayer(match.homePlayers, playerId);
    const onAway = teamHasPlayer(match.awayPlayers, playerId);
    if (!onHome && !onAway) return;

    const opponents = onHome ? match.awayPlayers : match.homePlayers;
    opponents.forEach((opp) => {
      rivalCounts[opp.id] = (rivalCounts[opp.id] ?? 0) + 1;
    });
  });

  const topId = _.maxBy(Object.keys(rivalCounts), (id) => rivalCounts[id]);
  if (!topId) return '—';

  const allMatches = matches.flatMap((m) => [...m.homePlayers, ...m.awayPlayers]);
  const rival = allMatches.find((p) => p.id === topId);
  const wins = matches.filter((m) => getResultForPlayer(m, playerId) === 'W').length;
  const losses = matches.filter((m) => getResultForPlayer(m, playerId) === 'L').length;
  return rival ? `vs ${getShortName(rival.username)} ${wins}–${losses}` : '—';
}

export function usePlayerStandings() {
  const { filteredMatches } = useFilteredMatches();

  const playerIds = computed(() => {
    const ids = filteredMatches.value.flatMap((m) =>
      [...m.homePlayers, ...m.awayPlayers].map((p) => p.id)
    );
    return _.uniq(ids);
  });

  const standings = computed((): PlayerStanding[] => {
    const matches = filteredMatches.value;
    if (matches.length === 0) return [];

    const players = _.chain(matches)
      .flatMap((m) => [...m.homePlayers, ...m.awayPlayers])
      .uniqBy('id')
      .value();

    const playerArrays = players.map((p) => [p]);
    const { eloRatings } = calculateEloRatings(matches, playerArrays);
    const { playerEloHistory } = calculateEloHistory(matches, playerArrays);

    return players
      .map((player) => {
        const playerMatches = _.sortBy(
          matches.filter(
            (m) =>
              teamHasPlayer(m.homePlayers, player.id) || teamHasPlayer(m.awayPlayers, player.id)
          ),
          'played'
        );

        const form = _.chain(playerMatches)
          .reverse()
          .map((m) => getResultForPlayer(m, player.id))
          .take(6)
          .value() as ('W' | 'L' | 'D')[];

        const wins = playerMatches.filter((m) => getResultForPlayer(m, player.id) === 'W').length;
        const losses = playerMatches.filter((m) => getResultForPlayer(m, player.id) === 'L').length;
        const draws = playerMatches.filter((m) => getResultForPlayer(m, player.id) === 'D').length;
        const total = wins + losses + draws;
        const winPct = total ? Math.round((wins / total) * 100) : 0;

        const history = playerEloHistory[player.username] ?? [{ date: 0, elo: BASE_ELO }];
        const hist = history.slice(-10).map((h) => h.elo);
        const peakElo = Math.round(_.max(hist) ?? BASE_ELO);

        const margins = playerMatches.map((m) => {
          const onHome = teamHasPlayer(m.homePlayers, player.id);
          const gf = onHome ? m.homeScore : m.awayScore;
          const ga = onHome ? m.awayScore : m.homeScore;
          return gf - ga;
        });
        const avgMargin =
          margins.length > 0
            ? `${margins.reduce((a, b) => a + b, 0) / margins.length >= 0 ? '+' : ''}${(margins.reduce((a, b) => a + b, 0) / margins.length).toFixed(1)}`
            : '0';

        const streak = calcStreak(form);
        const trendUp = hist.length >= 3 ? hist[hist.length - 1] >= hist[hist.length - 3] : true;

        return {
          id: player.id,
          name: player.username,
          shortName: getShortName(player.username),
          initials: getInitials(player.username),
          color: getPlayerColor(player.id, playerIds.value),
          elo: Math.round(eloRatings[player.id] ?? BASE_ELO),
          wins,
          losses,
          draws,
          winPct,
          streakType: streak.type,
          streakCount: streak.count,
          form,
          hist,
          peakElo,
          avgMargin,
          topRival: findTopRival(player.id, playerMatches),
          trendUp,
        };
      })
      .sort((a, b) => b.elo - a.elo);
  });

  return { standings, playerIds };
}
