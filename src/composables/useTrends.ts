import { computed, type Ref } from 'vue';
import type { Match } from '@/stores/match';
import type { Player } from '@/stores/player';

export interface TrendRow {
  id: string;
  names: string;
  value: number;
  detail: string;
  note?: string;
}

export interface Trends {
  hot: TrendRow[];
  cold: TrendRow[];
  form: TrendRow[];
  longestWin: TrendRow[];
  longestLoss: TrendRow[];
  calendarStreak: TrendRow[];
  ironman: TrendRow[];
  inseparable: TrendRow[];
  winningDuo: TrendRow[];
  nemesis: TrendRow[];
  nailBiter: TrendRow[];
  nightShift: TrendRow[];
}

type Outcome = 'W' | 'L' | 'D';

const DAY_MS = 24 * 60 * 60 * 1000;
const RECENT_DAYS = 14;
const IRONMAN_DAYS = 7;
const FORM_WINDOW = 10;
const LIST_LIMIT = 5;
const NIGHT_HOUR = 21;

function emptyTrends(): Trends {
  return {
    hot: [],
    cold: [],
    form: [],
    longestWin: [],
    longestLoss: [],
    calendarStreak: [],
    ironman: [],
    inseparable: [],
    winningDuo: [],
    nemesis: [],
    nailBiter: [],
    nightShift: [],
  };
}

function playedAt(match: Match): number | null {
  return typeof match.played === 'number' ? match.played : null;
}

function datedMatches(matches: Match[]): Match[] {
  return matches.filter((match) => playedAt(match) !== null);
}

function newestPlayed(matches: Match[]): number {
  return Math.max(...matches.map((match) => playedAt(match) ?? 0));
}

function inWindow(match: Match, end: number, days: number): boolean {
  const at = playedAt(match);
  return at !== null && at >= end - days * DAY_MS && at <= end;
}

function isHome(match: Match, playerId: string): boolean {
  return match.homePlayers.some((player) => player.id === playerId);
}

function isAway(match: Match, playerId: string): boolean {
  return match.awayPlayers.some((player) => player.id === playerId);
}

function playersOn(match: Match): Player[] {
  return [...match.homePlayers, ...match.awayPlayers];
}

function outcomeFor(match: Match, playerId: string): Outcome | null {
  const home = isHome(match, playerId);
  const away = isAway(match, playerId);
  if (!home && !away) {
    return null;
  }
  if (match.homeScore === match.awayScore) {
    return 'D';
  }
  const won = home ? match.homeScore > match.awayScore : match.awayScore > match.homeScore;
  return won ? 'W' : 'L';
}

function pairsOnSide(players: Player[]): Array<[Player, Player]> {
  const pairs: Array<[Player, Player]> = [];
  for (let i = 0; i < players.length; i += 1) {
    for (let j = i + 1; j < players.length; j += 1) {
      pairs.push([players[i], players[j]]);
    }
  }
  return pairs;
}

function pairKey(left: Player, right: Player): string {
  return [left.id, right.id].sort().join('|');
}

function pairNames(left: Player, right: Player): string {
  return [left.username, right.username].sort((a, b) => a.localeCompare(b)).join(' & ');
}

function dayKey(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(key: string, amount: number): string {
  const [year, month, day] = key.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + amount);
  return dayKey(date.getTime());
}

function uniqueSortedDays(timestamps: number[]): string[] {
  return [...new Set(timestamps.map(dayKey))].sort();
}

function longestConsecutiveDays(days: string[]): number {
  if (days.length === 0) {
    return 0;
  }

  let best = 1;
  let run = 1;
  for (let index = 1; index < days.length; index += 1) {
    if (days[index] === addDays(days[index - 1], 1)) {
      run += 1;
      best = Math.max(best, run);
    } else {
      run = 1;
    }
  }
  return best;
}

function currentConsecutiveDays(days: string[]): number {
  if (days.length === 0) {
    return 0;
  }

  let run = 1;
  for (let index = days.length - 1; index > 0; index -= 1) {
    if (days[index] === addDays(days[index - 1], 1)) {
      run += 1;
    } else {
      break;
    }
  }
  return run;
}

function currentStreak(resultsNewestFirst: Outcome[]): { type: Outcome; length: number } {
  const first = resultsNewestFirst.find((result) => result !== 'D');
  if (!first) {
    return { type: 'D', length: 0 };
  }

  let length = 0;
  for (const result of resultsNewestFirst) {
    if (result === 'D' || result !== first) {
      break;
    }
    length += 1;
  }
  return { type: first, length };
}

function longestStreak(resultsOldestFirst: Outcome[], type: 'W' | 'L'): number {
  let best = 0;
  let run = 0;
  for (const result of resultsOldestFirst) {
    if (result === type) {
      run += 1;
      best = Math.max(best, run);
    } else {
      run = 0;
    }
  }
  return best;
}

