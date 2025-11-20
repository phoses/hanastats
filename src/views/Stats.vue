<template>
  <h1>Stats</h1>

  <Accordion :multiple="true" :activeIndex="[1, 2]">
    <AccordionTab header="filters">
      <SelectButton v-model="gameFilter" :options="distinctGames" optionLabel="name" multiple/>
      <SelectButton v-model="playerCountFilter" :options="listOfPlayerCountOfMatches" optionLabel="name" multiple class="mt-3"/>
      <ToggleButton v-model="standingsAsWholeTeam" onLabel="Whole teams" offLabel="Whole teams" class="mt-3"/>
      <SelectButton v-model="playersInSameTeam" :options="allPlayers" optionLabel="username" multiple class="mt-3"/>
      <SelectButton v-model="playedMatchMonthFilter" :options="distinctPlayedMatchesMonths" multiple class="mt-3"/>
    </AccordionTab>

    <AccordionTab>
      <template #header >
        <div onclick="event.stopPropagation();" class="flex align-items-center">
          standings
          <SelectButton class="ml-3 quickfilter" v-model="enabledGamesFilter" :options="enabledGames" optionLabel="name" multiple/>
        </div>
      </template>

      <DataTable
        v-model:expandedRows="expandedRows"
        :value="standings"
        :rowClass="({validResult}) => !validResult ? 'row-disabled' : undefined"
        dataKey="player">
        <Column field="player" header="player">
          <template #body="slotProps">
            <div class="flex align-items-center">
              <a href="javascript:void(0)" @click.stop="onRowExpand(slotProps.data.player)">{{ slotProps.data.player }}</a>
              <template v-if="slotProps.data.loseOrWinStreakLatestStreak > 4">
                <span v-if="slotProps.data.loseOrWinStreakLatestStreakType === 'W'">🔥</span>
                <span v-if="slotProps.data.loseOrWinStreakLatestStreakType === 'L'">❄️</span>
              </template>
              <span v-if="slotProps.data.ownsGame" class="color-invert">🎮</span>
            </div>
          </template>
        </Column>
        <Column field="matches" header="gp"></Column>
        <Column field="wins" header="w"></Column>
        <Column field="losses" header="l"></Column>
        <Column v-if="showDraws" field="draws" header="d"></Column>
        <Column field="overtimelosses" header="ot"></Column>
        <Column field="goalsDiff" header="g-diff"></Column>
        <Column field="loseOrWinStreakLatestStreak" header="s">
          <template #body="slotProps">
            {{ slotProps.data.loseOrWinStreakLatestStreak + slotProps.data.loseOrWinStreakLatestStreakType }}
          </template>
        </Column>
        <Column field="playerPointsOfPercantage" header="p%"></Column>
        <Column v-if="!standingsAsWholeTeam" field="elo" header="elo"></Column>
        <template #expansion="slotProps">
          <div class="py-2">
            Games played: {{ slotProps.data.matches }}<br>
            <div class="pt-2">
              Wins: {{ slotProps.data.wins }}<br>
              <div class="pl-2">
                Regulartime wins: {{ slotProps.data.regularTimeWins }} (points: {{ slotProps.data.pointsForRegularTimeWins }})<br>
                Overtime wins: {{ slotProps.data.overtimewins }} (points: {{ slotProps.data.pointsForOverTimeWin }})<br>
              </div>
            </div>
            <div class="pt-2">
              Losses: {{ slotProps.data.losses }}<br>
              <div class="pl-2">
                Regulartime losses: {{ slotProps.data.regularTimeLosses }}<br>
                Overtime losses: {{ slotProps.data.overtimelosses }} (points: {{ slotProps.data.pointsForOverTimeLose }})<br>
              </div>
            </div>
            <div class="pt-2" v-if="showDraws && slotProps.data.draws > 0">
              Draws: {{ slotProps.data.draws }} (points: {{ slotProps.data.pointsForDraws }})
            </div>
            <div class="pt-2">
              Goals for: {{ slotProps.data.goalsFor }}<br>
              Goals against: {{ slotProps.data.goalsAgainst }}<br>
              Goals diff: {{ slotProps.data.goalsDiff }}<br>
            </div>
            <div class="pt-2">
              Points: {{ slotProps.data.points }} (
                {{ slotProps.data.pointsForRegularTimeWins }} + {{ slotProps.data.pointsForOverTimeWin }} + {{ slotProps.data.pointsForOverTimeLose }} + {{ slotProps.data.pointsForDraws }})<br>
              Maximum points: {{ slotProps.data.maximumPoints }}<br>
              Points of percentage: {{ slotProps.data.playerPointsOfPercantage }} ({{ slotProps.data.points }}  / {{ slotProps.data.maximumPoints }})<br>
            </div>
            <div class="pt-2" v-if="!standingsAsWholeTeam">
              ELO Rating: {{ slotProps.data.elo }}<br>
            </div>
          </div>
        </template>
      </DataTable>
    </AccordionTab>

    <AccordionTab>
      <template #header>
        <span class="pr-2">matches</span>
        <span v-if="matches">({{ matches.length }})</span>
      </template>

      <div v-for="match in matches" :key="match.id" class="mb-2">
        <div v-if="match.id" class="flex match justify-content-between clickable" @click="onMatchExpand(match.id)">
          <div class="flex flex-column mr-3">
            <div>{{match.playedFormatted}}</div>

            <div v-if="match.game">{{match.game.name}}</div>
          </div>
          <div class="flex flex-column align-content-start flex-grow-1">
            <div class="hometeam" :class="{'winner': match.homewinner}">
              {{ match.homePlayers.map(p => p.username).join(',') }}
              <span v-if="match.homeTeam">({{ match.homeTeam.shortName }})</span>
            </div>
            <div>VS</div>
            <div class="pr-2 awayteam" :class="{'winner': match.awaywinner}">
              {{ match.awayPlayers.map(p => p.username).join(',') }}
              <span v-if="match.awayTeam">({{ match.awayTeam.shortName }})</span>
            </div>
          </div>
          <div class="flex flex-none align-content-start">
            <div>{{ match.homeScore }}:{{ match.awayScore }}</div>
            <div class="w-2rem"><span v-if="match.overtime">(OT)</span></div>
          </div>
        </div>
        <div v-if="match.id && expandedMatches[match.id] && match.eloChanges.length > 0" class="elo-details pl-3 pt-2 pb-2">
          <div class="font-bold mb-1">ELO Changes:</div>
          <div v-for="change in match.eloChanges" :key="change.playerId" class="elo-change">
            {{ change.playerName }}: {{ change.oldElo }} <span :class="change.change >= 0 ? 'text-green-500' : 'text-red-500'">{{ change.change >= 0 ? '+' : '' }}{{ change.change }}</span> = {{ change.newElo }}
          </div>
        </div>
      </div>
    </AccordionTab>

    <AccordionTab header="miscallenous">
      <div>
        <div>Matches: {{ miscallenousStatistics.matches }}</div>
        <div>Players: {{ miscallenousStatistics.players }}</div>
        <div>Unique teams: {{ miscallenousStatistics.teams }}</div>
        <div>Home team win percentage: {{ miscallenousStatistics.homeTeamWinPercentage }}</div>
        <div>1 player team win %: {{ miscallenousStatistics.onePlayerTeamWinPercentage }}</div>
        <div>2 player team win %: {{ miscallenousStatistics.twoPlayerTeamWinPercentage }}</div>
        <div>3 player team win %: {{ miscallenousStatistics.threePlayerTeamWinPercentage }}</div>
      </div>
    </AccordionTab>
  </Accordion>

