<template>
  <h1>Stats</h1>

  <Accordion :multiple="true" :activeIndex="[1, 2]">
    <AccordionTab header="filters">
      <SelectButton v-model="playerCountFilter" :options="listOfPlayerCountOfMatches" optionLabel="name" multiple />
      <SelectButton v-model="gameFilter" :options="distinctGames" optionLabel="name" multiple class="mt-3"/>
    </AccordionTab>

    <AccordionTab header="standings">
      <DataTable :value="standings">
        <Column field="player" header="player"></Column>
        <Column field="matches" header="gp"></Column>
        <Column field="wins" header="w"></Column>
        <Column field="losses" header="l"></Column>
        <Column field="overtimelosses" header="ot"></Column>
        <Column field="points" header="pts"></Column>
        <Column field="goalsFor" header="gf"></Column>
        <Column field="goalsAgainst" header="ga"></Column>
        <Column field="goalsDiff" header="diff">
          <template #body="slotProps">
            {{ slotProps.data.goalsFor - slotProps.data.goalsAgainst }}
          </template>
        </Column>
        <Column field="playerPointsOfPercantage" header="p%"></Column>
      </DataTable>
    </AccordionTab>

    <AccordionTab header="matches">
      <div v-for="match in matches" :key="match.id" class="flex match justify-content-between mb-2">
        <div class="flex-none mr-3">{{match.playedFormatted}}</div>
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
import type { Game } from '@/stores/game';

const matchStore = useMatchStore();
const loadingStore = useLoadingStore();

const playerCountFilter = ref([] as { name: string, value: number }[]);
const gameFilter = ref([] as Game[]);

onMounted(async () => {
  if (matches.value === null) {
    loadingStore.doLoading(async () => {
      await matchStore.getMatches();
    });
  }
});

const filteredMatches = computed(() => {
  if (matchStore.matches === null) {
    return null;
  }

  if (playerCountFilter.value.length === 0) {
    return matchStore.matches;
  }

  return _.chain(matchStore.matches)
    .filter(match => playerCountFilter.value.length === 0 || _.map(playerCountFilter.value, 'value').includes([...match.homePlayers, ...match.awayPlayers].length))
    .filter(match => gameFilter.value.length === 0 || gameFilter.value.map(g => g.id).includes(match.game!.id))
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
    .value();
});

