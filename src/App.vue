
<template>
  <div class="flex w-full justify-content-center">
    <Menubar :model="items" breakpoint="50"/>
  </div>

  <ProgressBar v-if="isLoading" mode="indeterminate"/>

  <div class="flex justify-content-center">
    <div>
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

  const router = useRouter()
  const userStore = useUserStore();
  const loadingStore = useLoadingStore();
  const initializing = ref(true);

  onMounted(async () => {
    loadingStore.doLoading((async () => {
      initializing.value = true;
      await userStore.init();
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
  const items = computed(() => [
    { label: 'stats', icon: PrimeIcons.CHART_BAR, command: () => router.push('/')},
    ...(userStore.isAdmin ? [{ label: 'addgame', icon: PrimeIcons.PLUS, command: () => router.push('/addgame')}] : []),
    { label: 'config', icon: PrimeIcons.PLUS_CIRCLE, command: () => router.push('/config')},
    ...(!initializing.value ? [(userStore.isLogged ? { icon: PrimeIcons.SIGN_OUT, command: () => logout()} : { icon: PrimeIcons.SIGN_IN, command: () => login()})] : []) ,
  ]);

  </script>

<style scoped>

.pointer {
  cursor: pointer;
}

</style>