</template>

<script setup lang="ts">
import { useLoadingStore } from '@/stores/loading';
import { useMatchStore } from '@/stores/match';
import { computed, onMounted, ref, watch } from 'vue';
import _ from 'lodash';
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import SelectButton from 'primevue/selectbutton';
import moment from 'moment';
import { useGamesStore, type Game } from '@/stores/game';
import ToggleButton from 'primevue/togglebutton';
import { usePlayersStore, type Player } from '@/stores/player';

const matchStore = useMatchStore();
const loadingStore = useLoadingStore();
const gameStore = useGamesStore();
const playerStore = usePlayersStore();

const playerCountFilter = ref([] as { name: string, value: number }[]);
const gameFilter = ref([] as Game[]);
const enabledGamesFilter = ref([] as Game[]);
const standingsAsWholeTeam = ref(false)
const playersInSameTeam = ref([] as Player[]);
const playedMatchMonthFilter = ref([] as string[]);
const games = computed(() => gameStore.games);
const allPlayers = computed(() => playerStore.players);

const showDraws = computed(() => {
  // Show draws column when a single game is selected and it has points for draw
  if (filteredGames.value.length === 1) {
    const selectedGame = filteredGames.value[0];
    return selectedGame && selectedGame.pointsForDraw && selectedGame.pointsForDraw > 0;
  }
  return false;
});

