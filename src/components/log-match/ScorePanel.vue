<template>
  <div class="score-panel" :class="`score-panel--${side}`">
    <div class="score-panel__label font-heading">{{ side === 'home' ? 'HOME' : 'AWAY' }}</div>
    <div class="score-panel__names">{{ names }}</div>
    <div class="score-panel__score font-display">{{ score }}</div>
    <div class="score-panel__steppers">
      <button class="score-panel__step score-panel__step--minus" @click="$emit('dec')">−</button>
      <button
        class="score-panel__step score-panel__step--plus"
        :class="`score-panel__step--plus-${side}`"
        @click="$emit('inc')"
      >
        +
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  side: 'home' | 'away';
  names: string;
  score: number;
}>();

defineEmits<{ inc: []; dec: [] }>();
</script>

<style scoped>
.score-panel {
  flex: 1;
  border-radius: 18px;
  padding: 16px 12px;
  text-align: center;
}

.score-panel--home {
  background: rgba(198, 255, 61, 0.06);
  border: 1.5px solid rgba(198, 255, 61, 0.22);
}

.score-panel--away {
  background: rgba(56, 166, 255, 0.06);
  border: 1.5px solid rgba(56, 166, 255, 0.22);
}

.score-panel__label {
  font-weight: 800;
  font-size: 13px;
  margin-bottom: 3px;
}

.score-panel--home .score-panel__label {
  color: var(--hs-lime);
}

.score-panel--away .score-panel__label {
  color: var(--hs-blue);
}

.score-panel__names {
  color: var(--hs-text-muted);
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 14px;
  height: 32px;
  overflow: hidden;
}

.score-panel__score {
  font-weight: 900;
  font-size: 52px;
  color: var(--hs-text);
  line-height: 1;
}

.score-panel__steppers {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 14px;
}

.score-panel__step {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  font-size: 22px;
  font-weight: 700;
}

.score-panel__step--minus {
  background: rgba(255, 255, 255, 0.08);
  color: var(--hs-text);
}

.score-panel__step--plus-home {
  background: var(--hs-lime);
  color: var(--hs-bg);
}

.score-panel__step--plus-away {
  background: var(--hs-blue);
  color: var(--hs-bg);
}
</style>
