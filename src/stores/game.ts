import { ref } from 'vue';
import { defineStore } from 'pinia';
import { getDatabase, ref as fbRef, get, child, push } from "firebase/database";
import _ from 'lodash';
import { useLoadingStore } from './loading';

export interface Game {
  id: string;
  name: string;
};

export const useGamesStore = defineStore('game', () => {
  const games = ref(null as Game[] | null);

  const loadingStore = useLoadingStore();
  const dbRef = fbRef(getDatabase());

  async function getGames() {
    loadingStore.addLoader();
    const snapshot = await get(child(dbRef, 'games/'));

    if (snapshot.exists()) {
      games.value = _.map(_.keys(snapshot.val()), (id) => {
        return {
          id,
          name: snapshot.val()[id].name,
        }
      });
    } else {
      console.log("No data available");
    }

    loadingStore.removeLoader();
  }

  async function addGame(game: string) {
    loadingStore.addLoader();
    if (!_.find(games.value, { name: game }) && game !== "") {
      await push(fbRef(getDatabase(), 'games/'), {
        name: game,
      });
    }
    loadingStore.removeLoader();
  }

  return { games, getGames, addGame }
})
