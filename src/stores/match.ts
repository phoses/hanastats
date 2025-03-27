import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getDatabase, ref as fbRef, get, child, push } from "firebase/database";
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

export const useMatchStore = defineStore('match', () => {
  const matches = ref(null as Match[] | null)

  const dbRef = fbRef(getDatabase());

  async function getMatches() {
    const snapshot = await get(child(dbRef, 'matches/'));

    if (snapshot.exists()) {
      matches.value = _.map(_.keys(snapshot.val()), (id) => {
        return {
          id,
          ...snapshot.val()[id],
        }
      });
    } else {
      console.log("No data available");
    }
  }

  async function addMatch(match: Match) {
    match = {
      ...match,
      played: new Date().getTime(),
    }
    await push(fbRef(getDatabase(), 'matches/'), match);
    matches.value?.push(match);
  }

  return { matches, getMatches, addMatch }
})
