import { computed, ref, watch } from 'vue';
import _ from 'lodash';
import { useGamesStore, type Game, type Team } from '@/stores/game';
import { useLoadingStore } from '@/stores/loading';
import { useMatchStore, type Match } from '@/stores/match';
import { usePlayersStore, type Player } from '@/stores/player';
import { BASE_ELO } from '@/utils/elo';
import { predictMatchGoals } from '@/utils/goalPrediction';
import { balanceTeamsByElo, getPlayerElos, splitRandomTeams } from './useTeamBalancer';

export type TeamMode = 'elo-based' | 'random' | 'fixed';

function emptyMatch(): Match {
  return {
    game: null as Game | null,
    homePlayers: [] as Player[],
    awayPlayers: [] as Player[],
    homeScore: 0,
    awayScore: 0,
    overtime: false,
    homeTeam: null as Team | null,
    awayTeam: null as Team | null,
  } as Match;
}

/**
 * State and rules for adding a match: player short list, team assignment per
 * team mode, average elo per team and the goal prediction.
 */
export function useAddMatchForm() {
  const matchStore = useMatchStore();
  const gameStore = useGamesStore();
  const playerStore = usePlayersStore();
  const loadingStore = useLoadingStore();

  const games = computed(() => _.chain(gameStore.games)
    .filter(game => !game.disabled)
    .sortBy('id')
    .reverse()
    .value());

  const match = ref(emptyMatch());
  const selectedPlayers = ref([] as Player[]);
  const teamMode = ref<TeamMode>('elo-based');
  const showAllPlayers = ref(false);

  const gameMatches = computed(() => {
    if (!match.value.game) {
      return [];
    }
    return (matchStore.matches ?? []).filter(m => m.game?.id === match.value.game?.id);
  });

  const averagePlayedGamesByPlayerOrTeam = computed(() => {
    return Math.floor(gameMatches.value.length * 0.122);
  });

  const getPlayerGameMatchCount = (player: Player) => {
    return gameMatches.value.filter(m =>
      m.homePlayers.some(p => p.id === player.id) ||
      m.awayPlayers.some(p => p.id === player.id)
    ).length;
  };

  const players = computed(() => {
    const allPlayers = _.sortBy(playerStore.players, player => player.username.toLowerCase());

    if (showAllPlayers.value) {
      return allPlayers;
    }

    const threshold = averagePlayedGamesByPlayerOrTeam.value;
    const selectedIds = new Set(selectedPlayers.value.map(p => p.id));

    return allPlayers.filter(player =>
      getPlayerGameMatchCount(player) > threshold || selectedIds.has(player.id)
    );
  });

  const clear = () => {
    match.value = {
      game: null as Game | null,
      homePlayers: [],
      awayPlayers: [],
      homeScore: 0,
      awayScore: 0,
      overtime: false,
    } as Match;

    selectedPlayers.value = [];
  };

  // Current elo ratings for the selected game, including not-yet-played players
  const getPlayerElosForCurrentGame = (playersList: Player[]): { [key: string]: number } => {
    if (!match.value.game || !matchStore.matches) {
      return {};
    }

    const matchesOfGame = matchStore.matches.filter(m => m.game?.id === match.value.game?.id);

    return getPlayerElos(matchesOfGame, playersList);
  };

  watch(() => match.value.game, () => {
    showAllPlayers.value = false;
  });

  watch(selectedPlayers, (newVal: Player[]) => {
    if (teamMode.value === 'fixed') {
      // Fixed teams: alternate adding players to each team
      if (match.value.homePlayers.length === match.value.awayPlayers.length) {
        match.value.homePlayers.push(newVal[newVal.length - 1]);
      } else {
        match.value.awayPlayers.push(newVal[newVal.length - 1]);
      }
    } else if (teamMode.value === 'elo-based' && newVal.length > 1) {
      // Use elo-based balancing
      const balanced = balanceTeamsByElo(newVal, getPlayerElosForCurrentGame(newVal));
      match.value.homePlayers = balanced.home;
      match.value.awayPlayers = balanced.away;
    } else if (teamMode.value === 'random') {
      const random = splitRandomTeams(newVal);
      match.value.homePlayers = random.home;
      match.value.awayPlayers = random.away;
    }

    if (match.value?.game?.teams?.length! > 1) {
      const teams = _.shuffle(match.value?.game?.teams);
      match.value.homeTeam = teams[0];
      match.value.awayTeam = teams[1];
    }
  });

  async function addMatch() {
    await loadingStore.doLoading(async () => {
      await matchStore.addMatch(match.value);
      clear();
    });
  }

  function movePlayerToOtherTeam(playerId: string, from: 'home' | 'away') {
    if (from === 'home') {
      const player = match.value.homePlayers.find((item) => item.id === playerId);
      if (!player) {
        return;
      }
      match.value.homePlayers = match.value.homePlayers.filter((item) => item.id !== playerId);
      match.value.awayPlayers = [...match.value.awayPlayers, player];
      return;
    }

    const player = match.value.awayPlayers.find((item) => item.id === playerId);
    if (!player) {
      return;
    }
    match.value.awayPlayers = match.value.awayPlayers.filter((item) => item.id !== playerId);
    match.value.homePlayers = [...match.value.homePlayers, player];
  }

  const homeTeamAvgElo = computed(() => {
    if (!match.value.game || match.value.homePlayers.length === 0) {
      return null;
    }
    const eloRatings = getPlayerElosForCurrentGame([...match.value.homePlayers, ...match.value.awayPlayers]);
    const homeElos = match.value.homePlayers.map(p => eloRatings[p.id] || BASE_ELO);
    return Math.round(_.mean(homeElos));
  });

  const awayTeamAvgElo = computed(() => {
    if (!match.value.game || match.value.awayPlayers.length === 0) {
      return null;
    }
    const eloRatings = getPlayerElosForCurrentGame([...match.value.homePlayers, ...match.value.awayPlayers]);
    const awayElos = match.value.awayPlayers.map(p => eloRatings[p.id] || BASE_ELO);
    return Math.round(_.mean(awayElos));
  });

  const goalPrediction = computed(() => {
    if (
      !match.value.game ||
      match.value.homePlayers.length === 0 ||
      match.value.awayPlayers.length === 0
    ) {
      return null;
    }

    return predictMatchGoals(
      gameMatches.value,
      match.value.homePlayers,
      match.value.awayPlayers
    );
  });

  return {
    games,
    match,
    selectedPlayers,
    teamMode,
    showAllPlayers,
    players,
    homeTeamAvgElo,
    awayTeamAvgElo,
    goalPrediction,
    addMatch,
    movePlayerToOtherTeam,
    clear,
  };
}
