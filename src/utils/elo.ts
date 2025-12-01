import _ from 'lodash';

export interface Player {
  id: string;
  username: string;
}

export interface Match {
  id?: string;
  played?: number;
  homeScore: number;
  awayScore: number;
  homePlayers: Player[];
  awayPlayers: Player[];
  overtime?: boolean;
}

export interface EloChange {
  playerId: string;
  playerName: string;
  oldElo: number;
  change: number;
  newElo: number;
  team: 'home' | 'away';
  teamAvgElo: number;
  opponentTeamAvgElo: number;
}

export interface EloHistoryPoint {
  date: number;
  elo: number;
}

export interface EloCalculationResult {
  eloRatings: { [key: string]: number };
  matchEloChanges: { [matchId: string]: EloChange[] };
}

export interface EloHistoryResult {
  playerEloHistory: { [playerName: string]: EloHistoryPoint[] };
  eloRatings: { [key: string]: number };
}

const K_FACTOR = 32; // Standard K-factor for ELO
const BASE_ELO = 1500;

/**
 * Calculate expected score for ELO rating system
 */
const getExpectedScore = (ratingA: number, ratingB: number): number => {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
};

/**
 * Calculate team average ELO rating
 */
const calculateTeamAvgElo = (
  players: Player[],
  eloRatings: { [key: string]: number }
): number => {
  const playersElo = players.map(p => eloRatings[p.id] || BASE_ELO);
  return _.mean(playersElo);
};

/**
 * Determine actual scores based on match result
 * Returns [homeActual, awayActual] where 1 = win, 0.5 = draw, 0 = loss
 */
const getMatchOutcome = (homeScore: number, awayScore: number): [number, number] => {
  if (homeScore > awayScore) {
    return [1, 0];
  } else if (homeScore < awayScore) {
    return [0, 1];
  } else {
    return [0.5, 0.5];
  }
};

/**
 * Calculate margin of victory multiplier
 * Uses logarithmic scaling: ln(|GoalDifference| + 1)
 * Returns at least 1.0 to ensure draws still have ELO changes
 */
const getMarginOfVictoryMultiplier = (goalDifference: number): number => {
  const absDiff = Math.abs(goalDifference);
  // For draws or very close games, use multiplier of 1
  if (absDiff === 0) {
    return 1.0;
  }
  // Otherwise use logarithmic scaling, with minimum of 1
  return Math.max(1.0, Math.log(absDiff + 1));
};

/**
 * Calculate ELO change for a team (to be applied to all players equally)
 */
const calculateTeamEloChange = (
  teamAvgElo: number,
  opponentTeamAvgElo: number,
  actualScore: number,
  goalDifference: number
): number => {
  const expectedScore = getExpectedScore(teamAvgElo, opponentTeamAvgElo);
  const movMultiplier = getMarginOfVictoryMultiplier(goalDifference);
  const dynamicK = K_FACTOR * movMultiplier;
  return Math.round(dynamicK * (actualScore - expectedScore));
};

/**
 * Calculate ELO ratings for all players based on match history
 * Returns current ELO ratings and changes per match
 */
export const calculateEloRatings = (
  matches: Match[],
  players: Player[][]
): EloCalculationResult => {
  // Initialize ELO ratings for all individual players
  const eloRatings: { [key: string]: number } = {};
  
  // Store ELO changes per match
  const matchEloChanges: { [matchId: string]: EloChange[] } = {};
  
  // Initialize all players with base ELO
  players.forEach(playerArray => {
    const playerId = playerArray[0].id;
    eloRatings[playerId] = BASE_ELO;
  });
  
  // Process matches chronologically
  const sortedMatches = _.sortBy(matches, 'played');
  
  sortedMatches.forEach(match => {
    // Calculate average ELO for each team
    const homeTeamAvgElo = calculateTeamAvgElo(match.homePlayers, eloRatings);
    const awayTeamAvgElo = calculateTeamAvgElo(match.awayPlayers, eloRatings);
    
    // Determine actual scores (1 for win, 0.5 for draw, 0 for loss)
    const [homeActual, awayActual] = getMatchOutcome(match.homeScore, match.awayScore);
    
    // Calculate goal difference for margin of victory
    const goalDifference = match.homeScore - match.awayScore;
    
    // Calculate ELO change based on team average (same for all players on each team)
    const homeEloChange = calculateTeamEloChange(homeTeamAvgElo, awayTeamAvgElo, homeActual, goalDifference);
    const awayEloChange = calculateTeamEloChange(awayTeamAvgElo, homeTeamAvgElo, awayActual, goalDifference);
    
    // Track ELO changes for this match
    const matchChanges: EloChange[] = [];
    
    // Apply the same ELO change to all home players
    match.homePlayers.forEach(player => {
      const oldElo = eloRatings[player.id] || BASE_ELO;
      const newElo = oldElo + homeEloChange;
      
      matchChanges.push({
        playerId: player.id,
        playerName: player.username,
        oldElo,
        change: homeEloChange,
        newElo,
        team: 'home',
        teamAvgElo: homeTeamAvgElo,
        opponentTeamAvgElo: awayTeamAvgElo
      });
      
      eloRatings[player.id] = newElo;
    });
    
    // Apply the same ELO change to all away players
    match.awayPlayers.forEach(player => {
      const oldElo = eloRatings[player.id] || BASE_ELO;
      const newElo = oldElo + awayEloChange;
      
      matchChanges.push({
        playerId: player.id,
        playerName: player.username,
        oldElo,
        change: awayEloChange,
        newElo,
        team: 'away',
        teamAvgElo: awayTeamAvgElo,
        opponentTeamAvgElo: homeTeamAvgElo
      });
      
      eloRatings[player.id] = newElo;
    });
    
    if (match.id) {
      matchEloChanges[match.id] = matchChanges;
    }
  });
  
  return { eloRatings, matchEloChanges };
};

