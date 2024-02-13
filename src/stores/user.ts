import { defineStore } from 'pinia';
import { getDatabase, ref as fbRef, set, child } from "firebase/database";
import { GoogleAuthProvider, browserLocalPersistence, getAuth, setPersistence, signInWithPopup } from 'firebase/auth';
import { computed, ref } from 'vue';
import { get } from '@firebase/database';

export const useUserStore = defineStore('user', () => {

  const currentUser = ref(null as any | null);
  const db = getDatabase();
  const auth = getAuth();
  const dbRef = fbRef(getDatabase());
  const provider = new GoogleAuthProvider();

  const isLogged = computed(() => currentUser.value !== null);
  const isAdmin = computed(() => (currentUser.value !== null) && (currentUser.value.role === 'admin'));

  async function addUser(uid: string, email: string) {
    await set(fbRef(db, 'users/' + uid), {
      email: email,
    });
  }

  async function getUser(uid: string) {
    const data = await get(child(dbRef, 'users/' + uid));
    if (data.exists()) {
      currentUser.value = data.val();
    }
  }

  async function logout() {
    auth.signOut();
    currentUser.value = null;
  };

  async function init () {
    await setPersistence(auth, browserLocalPersistence);
    if (auth.currentUser) {
      await getUser(auth.currentUser.uid);
    }
  }

  async function login() {
    const login = await signInWithPopup(auth, provider)
    GoogleAuthProvider.credentialFromResult(login);

    if (auth.currentUser) {
      await getUser(auth.currentUser.uid);

      if (!currentUser.value) {
        await addUser(auth.currentUser.uid, auth.currentUser.email!);
        await getUser(auth.currentUser.uid);
      }
    }
  }

  return { addUser, login, logout, isLogged, isAdmin, init, currentUser };
});
