<template>
  <div
    class="player-avatar font-heading"
    :class="{ 'player-avatar--rank1': rank1 }"
    :style="{
      width: size + 'px',
      height: size + 'px',
      borderRadius: radius + 'px',
      background: color,
      fontSize: fontSize + 'px',
      boxShadow: glow,
    }"
  >
    {{ initials }}
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    initials: string;
    color: string;
    size?: number;
    radius?: number;
    fontSize?: number;
    rank1?: boolean;
  }>(),
  {
    size: 42,
    radius: 13,
    fontSize: 16,
    rank1: false,
  }
);

const glow = computed(() => {
  if (props.rank1) {
    return `0 0 0 2px rgba(255,203,69,.6), 0 4px 14px -3px ${props.color}99`;
  }
  return `0 3px 10px -3px ${props.color}66`;
});
</script>

<style scoped>
.player-avatar {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  color: var(--hs-bg);
}
</style>
