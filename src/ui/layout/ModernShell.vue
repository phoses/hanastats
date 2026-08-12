<template>
  <div class="tw:min-h-dvh tw:bg-canvas tw:text-ink">
    <a
      href="#modern-main"
      class="tw:sr-only tw:focus:not-sr-only tw:focus:fixed tw:focus:top-2 tw:focus:left-2 tw:focus:z-50 tw:focus:rounded-ui tw:focus:bg-surface-3 tw:focus:px-3 tw:focus:py-2"
    >
      skip to content
    </a>

    <TopBar />

    <main
      id="modern-main"
      class="tw:mx-auto tw:w-full tw:max-w-3xl tw:px-3 tw:pt-4 tw:pb-[calc(5rem+env(safe-area-inset-bottom))]"
    >
      <RouterView />
    </main>

    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
import BottomNav from './BottomNav.vue';
import TopBar from './TopBar.vue';
</script>
