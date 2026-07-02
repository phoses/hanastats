import _ from 'lodash';
import { BASE_ELO, calculateEloRatings, type Match as EloMatch, type Player } from './elo';

export interface GoalPredictionMatch extends EloMatch {
  game?: { id: string };
}

export interface GoalPrediction {
  homeExpectedGoals: number;
  awayExpectedGoals: number;
  homeWinProbability: number;
  drawProbability: number;
  awayWinProbability: number;
  mostLikelyScorelines: { home: number; away: number; probability: number }[];
  confidence: 'low' | 'medium' | 'high';
  headToHeadMatches: number;
  basedOnMatches: number;
}

const PRIOR_WEIGHT = 3;

// Minimum size of the scoreline grid. The actual cap is derived from the
// highest score observed in the game's history (plus a margin) so the model
// adapts to both low-scoring games (e.g. football) and high-scoring, race-to-N
// games (e.g. table tennis to 11).
const MIN_SCORELINE_CAP = 8;
const SCORELINE_CAP_MARGIN = 2;

// Weights for blending the player-rate model with the ELO anchor (must sum to 1).
const PLAYER_RATE_WEIGHT = 0.65;
const ELO_WEIGHT = 0.35;

// How strongly ELO win probability skews the split of the average total goals.
// Tunable heuristic; would ideally be calibrated against historical outcomes.
const ELO_GOAL_SHARE_SENSITIVITY = 0.65;

// Dixon-Coles low-score dependency parameter. Negative rho increases the
// probability mass on 0-0 and 1-1 and reduces 1-0 and 0-1, correcting the
// independence assumption of the raw double-Poisson model.
const DIXON_COLES_RHO = -0.1;

const getExpectedWinProbability = (ratingA: number, ratingB: number): number => {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
};

const factorial = (n: number): number => {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
};

const poissonProbability = (goals: number, lambda: number): number => {
  if (lambda <= 0) return goals === 0 ? 1 : 0;
  return (Math.pow(lambda, goals) * Math.exp(-lambda)) / factorial(goals);
};

const getPlayerSideStats = (
  matches: GoalPredictionMatch[],
  playerId: string,
  leagueAvgGoalsFor: number,
  leagueAvgGoalsAgainst: number
) => {
  const playerMatches = matches.filter(
    m => m.homePlayers.some(p => p.id === playerId) || m.awayPlayers.some(p => p.id === playerId)
  );

  if (playerMatches.length === 0) {
    return {
      games: 0,
      goalsForPerGame: leagueAvgGoalsFor,
      goalsAgainstPerGame: leagueAvgGoalsAgainst,
    };
  }

  const goalsFor = _.sumBy(playerMatches, m =>
    m.homePlayers.some(p => p.id === playerId) ? m.homeScore : m.awayScore
  );
  const goalsAgainst = _.sumBy(playerMatches, m =>
    m.homePlayers.some(p => p.id === playerId) ? m.awayScore : m.homeScore
  );

  const games = playerMatches.length;
  const rawGoalsForPerGame = goalsFor / games;
  const rawGoalsAgainstPerGame = goalsAgainst / games;

  return {
    games,
    goalsForPerGame: (rawGoalsForPerGame * games + leagueAvgGoalsFor * PRIOR_WEIGHT) / (games + PRIOR_WEIGHT),
    goalsAgainstPerGame: (rawGoalsAgainstPerGame * games + leagueAvgGoalsAgainst * PRIOR_WEIGHT) / (games + PRIOR_WEIGHT),
  };
};

const samePlayerSet = (playersA: Player[], playersB: Player[]): boolean => {
  const idsA = new Set(playersA.map(p => p.id));
  const idsB = new Set(playersB.map(p => p.id));
  return idsA.size === idsB.size && [...idsA].every(id => idsB.has(id));
};

const findExactHeadToHead = (
  matches: GoalPredictionMatch[],
  homePlayers: Player[],
  awayPlayers: Player[]
) => {
  return matches.filter(
    m =>
      samePlayerSet(m.homePlayers, homePlayers) && samePlayerSet(m.awayPlayers, awayPlayers)
  );
};

const findReversedHeadToHead = (
  matches: GoalPredictionMatch[],
  homePlayers: Player[],
  awayPlayers: Player[]
) => {
  return matches.filter(
    m =>
      samePlayerSet(m.homePlayers, awayPlayers) && samePlayerSet(m.awayPlayers, homePlayers)
  );
};

