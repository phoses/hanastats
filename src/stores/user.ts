import { defineStore } from 'pinia';
import { getDatabase, ref as fbRef, push } from "firebase/database";
import _ from 'lodash';

export const useUserStore = defineStore('user', () => {

  async function addUser(uid: string) {
    await push(fbRef(getDatabase(), 'users/'), uid);
  }

  return { addUser };
});
