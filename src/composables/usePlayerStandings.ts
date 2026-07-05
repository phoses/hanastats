import { computed } from 'vue';
import _ from 'lodash';
import type { Player } from '@/stores/player';
import type { Match } from '@/stores/match';
import { calculateEloHistory, calculateEloRatings, BASE_ELO } from '@/utils/elo';
import { getInitials, getPlayerColor, getShortName } from '@/utils/playerUi';
import { useMatchFilters } from './useMatchFilters';
import { useUiStore } from '@/stores/ui';

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
  overtimeLosses: number;
  overtimeWins: number;
  regularTimeWins: number;
  regularTimeLosses: number;
  winPct: number;
  pointsPct: string;
  points: number;
  maximumPoints: number;
  goalsFor: number;
  goalsAgainst: number;
  goalsDiff: number;
  streakType: 'W' | 'L';
  streakCount: number;
  form: ('W' | 'L' | 'D')[];
  hist: number[];
  peakElo: number;
  avgMargin: string;
  topRival: string;
  trendUp: boolean;
  validResult: boolean;
  ownsGame: boolean;
  matches: number;
}

function teamHasPlayer(team: Player[], playerId: string): boolean {
  return team.some((p) => p.id === playerId);
}

function teamContainsPlayers(team: Player[], players: Player[], wholeTeam: boolean): boolean {
  if (wholeTeam) {
    return team.map((p) => p.id).join(',') === players.map((p) => p.id).join(',');
  }
  return players.every((p) => teamHasPlayer(team, p.id));
}

function getResultForSide(
  match: Match,
  side: Player[],
  wholeTeam: boolean
): 'W' | 'L' | 'D' {
  const onHome = teamContainsPlayers(match.homePlayers, side, wholeTeam);
  const onAway = teamContainsPlayers(match.awayPlayers, side, wholeTeam);
  if (!onHome && !onAway) return 'L';

  if (match.homeScore === match.awayScore) return 'D';
  if (onHome) return match.homeScore > match.awayScore ? 'W' : 'L';
  return match.awayScore > match.homeScore ? 'W' : 'L';
}

function calcStreak(form: ('W' | 'L' | 'D')[]): { type: 'W' | 'L'; count: number } {
  const streakForm = form.map((r) => (r === 'W' ? 'W' : 'L'));
  if (streakForm.length === 0) return { type: 'W', count: 0 };
  const type = streakForm[0];
  let count = 0;
  for (const r of streakForm) {
    if (r === type) count++;
    else break;
  }
  return { type, count };
}

function matchOpposesRival(
  match: Match,
  side: Player[],
  rivalId: string,
  wholeTeam: boolean
): boolean {
  const onHome = teamContainsPlayers(match.homePlayers, side, wholeTeam);
  const onAway = teamContainsPlayers(match.awayPlayers, side, wholeTeam);
  if (!onHome && !onAway) return false;
  const opponents = onHome ? match.awayPlayers : match.homePlayers;
  return opponents.some((p) => p.id === rivalId);
}