/**
 * Dixon-Coles adjustment factor for low-scoring correlated results.
 */
const dixonColesTau = (
  home: number,
  away: number,
  homeLambda: number,
  awayLambda: number
): number => {
  if (home === 0 && away === 0) return 1 - homeLambda * awayLambda * DIXON_COLES_RHO;
  if (home === 0 && away === 1) return 1 + homeLambda * DIXON_COLES_RHO;
  if (home === 1 && away === 0) return 1 + awayLambda * DIXON_COLES_RHO;
  if (home === 1 && away === 1) return 1 - DIXON_COLES_RHO;
  return 1;
};

/**
 * Build a normalized scoreline probability grid using a Dixon-Coles adjusted
 * double-Poisson model. Both outcome and scoreline probabilities derive from it.
 */
const buildScoreGrid = (
  homeLambda: number,
  awayLambda: number,
  scoreCap: number
): { home: number; away: number; probability: number }[] => {
  const grid: { home: number; away: number; probability: number }[] = [];
  let total = 0;

  for (let home = 0; home <= scoreCap; home++) {
    for (let away = 0; away <= scoreCap; away++) {
      const probability =
        poissonProbability(home, homeLambda) *
        poissonProbability(away, awayLambda) *
        dixonColesTau(home, away, homeLambda, awayLambda);
      grid.push({ home, away, probability });
      total += probability;
    }
  }

  const norm = total || 1;
  return grid.map(cell => ({ ...cell, probability: cell.probability / norm }));
};

const calculateOutcomeProbabilities = (
  grid: { home: number; away: number; probability: number }[]
): { homeWin: number; draw: number; awayWin: number } => {
  let homeWin = 0;
  let draw = 0;
  let awayWin = 0;

  grid.forEach(({ home, away, probability }) => {
    if (home > away) homeWin += probability;
    else if (home === away) draw += probability;
    else awayWin += probability;
  });

  const total = homeWin + draw + awayWin || 1;
  return {
    homeWin: homeWin / total,
    draw: draw / total,
    awayWin: awayWin / total,
  };
};

const roundGoals = (value: number): number => Math.round(value * 10) / 10;

