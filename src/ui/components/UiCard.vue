<template>
  <component :is="as" :class="classes">
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  as?: string;
  padding?: 'none' | 'sm' | 'md';
  interactive?: boolean;
}>(), {
  as: 'div',
  padding: 'md',
  interactive: false,
});

const paddings = {
  none: '',
  sm: 'tw:p-3',
  md: 'tw:p-4',
};

const classes = computed(() => [
  'tw:rounded-card tw:border tw:border-line tw:bg-surface',
  paddings[props.padding],
  props.interactive ? 'tw:transition-colors tw:hover:border-line-strong' : '',
]);
</script>
