<template>
  <span :class="classes">
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { BadgeTone } from './types';

const props = withDefaults(defineProps<{
  tone?: BadgeTone;
  size?: 'sm' | 'md';
}>(), {
  tone: 'neutral',
  size: 'sm',
});

const tones: Record<BadgeTone, string> = {
  neutral: 'tw:bg-surface-3 tw:text-ink-muted tw:border-line',
  accent: 'tw:bg-accent-soft tw:text-accent tw:border-accent/40',
  win: 'tw:bg-win/15 tw:text-win tw:border-win/40',
  loss: 'tw:bg-loss/15 tw:text-loss tw:border-loss/40',
  warn: 'tw:bg-warn/15 tw:text-warn tw:border-warn/40',
};

const classes = computed(() => [
  'tw:inline-flex tw:items-center tw:gap-1 tw:rounded-full tw:border tw:font-medium tw:whitespace-nowrap',
  props.size === 'sm' ? 'tw:px-2 tw:py-0.5 tw:text-xs' : 'tw:px-2.5 tw:py-1 tw:text-sm',
  tones[props.tone],
]);
</script>
