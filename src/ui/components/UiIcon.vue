<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.75"
    stroke-linecap="round"
    stroke-linejoin="round"
    :role="label ? 'img' : undefined"
    :aria-label="label || undefined"
    :aria-hidden="label ? undefined : true"
    v-html="markup"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { icons, type IconName } from './icons';

const props = withDefaults(defineProps<{
  name: IconName;
  size?: number | string;
  label?: string;
}>(), {
  size: 20,
  label: '',
});

const markup = computed(() => icons[props.name] ?? '');
</script>
