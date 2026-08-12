import { computed, type Ref } from 'vue';
import _ from 'lodash';
import moment from 'moment';
import type { Match } from '@/stores/match';
import type { EloChange } from '@/utils/elo';

export interface MatchListItem extends Match {
  playedFormatted: string;
  homewinner: boolean;
  awaywinner: boolean;
  eloChanges: EloChange[];
}

export function useMatchList(
  filteredMatches: Ref<Match[] | null>,
  matchEloChanges: Ref<{ [matchId: string]: EloChange[] }>
) {
  return computed(() => {
    if (filteredMatches.value === null) {
      return null;
    }

    return _.chain(filteredMatches.value)
      .map(match => {
        return {
          ...match,
          playedFormatted: moment(match.played).format('YY-MM-DD'),
          homewinner: match.homeScore > match.awayScore,
          awaywinner: match.awayScore > match.homeScore,
          eloChanges: match.id ? (matchEloChanges.value[match.id] || []) : []
        };
      })
      .sortBy('played')
      .reverse()
      .value() as MatchListItem[];
  });
}
