<template>
  <span class="tw:inline-flex tw:items-center tw:gap-2" :aria-label="label || undefined" :role="label ? 'status' : undefined">
    <svg
      :width="size"
      :height="size"
      viewBox="0 0 24 24"
      fill="none"
      class="tw:animate-spin"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2.5" stroke-opacity="0.25" />
      <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
    </svg>
    <span v-if="label" class="tw:sr-only">{{ label }}</span>
  </span>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  size?: number | string;
  label?: string;
}>(), {
  size: 18,
  label: '',
});
</script>
