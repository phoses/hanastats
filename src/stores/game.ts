import { ref } from 'vue';
import { defineStore } from 'pinia';
import { getDatabase, ref as fbRef, get, child, push, update } from "firebase/database";
import _ from 'lodash';
export interface Game {
  id: string;
  name: string;
  pointsForDraw: number;
  pointsForWin: number;
  pointsForOTLose: number;
  pointsForOTWin: number;
  disabled: boolean;
  teams?: Team[];
};

export interface Team {
  id?: string;
  name: string;
  shortName: string;
}

export const useGamesStore = defineStore('game', () => {
  const games = ref(null as Game[] | null);
  const dbRef = fbRef(getDatabase());

  async function getGames() {
    const snapshot = await get(child(dbRef, 'games/'));

    if (snapshot.exists()) {
      games.value = _.map(_.keys(snapshot.val()), (id) => {
        return {
          id,
          ...snapshot.val()[id],
        }
      });
    } else {
      console.log("No data available");
    }
  }

  async function addGame(game: Game) {
    if (!_.find(games.value, { name: game.name }) && game.name !== "") {
      await push(fbRef(getDatabase(), 'games/'), game);
    }
  }

  async function updateGame(game: Game) {
    const dataBaseRefGame = {
      [game.id]: {
        ..._.omit(game, 'id'),
      }
    }

    await update(fbRef(getDatabase(), 'games/'), dataBaseRefGame);
  }

  async function addTeam(game: Game, team: Team) {
    team.id = crypto.randomUUID();
    const dataBaseRefGame = {
      [game.id]: {
        ..._.omit(game, 'id'),
        teams: [
          ...(game.teams ? game.teams : []),
          team,
        ]
      }
    }

    await update(fbRef(getDatabase(), 'games/'), dataBaseRefGame);
  }

  async function deleteTeam(game: Game, team: Team) {
    const dataBaseRefGame = {
      [game.id]: {
        ..._.omit(game, 'id'),
        teams: _.filter(game.teams, (t) => t.id !== team.id),
      }
    }

    await update(fbRef(getDatabase(), 'games/'), dataBaseRefGame);
  }

  return { games, getGames, addGame, updateGame, addTeam, deleteTeam };
})
