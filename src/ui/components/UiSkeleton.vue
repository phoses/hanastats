<template>
  <div class="tw:animate-pulse tw:rounded-ui tw:bg-surface-3" :style="{ width, height }" aria-hidden="true" />
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  width?: string;
  height?: string;
}>(), {
  width: '100%',
  height: '1rem',
});
</script>
