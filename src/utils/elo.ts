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
    const homePlayersElo = match.homePlayers.map(p => eloRatings[p.id] || BASE_ELO);
    const awayPlayersElo = match.awayPlayers.map(p => eloRatings[p.id] || BASE_ELO);
    
    const homeTeamAvgElo = _.mean(homePlayersElo);
    const awayTeamAvgElo = _.mean(awayPlayersElo);
    
    // Determine actual scores (1 for win, 0.5 for draw, 0 for loss)
    let homeActual: number;
    let awayActual: number;
    
    if (match.homeScore > match.awayScore) {
      homeActual = 1;
      awayActual = 0;
    } else if (match.homeScore < match.awayScore) {
      homeActual = 0;
      awayActual = 1;
    } else {
      homeActual = 0.5;
      awayActual = 0.5;
    }
    
    // Track ELO changes for this match
    const matchChanges: EloChange[] = [];
    
    // Update ELO for each home player against average away team ELO
    match.homePlayers.forEach(player => {
      const oldElo = eloRatings[player.id] || BASE_ELO;
      const expectedScore = getExpectedScore(oldElo, awayTeamAvgElo);
      const newElo = Math.round(oldElo + K_FACTOR * (homeActual - expectedScore));
      const change = newElo - oldElo;
      
      matchChanges.push({
        playerId: player.id,
        playerName: player.username,
        oldElo,
        change,
        newElo,
        team: 'home'
      });
      
      eloRatings[player.id] = newElo;
    });
    
    // Update ELO for each away player against average home team ELO
    match.awayPlayers.forEach(player => {
      const oldElo = eloRatings[player.id] || BASE_ELO;
      const expectedScore = getExpectedScore(oldElo, homeTeamAvgElo);
      const newElo = Math.round(oldElo + K_FACTOR * (awayActual - expectedScore));
      const change = newElo - oldElo;
      
      matchChanges.push({
        playerId: player.id,
        playerName: player.username,
        oldElo,
        change,
        newElo,
        team: 'away'
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
    
    const homePlayersElo = match.homePlayers.map(p => eloRatings[p.id] || BASE_ELO);
    const awayPlayersElo = match.awayPlayers.map(p => eloRatings[p.id] || BASE_ELO);
    
    const homeTeamAvgElo = _.mean(homePlayersElo);
    const awayTeamAvgElo = _.mean(awayPlayersElo);
    
    let homeActual: number;
    let awayActual: number;
    
    if (match.homeScore > match.awayScore) {
      homeActual = 1;
      awayActual = 0;
    } else if (match.homeScore < match.awayScore) {
      homeActual = 0;
      awayActual = 1;
    } else {
      homeActual = 0.5;
      awayActual = 0.5;
    }
    
    const matchDate = typeof match.played === 'number' ? match.played : new Date(match.played).getTime();
    
    // Update ELO for home players
    match.homePlayers.forEach(player => {
      const oldElo = eloRatings[player.id] || BASE_ELO;
      const expectedScore = getExpectedScore(oldElo, awayTeamAvgElo);
      const newElo = Math.round(oldElo + K_FACTOR * (homeActual - expectedScore));
      eloRatings[player.id] = newElo;
      
      // Initialize player history if not exists
      if (!playerEloHistory[player.username]) {
        playerEloHistory[player.username] = [{ date: firstMatchDate, elo: BASE_ELO }];
      }
      playerEloHistory[player.username].push({ date: matchDate, elo: newElo });
    });
    
    // Update ELO for away players
    match.awayPlayers.forEach(player => {
      const oldElo = eloRatings[player.id] || BASE_ELO;
      const expectedScore = getExpectedScore(oldElo, homeTeamAvgElo);
      const newElo = Math.round(oldElo + K_FACTOR * (awayActual - expectedScore));
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