const standings = computed(() => {
  if (matchStore.matches === null) {
    return null;
  }

  const players = _.uniqBy(_.flatMap(filteredMatches.value, match => {
    return [...match.homePlayers, ...match.awayPlayers];
  }), 'id');

  const percentageFormat = new Intl.NumberFormat('en-US', {
      minimumIntegerDigits: 1,
      minimumFractionDigits: 3
  });

  return _.chain(players)
    .map(player => {

      const pointsForWin = 2;
      const pointsForLosingAtOverTime = 1;

      return {
        player: player.username,
        wins: _.filter(filteredMatches.value, match => {
          return _.map(match.homePlayers, 'id').includes(player.id) && match.homeScore > match.awayScore ||
          _.map(match.awayPlayers, 'id').includes(player.id) && match.awayScore > match.homeScore;
        }).length,
        losses: _.filter(filteredMatches.value, match => {
          return _.map(match.homePlayers, 'id').includes(player.id) && match.homeScore < match.awayScore ||
          _.map(match.awayPlayers, 'id').includes(player.id) && match.awayScore < match.homeScore;
        }).length,
        matches: _.filter(filteredMatches.value, match => {
          return _.map(match.homePlayers, 'id').includes(player.id) || _.map(match.awayPlayers, 'id').includes(player.id);
        }).length,
        overtimewins: _.filter(filteredMatches.value, match => {
          return _.map(match.homePlayers, 'id').includes(player.id) && match.homeScore > match.awayScore && match.overtime ||
          _.map(match.awayPlayers, 'id').includes(player.id) && match.awayScore > match.homeScore && match.overtime;
        }).length,
        overtimelosses: _.filter(filteredMatches.value, match => {
          return _.map(match.homePlayers, 'id').includes(player.id) && match.homeScore < match.awayScore && match.overtime ||
          _.map(match.awayPlayers, 'id').includes(player.id) && match.awayScore < match.homeScore && match.overtime;
        }).length,
        points: _.filter(filteredMatches.value, match => {
          return _.map(match.homePlayers, 'id').includes(player.id) && match.homeScore > match.awayScore ||
          _.map(match.awayPlayers, 'id').includes(player.id) && match.awayScore > match.homeScore;
        }).length * pointsForWin + _.filter(filteredMatches.value, match => {
          return _.map(match.homePlayers, 'id').includes(player.id) && match.homeScore < match.awayScore && match.overtime ||
          _.map(match.awayPlayers, 'id').includes(player.id) && match.awayScore < match.homeScore && match.overtime;
        }).length * pointsForLosingAtOverTime,
        goalsFor: _.sumBy(_.filter(filteredMatches.value, match => {
          return _.map(match.homePlayers, 'id').includes(player.id) || _.map(match.awayPlayers, 'id').includes(player.id);
        }), match => {
          return _.map(match.homePlayers, 'id').includes(player.id) ? match.homeScore : match.awayScore;
        }),
        goalsAgainst: _.sumBy(_.filter(filteredMatches.value, match => {
          return _.map(match.homePlayers, 'id').includes(player.id) || _.map(match.awayPlayers, 'id').includes(player.id);
        }), match => {
          return _.map(match.homePlayers, 'id').includes(player.id) ? match.awayScore : match.homeScore;
        }),
        pointsPerMatch: (_.filter(filteredMatches.value, match => {
          return _.map(match.homePlayers, 'id').includes(player.id) && match.homeScore > match.awayScore ||
          _.map(match.awayPlayers, 'id').includes(player.id) && match.awayScore > match.homeScore;
        }).length * pointsForWin + _.filter(filteredMatches.value, match => {
          return _.map(match.homePlayers, 'id').includes(player.id) && match.homeScore < match.awayScore && match.overtime ||
          _.map(match.awayPlayers, 'id').includes(player.id) && match.awayScore < match.homeScore && match.overtime;
        }).length * pointsForLosingAtOverTime) / _.filter(filteredMatches.value, match => {
          return _.map(match.homePlayers, 'id').includes(player.id) || _.map(match.awayPlayers, 'id').includes(player.id);
        }).length,
        playerPointsOfPercantage: (_.filter(filteredMatches.value, match => {
          return _.map(match.homePlayers, 'id').includes(player.id) && match.homeScore > match.awayScore ||
          _.map(match.awayPlayers, 'id').includes(player.id) && match.awayScore > match.homeScore;
        }).length * pointsForWin + _.filter(filteredMatches.value, match => {
          return _.map(match.homePlayers, 'id').includes(player.id) && match.homeScore < match.awayScore && match.overtime ||
          _.map(match.awayPlayers, 'id').includes(player.id) && match.awayScore < match.homeScore && match.overtime;
        }).length * pointsForLosingAtOverTime) / (_.filter(filteredMatches.value, match => {
          return _.map(match.homePlayers, 'id').includes(player.id) || _.map(match.awayPlayers, 'id').includes(player.id);
        }).length * pointsForWin),
      };
    })
    .sortBy(['playerPointsOfPercantage', 'points'])
    .reverse()
    .map(standing => {
      return {
        ...standing,
        playerPointsOfPercantage: standing.playerPointsOfPercantage === 1 ? '1.00' : percentageFormat.format(standing.playerPointsOfPercantage).substring(1)
      }
    })
    .value();
});

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
  text-align: right;
}

:deep(.p-datatable .p-datatable-tbody > tr > td:not(:first-child)) {
  text-align: right;
}

</style>