const expandedRows = ref({} as any);
const expandedMatches = ref({} as any);

onMounted(async () => {
  if (matches.value === null) {
    loadingStore.doLoading(async () => {
      await matchStore.getMatches();
      await gameStore.getGames();
      await playerStore.getPlayers();
    });
  }
});

const onRowExpand = (player: any) => {
  if (expandedRows.value[player]) {
    delete expandedRows.value[player];
  } else {
    expandedRows.value[player] = true;
  }

  expandedRows.value = {...expandedRows.value};
}

const onMatchExpand = (matchId: string) => {
  if (expandedMatches.value[matchId]) {
    delete expandedMatches.value[matchId];
  } else {
    expandedMatches.value[matchId] = true;
  }

  expandedMatches.value = {...expandedMatches.value};
}

const filteredGames = computed(() => {
  return _.uniqBy([...gameFilter.value, ...enabledGamesFilter.value], 'id');
});

watch(filteredGames, () => {
  expandedRows.value = {...expandedRows.value};
});

const filteredMatches = computed(() => {
  if (matchStore.matches === null) {
    return null;
  }

  return _.chain(matchStore.matches)
    .filter(match => playerCountFilter.value.length === 0 || _.map(playerCountFilter.value, 'value').includes([...match.homePlayers, ...match.awayPlayers].length))
    .filter(match => filteredGames.value.length === 0 || filteredGames.value.map(g => g.id).includes(match.game!.id))
    .filter(match => playersInSameTeam.value.length === 0 || playersInSameTeam.value.every(player => match.homePlayers.map(p => p.id).includes(player.id)) || playersInSameTeam.value.every(player => match.awayPlayers.map(p => p.id).includes(player.id)))
    .filter(match => playedMatchMonthFilter.value.length === 0 || playedMatchMonthFilter.value.includes(moment(match.played).format('YYYY-MM')))
    .map(match => {
      return {
        ...match,
        game: _.find(games.value, g => g.id === match.game!.id),
        homePlayers: _.sortBy(match.homePlayers, 'id'),
        awayPlayers: _.sortBy(match.awayPlayers, 'id'),
      }

    })
    .value();
});

const distinctGames = computed(() => {
  if (matchStore.matches === null) {
    return null;
  }

  return _.chain(matchStore.matches)
    .map(match => match.game)
    .uniqBy('id')
    .value();
});

const enabledGames = computed(() => {
  return _.filter(games.value, game => !game.disabled);
})

const distinctPlayedMatchesMonths = computed(() => {
  if (matchStore.matches === null) {
    return null;
  }

  return _.chain(matchStore.matches)
    .map(match => moment(match.played).format('YYYY-MM'))
    .uniq()
    .reverse()
    .value();
});

const matches = computed(() => {
  if (matchStore.matches === null) {
    return null;
  }

  const { matchEloChanges } = calculateEloRatings();

  return _.chain(filteredMatches.value)
    .map(match => {
      return {
        ...match,
        playedFormatted: moment(match.played).format('YY-MM-DD'),
        homewinner: match.homeScore > match.awayScore,
        awaywinner: match.awayScore > match.homeScore,
        eloChanges: match.id ? (matchEloChanges[match.id] || []) : []
      };
    })
    .sortBy('played')
    .reverse()
    .value();
});

const listOfPlayerCountOfMatches = computed(() => {
  if (matchStore.matches === null) {
    return null;
  }

  return _.chain(matchStore.matches)
    .map(match => {
      return [...match.homePlayers, ...match.awayPlayers].length;
    })
    .flatten()
    .uniq()
    .map(count => {
      return {
        name: count + ' players',
        value: count
      };
    })
    .sortBy('value')
    .value();
});

