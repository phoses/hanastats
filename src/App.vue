<template>
  <div class="app-shell">
    <div v-if="isLoading" class="app-loading">
      <div class="app-loading__bar" />
    </div>

    <template v-if="!initializing">
      <main class="app-scroll hs-scroll" :class="{ 'app-scroll--config': isConfigRoute || isAddMatchRoute }">
        <RouterView />
      </main>

      <template v-if="!isConfigRoute && !isAddMatchRoute">
        <BottomNav
          :tab="uiStore.tab"
          :show-fab="userStore.isAdmin"
          @navigate="uiStore.setTab"
          @add="router.push('/addmatch')"
        />
        <AppToast :message="uiStore.toast" />
      </template>

      <button
        v-if="userStore.isLogged && !isConfigRoute && !isAddMatchRoute"
        class="settings-btn"
        aria-label="Settings"
        @click="router.push('/config')"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 15a3 3 0 100-6 3 3 0 000 6z"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>

      <button
        v-if="!userStore.isLogged && !initializing"
        class="login-btn font-heading"
        @click="login"
      >
        Sign in
      </button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { RouterView, useRouter, useRoute } from 'vue-router';
import { useLoadingStore } from './stores/loading';
import { useUserStore } from './stores/user';
import { useGamesStore } from './stores/game';
import { usePlayersStore } from './stores/player';
import { useMatchStore } from './stores/match';
import { useUiStore } from './stores/ui';
import BottomNav from './components/ui/BottomNav.vue';
import AppToast from './components/ui/AppToast.vue';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const loadingStore = useLoadingStore();
const gameStore = useGamesStore();
const playerStore = usePlayersStore();
const matchStore = useMatchStore();
const uiStore = useUiStore();

const initializing = ref(true);
const isLoading = computed(() => loadingStore.isLoading());
const isConfigRoute = computed(() => route.path === '/config');
const isAddMatchRoute = computed(() => route.path === '/addmatch');

onMounted(async () => {
  loadingStore.doLoading(async () => {
    initializing.value = true;
    await userStore.init();
    await playerStore.getPlayers();
    await gameStore.getGames();
    await matchStore.getMatches(playerStore.players);
    initializing.value = false;
  });
});

watch(
  () => gameStore.games,
  (games) => {
    if (games?.length && uiStore.gameFilterId === 'all') {
      const first = games.find((g) => !g.disabled);
      if (first) uiStore.setGameFilter(first.id);
    }
  },
  { immediate: true }
);

async function login() {
  loadingStore.doLoading(async () => {
    await userStore.login();
  });
}
</script>

<style scoped>
.app-shell {
  position: relative;
  margin: 0 auto;
  width: 100%;
  max-width: 390px;
  min-height: 100vh;
  background: var(--hs-bg);
}

.app-scroll {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-y: auto;
  padding: var(--hs-scroll-top) 0 var(--hs-scroll-bottom);
}

.app-loading {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 390px;
  z-index: 100;
}

.app-loading__bar {
  height: 3px;
  background: var(--hs-lime);
  animation: loading-pulse 1s ease infinite;
}

@keyframes loading-pulse {
  0%,
  100% {
    opacity: 0.4;
  }
  50% {
    opacity: 1;
  }
}

.settings-btn {
  position: fixed;
  top: 12px;
  right: max(12px, calc(50% - 195px + 12px));
  z-index: 45;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.06);
  color: var(--hs-text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.app-scroll--config {
  padding-bottom: 24px;
}

.login-btn {
  position: fixed;
  top: 12px;
  right: max(12px, calc(50% - 195px + 12px));
  z-index: 45;
  border: none;
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.06);
  color: var(--hs-text);
  cursor: pointer;
  padding: 8px 14px;
  font-weight: 700;
  font-size: 13px;
}
</style>
