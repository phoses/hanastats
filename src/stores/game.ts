import { ref } from 'vue';
import { defineStore } from 'pinia';
import { getDatabase, ref as fbRef, get, child, push } from "firebase/database";
import _ from 'lodash';
export interface Game {
  id: string;
  name: string;
  pointsForDraw: number;
  pointsForWin: number;
  pointsForOTLose: number;
  pointsForOTWin: number;
};

export const useGamesStore = defineStore('game', () => {
  const games = ref(null as Game[] | null);
  const dbRef = fbRef(getDatabase());

  async function getGames() {
    const snapshot = await get(child(dbRef, 'games/'));

    if (snapshot.exists()) {
      games.value = _.map(_.keys(snapshot.val()), (id) => {
        return {
          id,
          name: snapshot.val()[id].name,
          pointsForDraw: snapshot.val()[id].pointsForDraw,
          pointsForWin: snapshot.val()[id].pointsForWin,
          pointsForOTLose: snapshot.val()[id].pointsForOTLose,
          pointsForOTWin: snapshot.val()[id].pointsForOTWin,
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

  return { games, getGames, addGame }
})
