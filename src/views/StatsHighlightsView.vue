<template>
  <section class="stats-view hs-animate-fade">
    <ScreenHeader subtitle="Season highlights" accent-color="#B98CFF">
      <template #title-before>ST</template>
      <template #title-accent>ATS</template>
    </ScreenHeader>

    <div class="stats-grid">
      <div
        v-for="(card, i) in statCards"
        :key="i"
        class="stat-card"
        :class="{
          'stat-card--full': card.spanFull,
          'stat-card--gradient': card.gradient,
        }"
      >
        <div class="stat-card__tag" :style="{ color: card.tagColor }">{{ card.tag }}</div>
        <div>
          <div class="stat-card__value font-display" :style="{ fontSize: card.valueSize }">
            {{ card.value }}
          </div>
          <div class="stat-card__sub font-heading">{{ card.sub }}</div>
        </div>
      </div>
      <p v-if="statCards.length === 0" class="empty-state">Play some matches to unlock highlights.</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import ScreenHeader from '@/components/ui/ScreenHeader.vue';
import { useHighlights } from '@/composables/useHighlights';

const { statCards } = useHighlights();
</script>

<style scoped>
.stats-view {
  padding: 14px 18px 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 11px;
}

.stat-card {
  min-height: 118px;
  border-radius: 18px;
  padding: 15px 14px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: var(--hs-surface);
  border: 1px solid var(--hs-border);
}

.stat-card--full {
  grid-column: 1 / -1;
}

.stat-card--gradient {
  background: linear-gradient(135deg, rgba(255, 91, 57, 0.14), rgba(255, 91, 57, 0.03));
  border-color: rgba(255, 91, 57, 0.25);
}

.stat-card__tag {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.06em;
}

.stat-card__value {
  font-weight: 900;
  color: var(--hs-text);
  line-height: 1;
  letter-spacing: -0.01em;
}

.stat-card__sub {
  color: var(--hs-text-muted);
  font-size: 13px;
  font-weight: 600;
  margin-top: 5px;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  color: var(--hs-text-faint);
  font-size: 14px;
  padding: 32px 0;
}
</style>
