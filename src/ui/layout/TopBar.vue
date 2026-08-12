<template>
  <header class="tw:sticky tw:top-0 tw:z-40 tw:bg-canvas/95 tw:backdrop-blur">
    <div class="tw:flex tw:min-h-14 tw:items-center tw:justify-between tw:gap-2 tw:px-3 tw:pt-[env(safe-area-inset-top)]">
      <div class="tw:flex tw:min-w-0 tw:items-center tw:gap-2">
        <span :class="chrome.headerIconClass">
          <UiIcon :name="chrome.headerIcon" :size="22" />
        </span>
        <h1 class="tw:truncate tw:text-base tw:font-semibold tw:tracking-tight">{{ chrome.title }}</h1>
      </div>

      <div class="tw:flex tw:shrink-0 tw:items-center tw:gap-2">
        <UiModeToggle />
      </div>
    </div>

    <div v-if="isLoading" class="tw:h-0.5 tw:overflow-hidden tw:bg-surface-2" role="status" aria-label="loading">
      <div class="tw:h-full tw:w-1/4 tw:animate-progress tw:bg-accent" />
    </div>
    <div
      v-else
      class="tw:h-0.5 tw:bg-gradient-to-r tw:from-violet-500 tw:via-cyan-400 tw:to-emerald-400"
      aria-hidden="true"
    />
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import UiIcon from '../components/UiIcon.vue';
import UiModeToggle from './UiModeToggle.vue';
import { chromeForRoute } from '../routeChrome';
import { useLoadingStore } from '@/stores/loading';

const route = useRoute();
const loadingStore = useLoadingStore();

const chrome = computed(() => chromeForRoute(route.name));
const isLoading = computed(() => loadingStore.isLoading());
</script>