function findTopRival(side: Player[], matches: Match[], wholeTeam: boolean): string {
  const playerId = side[0]?.id;
  if (!playerId) return '—';

  const rivalCounts: Record<string, number> = {};
  matches.forEach((match) => {
    const onHome = teamContainsPlayers(match.homePlayers, side, wholeTeam);
    const onAway = teamContainsPlayers(match.awayPlayers, side, wholeTeam);
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
  const h2hMatches = matches.filter((m) => matchOpposesRival(m, side, topId, wholeTeam));
  const wins = h2hMatches.filter((m) => getResultForSide(m, side, wholeTeam) === 'W').length;
  const losses = h2hMatches.filter((m) => getResultForSide(m, side, wholeTeam) === 'L').length;
  return rival ? `vs ${getShortName(rival.username)} ${wins}–${losses}` : '—';
}

export function getValidPlayerIds(matches: Match[]): Set<string> {
  if (matches.length === 0) return new Set();
  const threshold = Math.floor(matches.length * 0.122);
  const counts: Record<string, number> = {};
  matches.forEach((m) => {
    [...m.homePlayers, ...m.awayPlayers].forEach((p) => {
      counts[p.id] = (counts[p.id] ?? 0) + 1;
    });
  });
  return new Set(Object.keys(counts).filter((id) => counts[id] > threshold));
}

const percentageFormat = new Intl.NumberFormat('en-US', {
  minimumIntegerDigits: 1,
  minimumFractionDigits: 3,
});

function formatPointsPct(points: number, maximumPoints: number): string {
  if (maximumPoints === 0) return '0.000';
  const ratio = points / maximumPoints;
  if (ratio === 1) return '1.00';
  return percentageFormat.format(ratio).substring(1);
}

export function usePlayerStandings() {
  const { filteredMatches, uniqueTeams, teamKey } = useMatchFilters();
  const uiStore = useUiStore();

  const playerIds = computed(() => {
    const ids = filteredMatches.value.flatMap((m) =>
      [...m.homePlayers, ...m.awayPlayers].map((p) => p.id)
    );
    return _.uniq(ids);
  });

  const standings = computed((): PlayerStanding[] => {
    const matches = filteredMatches.value;
    if (matches.length === 0) return [];

    const wholeTeam = uiStore.standingsAsWholeTeam;
    const sides = wholeTeam
      ? uniqueTeams.value
      : _.chain(matches)
          .flatMap((m) => [...m.homePlayers, ...m.awayPlayers])
          .uniqBy('id')
          .map((p) => [p])
          .value();

    const players = _.chain(matches)
      .flatMap((m) => [...m.homePlayers, ...m.awayPlayers])
      .uniqBy('id')
      .value();

    const playerArrays = players.map((p) => [p]);
    const { eloRatings } = calculateEloRatings(matches, playerArrays);
    const { playerEloHistory } = calculateEloHistory(matches, playerArrays);

    const averagePlayedGamesByPlayerOrTeam = Math.floor(matches.length * 0.122);

    return sides
      .map((side) => {
        const sideMatches = _.sortBy(
          matches.filter(
            (m) =>
              teamContainsPlayers(m.homePlayers, side, wholeTeam) ||
              teamContainsPlayers(m.awayPlayers, side, wholeTeam)
          ),
          'played'
        );

        const form = _.chain(sideMatches)
          .reverse()
          .map((m) => getResultForSide(m, side, wholeTeam))
          .take(6)
          .value() as ('W' | 'L' | 'D')[];

        const wins = sideMatches.filter((m) => getResultForSide(m, side, wholeTeam) === 'W');
        const losses = sideMatches.filter((m) => getResultForSide(m, side, wholeTeam) === 'L');
        const draws = sideMatches.filter((m) => getResultForSide(m, side, wholeTeam) === 'D');

        const overtimeWins = wins.filter((m) => m.overtime);
        const overtimeLosses = losses.filter((m) => m.overtime);
        const regularTimeWins = wins.filter((m) => !m.overtime);
        const regularTimeLosses = losses.filter((m) => !m.overtime);

        const points =
          _.sumBy(wins, (m) => (m.overtime ? m.game?.pointsForOTWin ?? 0 : m.game?.pointsForWin ?? 0)) +
          _.sumBy(losses, (m) => (m.overtime ? m.game?.pointsForOTLose ?? 0 : 0)) +
          _.sumBy(draws, (m) => m.game?.pointsForDraw ?? 0);

        const maximumPoints = _.sumBy(sideMatches, (m) => m.game?.pointsForWin ?? 0);
        const pointsPct = formatPointsPct(points, maximumPoints);

        const goalsFor = _.sumBy(sideMatches, (m) => {
          const onHome = teamContainsPlayers(m.homePlayers, side, wholeTeam);
          return onHome ? m.homeScore : m.awayScore;
        });
        const goalsAgainst = _.sumBy(sideMatches, (m) => {
          const onHome = teamContainsPlayers(m.homePlayers, side, wholeTeam);
          return onHome ? m.awayScore : m.homeScore;
        });

        const decided = wins.length + losses.length;
        const winPct = decided ? Math.round((wins.length / decided) * 100) : 0;

        const displayName = side.map((p) => p.username).join(', ');
        const primaryPlayer = side[0];
        const history = primaryPlayer
          ? (playerEloHistory[primaryPlayer.username] ?? [{ date: 0, elo: BASE_ELO }])
          : [{ date: 0, elo: BASE_ELO }];
        const hist = history.slice(-10).map((h) => h.elo);
        const peakElo = Math.round(_.max(history.map((h) => h.elo)) ?? BASE_ELO);

        const margins = sideMatches.map((m) => {
          const onHome = teamContainsPlayers(m.homePlayers, side, wholeTeam);
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

        const elo =
          !wholeTeam && side.length === 1
            ? Math.round(eloRatings[side[0].id] ?? BASE_ELO)
            : 0;

        const ownsGame =
          side.length === 1 &&
          uiStore.gameFilterId !== 'all' &&
          !!primaryPlayer?.ownedGames?.includes(uiStore.gameFilterId);

        return {
          id: wholeTeam ? teamKey(side) : side[0].id,
          name: displayName,
          shortName: getShortName(displayName),
          initials: getInitials(displayName),
          color: getPlayerColor(side[0].id, playerIds.value),
          elo,
          wins: wins.length,
          losses: losses.length,
          draws: draws.length,
          overtimeLosses: overtimeLosses.length,
          overtimeWins: overtimeWins.length,
          regularTimeWins: regularTimeWins.length,
          regularTimeLosses: regularTimeLosses.length,
          winPct,
          pointsPct,
          points,
          maximumPoints,
          goalsFor,
          goalsAgainst,
          goalsDiff: goalsFor - goalsAgainst,
          streakType: streak.type,
          streakCount: streak.count,
          form,
          hist,
          peakElo,
          avgMargin,
          topRival: findTopRival(side, sideMatches, wholeTeam),
          trendUp,
          validResult: sideMatches.length > averagePlayedGamesByPlayerOrTeam,
          ownsGame,
          matches: sideMatches.length,
        };
      })
      .sort((a, b) => {
        if (a.validResult !== b.validResult) return a.validResult ? -1 : 1;
        if (a.elo !== b.elo) return b.elo - a.elo;
        const aPct = a.maximumPoints ? a.points / a.maximumPoints : 0;
        const bPct = b.maximumPoints ? b.points / b.maximumPoints : 0;
        if (aPct !== bPct) return bPct - aPct;
        return b.points - a.points;
      });
  });

  const validStandings = computed(() => standings.value.filter((p) => p.validResult));

  const validPlayerIds = computed(() => getValidPlayerIds(filteredMatches.value));

  return { standings, validStandings, validPlayerIds, playerIds };
}
