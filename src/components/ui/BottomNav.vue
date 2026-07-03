<template>
  <nav class="bottom-nav">
    <button
      class="bottom-nav__item"
      :class="{ 'bottom-nav__item--active': tab === 'standings' }"
      :style="{ color: tab === 'standings' ? '#C6FF3D' : '#4A5563' }"
      @click="$emit('navigate', 'standings')"
    >
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="11" width="4.5" height="9" rx="1.4" fill="currentColor" />
        <rect x="9.75" y="5" width="4.5" height="15" rx="1.4" fill="currentColor" />
        <rect x="16.5" y="8" width="4.5" height="12" rx="1.4" fill="currentColor" />
      </svg>
      <span>Ranks</span>
    </button>

    <button
      class="bottom-nav__item"
      :class="{ 'bottom-nav__item--active': tab === 'trends' }"
      :style="{ color: tab === 'trends' ? '#38A6FF' : '#4A5563' }"
      @click="$emit('navigate', 'trends')"
    >
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M3 16L9 10L13 14L21 5"
          stroke="currentColor"
          stroke-width="2.3"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <circle cx="21" cy="5" r="2" fill="currentColor" />
      </svg>
      <span>Trends</span>
    </button>

    <button
      v-if="showFab"
      class="bottom-nav__fab hs-animate-pulse"
      aria-label="Log a match"
      @click="$emit('add')"
    >
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 5V19M5 12H19" stroke="#0A0E13" stroke-width="3" stroke-linecap="round" />
      </svg>
    </button>
    <div v-else class="bottom-nav__fab-spacer" />

    <button
      class="bottom-nav__item"
      :class="{ 'bottom-nav__item--active': tab === 'matches' }"
      :style="{ color: tab === 'matches' ? '#FF5B39' : '#4A5563' }"
      @click="$emit('navigate', 'matches')"
    >
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 7h5l3 10 3-10h5"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <span>Matches</span>
    </button>

    <button
      class="bottom-nav__item"
      :class="{ 'bottom-nav__item--active': tab === 'stats' }"
      :style="{ color: tab === 'stats' ? '#B98CFF' : '#4A5563' }"
      @click="$emit('navigate', 'stats')"
    >
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="3" width="7.5" height="7.5" rx="2" fill="currentColor" />
        <rect x="13.5" y="3" width="7.5" height="7.5" rx="2" fill="currentColor" opacity="0.5" />
        <rect x="3" y="13.5" width="7.5" height="7.5" rx="2" fill="currentColor" opacity="0.5" />
        <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" fill="currentColor" />
      </svg>
      <span>Stats</span>
    </button>
  </nav>
</template>

<script setup lang="ts">
import type { AppTab } from '@/stores/ui';

defineProps<{
  tab: AppTab;
  showFab?: boolean;
}>();

defineEmits<{
  navigate: [tab: AppTab];
  add: [];
}>();
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 390px;
  height: var(--hs-nav-height);
  z-index: 50;
  background: linear-gradient(to top, var(--hs-bg) 62%, rgba(10, 14, 19, 0));
  display: flex;
  align-items: flex-start;
  justify-content: space-around;
  padding: 14px 14px 0;
}

.bottom-nav__item {
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  width: 48px;
  padding: 0;
}

.bottom-nav__item span {
  font-size: 10px;
  font-weight: 700;
}

.bottom-nav__fab {
  border: none;
  cursor: pointer;
  margin-top: -8px;
  width: 56px;
  height: 56px;
  border-radius: 19px;
  background: var(--hs-lime);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 22px -4px rgba(198, 255, 61, 0.6);
}

.bottom-nav__fab-spacer {
  width: 56px;
}
</style>
