<template>
  <header class="screen-header">
    <div class="screen-header__top">
      <h1 class="screen-header__title font-display">
        <slot name="title-before" />
        <span :style="{ color: accentColor }"><slot name="title-accent" /></span>
        <slot name="title-after" />
      </h1>
      <div v-if="$slots.meta" class="screen-header__meta">
        <slot name="meta" />
      </div>
    </div>
    <p v-if="subtitle" class="screen-header__subtitle">{{ subtitle }}</p>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  accentColor?: string;
  subtitle?: string;
}>();
</script>

<style scoped>
.screen-header {
  margin-bottom: 14px;
}

.screen-header__top {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 2px;
}

.screen-header__title {
  margin: 0;
  font-weight: 900;
  font-size: 36px;
  line-height: 0.92;
  color: var(--hs-text);
  letter-spacing: -0.01em;
}

.screen-header__meta {
  text-align: right;
  color: var(--hs-text-dim);
  font-size: 12px;
  font-weight: 500;
  line-height: 1.2;
}

.screen-header__subtitle {
  margin: 0;
  color: var(--hs-text-dim);
  font-size: 13px;
  font-weight: 500;
}
</style>
