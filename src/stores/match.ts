import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { getDatabase, ref as fbRef, get, child, push, query, orderByKey, startAfter } from "firebase/database";
import _ from 'lodash';
import type { Game, Team } from './game';
import { usePlayersStore, type Player } from './player';

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

  function loadMatchesFromStorage(): Match[] | null {
    const stored = localStorage.getItem(MATCHES_STORAGE_KEY);
    if (!stored) return null;

    try {
      return JSON.parse(stored) as Match[];
    } catch {
      return null;
    }
  }

  function saveMatchesToStorage(matchList: Match[]) {
    localStorage.setItem(MATCHES_STORAGE_KEY, JSON.stringify(matchList));
  }

  async function getMatches(players: Player[]) {
    const storedMatches = loadMatchesFromStorage();
    let fetchedMatches: Record<string, Omit<Match, 'id'>> = {};

    if (!storedMatches?.length) {
      const snapshot = await get(child(dbRef, 'matches/'));
      if (snapshot.exists()) {
        fetchedMatches = snapshot.val();
      }
    } else {
      const lastId = _.max(_.map(storedMatches, 'id').filter(Boolean)) as string;
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

    const allMatchesMap = new Map<string, Match>();
    for (const match of storedMatches ?? []) {
      if (match.id) {
        allMatchesMap.set(match.id, match);
      }
    }
    for (const match of newMatches) {
      if (match.id) {
        allMatchesMap.set(match.id, match as Match);
      }
    }

    const allMatches = _.map([...allMatchesMap.values()], (match) => hydrateMatch(match, players));
    matches.value = allMatches.length > 0 ? allMatches : null;
    if (allMatches.length > 0) {
      saveMatchesToStorage(allMatches);
    }
  }

  async function addMatch(match: Match) {
    match = {
      ...match,
      played: new Date().getTime(),
    }
    const addedMatch = await push(fbRef(getDatabase(), 'matches/'), match);
    matches.value?.push({
      id: addedMatch.key!,
      ...match,
    });
  }

  return { matches, getMatches, addMatch }
})
