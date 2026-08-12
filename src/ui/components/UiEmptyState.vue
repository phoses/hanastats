<template>
  <div class="tw:flex tw:flex-col tw:items-center tw:gap-2 tw:rounded-card tw:border tw:border-dashed tw:border-line tw:px-4 tw:py-10 tw:text-center">
    <UiIcon :name="icon" :size="28" class="tw:text-ink-subtle" />
    <p class="tw:font-semibold">{{ title }}</p>
    <p v-if="description" class="tw:text-sm tw:text-ink-muted">{{ description }}</p>
    <div v-if="$slots.default" class="tw:mt-2">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import UiIcon from './UiIcon.vue';
import type { IconName } from './icons';

withDefaults(defineProps<{
  title: string;
  description?: string;
  icon?: IconName;
}>(), {
  description: '',
  icon: 'info',
});
</script>