const teamContainsPlayer = (team: Player[], players: Player[]) =>{
    if (standingsAsWholeTeam.value) {
      return team.map(p => p.id).join(',') === players.map(p => p.id).join(',');
    } else {
      return team.map(p => p.id).includes(players[0].id);
    }
  }

const percentageFormat = new Intl.NumberFormat('en-US', {
    minimumIntegerDigits: 1,
    minimumFractionDigits: 3
});

const players = computed(() => {
  return _.chain(filteredMatches.value)
    .flatMap(match => {
      return [...match.homePlayers, ...match.awayPlayers];
    })
    .uniqBy('id')
    .map(player => [player])
    .value();
  });

const uniqueTeams = computed(() => {
  return _.uniqBy([
    ..._.map(filteredMatches.value, match => match.homePlayers),
    ..._.map(filteredMatches.value, match => match.awayPlayers)
  ], players => players.map(p => p.id).join(','));
});

const calculateEloRatings = () => {
  const K_FACTOR = 32; // Standard K-factor for ELO
  const BASE_ELO = 1500;
  
  // Initialize ELO ratings for all individual players
  const eloRatings: { [key: string]: number } = {};
  
  // Store ELO changes per match
  const matchEloChanges: { [matchId: string]: any[] } = {};
  
  // Initialize all players with base ELO
  players.value.forEach(playerArray => {
    const playerId = playerArray[0].id;
    eloRatings[playerId] = BASE_ELO;
  });
  
  // Calculate expected score
  const getExpectedScore = (ratingA: number, ratingB: number): number => {
    return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
  };
  
  // Process matches chronologically
  const sortedMatches = _.sortBy(filteredMatches.value, 'played');
  
  sortedMatches.forEach(match => {
    // Calculate average ELO for each team
    const homePlayersElo = match.homePlayers.map(p => eloRatings[p.id] || BASE_ELO);
    const awayPlayersElo = match.awayPlayers.map(p => eloRatings[p.id] || BASE_ELO);
    
    const homeTeamAvgElo = _.mean(homePlayersElo);
    const awayTeamAvgElo = _.mean(awayPlayersElo);
    
    // Determine actual scores (1 for win, 0.5 for draw, 0 for loss)
    let homeActual: number;
    let awayActual: number;
    
    if (match.homeScore > match.awayScore) {
      homeActual = 1;
      awayActual = 0;
    } else if (match.homeScore < match.awayScore) {
      homeActual = 0;
      awayActual = 1;
    } else {
      homeActual = 0.5;
      awayActual = 0.5;
    }
    
    // Track ELO changes for this match
    const matchChanges: any[] = [];
    
    // Update ELO for each home player against average away team ELO
    match.homePlayers.forEach(player => {
      const oldElo = eloRatings[player.id] || BASE_ELO;
      const expectedScore = getExpectedScore(oldElo, awayTeamAvgElo);
      const newElo = oldElo + K_FACTOR * (homeActual - expectedScore);
      const change = newElo - oldElo;
      
      matchChanges.push({
        playerId: player.id,
        playerName: player.username,
        oldElo: Math.round(oldElo),
        change: Math.round(change),
        newElo: Math.round(newElo),
        team: 'home'
      });
      
      eloRatings[player.id] = newElo;
    });
    
    // Update ELO for each away player against average home team ELO
    match.awayPlayers.forEach(player => {
      const oldElo = eloRatings[player.id] || BASE_ELO;
      const expectedScore = getExpectedScore(oldElo, homeTeamAvgElo);
      const newElo = oldElo + K_FACTOR * (awayActual - expectedScore);
      const change = newElo - oldElo;
      
      matchChanges.push({
        playerId: player.id,
        playerName: player.username,
        oldElo: Math.round(oldElo),
        change: Math.round(change),
        newElo: Math.round(newElo),
        team: 'away'
      });
      
      eloRatings[player.id] = newElo;
    });
    
    if (match.id) {
      matchEloChanges[match.id] = matchChanges;
    }
  });
  
  return { eloRatings, matchEloChanges };
};

