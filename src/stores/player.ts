import { ref } from 'vue';
import { defineStore } from 'pinia';
import { getDatabase, ref as fbRef, get, child, push } from "firebase/database";
import _ from 'lodash';
export interface Player {
  id: string;
  username: string;
  ownedGames: string[];
};

export const usePlayersStore = defineStore('player', () => {

  const players = ref(null as Player[] | null);
  const dbRef = fbRef(getDatabase());

  async function getPlayers() {
    const snapshot = await get(child(dbRef, 'players/'));

    if (snapshot.exists()) {
      players.value = _.map(_.keys(snapshot.val()), (id) => {
        return {
          id,
          ...snapshot.val()[id],
        }
      });
    } else {
      console.log("No data available");
    }
  }

  async function addplayer(player: string) {
    if (!_.find(players.value, { username: player }) && player !== "") {
      await push(fbRef(getDatabase(), 'players/'), {
        username: player,
      });
    }
  }

  return { players, addplayer, getPlayers }
});
