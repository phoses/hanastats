import { ref } from 'vue';
import { defineStore } from 'pinia';
import { getDatabase, ref as fbRef, get, child, push } from "firebase/database";
import _ from 'lodash';
import { useLoadingStore } from './loading';

export interface Player {
  id: string;
  username: string;
};

export const usePlayersStore = defineStore('player', () => {

  const players = ref(null as Player[] | null);

  const loadingStore = useLoadingStore();
  const dbRef = fbRef(getDatabase());

  async function getPlayers() {
    loadingStore.addLoader();
    const snapshot = await get(child(dbRef, 'players/'));

    if (snapshot.exists()) {
      players.value = _.map(_.keys(snapshot.val()), (id) => {
        return {
          id,
          username: snapshot.val()[id].username,
        }
      });
    } else {
      console.log("No data available");
    }

    loadingStore.removeLoader();
  }

  async function addplayer(player: string) {
    loadingStore.addLoader();
    if (!_.find(players.value, { username: player }) && player !== "") {
      await push(fbRef(getDatabase(), 'players/'), {
        username: player,
      });
    }
    loadingStore.removeLoader();
  }

  return { players, addplayer, getPlayers }
});
