<template>
  <button
    type="button"
    :aria-label="label"
    :aria-pressed="pressed"
    :disabled="disabled"
    :class="classes"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { IconButtonSize, IconButtonVariant } from './types';

const props = withDefaults(defineProps<{
  label: string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  disabled?: boolean;
  pressed?: boolean;
}>(), {
  variant: 'ghost',
  size: 'md',
  disabled: false,
  pressed: undefined,
});

const variants: Record<IconButtonVariant, string> = {
  ghost: 'tw:text-ink-muted tw:hover:bg-surface-2 tw:hover:text-ink',
  surface: 'tw:bg-surface-3 tw:text-ink tw:border tw:border-line tw:hover:bg-surface-2',
  accent: 'tw:bg-accent-strong tw:text-white tw:hover:bg-accent',
};

// Sizes stay at or above 44px so touch targets meet the accessibility minimum.
const sizes: Record<IconButtonSize, string> = {
  sm: 'tw:size-11',
  md: 'tw:size-11',
  lg: 'tw:size-14',
};

const classes = computed(() => [
  'tw:inline-flex tw:shrink-0 tw:items-center tw:justify-center tw:rounded-ui tw:transition-colors',
  'tw:disabled:opacity-50 tw:disabled:pointer-events-none',
  variants[props.variant],
  sizes[props.size],
  props.pressed ? 'tw:bg-accent-soft tw:text-ink' : '',
]);
</script>
