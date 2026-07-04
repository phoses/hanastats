<template>
  <div
    class="player-card"
    :class="{
      'player-card--highlight': highlighted,
      'player-card--invalid': !player.validResult,
    }"
    :style="{ animation: animate ? 'hsFadeIn .35s ease' : 'none' }"
  >
    <button class="player-card__row" @click="$emit('toggle')">
      <div class="player-card__rank font-display" :style="{ color: rankColor }">{{ rank }}</div>
      <PlayerAvatar
        :initials="player.initials"
        :color="player.color"
        :rank1="rank === 1"
      />
      <div class="player-card__info">
        <div class="player-card__name-row">
          <span class="player-card__name font-heading">{{ player.name }}</span>
          <span class="player-card__streak" :style="streakStyle">{{ streakLabel }}</span>
        </div>
        <div class="player-card__record">
          {{ player.wins }}–{{ player.losses }} · {{ player.winPct }}% win
        </div>
      </div>
      <div class="player-card__elo-block">
        <div class="player-card__elo font-display">{{ player.elo }}</div>
        <div class="player-card__trend" :style="{ color: player.trendUp ? 'var(--hs-lime)' : 'var(--hs-cooling)' }">
          {{ player.trendUp ? '▲ rising' : '▼ cooling' }}
        </div>
      </div>
      <div class="player-card__chevron" :class="{ 'player-card__chevron--open': expanded }">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path
            d="M3 4.5L6 7.5L9 4.5"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
    </button>

    <div v-if="expanded" class="player-card__detail hs-animate-fade">
      <div class="player-card__divider" />
      <div class="player-card__stats">
        <div class="player-card__stat">
          <div class="player-card__stat-value font-display player-card__stat-value--accent">
            {{ player.winPct }}%
          </div>
          <div class="player-card__stat-label">WIN RATE</div>
        </div>
        <div class="player-card__stat">
          <div class="player-card__stat-value font-display">{{ player.peakElo }}</div>
          <div class="player-card__stat-label">PEAK ELO</div>
        </div>
        <div class="player-card__stat">
          <div class="player-card__stat-value font-display">{{ player.avgMargin }}</div>
          <div class="player-card__stat-label">AVG MARGIN</div>
        </div>
      </div>
      <div class="player-card__bottom">
        <div>
          <div class="player-card__stat-label player-card__stat-label--spaced">LAST 6</div>
          <div class="player-card__form">
            <span
              v-for="(r, i) in player.form"
              :key="i"
              class="player-card__form-chip font-heading"
              :class="
                r === 'W'
                  ? 'player-card__form-chip--win'
                  : r === 'D'
                    ? 'player-card__form-chip--draw'
                    : 'player-card__form-chip--loss'
              "
            >
              {{ r }}
            </span>
          </div>
        </div>
        <div class="player-card__rival">
          <div class="player-card__stat-label">TOP RIVAL</div>
          <div class="player-card__rival-name font-heading">{{ player.topRival }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import PlayerAvatar from './PlayerAvatar.vue';
import { MEDAL_COLORS } from '@/utils/playerUi';
import type { PlayerStanding } from '@/composables/usePlayerStandings';

const props = defineProps<{
  player: PlayerStanding;
  rank: number;
  expanded: boolean;
  highlighted?: boolean;
  animate?: boolean;
}>();

defineEmits<{ toggle: [] }>();

const rankColor = computed(() =>
  props.rank <= 3 ? MEDAL_COLORS[props.rank - 1] : 'var(--hs-text-faint)'
);

const streakLabel = computed(() => `${props.player.streakType}${props.player.streakCount}`);

const streakStyle = computed(() => {
  const hot = props.player.streakType === 'W' && props.player.streakCount >= 3;
  const cold = props.player.streakType === 'L' && props.player.streakCount >= 2;
  if (hot) return { background: 'rgba(255, 85, 85, 0.16)', color: 'var(--hs-red)' };
  if (cold) return { background: 'rgba(139, 233, 253, 0.16)', color: 'var(--hs-blue)' };
  return { background: 'rgba(255,255,255,.06)', color: 'var(--hs-text-muted)' };
});
</script>

<style scoped>
.player-card {
  background: var(--hs-surface);
  border: 1px solid var(--hs-border);
  border-radius: 17px;
  overflow: hidden;
  box-shadow: 0 2px 10px -4px rgba(0, 0, 0, 0.5);
}

.player-card--highlight {
  background: var(--hs-accent-soft);
  border-color: rgba(189, 147, 249, 0.4);
}

.player-card--invalid {
  opacity: 0.55;
}

.player-card--invalid .player-card__name,
.player-card--invalid .player-card__elo,
.player-card--invalid .player-card__record {
  color: rgba(255, 170, 170, 0.85);
}

.player-card__row {
  width: 100%;
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 11px 13px;
  text-align: left;
  color: inherit;
}

.player-card__rank {
  flex: 0 0 26px;
  text-align: center;
  font-weight: 900;
  font-size: 19px;
}

.player-card__info {
  flex: 1;
  min-width: 0;
}

.player-card__name-row {
  display: flex;
  align-items: center;
  gap: 7px;
}

.player-card__name {
  font-weight: 700;
  font-size: 16px;
  color: var(--hs-text);
}

.player-card__streak {
  flex: none;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 7px;
}

.player-card__record {
  color: var(--hs-text-dim);
  font-size: 12.5px;
  font-weight: 500;
  margin-top: 1px;
}

.player-card__elo-block {
  text-align: right;
}

.player-card__elo {
  font-weight: 800;
  font-size: 20px;
  color: var(--hs-text);
  line-height: 1;
  letter-spacing: -0.01em;
}

.player-card__trend {
  font-size: 11.5px;
  font-weight: 700;
  margin-top: 2px;
}

.player-card__chevron {
  flex: 0 0 12px;
  color: var(--hs-text-faint);
  transition: transform 0.2s;
}

.player-card__chevron--open {
  transform: rotate(180deg);
}

.player-card__detail {
  padding: 2px 15px 15px;
}

.player-card__divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.07);
  margin-bottom: 13px;
}

.player-card__stats {
  display: flex;
  gap: 8px;
  margin-bottom: 13px;
}

.player-card__stat {
  flex: 1;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 12px;
  padding: 10px 12px;
}

.player-card__stat-value {
  font-weight: 800;
  font-size: 19px;
  color: var(--hs-text);
}

.player-card__stat-label {
  color: var(--hs-text-dim);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.03em;
}

.player-card__stat-label--spaced {
  margin-bottom: 6px;
}

.player-card__bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.player-card__form {
  display: flex;
  gap: 5px;
}

.player-card__form-chip {
  width: 22px;
  height: 22px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
}

.player-card__form-chip--win {
  background: var(--hs-win-soft);
  color: var(--hs-lime);
}

.player-card__form-chip--loss {
  background: var(--hs-loss-soft);
  color: var(--hs-red);
}

.player-card__form-chip--draw {
  background: rgba(255, 255, 255, 0.08);
  color: var(--hs-text-muted);
}

.player-card__stat-value--accent {
  color: var(--hs-lime);
}

.player-card__rival {
  text-align: right;
}

.player-card__rival-name {
  color: var(--hs-text);
  font-size: 13px;
  font-weight: 700;
}
</style>
