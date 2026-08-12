import _ from 'lodash';
import type { Match } from '@/stores/match';
import type { Player } from '@/stores/player';
import { BASE_ELO, calculateEloRatings } from '@/utils/elo';

export interface TeamSplit {
  home: Player[];
  away: Player[];
}

/**
 * Current elo ratings for a single game, including players who have not played
 * it yet (they start from BASE_ELO).
 */
export function getPlayerElos(gameMatches: Match[], playersList: Player[]): { [key: string]: number } {
  const allPlayersInGame = _.chain(gameMatches)
    .flatMap(m => [...m.homePlayers, ...m.awayPlayers])
    .concat(playersList)
    .uniqBy('id')
    .map(p => [p])
    .value();

  const { eloRatings } = calculateEloRatings(gameMatches, allPlayersInGame);

  return eloRatings;
}

// Generate all combinations of size k from array
const getCombinations = <T,>(array: T[], k: number): T[][] => {
  if (k === 0) return [[]];
  if (array.length === 0) return [];

  const [first, ...rest] = array;
  const withFirst = getCombinations(rest, k - 1).map(combo => [first, ...combo]);
  const withoutFirst = getCombinations(rest, k);

  return [...withFirst, ...withoutFirst];
};

// Find the best team split by trying all combinations (for small groups)
const findBestTeamSplit = (playersWithElo: { player: Player, elo: number }[]): TeamSplit => {
  const n = playersWithElo.length;
  const halfSize = Math.floor(n / 2);

  let bestSplit = { home: [] as Player[], away: [] as Player[], diff: Infinity, homeAvgElo: 0, awayAvgElo: 0 };

  // For odd numbers, try both possible team sizes to find best balance
  const sizesToTry = n % 2 === 0 ? [halfSize] : [halfSize, halfSize + 1];

  for (const teamSize of sizesToTry) {
    const combinations = getCombinations(playersWithElo, teamSize);

    for (const homeTeam of combinations) {
      const homeIds = new Set(homeTeam.map(p => p.player.id));
      const awayTeam = playersWithElo.filter(p => !homeIds.has(p.player.id));

      const homeAvgElo = _.meanBy(homeTeam, 'elo');
      const awayAvgElo = _.meanBy(awayTeam, 'elo');
      const diff = Math.abs(homeAvgElo - awayAvgElo);

      if (diff < bestSplit.diff) {
        bestSplit = {
          home: homeTeam.map(p => p.player),
          away: awayTeam.map(p => p.player),
          diff,
          homeAvgElo,
          awayAvgElo
        };
      }
    }
  }

  const { home, away, homeAvgElo, awayAvgElo } = bestSplit;
  const betterElo = Math.max(homeAvgElo, awayAvgElo);
  const worseElo = Math.min(homeAvgElo, awayAvgElo);
  const pWorseHome = Math.min(1, (betterElo / Math.max(worseElo, 1)) * 100 / 2 / 100);
  const worsePlayers = homeAvgElo <= awayAvgElo ? home : away;
  const betterPlayers = homeAvgElo <= awayAvgElo ? away : home;
  if (Math.random() < pWorseHome) {
    return { home: worsePlayers, away: betterPlayers };
  }
  return { home: betterPlayers, away: worsePlayers };
};

// Snake draft approach for larger groups
const snakeDraftTeams = (playersWithElo: { player: Player, elo: number }[]): TeamSplit => {
  const home: Player[] = [];
  const away: Player[] = [];

  // Snake draft: 1st to home, 2nd to away, 3rd to away, 4th to home, etc.
  playersWithElo.forEach((p, index) => {
    const round = Math.floor(index / 2);
    if (round % 2 === 0) {
      if (index % 2 === 0) {
        home.push(p.player);
      } else {
        away.push(p.player);
      }
    } else {
      if (index % 2 === 0) {
        away.push(p.player);
      } else {
        home.push(p.player);
      }
    }
  });

  const homeIds = new Set(home.map(p => p.id));
  const homeAvgElo = _.meanBy(playersWithElo.filter(pe => homeIds.has(pe.player.id)), 'elo');
  const awayAvgElo = _.meanBy(playersWithElo.filter(pe => !homeIds.has(pe.player.id)), 'elo');
  const betterElo = Math.max(homeAvgElo, awayAvgElo);
  const worseElo = Math.min(homeAvgElo, awayAvgElo);
  const pWorseHome = Math.min(1, (betterElo / Math.max(worseElo, 1)) * 100 / 2 / 100);
  const worsePlayers = homeAvgElo <= awayAvgElo ? home : away;
  const betterPlayers = homeAvgElo <= awayAvgElo ? away : home;
  if (Math.random() < pWorseHome) {
    return { home: _.shuffle(worsePlayers), away: _.shuffle(betterPlayers) };
  }
  return { home: _.shuffle(betterPlayers), away: _.shuffle(worsePlayers) };
};

/**
 * Balance teams based on elo to make them as even as possible. A small random
 * variance keeps repeated line-ups from always being identical.
 */
export function balanceTeamsByElo(playersList: Player[], eloRatings: { [key: string]: number }): TeamSplit {
  const randomVariance = 40;
  const playersWithElo = playersList.map(p => ({
    player: p,
    elo: (eloRatings[p.id] || BASE_ELO) + (Math.random() * 2 - 1) * randomVariance
  }));

  const sortedPlayers = _.orderBy(playersWithElo, ['elo'], ['desc']);

  if (playersList.length <= 10) {
    return findBestTeamSplit(sortedPlayers);
  }

  return snakeDraftTeams(sortedPlayers);
}

/** Split players into two teams at random, keeping the sizes as even as possible. */
export function splitRandomTeams(playersList: Player[]): TeamSplit {
  const home: Player[] = [];
  const away: Player[] = [];
  const shuffled = _.shuffle(playersList);

  _.forEach(shuffled, player => {
    if (home.length < away.length) {
      home.push(player);
    } else if (home.length > away.length) {
      away.push(player);
    } else {
      const random = Math.random() >= 0.5;
      if (random) {
        home.push(player);
      } else {
        away.push(player);
      }
    }
  });

  return { home, away };
}