const standings = computed(() => {
  if (matchStore.matches === null) {
    return null;
  }

  const { eloRatings } = calculateEloRatings();

  return _.chain(standingsAsWholeTeam.value ? uniqueTeams.value : players.value)
    .map(playerOrTeam => {

      const matches = _.filter(filteredMatches.value, match => {
        return teamContainsPlayer(match.homePlayers, playerOrTeam) || teamContainsPlayer(match.awayPlayers, playerOrTeam);
      });

      const matchesWon = _.filter(matches, match => {
        return teamContainsPlayer(match.homePlayers, playerOrTeam) && match.homeScore > match.awayScore ||
        teamContainsPlayer(match.awayPlayers, playerOrTeam) && match.awayScore > match.homeScore;
      });

      const matchesLost = _.filter(matches, match => {
        return teamContainsPlayer(match.homePlayers, playerOrTeam) && match.homeScore < match.awayScore ||
        teamContainsPlayer(match.awayPlayers, playerOrTeam) && match.awayScore < match.homeScore;
      });

      const matchesOvertimeLost = _.filter(matches, match => {
        return teamContainsPlayer(match.homePlayers, playerOrTeam) && match.homeScore < match.awayScore && match.overtime ||
        teamContainsPlayer(match.awayPlayers, playerOrTeam) && match.awayScore < match.homeScore && match.overtime;
      });

      const matchesOvertimeWin = _.filter(matches, match => {
        return teamContainsPlayer(match.homePlayers, playerOrTeam) && match.homeScore > match.awayScore && match.overtime ||
        teamContainsPlayer(match.awayPlayers, playerOrTeam) && match.awayScore > match.homeScore && match.overtime;
      });

      const matchesDraw = _.filter(matches, match => {
        return match.homeScore === match.awayScore && (teamContainsPlayer(match.homePlayers, playerOrTeam) || teamContainsPlayer(match.awayPlayers, playerOrTeam));
      });

      const points = _.sumBy(matchesWon, match => match.overtime ? match.game?.pointsForOTWin! : match.game?.pointsForWin!) +
        _.sumBy(matchesLost, match => match.overtime ? match.game?.pointsForOTLose! : 0) +
        _.sumBy(matchesDraw, match => match.game?.pointsForDraw!);

      const averagePlayedGamesByPlayerOrTeam = Math.floor((filteredMatches.value?.length || 0) * 0.122);

      const teamOrPlayerLoseAndWinStreak = _.chain(matches)
        .sortBy('played')
        .reverse()
        .map(match => {
          return teamContainsPlayer(match.homePlayers, playerOrTeam) && match.homeScore > match.awayScore ||
            teamContainsPlayer(match.awayPlayers, playerOrTeam) && match.awayScore > match.homeScore;
        })
        .map(result => result ? 'W' : 'L')
        .join('')
        .value();

      const loseOrWinStreakLatestStreakSameType = teamOrPlayerLoseAndWinStreak.match(/(W+|L+)/g)?.[0] || '';

      const goalsFor = _.sumBy(matches, match => {
        return teamContainsPlayer(match.homePlayers, playerOrTeam) ? match.homeScore : match.awayScore;
      });

      const goalsAgainst = _.sumBy(matches, match => {
        return teamContainsPlayer(match.homePlayers, playerOrTeam) ? match.awayScore : match.homeScore;
      });


      const currentPlayer = allPlayers.value?.find(p => p.username === playerOrTeam[0].username);
      const ownsGame = _.size(playerOrTeam) === 1
        && filteredGames.value.length === 1
        && _.find(currentPlayer?.ownedGames || [], gameId => gameId === filteredGames.value[0].id);

      // ELO is only calculated for individual players, not teams
      const elo = !standingsAsWholeTeam.value && playerOrTeam.length === 1 
        ? Math.round(eloRatings[playerOrTeam[0].id] || 1500) 
        : 0;

      return {
        player: playerOrTeam.map(p => p.username).join(','),
        ownsGame,
        wins: matchesWon.length,
        regularTimeWins: _.filter(matchesWon, match => !match.overtime).length,
        pointsForRegularTimeWins: _.sumBy(_.filter(matchesWon, match => !match.overtime), match => match.game?.pointsForWin!),
        losses: matchesLost.length,
        regularTimeLosses: _.filter(matchesLost, match => !match.overtime).length,
        draws: matchesDraw.length,
        pointsForDraws: _.sumBy(matchesDraw, match => match.game?.pointsForDraw!),
        matches: matches.length,
        overtimelosses: matchesOvertimeLost.length,
        pointsForOverTimeLose: _.sumBy(matchesOvertimeLost, match => match.game?.pointsForOTLose!),
        overtimewins: matchesOvertimeWin.length,
        pointsForOverTimeWin: _.sumBy(matchesOvertimeWin, match => match.game?.pointsForOTWin!),
        points,
        goalsFor,
        goalsAgainst,
        goalsDiff: goalsFor - goalsAgainst,
        playerPointsOfPercantage: points / _.sumBy(matches, match => match.game?.pointsForWin!),
        maximumPoints: _.sumBy(matches, match => match.game?.pointsForWin!),
        validResult: matches.length > averagePlayedGamesByPlayerOrTeam,
        loseOrWinStreakLatestStreak: loseOrWinStreakLatestStreakSameType.length,
        loseOrWinStreakLatestStreakType: loseOrWinStreakLatestStreakSameType[0].charAt(0),
        elo

      };
    })
    .sortBy(['validResult', 'elo','playerPointsOfPercantage', 'points'])
    .reverse()
    .map(standing => {
      return {
        ...standing,
        playerPointsOfPercantage: standing.playerPointsOfPercantage === 1 ? '1.00' : percentageFormat.format(standing.playerPointsOfPercantage).substring(1)
      }
    })
    .value();

  });

  const miscallenousStatistics = computed(() => {
    return {
      matches: _.size(filteredMatches.value),
      players: _.size(players.value),
      teams: _.size(uniqueTeams.value),
      homeTeamWinPercentage: _.chain(filteredMatches.value)
        .filter(match => match.homeScore > match.awayScore)
        .size()
        .thru(val=> val / _.size(filteredMatches.value) * 100)
        .thru(val => val.toFixed(0) + '%' )
        .value(),
      onePlayerTeamWinPercentage: matchesWhichHaveWonSpecificPlayerCount(1),
      twoPlayerTeamWinPercentage: matchesWhichHaveWonSpecificPlayerCount(2),
      threePlayerTeamWinPercentage: matchesWhichHaveWonSpecificPlayerCount(3),
    }

  });

  const matchesWhichHaveWonSpecificPlayerCount = (playerCount: number) => {
    return _.chain(filteredMatches.value)
      .filter(match => (match.homePlayers.length === playerCount && match.homeScore > match.awayScore) || (match.awayPlayers.length === playerCount && match.homeScore < match.awayScore))
      .size()
      .thru(val=> val / _.size(filteredMatches.value) * 100)
      .thru(val => val.toFixed(0) + '%' )
      .value();
  };

