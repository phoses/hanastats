import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Game } from './game';
import type { Player } from './player';

export type AppTab = 'standings' | 'trends' | 'matches' | 'stats';

export interface AddMatchState {
  open: boolean;
  step: 1 | 2 | 3 | 4;
  game: Game | null;
  teamA: Player[];
  teamB: Player[];
  homeScore: number;
  awayScore: number;
  overtime: boolean;
}

function defaultAddState(): AddMatchState {
  return {
    open: false,
    step: 1,
    game: null,
    teamA: [],
    teamB: [],
    homeScore: 0,
    awayScore: 0,
    overtime: false,
  };
}

export const useUiStore = defineStore('ui', () => {
  const tab = ref<AppTab>('standings');
  const expandedPlayerId = ref<string | null>(null);
  const gameFilterId = ref<string | 'all'>('all');
  const chartSelectedIds = ref<string[]>([]);
  const justAddedIds = ref<string[]>([]);
  const toast = ref<string | null>(null);
  const newlyAddedMatchId = ref<string | null>(null);
  const add = ref<AddMatchState>(defaultAddState());

  let toastTimer: ReturnType<typeof setTimeout> | null = null;
  let highlightTimer: ReturnType<typeof setTimeout> | null = null;

  function setTab(next: AppTab) {
    tab.value = next;
  }

  function toggleExpanded(playerId: string) {
    expandedPlayerId.value = expandedPlayerId.value === playerId ? null : playerId;
  }

  function setGameFilter(id: string | 'all') {
    gameFilterId.value = id;
  }

  function toggleChartPlayer(playerId: string) {
    if (chartSelectedIds.value.includes(playerId)) {
      chartSelectedIds.value = chartSelectedIds.value.filter((id) => id !== playerId);
    } else {
      chartSelectedIds.value = [...chartSelectedIds.value, playerId];
    }
  }

  function initChartSelection(playerIds: string[]) {
    if (chartSelectedIds.value.length === 0 && playerIds.length > 0) {
      chartSelectedIds.value = playerIds.slice(0, 3);
    }
  }

  function openAddMatch() {
    add.value = defaultAddState();
    add.value.open = true;
  }

  function closeAddMatch() {
    add.value = defaultAddState();
  }

  function showToast(message: string) {
    toast.value = message;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.value = null;
    }, 2600);
  }

  function highlightPlayers(playerIds: string[], matchId?: string) {
    justAddedIds.value = playerIds;
    if (matchId) newlyAddedMatchId.value = matchId;
    if (highlightTimer) clearTimeout(highlightTimer);
    highlightTimer = setTimeout(() => {
      justAddedIds.value = [];
      newlyAddedMatchId.value = null;
    }, 2700);
  }

  function onMatchSaved(playerIds: string[], matchId?: string) {
    tab.value = 'standings';
    closeAddMatch();
    highlightPlayers(playerIds, matchId);
    showToast('Match saved · standings updated');
  }

  return {
    tab,
    expandedPlayerId,
    gameFilterId,
    chartSelectedIds,
    justAddedIds,
    toast,
    newlyAddedMatchId,
    add,
    setTab,
    toggleExpanded,
    setGameFilter,
    toggleChartPlayer,
    initChartSelection,
    openAddMatch,
    closeAddMatch,
    showToast,
    highlightPlayers,
    onMatchSaved,
  };
});
