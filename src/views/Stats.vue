<template>
  <h1>Stats</h1>

  <Accordion :multiple="true" :activeIndex="[1, 2]">
    <AccordionTab header="filters">
      <SelectButton v-model="gameFilter" :options="distinctGames || []" optionLabel="name" multiple/>
      <SelectButton v-model="playerCountFilter" :options="listOfPlayerCountOfMatches || []" optionLabel="name" multiple class="mt-3"/>
      <ToggleButton v-model="standingsAsWholeTeam" onLabel="Whole teams" offLabel="Whole teams" class="mt-3"/>
      <SelectButton v-model="playersInSameTeam" :options="allPlayers || []" optionLabel="username" multiple class="mt-3"/>
      <SelectButton v-model="playedMatchMonthFilter" :options="distinctPlayedMatchesMonths || []" multiple class="mt-3"/>
    </AccordionTab>

    <AccordionTab>
      <template #header >
        <div onclick="event.stopPropagation();" class="flex justify-content-between w-full">
          <div class="flex align-items-center justify-content-center">
          standings
            <div
              @click.stop="enabledGamesFilter = []; gameFilter = []"
              :class="{'active': enabledGamesFilter.length === 0 && gameFilter.length === 0}"
              class="ml-3 px-2 filter-button"
            >
              all
            </div>
            <SelectButton class="ml-3 quickfilter" v-model="enabledGamesFilter" :options="enabledGames" optionLabel="name" multiple/>
          </div>

          <div class="flex align-items-center justify-content-center">
            <div
              @click.stop="showGraph = !showGraph" 
              :class="{'active': showGraph}"
              class="mr-3 px-2 filter-button">
              graph
            </div>
          </div>
        </div>
      </template>

      <div v-if="!showGraph">
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
      </div>

      <div v-else>
        <EloGraph v-if="filteredMatches" :matches="filteredMatches" :players="players" />
      </div>
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
          <div class="font-bold mb-2">ELO Changes:</div>
          
          <div class="mb-3">
            <div class="text-sm opacity-80 mb-1">Home Team (Avg: {{ Math.round(match.eloChanges.find(c => c.team === 'home')?.teamAvgElo || 0) }})</div>
            <div v-for="change in match.eloChanges.filter(c => c.team === 'home')" :key="change.playerId" class="elo-change">
              {{ change.playerName }}: {{ change.oldElo }} <span :class="change.change >= 0 ? 'text-green-500' : 'text-red-500'">{{ change.change >= 0 ? '+' : '' }}{{ change.change }}</span> = {{ change.newElo }}
            </div>
          </div>
          
          <div>
            <div class="text-sm opacity-80 mb-1">Away Team (Avg: {{ Math.round(match.eloChanges.find(c => c.team === 'away')?.teamAvgElo || 0) }})</div>
            <div v-for="change in match.eloChanges.filter(c => c.team === 'away')" :key="change.playerId" class="elo-change">
              {{ change.playerName }}: {{ change.oldElo }} <span :class="change.change >= 0 ? 'text-green-500' : 'text-red-500'">{{ change.change >= 0 ? '+' : '' }}{{ change.change }}</span> = {{ change.newElo }}
            </div>
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
import { computed, ref, watch } from 'vue';
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import SelectButton from 'primevue/selectbutton';
import ToggleButton from 'primevue/togglebutton';
import { usePlayersStore } from '@/stores/player';
import EloGraph from '@/components/EloGraph.vue';
import { createMatchFilters, useFilteredMatches } from '@/composables/useMatchFilters';
import { useEloCalculation } from '@/composables/useEloCalculation';
import { useMiscStatistics, useStandings } from '@/composables/useStandings';
import { useMatchList } from '@/composables/useMatchList';

const playerStore = usePlayersStore();

const filters = createMatchFilters();
const { gameFilter, enabledGamesFilter, playerCountFilter, playersInSameTeam, playedMatchMonthFilter } = filters;

const standingsAsWholeTeam = ref(false);
const showGraph = ref(false);
const allPlayers = computed(() => playerStore.players);

const {
  filteredGames,
  filteredMatches,
  distinctGames,
  enabledGames,
  distinctPlayedMatchesMonths,
  listOfPlayerCountOfMatches,
  players,
} = useFilteredMatches(filters);

const { eloRatings, matchEloChanges } = useEloCalculation(filteredMatches, players);

const { standings, uniqueTeams, showDraws } = useStandings({
  filteredMatches,
  filteredGames,
  players,
  allPlayers,
  standingsAsWholeTeam,
  eloRatings,
});

const matches = useMatchList(filteredMatches, matchEloChanges);
const miscallenousStatistics = useMiscStatistics(filteredMatches, players, uniqueTeams);

const expandedRows = ref({} as any);
const expandedMatches = ref({} as any);

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

watch(filteredGames, () => {
  expandedRows.value = {...expandedRows.value};
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

:deep(.p-selectbutton .p-highlight), .active-graph {
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

.filter-button {
  border-radius: 4px;
  background-color: #2f2f2f;;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.12);

  &.active {
    background-color: white;
    color: #2f2f2f;
  }
}
</style>
