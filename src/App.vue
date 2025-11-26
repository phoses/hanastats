
<template>
  <div class="flex justify-content-center flex-wrap">
    <div class="flex flex-column w-full sm:w-30rem">
      <Menubar :model="items" breakpoint="50"/>
      <ProgressBar v-if="isLoading" mode="indeterminate"/>
      <RouterView/>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { RouterView } from 'vue-router';
  import { useRouter } from 'vue-router';
  import { PrimeIcons } from 'primevue/api';
  import ProgressBar from 'primevue/progressbar';
  import { useLoadingStore } from './stores/loading';
  import { useUserStore } from './stores/user';
  import 'primeicons/primeicons.css'
  import Menubar from 'primevue/menubar';
import { useGamesStore } from './stores/game';
import { usePlayersStore } from './stores/player';
import { useMatchStore } from './stores/match';

  const router = useRouter()
  const userStore = useUserStore();
  const loadingStore = useLoadingStore();
  const initializing = ref(true);
  const gameStore = useGamesStore();
  const playerStore = usePlayersStore();
  const matchStore = useMatchStore();

  onMounted(async () => {
    loadingStore.doLoading((async () => {
      initializing.value = true;
      await userStore.init();
      await playerStore.getPlayers();
      await gameStore.getGames();
      await matchStore.getMatches(playerStore.players);
      initializing.value = false;
    }));
  });

  async function login () {
    loadingStore.doLoading(async () => (await userStore.login()));
  }

  async function logout () {
    loadingStore.doLoading(async () => (await userStore.logout()));
  }

  const isLoading = computed(() => loadingStore.isLoading());
  const items = computed(() => {
    const items: any[] = [
    { label: 'stats', icon: PrimeIcons.CHART_BAR, command: () => router.push('/')}
    ];

    if (userStore.isAdmin) {
      items.push({ label: 'addmatch', icon: PrimeIcons.PLUS_CIRCLE, command: () => router.push('/addmatch')});
    }

    if (!initializing.value) {
      if (userStore.isLogged) {
        items.push({
          icon: PrimeIcons.COG,
          items: [
            { label: 'config', icon: PrimeIcons.DATABASE, command: () => router.push('/config')},
            { label: 'logout', icon: PrimeIcons.SIGN_OUT, command: () => logout()},
          ],
        })
      } else {
        items.push({ icon: PrimeIcons.SIGN_IN, command: () => login()});
      }
    }

    return items;
  });

  </script>

<style scoped>

:deep(.p-menubar) {
  padding: 0;
}

</style>
