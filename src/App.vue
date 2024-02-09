
<template>
  <div class="flex w-full justify-content-center">
    <router-link to="/">
      <span class="pi pi-chart-bar"></span>
      <span class="pl-2">stats</span>
    </router-link>
    <router-link to="/addgame" class="ml-5">
      <span class="pi pi-plus"></span>
      <span class="pl-2">addgame</span>
    </router-link>
    <router-link to="/config" class="ml-5">
      <span class="pi pi-server"></span>
      <span class="pl-2">config</span>
    </router-link>
  </div>

  <ProgressBar v-if="isLoading" mode="indeterminate"/>
  <div class="flex justify-content-center">
    <div>
      <RouterView/>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { RouterView } from 'vue-router';
  import { useRouter } from 'vue-router';
  import { PrimeIcons } from 'primevue/api';
  import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth';
  import ProgressBar from 'primevue/progressbar';
  import { useLoadingStore } from './stores/loading';
  import 'primeicons/primeicons.css'


  const provider = new GoogleAuthProvider();
  const auth = getAuth();

  const router = useRouter()
  const loadingStore = useLoadingStore();

  const isLoading = computed(() => loadingStore.isLoading());

  // signInWithPopup(auth, provider)
  //   .then((result) => {
  //     console.log(result);
  //     const credential = GoogleAuthProvider.credentialFromResult(result);
  //     const token = credential?.accessToken;
  //     const user = result.user;
  //   }).catch((error) => {
  //     console.log(error);
  //     // Handle Errors here.
  //     const errorCode = error.code;
  //     const errorMessage = error.message;
  //     // The email of the user's account used.
  //     const email = error.customData.email;
  //     // The AuthCredential type that was used.
  //     const credential = GoogleAuthProvider.credentialFromError(error);
  //     // ...
  // });

  const items = ref([
    { label: 'stats', icon: PrimeIcons.CHART_BAR, command: () => router.push('/')},
    { label: 'addgame', icon: PrimeIcons.PLUS, command: () => router.push('/addgame')},
    { label: 'config', icon: PrimeIcons.PLUS_CIRCLE, command: () => router.push('/config')},
  ]);

  </script>

<style scoped>

</style>
