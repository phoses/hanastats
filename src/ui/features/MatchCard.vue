<template>
  <UiCard as="article" padding="none" interactive :class="['tw:border-l-3', tone.edge]">
    <button
      type="button"
      class="tw:flex tw:w-full tw:items-center tw:gap-3 tw:px-3 tw:py-2.5 tw:text-left"
      :aria-expanded="expanded ? 'true' : 'false'"
      :aria-controls="detailsId"
      @click="emit('toggle')"
    >
      <span class="tw:flex tw:w-16 tw:shrink-0 tw:flex-col tw:text-xs tw:text-ink-muted">
        <span class="tw:tabular-nums">{{ match.playedFormatted }}</span>
        <span v-if="match.game" :class="['tw:truncate tw:font-medium', tone.text]">{{ match.game.name }}</span>
      </span>

      <span class="tw:flex tw:min-w-0 tw:grow tw:flex-col tw:gap-0.5">
        <span :class="['tw:flex tw:min-w-0 tw:items-center tw:gap-1', match.homewinner ? 'tw:font-semibold tw:text-win' : 'tw:text-ink']">
          <UiIcon v-if="match.homewinner" name="trophy" :size="14" label="winner" class="tw:shrink-0" />
          <span class="tw:truncate">{{ homePlayers }}</span>
        </span>
        <span :class="['tw:flex tw:min-w-0 tw:items-center tw:gap-1', match.awaywinner ? 'tw:font-semibold tw:text-win' : 'tw:text-ink']">
          <UiIcon v-if="match.awaywinner" name="trophy" :size="14" label="winner" class="tw:shrink-0" />
          <span class="tw:truncate">{{ awayPlayers }}</span>
        </span>
      </span>

      <span class="tw:flex tw:shrink-0 tw:flex-col tw:items-end">
        <span class="tw:text-base tw:font-semibold tw:tabular-nums">
          <span :class="match.homewinner ? 'tw:text-win' : ''">{{ match.homeScore }}</span>
          <span class="tw:text-ink-subtle">:</span>
          <span :class="match.awaywinner ? 'tw:text-win' : ''">{{ match.awayScore }}</span>
        </span>
        <span v-if="match.overtime" class="tw:text-[0.65rem] tw:text-ink-muted">overtime</span>
      </span>

      <UiIcon
        name="chevron-down"
        :size="16"
        :class="['tw:shrink-0 tw:text-ink-subtle tw:transition-transform', expanded ? 'tw:rotate-180' : '']"
      />
    </button>

    <div v-if="expanded" :id="detailsId" class="tw:border-t tw:border-line tw:px-3 tw:py-3">
      <div v-if="match.eloChanges.length > 0" class="tw:flex tw:flex-col tw:gap-3">
        <div v-for="team in ['home', 'away'] as const" :key="team">
          <p class="tw:mb-1 tw:text-xs tw:text-ink-muted">
            {{ team }} team · avg elo {{ averageElo(team) }}
          </p>
          <ul class="tw:flex tw:flex-col tw:gap-0.5 tw:text-sm">
            <li
              v-for="change in changesFor(team)"
              :key="change.playerId"
              class="tw:flex tw:items-center tw:justify-between tw:gap-2 tw:tabular-nums"
            >
              <span>{{ change.playerName }}</span>
              <span class="tw:flex tw:items-center tw:gap-1.5">
                <span class="tw:text-ink-muted">{{ change.oldElo }}</span>
                <span :class="change.change >= 0 ? 'tw:text-win' : 'tw:text-loss'">
                  {{ change.change >= 0 ? '+' : '' }}{{ change.change }}
                </span>
                <span>{{ change.newElo }}</span>
              </span>
            </li>
          </ul>
        </div>
      </div>
      <p v-else class="tw:text-sm tw:text-ink-muted">no elo changes recorded for this match</p>
    </div>
  </UiCard>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import UiCard from '../components/UiCard.vue';
import UiIcon from '../components/UiIcon.vue';
import { useComponentId } from '../composables/useComponentId';
import { toneFor } from '../palette';
import type { MatchListItem } from '@/composables/useMatchList';

const props = defineProps<{
  match: MatchListItem;
  expanded: boolean;
}>();

const emit = defineEmits<{ toggle: [] }>();

const detailsId = useComponentId('match-details');

const tone = computed(() => toneFor(props.match.game?.id));

const homePlayers = computed(() => {
  const names = props.match.homePlayers.map((player) => player.username).join(', ');
  return props.match.homeTeam ? `${names} (${props.match.homeTeam.shortName})` : names;
});

const awayPlayers = computed(() => {
  const names = props.match.awayPlayers.map((player) => player.username).join(', ');
  return props.match.awayTeam ? `${names} (${props.match.awayTeam.shortName})` : names;
});

function changesFor(team: 'home' | 'away') {
  return props.match.eloChanges.filter((change) => change.team === team);
}

function averageElo(team: 'home' | 'away') {
  return Math.round(props.match.eloChanges.find((change) => change.team === team)?.teamAvgElo || 0);
}
</script>
