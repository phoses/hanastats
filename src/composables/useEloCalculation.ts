import { computed, type Ref } from 'vue';
import type { Match } from '@/stores/match';
import type { Player } from '@/stores/player';
import { calculateEloRatings } from '@/utils/elo';

/**
 * Runs the elo calculation once for a set of matches and shares both results,
 * so standings and match lists do not each recalculate the whole history.
 */
export function useEloCalculation(filteredMatches: Ref<Match[] | null>, players: Ref<Player[][]>) {
  const calculation = computed(() => calculateEloRatings(filteredMatches.value || [], players.value));

  return {
    eloRatings: computed(() => calculation.value.eloRatings),
    matchEloChanges: computed(() => calculation.value.matchEloChanges),
  };
}
