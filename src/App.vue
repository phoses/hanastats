
<template>
  <header>
    <Menubar :model="items" />
  </header>

  <RouterView />
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { RouterLink, RouterView } from 'vue-router';
  import { useRouter } from 'vue-router';
  import Menubar from 'primevue/menubar';
  import { PrimeIcons } from 'primevue/api';
  import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth';
  const provider = new GoogleAuthProvider();

  const router = useRouter()
  const auth = getAuth();

  signInWithPopup(auth, provider)
    .then((result) => {
      console.log(result);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      const user = result.user;
    }).catch((error) => {
      console.log(error);
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.customData.email;
      // The AuthCredential type that was used.
      const credential = GoogleAuthProvider.credentialFromError(error);
      // ...
  });

  const items = ref([
    { label: 'stats', icon: PrimeIcons.CHART_BAR, command: () => router.push('/')},
    { label: 'addgame', icon: PrimeIcons.PLUS, command: () => router.push('/addgame')},
    { label: 'config', icon: PrimeIcons.PLUS_CIRCLE, command: () => router.push('/config')},
  ]);

  </script>

<style scoped>

</style>