/**
 * Calculate ELO history for all players for graphing purposes
 * Returns ELO progression over time for each player
 */
export const calculateEloHistory = (
  matches: Match[],
  players: Player[][]
): EloHistoryResult => {
  // Track ELO progression for each player
  const playerEloHistory: { [key: string]: EloHistoryPoint[] } = {};
  const eloRatings: { [key: string]: number } = {};
  
  // Process matches chronologically
  const sortedMatches = _.sortBy(matches, 'played');
  
  // Get the first match date for initialization
  const firstMatchDate = sortedMatches.length > 0 && sortedMatches[0].played
    ? (typeof sortedMatches[0].played === 'number' ? sortedMatches[0].played : new Date(sortedMatches[0].played).getTime())
    : Date.now();
  
  // Initialize all players with first match date
  players.forEach(playerArray => {
    const playerId = playerArray[0].id;
    const playerName = playerArray[0].username;
    eloRatings[playerId] = BASE_ELO;
    playerEloHistory[playerName] = [{ date: firstMatchDate, elo: BASE_ELO }];
  });
  
  sortedMatches.forEach(match => {
    if (!match.played) return;
    
    // Calculate average ELO for each team
    const homeTeamAvgElo = calculateTeamAvgElo(match.homePlayers, eloRatings);
    const awayTeamAvgElo = calculateTeamAvgElo(match.awayPlayers, eloRatings);
    
    // Determine actual scores (1 for win, 0.5 for draw, 0 for loss)
    const [homeActual, awayActual] = getMatchOutcome(match.homeScore, match.awayScore);
    
    // Calculate goal difference for margin of victory
    const goalDifference = match.homeScore - match.awayScore;
    
    // Calculate ELO change based on team average (same for all players on each team)
    const homeEloChange = calculateTeamEloChange(homeTeamAvgElo, awayTeamAvgElo, homeActual, goalDifference);
    const awayEloChange = calculateTeamEloChange(awayTeamAvgElo, homeTeamAvgElo, awayActual, goalDifference);
    
    const matchDate = typeof match.played === 'number' ? match.played : new Date(match.played).getTime();
    
    // Apply the same ELO change to all home players
    match.homePlayers.forEach(player => {
      const oldElo = eloRatings[player.id] || BASE_ELO;
      const newElo = oldElo + homeEloChange;
      eloRatings[player.id] = newElo;
      
      // Initialize player history if not exists
      if (!playerEloHistory[player.username]) {
        playerEloHistory[player.username] = [{ date: firstMatchDate, elo: BASE_ELO }];
      }
      playerEloHistory[player.username].push({ date: matchDate, elo: newElo });
    });
    
    // Apply the same ELO change to all away players
    match.awayPlayers.forEach(player => {
      const oldElo = eloRatings[player.id] || BASE_ELO;
      const newElo = oldElo + awayEloChange;
      eloRatings[player.id] = newElo;
      
      // Initialize player history if not exists
      if (!playerEloHistory[player.username]) {
        playerEloHistory[player.username] = [{ date: firstMatchDate, elo: BASE_ELO }];
      }
      playerEloHistory[player.username].push({ date: matchDate, elo: newElo });
    });
  });
  
  return { playerEloHistory, eloRatings };
};