</script>

<style scoped>

.winner {
  color: green;
}

:deep(.p-accordion-header-link) {
  padding: 0;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  padding-left: 8px;
}

:deep(.p-accordion-content) {
  padding: 0;
  padding-left: 8px;
  padding-bottom: 8px;
}

:deep(.p-accordion-tab) {
  margin-top: 1rem;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  padding: 0;
  width: 15px;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  padding: 0;
  margin-bottom: 0.5rem;
  border-bottom: 1px solid #d9d9d9;
}

:deep(.p-selectbutton .p-highlight) {
  background-color: white;
  color: #1c1c1c;
}

:deep(.p-datatable .p-column-header-content) {
  display: block;
}

:deep(.p-datatable .p-datatable-thead > tr > th:not(:first-child)) {
  text-align: center;
}

:deep(.p-datatable .p-datatable-tbody > tr > td:not(:first-child)) {
  text-align: center;
}

:deep(.p-togglebutton.p-highlight > .p-component) {
  background-color: white;
  color: #1c1c1c;
}

:deep(.p-datatable .p-datatable-tbody > tr.row-disabled) {
  color: #ffaaaa;
}

.quickfilter :deep(.p-button) {
  padding: 0;
}

.color-invert {
  filter: invert(1);
}

.clickable {
  cursor: pointer;
}

.clickable:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.elo-details {
  background-color: rgba(0, 0, 0, 0.2);
  border-left: 2px solid #555;
  font-size: 0.9em;
}

.elo-change {
  margin-bottom: 0.25rem;
}

.text-green-500 {
  color: #22c55e;
}

.text-red-500 {
  color: #ef4444;
}

</style>
