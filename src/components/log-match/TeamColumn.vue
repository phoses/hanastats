<template>
  <div class="team-column" :class="`team-column--${side}`">
    <div class="team-column__header">
      <span class="team-column__label font-heading">{{ side === 'home' ? 'HOME' : 'AWAY' }} · {{ players.length }}</span>
      <span class="team-column__elo">{{ avgElo ? avgElo + ' avg' : '—' }}</span>
    </div>
    <div class="team-column__list">
      <div v-for="player in players" :key="player.id" class="team-chip">
        <PlayerAvatar
          :initials="getInitials(player.username)"
          :color="getPlayerColor(player.id, allIds)"
          :size="28"
          :radius="9"
          :font-size="11"
        />
        <span class="team-chip__name font-heading">{{ getShortName(player.username) }}</span>
        <button class="team-chip__action" title="Move to other team" @click="$emit('swap', player)">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <path
              d="M5 4L2 7L5 10M11 6L14 9L11 12M2 7H14M2 9H14"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <button class="team-chip__action team-chip__action--muted" title="Remove" @click="$emit('remove', player)">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path
              d="M4 4L12 12M12 4L4 12"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>
      <div v-if="players.length === 0" class="team-column__placeholder">tap to add</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import PlayerAvatar from '@/components/ui/PlayerAvatar.vue';
import type { Player } from '@/stores/player';
import { usePlayersStore } from '@/stores/player';
import { getInitials, getPlayerColor, getShortName } from '@/utils/playerUi';

defineProps<{
  side: 'home' | 'away';
  players: Player[];
  avgElo: number;
}>();

defineEmits<{
  swap: [player: Player];
  remove: [player: Player];
}>();

const playerStore = usePlayersStore();
const allIds = computed(() => playerStore.players.map((p) => p.id));
</script>

<style scoped>
.team-column {
  flex: 1;
  border-radius: 16px;
  padding: 12px 11px;
  min-height: 150px;
}

.team-column--home {
  background: rgba(198, 255, 61, 0.06);
  border: 1.5px solid rgba(198, 255, 61, 0.22);
}

.team-column--away {
  background: rgba(56, 166, 255, 0.06);
  border: 1.5px solid rgba(56, 166, 255, 0.22);
}

.team-column__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.team-column__label {
  font-weight: 800;
  font-size: 14px;
}

.team-column--home .team-column__label {
  color: var(--hs-lime);
}

.team-column--away .team-column__label {
  color: var(--hs-blue);
}

.team-column__elo {
  font-size: 11px;
  font-weight: 700;
  color: var(--hs-text-dim);
}

.team-column__list {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.team-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 11px;
  padding: 6px 8px;
}

.team-chip__name {
  flex: 1;
  font-weight: 700;
  font-size: 13px;
  color: var(--hs-text);
}

.team-chip__action {
  border: none;
  background: none;
  cursor: pointer;
  color: var(--hs-text-dim);
  padding: 2px;
}

.team-chip__action--muted {
  color: #5a646f;
}

.team-column__placeholder {
  border: 1.5px dashed;
  border-radius: 11px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
}

.team-column--home .team-column__placeholder {
  border-color: rgba(198, 255, 61, 0.28);
  color: rgba(198, 255, 61, 0.5);
}

.team-column--away .team-column__placeholder {
  border-color: rgba(56, 166, 255, 0.28);
  color: rgba(56, 166, 255, 0.5);
}
</style>
