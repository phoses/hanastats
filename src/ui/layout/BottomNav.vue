<template>
  <nav
    aria-label="main"
    class="tw:fixed tw:inset-x-0 tw:bottom-0 tw:z-40 tw:overflow-visible tw:border-t tw:border-line tw:bg-surface/95 tw:backdrop-blur"
  >
    <ul class="tw:mx-auto tw:flex tw:w-full tw:max-w-3xl tw:pb-[env(safe-area-inset-bottom)]">
      <li v-for="item in leftItems" :key="item.name" class="tw:flex tw:grow tw:basis-0">
        <RouterLink
          :to="{ name: item.name }"
          :aria-current="isActive(item.name) ? 'page' : undefined"
          :class="tabClass(item)"
        >
          <span :class="['tw:rounded-full tw:px-3 tw:py-0.5', isActive(item.name) ? item.pillClass : '']">
            <UiIcon :name="item.icon" :size="22" />
          </span>
          <span>{{ item.label }}</span>
        </RouterLink>
      </li>

      <li v-if="addItem" class="tw:flex tw:grow tw:basis-0 tw:items-center tw:justify-center">
        <RouterLink
          :to="{ name: addItem.name }"
          :aria-current="isActive(addItem.name) ? 'page' : undefined"
          :aria-label="addItem.label"
          :class="[
            'tw:flex tw:size-12 tw:items-center tw:justify-center tw:rounded-full tw:bg-accent-strong tw:text-white tw:shadow-[0_2px_8px_rgb(0_0_0/0.45)] tw:transition-colors',
            isActive(addItem.name) ? 'tw:ring-2 tw:ring-violet-300/70 tw:ring-offset-2 tw:ring-offset-surface' : '',
          ]"
        >
          <UiIcon :name="addItem.icon" :size="26" />
        </RouterLink>
      </li>

      <li v-for="item in rightItems" :key="item.name" class="tw:flex tw:grow tw:basis-0">
        <RouterLink
          :to="{ name: item.name }"
          :aria-current="isActive(item.name) ? 'page' : undefined"
          :class="tabClass(item)"
        >
          <span :class="['tw:rounded-full tw:px-3 tw:py-0.5', isActive(item.name) ? item.pillClass : '']">
            <UiIcon :name="item.icon" :size="22" />
          </span>
          <span>{{ item.label }}</span>
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import UiIcon from '../components/UiIcon.vue';
import type { IconName } from '../components/icons';
import { useUserStore } from '@/stores/user';

interface NavItem {
  name: string;
  label: string;
  icon: IconName;
  activeClass: string;
  pillClass: string;
}

const route = useRoute();
const userStore = useUserStore();

const leftItems: NavItem[] = [
  {
    name: 'modern-standings',
    label: 'standings',
    icon: 'stats',
    activeClass: 'tw:text-cyan-300',
    pillClass: 'tw:bg-cyan-400/15',
  },
  {
    name: 'modern-matches',
    label: 'matches',
    icon: 'list',
    activeClass: 'tw:text-emerald-300',
    pillClass: 'tw:bg-emerald-400/15',
  },
];

const addItem = computed<NavItem | null>(() => {
  if (!userStore.isAdmin) {
    return null;
  }

  return {
    name: 'modern-add',
    label: 'add',
    icon: 'plus',
    activeClass: 'tw:text-violet-300',
    pillClass: 'tw:bg-violet-400/15',
  };
});

const rightItems: NavItem[] = [
  {
    name: 'modern-trends',
    label: 'trends',
    icon: 'trend',
    activeClass: 'tw:text-fuchsia-300',
    pillClass: 'tw:bg-fuchsia-400/15',
  },
  {
    name: 'modern-more',
    label: 'more',
    icon: 'settings',
    activeClass: 'tw:text-amber-300',
    pillClass: 'tw:bg-amber-400/15',
  },
];

function isActive(name: string): boolean {
  return route.name === name;
}

function tabClass(item: NavItem): string {
  return [
    'tw:flex tw:min-h-14 tw:w-full tw:flex-col tw:items-center tw:justify-center tw:gap-0.5 tw:py-2 tw:text-[0.7rem] tw:transition-colors',
    isActive(item.name) ? item.activeClass : 'tw:text-ink-muted tw:hover:text-ink',
  ].join(' ');
}
</script>
