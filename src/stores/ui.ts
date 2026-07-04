import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Game } from './game';
import type { Player } from './player';

export type AppTab = 'standings' | 'trends' | 'matches' | 'stats';

export type AppDesign = 'new' | 'old';

const DESIGN_STORAGE_KEY = 'hs-design';

function loadDesign(): AppDesign {
  try {
    return localStorage.getItem(DESIGN_STORAGE_KEY) === 'old' ? 'old' : 'new';
  } catch {
    return 'new';
  }
}

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
  const design = ref<AppDesign>(loadDesign());
  const expandedPlayerId = ref<string | null>(null);
  const gameFilterId = ref<string | 'all'>('all');
  const playerCountFilter = ref<number[]>([]);
  const playedMatchMonthFilter = ref<string[]>([]);
  const standingsAsWholeTeam = ref(false);
  const playersInSameTeam = ref<Player[]>([]);
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

  function setDesign(next: AppDesign) {
    design.value = next;
    try {
      localStorage.setItem(DESIGN_STORAGE_KEY, next);
    } catch {
      // ignore storage errors (e.g. private mode)
    }
  }

  function toggleDesign() {
    setDesign(design.value === 'new' ? 'old' : 'new');
  }

  function toggleExpanded(playerId: string) {
    expandedPlayerId.value = expandedPlayerId.value === playerId ? null : playerId;
  }

  function setGameFilter(id: string | 'all') {
    gameFilterId.value = id;
  }

  function togglePlayerCountFilter(count: number) {
    if (playerCountFilter.value.includes(count)) {
      playerCountFilter.value = playerCountFilter.value.filter((c) => c !== count);
    } else {
      playerCountFilter.value = [...playerCountFilter.value, count];
    }
  }

  function toggleMonthFilter(month: string) {
    if (playedMatchMonthFilter.value.includes(month)) {
      playedMatchMonthFilter.value = playedMatchMonthFilter.value.filter((m) => m !== month);
    } else {
      playedMatchMonthFilter.value = [...playedMatchMonthFilter.value, month];
    }
  }

  function toggleSameTeamPlayer(player: Player) {
    if (playersInSameTeam.value.some((p) => p.id === player.id)) {
      playersInSameTeam.value = playersInSameTeam.value.filter((p) => p.id !== player.id);
    } else {
      playersInSameTeam.value = [...playersInSameTeam.value, player];
    }
  }

  function toggleStandingsAsWholeTeam() {
    standingsAsWholeTeam.value = !standingsAsWholeTeam.value;
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
    add.value = defaultAddState();
    highlightPlayers(playerIds, matchId);
    showToast('Match saved · standings updated');
  }

  return {
    tab,
    design,
    expandedPlayerId,
    gameFilterId,
    playerCountFilter,
    playedMatchMonthFilter,
    standingsAsWholeTeam,
    playersInSameTeam,
    chartSelectedIds,
    justAddedIds,
    toast,
    newlyAddedMatchId,
    add,
    setTab,
    setDesign,
    toggleDesign,
    toggleExpanded,
    setGameFilter,
    togglePlayerCountFilter,
    toggleMonthFilter,
    toggleSameTeamPlayer,
    toggleStandingsAsWholeTeam,
    toggleChartPlayer,
    initChartSelection,
    openAddMatch,
    closeAddMatch,
    showToast,
    highlightPlayers,
    onMatchSaved,
  };
});
