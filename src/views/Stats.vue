<template>
  <h1>Stats</h1>

  <Accordion :multiple="true" :activeIndex="[1, 2]">
    <AccordionTab header="filters">
      <SelectButton v-model="gameFilter" :options="distinctGames" optionLabel="name" multiple/>
      <SelectButton v-model="playerCountFilter" :options="listOfPlayerCountOfMatches" optionLabel="name" multiple class="mt-3"/>
      <ToggleButton v-model="standingsAsWholeTeam" onLabel="Whole teams" offLabel="Whole teams" class="mt-3"/>
      <SelectButton v-model="playersInSameTeam" :options="allPlayers" optionLabel="username" multiple class="mt-3"/>
    </AccordionTab>

    <AccordionTab>
      <template #header >
        <div onclick="event.stopPropagation();" class="flex align-items-center">
          standings
          <SelectButton class="ml-3 quickfilter" v-model="enabledGamesFilter" :options="enabledGames" optionLabel="name" multiple/>
        </div>
      </template>
      <DataTable :value="standings" :rowClass="({validResult}) => !validResult ? 'row-disabled' : undefined">
        <Column field="player" header="player"></Column>
        <Column field="matches" header="gp"></Column>
        <Column field="wins" header="w"></Column>
        <Column field="losses" header="l"></Column>
        <!-- <Column field="overtimelosses" header="ot"></Column> -->
        <!-- <Column field="points" header="pts"></Column> -->
        <!-- <Column field="goalsFor" header="gf"></Column> -->
        <!-- <Column field="goalsAgainst" header="ga"></Column> -->
        <Column field="goalsDiff" header="diff">
          <template #body="slotProps">
            {{ slotProps.data.goalsFor - slotProps.data.goalsAgainst }}
          </template>
        </Column>
        <Column field="loseOrWinStreakLatestStreakSameType" header="s"></Column>
        <Column field="playerPointsOfPercantage" header="p%"></Column>
      </DataTable>
    </AccordionTab>

    <AccordionTab>
      <template #header>
        <span class="pr-2">matches</span>
        <span v-if="matches">({{ matches.length }})</span>
      </template>

      <div v-for="match in matches" :key="match.id" class="flex match justify-content-between mb-2">
        <div class="flex flex-column mr-3">
          <div>{{match.playedFormatted}}</div>

          <div v-if="match.game">{{match.game.name}}</div>
        </div>
        <div class="flex flex-column align-content-start flex-grow-1">
          <div class="hometeam" :class="{'winner': match.homewinner}">{{ match.homePlayers.map(p => p.username).join(',') }}</div>
          <div>VS</div>
          <div class="pr-2 awayteam" :class="{'winner': match.awaywinner}">{{ match.awayPlayers.map(p => p.username).join(',') }}</div>
        </div>
        <div class="flex flex-none align-content-start">
          <div>{{ match.homeScore }}:{{ match.awayScore }}</div>
          <div class="w-2rem"><span v-if="match.overtime">(OT)</span></div>
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
import { computed, onMounted, ref } from 'vue';
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
const games = computed(() => gameStore.games);
const allPlayers = computed(() => playerStore.players);

onMounted(async () => {
  if (matches.value === null) {
    loadingStore.doLoading(async () => {
      await matchStore.getMatches();
      await gameStore.getGames();
      await playerStore.getPlayers();
    });
  }
});

const filteredMatches = computed(() => {
  if (matchStore.matches === null) {
    return null;
  }

  return _.chain(matchStore.matches)
    .filter(match => playerCountFilter.value.length === 0 || _.map(playerCountFilter.value, 'value').includes([...match.homePlayers, ...match.awayPlayers].length))
    .filter(match => gameFilter.value.length === 0 || gameFilter.value.map(g => g.id).includes(match.game!.id))
    .filter(match => enabledGamesFilter.value.length === 0 || enabledGamesFilter.value.map(g => g.id).includes(match.game!.id))
    .filter(match => playersInSameTeam.value.length === 0 || playersInSameTeam.value.every(player => match.homePlayers.map(p => p.id).includes(player.id)) || playersInSameTeam.value.every(player => match.awayPlayers.map(p => p.id).includes(player.id)))
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

const matches = computed(() => {
  if (matchStore.matches === null) {
    return null;
  }

  return _.chain(filteredMatches.value)
    .map(match => {
      return {
        ...match,
        playedFormatted: moment(match.played).format('YY-MM-DD'),
        homewinner: match.homeScore > match.awayScore,
        awaywinner: match.awayScore > match.homeScore
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

const standings = computed(() => {
  if (matchStore.matches === null) {
    return null;
  }

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

      const matchesDraw = _.filter(matches, match => {
        return match.homeScore === match.awayScore && (teamContainsPlayer(match.homePlayers, playerOrTeam) || teamContainsPlayer(match.awayPlayers, playerOrTeam));
      });

      const points = _.sumBy(matchesWon, match => match.overtime ? match.game?.pointsForOTWin! : match.game?.pointsForWin!) +
        _.sumBy(matchesLost, match => match.overtime ? match.game?.pointsForOTLose! : 0) +
        _.sumBy(matchesDraw, match => match.game?.pointsForDraw!);

      const averagePlayedGamesByPlayerOrTeam = _.size(filteredMatches.value) / (standingsAsWholeTeam.value ? uniqueTeams.value.length : players.value.length);

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

      return {
        player: playerOrTeam.map(p => p.username).join(','),
        wins: matchesWon.length,
        losses: matchesLost.length,
        draws: matchesDraw.length,
        matches: matches.length,
        overtimelosses: matchesOvertimeLost.length,
        points: points,
        goalsFor: _.sumBy(matches, match => {
          return teamContainsPlayer(match.homePlayers, playerOrTeam) ? match.homeScore : match.awayScore;
        }),

        goalsAgainst: _.sumBy(matches, match => {
          return teamContainsPlayer(match.homePlayers, playerOrTeam) ? match.awayScore : match.homeScore;
        }),
        playerPointsOfPercantage: points / _.sumBy(matches, match => match.game?.pointsForWin!),
        validResult: matches.length > averagePlayedGamesByPlayerOrTeam,
        loseOrWinStreakLatestStreakSameType: loseOrWinStreakLatestStreakSameType.length + loseOrWinStreakLatestStreakSameType[0].charAt(0)

      };
    })
    .sortBy(['validResult', 'playerPointsOfPercantage', 'points'])
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

</style>
