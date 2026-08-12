<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :aria-busy="loading ? 'true' : undefined"
    :class="classes"
  >
    <UiSpinner v-if="loading" :size="size === 'lg' ? 20 : 16" />
    <slot v-else name="icon" />
    <span v-if="$slots.default"><slot /></span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import UiSpinner from './UiSpinner.vue';
import type { ButtonSize, ButtonVariant } from './types';

const props = withDefaults(defineProps<{
  variant?: ButtonVariant;
  size?: ButtonSize;
  type?: 'button' | 'submit' | 'reset';
  block?: boolean;
  disabled?: boolean;
  loading?: boolean;
}>(), {
  variant: 'secondary',
  size: 'md',
  type: 'button',
  block: false,
  disabled: false,
  loading: false,
});

const variants: Record<ButtonVariant, string> = {
  primary: 'tw:bg-accent-strong tw:text-white tw:hover:bg-accent',
  secondary: 'tw:bg-surface-3 tw:text-ink tw:border tw:border-line tw:hover:bg-surface-2',
  ghost: 'tw:text-ink-muted tw:hover:bg-surface-2 tw:hover:text-ink',
  danger: 'tw:bg-loss/15 tw:text-loss tw:border tw:border-loss/40 tw:hover:bg-loss/25',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'tw:min-h-9 tw:px-3 tw:text-sm tw:gap-1.5',
  md: 'tw:min-h-11 tw:px-4 tw:gap-2',
  lg: 'tw:min-h-12 tw:px-5 tw:text-lg tw:gap-2',
};

const classes = computed(() => [
  'tw:inline-flex tw:items-center tw:justify-center tw:rounded-ui tw:font-medium tw:transition-colors tw:select-none',
  'tw:disabled:opacity-50 tw:disabled:pointer-events-none',
  variants[props.variant],
  sizes[props.size],
  props.block ? 'tw:w-full' : '',
]);
</script>
