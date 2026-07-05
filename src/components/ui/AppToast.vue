<template>
  <div v-if="message" class="app-toast hs-animate-toast font-heading">
    {{ message }}
  </div>
</template>

<script setup lang="ts">
defineProps<{ message: string | null }>();
</script>

<style scoped>
.app-toast {
  position: fixed;
  bottom: 118px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 60;
  background: var(--hs-lime);
  color: var(--hs-bg);
  font-weight: 800;
  font-size: 13.5px;
  padding: 11px 18px;
  border-radius: 13px;
  box-shadow: 0 10px 30px -6px rgba(198, 255, 61, 0.5);
  white-space: nowrap;
  pointer-events: none;
}
</style>