function topRows(rows: TrendRow[], minValue = 1): TrendRow[] {
  return rows
    .filter((row) => row.value >= minValue)
    .sort((left, right) => right.value - left.value || left.names.localeCompare(right.names))
    .slice(0, LIST_LIMIT);
}

function collectPlayers(matches: Match[]): Map<string, Player> {
  const byId = new Map<string, Player>();
  for (const match of matches) {
    for (const player of playersOn(match)) {
      if (player?.id) {
        byId.set(player.id, player);
      }
    }
  }
  return byId;
}

function matchesForPlayer(matches: Match[], playerId: string): Match[] {
  return matches
    .filter((match) => isHome(match, playerId) || isAway(match, playerId))
    .sort((left, right) => (playedAt(left) ?? 0) - (playedAt(right) ?? 0));
}

export function computeTrends(matches: Match[]): Trends {
  const withDates = datedMatches(matches);
  if (withDates.length === 0) {
    return emptyTrends();
  }

  const end = newestPlayed(withDates);
  const recent = withDates.filter((match) => inWindow(match, end, RECENT_DAYS));
  const lastWeek = withDates.filter((match) => inWindow(match, end, IRONMAN_DAYS));
  const players = collectPlayers(withDates);

  const hot: TrendRow[] = [];
  const cold: TrendRow[] = [];
  const form: TrendRow[] = [];
  const longestWin: TrendRow[] = [];
  const longestLoss: TrendRow[] = [];
  const calendarStreak: TrendRow[] = [];
  const ironman: TrendRow[] = [];
  const nailBiter: TrendRow[] = [];
  const nightShift: TrendRow[] = [];

  for (const player of players.values()) {
    const playerMatches = matchesForPlayer(withDates, player.id);
    if (playerMatches.length === 0) {
      continue;
    }

    const outcomesOldest = playerMatches
      .map((match) => outcomeFor(match, player.id))
      .filter((outcome): outcome is Outcome => outcome !== null);
    const outcomesNewest = [...outcomesOldest].reverse();

    const current = currentStreak(outcomesNewest);
    if (current.type === 'W' && current.length >= 3) {
      hot.push({
        id: player.id,
        names: player.username,
        value: current.length,
        detail: `${current.length}W`,
      });
    }
    if (current.type === 'L' && current.length >= 3) {
      cold.push({
        id: player.id,
        names: player.username,
        value: current.length,
        detail: `${current.length}L`,
      });
    }

    const maxWin = longestStreak(outcomesOldest, 'W');
    const maxLoss = longestStreak(outcomesOldest, 'L');
    if (maxWin >= 3) {
      longestWin.push({
        id: player.id,
        names: player.username,
        value: maxWin,
        detail: `${maxWin}W`,
      });
    }
    if (maxLoss >= 3) {
      longestLoss.push({
        id: player.id,
        names: player.username,
        value: maxLoss,
        detail: `${maxLoss}L`,
      });
    }

    const lastTen = outcomesOldest.slice(-FORM_WINDOW);
    if (lastTen.length >= 5) {
      const wins = lastTen.filter((outcome) => outcome === 'W').length;
      const previousFive = lastTen.slice(-10, -5);
      const recentFive = lastTen.slice(-5);
      let note: string | undefined;
      if (previousFive.length === 5) {
        const recentWins = recentFive.filter((outcome) => outcome === 'W').length;
        const previousWins = previousFive.filter((outcome) => outcome === 'W').length;
        if (recentWins - previousWins >= 2) {
          note = 'heating up';
        } else if (previousWins - recentWins >= 2) {
          note = 'cooling off';
        }
      }
      form.push({
        id: player.id,
        names: player.username,
        value: wins + lastTen.length / 100,
        detail: lastTen.join(''),
        note,
      });
    }

    const days = uniqueSortedDays(playerMatches.map((match) => playedAt(match)!));
    const currentCalendar = currentConsecutiveDays(days);
    const longestCalendar = longestConsecutiveDays(days);
    if (currentCalendar >= 2) {
      calendarStreak.push({
        id: player.id,
        names: player.username,
        value: currentCalendar,
        detail: `${currentCalendar} days`,
        note: longestCalendar > currentCalendar ? `best ${longestCalendar}` : undefined,
      });
    } else if (longestCalendar >= 3) {
      calendarStreak.push({
        id: player.id,
        names: player.username,
        value: longestCalendar,
        detail: `${longestCalendar} days`,
        note: 'best run',
      });
    }

    const weekCount = lastWeek.filter((match) => isHome(match, player.id) || isAway(match, player.id)).length;
    if (weekCount >= 3) {
      ironman.push({
        id: player.id,
        names: player.username,
        value: weekCount,
        detail: `${weekCount} gp`,
      });
    }

    const closeGames = playerMatches.filter((match) => Math.abs(match.homeScore - match.awayScore) === 1).length;
    if (closeGames >= 3) {
      nailBiter.push({
        id: player.id,
        names: player.username,
        value: closeGames,
        detail: `${closeGames} close`,
      });
    }

    const nights = playerMatches.filter((match) => new Date(playedAt(match)!).getHours() >= NIGHT_HOUR).length;
    if (nights >= 3) {
      nightShift.push({
        id: player.id,
        names: player.username,
        value: nights,
        detail: `${nights} late`,
      });
    }
  }

  interface PairStat {
    key: string;
    names: string;
    played: number;
    wins: number;
  }

  const pairStats = new Map<string, PairStat>();

  function addPairPlay(left: Player, right: Player, won: boolean) {
    const key = pairKey(left, right);
    const existing = pairStats.get(key) ?? {
      key,
      names: pairNames(left, right),
      played: 0,
      wins: 0,
    };
    existing.played += 1;
    if (won) {
      existing.wins += 1;
    }
    pairStats.set(key, existing);
  }

  for (const match of recent) {
    const homeWon = match.homeScore > match.awayScore;
    const awayWon = match.awayScore > match.homeScore;
    for (const [left, right] of pairsOnSide(match.homePlayers)) {
      addPairPlay(left, right, homeWon);
    }
    for (const [left, right] of pairsOnSide(match.awayPlayers)) {
      addPairPlay(left, right, awayWon);
    }
  }

  const inseparable: TrendRow[] = [];
  const winningDuo: TrendRow[] = [];
  for (const stat of pairStats.values()) {
    if (stat.played >= 3) {
      inseparable.push({
        id: stat.key,
        names: stat.names,
        value: stat.played,
        detail: `${stat.played} gp`,
      });
    }
    if (stat.played >= 3 && stat.wins >= 2) {
      winningDuo.push({
        id: `${stat.key}-wins`,
        names: stat.names,
        value: stat.wins,
        detail: `${stat.wins}W / ${stat.played}`,
      });
    }
  }

  interface HeadToHead {
    aId: string;
    bId: string;
    aName: string;
    bName: string;
    aWins: number;
    bWins: number;
  }

  const headToHead = new Map<string, HeadToHead>();

  for (const match of withDates) {
    if (match.homeScore === match.awayScore) {
      continue;
    }

    const homeWon = match.homeScore > match.awayScore;
    for (const home of match.homePlayers) {
      for (const away of match.awayPlayers) {
        if (!home.id || !away.id || home.id === away.id) {
          continue;
        }

        const key = [home.id, away.id].sort().join('|');
        const [first, second] = home.id < away.id ? [home, away] : [away, home];
        const existing = headToHead.get(key) ?? {
          aId: first.id,
          bId: second.id,
          aName: first.username,
          bName: second.username,
          aWins: 0,
          bWins: 0,
        };

        const winnerId = homeWon ? home.id : away.id;
        if (winnerId === existing.aId) {
          existing.aWins += 1;
        } else {
          existing.bWins += 1;
        }
        headToHead.set(key, existing);
      }
    }
  }

  const nemesis: TrendRow[] = [];
  for (const row of headToHead.values()) {
    const meetings = row.aWins + row.bWins;
    if (meetings < 3) {
      continue;
    }

    const aLeads = row.aWins >= row.bWins;
    const leaderWins = aLeads ? row.aWins : row.bWins;
    const trailingWins = aLeads ? row.bWins : row.aWins;
    if (leaderWins < trailingWins + 2) {
      continue;
    }

    nemesis.push({
      id: `${row.aId}|${row.bId}`,
      names: `${aLeads ? row.aName : row.bName} over ${aLeads ? row.bName : row.aName}`,
      value: leaderWins,
      detail: `${leaderWins}–${trailingWins}`,
    });
  }

  return {
    hot: topRows(hot, 3),
    cold: topRows(cold, 3),
    form: topRows(form, 0),
    longestWin: topRows(longestWin, 3),
    longestLoss: topRows(longestLoss, 3),
    calendarStreak: topRows(calendarStreak, 2),
    ironman: topRows(ironman, 3),
    inseparable: topRows(inseparable, 3),
    winningDuo: topRows(winningDuo, 2),
    nemesis: topRows(nemesis, 1),
    nailBiter: topRows(nailBiter, 3),
    nightShift: topRows(nightShift, 3),
  };
}

export function useTrends(filteredMatches: Ref<Match[] | null>) {
  return computed(() => {
    if (filteredMatches.value === null) {
      return null;
    }
    return computeTrends(filteredMatches.value);
  });
}
