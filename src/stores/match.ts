import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getDatabase, ref as fbRef, get, child, push, set, query, orderByKey, startAfter } from "firebase/database";
import _ from 'lodash';
import type { Game, Team } from './game';
import type { Player } from './player';

export interface Match {
  id?: string;
  game?: Game;
  played?: number;
  playedFormatted?: string;
  homePlayers: Player[];
  awayPlayers: Player[];
  homeScore: number;
  awayScore: number;
  overtime: boolean;
  homeTeam?: Team;
  awayTeam?: Team;
}

interface StoredMatches {
  version: number;
  matches: Match[];
}

const MATCHES_STORAGE_KEY = 'hanastats-matches';

export const useMatchStore = defineStore('match', () => {
  const matches = ref(null as Match[] | null)
  const dbRef = fbRef(getDatabase());

  function hydrateMatch(match: Match, players: Player[]): Match {
    return {
      ...match,
      homePlayers: _.compact(_.map(match.homePlayers, (player) => _.find(players, { id: player.id }))),
      awayPlayers: _.compact(_.map(match.awayPlayers, (player) => _.find(players, { id: player.id }))),
    };
  }

  async function getMatchesVersion(): Promise<number> {
    try {
      const snapshot = await get(child(dbRef, 'metadata/matches/version'));
      return snapshot.exists() ? snapshot.val() as number : 0;
    } catch {
      return 0;
    }
  }

  function loadMatchesFromStorage(): StoredMatches | null {
    const stored = localStorage.getItem(MATCHES_STORAGE_KEY);
    if (!stored) return null;

    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return null;
      }
      if (parsed && typeof parsed.version === 'number' && Array.isArray(parsed.matches)) {
        return parsed as StoredMatches;
      }
      return null;
    } catch {
      return null;
    }
  }

  function saveMatchesToStorage(version: number, matchList: Match[]) {
    localStorage.setItem(MATCHES_STORAGE_KEY, JSON.stringify({ version, matches: matchList }));
  }

  async function getMatches(players: Player[]) {
    const serverVersion = await getMatchesVersion();
    const cached = loadMatchesFromStorage();
    const cacheValid = cached !== null && cached.version === serverVersion && cached.matches.length > 0;
    let fetchedMatches: Record<string, Omit<Match, 'id'>> = {};

    if (!cacheValid) {
      const snapshot = await get(child(dbRef, 'matches/'));
      if (snapshot.exists()) {
        fetchedMatches = snapshot.val();
      }
    } else {
      const lastId = _.max(_.map(cached.matches, 'id').filter(Boolean)) as string;
      const matchesQuery = query(
        child(dbRef, 'matches'),
        orderByKey(),
        startAfter(lastId),
      );
      const snapshot = await get(matchesQuery);
      if (snapshot.exists()) {
        fetchedMatches = snapshot.val();
      }
    }

    const newMatches = _.map(_.keys(fetchedMatches), (id) => ({
      id,
      ...fetchedMatches[id],
    }));

    let allMatches: Match[];
    if (cacheValid) {
      const allMatchesMap = new Map<string, Match>();
      for (const match of cached.matches) {
        if (match.id) {
          allMatchesMap.set(match.id, match);
        }
      }
      for (const match of newMatches) {
        if (match.id) {
          allMatchesMap.set(match.id, match as Match);
        }
      }
      allMatches = [...allMatchesMap.values()];
    } else {
      allMatches = newMatches as Match[];
    }

    const hydratedMatches = _.map(allMatches, (match) => hydrateMatch(match, players));
    matches.value = hydratedMatches.length > 0 ? hydratedMatches : null;
    if (hydratedMatches.length > 0) {
      saveMatchesToStorage(serverVersion, hydratedMatches);
    }
  }

  async function bumpMatchesVersion() {
    const currentVersion = await getMatchesVersion();
    await set(child(dbRef, 'metadata/matches/version'), currentVersion + 1);
  }

  async function addMatch(match: Match): Promise<string | undefined> {
    match = {
      ...match,
      played: new Date().getTime(),
    }
    const addedMatch = await push(fbRef(getDatabase(), 'matches/'), match);
    const id = addedMatch.key ?? undefined;
    matches.value?.push({
      id,
      ...match,
    });
    await bumpMatchesVersion();
    const version = await getMatchesVersion();
    if (matches.value) {
      saveMatchesToStorage(version, matches.value);
    }
    return id;
  }

  return { matches, getMatches, addMatch, bumpMatchesVersion, getMatchesVersion }
})
