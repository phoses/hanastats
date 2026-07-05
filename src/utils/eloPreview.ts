import type { Player } from '@/stores/player';
import { BASE_ELO } from './elo';

const K_FACTOR = 32;

export function getExpectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

export function teamAvgElo(players: Player[], eloRatings: Record<string, number>): number {
  if (players.length === 0) return BASE_ELO;
  const total = players.reduce((sum, p) => sum + (eloRatings[p.id] ?? BASE_ELO), 0);
  return Math.round(total / players.length);
}

export interface ProjectedEloChange {
  playerId: string;
  playerName: string;
  team: 'Home' | 'Away';
  delta: number;
  newElo: number;
}

export function projectEloChanges(
  homePlayers: Player[],
  awayPlayers: Player[],
  homeScore: number,
  awayScore: number,
  eloRatings: Record<string, number>
): ProjectedEloChange[] {
  const avgA = teamAvgElo(homePlayers, eloRatings);
  const avgB = teamAvgElo(awayPlayers, eloRatings);
  const expA = getExpectedScore(avgA, avgB);
  const actualA = homeScore > awayScore ? 1 : homeScore < awayScore ? 0 : 0.5;
  const dA = Math.round(K_FACTOR * (actualA - expA));
  const dB = -dA;

  const mapTeam = (players: Player[], delta: number, team: 'Home' | 'Away') =>
    players.map((p) => {
      const old = eloRatings[p.id] ?? BASE_ELO;
      return {
        playerId: p.id,
        playerName: p.username,
        team,
        delta,
        newElo: old + delta,
      };
    });

  return [...mapTeam(homePlayers, dA, 'Home'), ...mapTeam(awayPlayers, dB, 'Away')];
}

export function winProbability(homeAvg: number, awayAvg: number): number {
  return getExpectedScore(homeAvg, awayAvg);
}