export const predictMatchGoals = (
  matches: GoalPredictionMatch[],
  homePlayers: Player[],
  awayPlayers: Player[]
): GoalPrediction | null => {
  if (homePlayers.length === 0 || awayPlayers.length === 0) {
    return null;
  }

  if (matches.length === 0) {
    return {
      homeExpectedGoals: 1,
      awayExpectedGoals: 1,
      homeWinProbability: 0.33,
      drawProbability: 0.34,
      awayWinProbability: 0.33,
      mostLikelyScorelines: [{ home: 1, away: 1, probability: 0.1 }],
      confidence: 'low',
      headToHeadMatches: 0,
      basedOnMatches: 0,
    };
  }

  const leagueAvgGoalsFor = _.meanBy(matches, m => m.homeScore);
  const leagueAvgGoalsAgainst = _.meanBy(matches, m => m.awayScore);
  const leagueAvgPerTeam = (leagueAvgGoalsFor + leagueAvgGoalsAgainst) / 2;

  const maxObservedScore = _.max(matches.flatMap(m => [m.homeScore, m.awayScore])) ?? MIN_SCORELINE_CAP;
  const scoreCap = Math.max(MIN_SCORELINE_CAP, maxObservedScore + SCORELINE_CAP_MARGIN);

  const allPlayers = _.uniqBy([...homePlayers, ...awayPlayers], 'id');
  const playerStats = Object.fromEntries(
    allPlayers.map(player => [
      player.id,
      getPlayerSideStats(matches, player.id, leagueAvgPerTeam, leagueAvgPerTeam),
    ])
  );

  const homeAttack = _.meanBy(homePlayers, p => playerStats[p.id].goalsForPerGame);
  const homeDefense = _.meanBy(homePlayers, p => playerStats[p.id].goalsAgainstPerGame);
  const awayAttack = _.meanBy(awayPlayers, p => playerStats[p.id].goalsForPerGame);
  const awayDefense = _.meanBy(awayPlayers, p => playerStats[p.id].goalsAgainstPerGame);

  const playerRateHomeXg = (homeAttack * awayDefense) / Math.max(leagueAvgPerTeam, 0.1);
  const playerRateAwayXg = (awayAttack * homeDefense) / Math.max(leagueAvgPerTeam, 0.1);

  const exactHeadToHead = findExactHeadToHead(matches, homePlayers, awayPlayers);
  const reversedHeadToHead = findReversedHeadToHead(matches, homePlayers, awayPlayers);

  let headToHeadHomeXg = playerRateHomeXg;
  let headToHeadAwayXg = playerRateAwayXg;
  let headToHeadWeight = 0;

  if (exactHeadToHead.length > 0) {
    headToHeadHomeXg = _.meanBy(exactHeadToHead, m => m.homeScore);
    headToHeadAwayXg = _.meanBy(exactHeadToHead, m => m.awayScore);
    headToHeadWeight = Math.min(0.7, 0.25 + exactHeadToHead.length * 0.15);
  } else if (reversedHeadToHead.length > 0) {
    headToHeadHomeXg = _.meanBy(reversedHeadToHead, m => m.awayScore);
    headToHeadAwayXg = _.meanBy(reversedHeadToHead, m => m.homeScore);
    headToHeadWeight = Math.min(0.55, 0.2 + reversedHeadToHead.length * 0.12);
  }

  const allPlayersForElo = _.chain(matches)
    .flatMap(m => [...m.homePlayers, ...m.awayPlayers])
    .concat(allPlayers)
    .uniqBy('id')
    .map(p => [p])
    .value();

  const { eloRatings } = calculateEloRatings(matches, allPlayersForElo);
  const homeAvgElo = _.meanBy(homePlayers, p => eloRatings[p.id] || BASE_ELO);
  const awayAvgElo = _.meanBy(awayPlayers, p => eloRatings[p.id] || BASE_ELO);
  const homeWinProbFromElo = getExpectedWinProbability(homeAvgElo, awayAvgElo);

  const avgTotalGoals = _.meanBy(matches, m => m.homeScore + m.awayScore);
  const eloHomeShare = 0.5 + (homeWinProbFromElo - 0.5) * ELO_GOAL_SHARE_SENSITIVITY;
  const eloHomeXg = avgTotalGoals * eloHomeShare;
  const eloAwayXg = avgTotalGoals * (1 - eloHomeShare);

  const playerRateWeight = 1 - headToHeadWeight;
  const blendedHomeXg =
    headToHeadWeight * headToHeadHomeXg +
    playerRateWeight * (PLAYER_RATE_WEIGHT * playerRateHomeXg + ELO_WEIGHT * eloHomeXg);
  const blendedAwayXg =
    headToHeadWeight * headToHeadAwayXg +
    playerRateWeight * (PLAYER_RATE_WEIGHT * playerRateAwayXg + ELO_WEIGHT * eloAwayXg);

  const homeLambda = Math.max(0, blendedHomeXg);
  const awayLambda = Math.max(0, blendedAwayXg);

  const homeExpectedGoals = roundGoals(homeLambda);
  const awayExpectedGoals = roundGoals(awayLambda);

  const scoreGrid = buildScoreGrid(homeLambda, awayLambda, scoreCap);
  const outcomes = calculateOutcomeProbabilities(scoreGrid);
  const mostLikelyScorelines = _.orderBy(scoreGrid, ['probability'], ['desc']).slice(0, 5);

  const minPlayerGames = _.min(allPlayers.map(p => playerStats[p.id].games)) ?? 0;
  const headToHeadMatches = exactHeadToHead.length + reversedHeadToHead.length;

  let confidence: GoalPrediction['confidence'] = 'low';
  if (headToHeadMatches >= 2 || (minPlayerGames >= 8 && matches.length >= 20)) {
    confidence = 'high';
  } else if (headToHeadMatches >= 1 || minPlayerGames >= 4 || matches.length >= 10) {
    confidence = 'medium';
  }

  return {
    homeExpectedGoals,
    awayExpectedGoals,
    homeWinProbability: Math.round(outcomes.homeWin * 100),
    drawProbability: Math.round(outcomes.draw * 100),
    awayWinProbability: Math.round(outcomes.awayWin * 100),
    mostLikelyScorelines: mostLikelyScorelines.map(s => ({
      ...s,
      probability: Math.round(s.probability * 1000) / 10,
    })),
    confidence,
    headToHeadMatches,
    basedOnMatches: matches.length,
  };
};
