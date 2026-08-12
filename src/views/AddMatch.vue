<template>
  <div class="text-center">
    <h2>add new match</h2>

    <h3>game
      <Dropdown v-model="match.game" :options="games" optionLabel="name" placeholder="Select game" :scrollHeight="gamesScrollHeightPx" />
    </h3>

    <template v-if="match.game !== null">

      <h3>team mode</h3>
      <div class="mb-3 flex gap-2 justify-content-center">
        <div class="flex align-items-center">
          <RadioButton v-model="teamMode" inputId="mode-elo" value="elo-based" />
          <label for="mode-elo" class="ml-2">elo-based</label>
        </div>
        <div class="flex align-items-center">
          <RadioButton v-model="teamMode" inputId="mode-random" value="random" />
          <label for="mode-random" class="ml-2">random</label>
        </div>
        <div class="flex align-items-center">
          <RadioButton v-model="teamMode" inputId="mode-fixed" value="fixed" />
          <label for="mode-fixed" class="ml-2">fixed</label>
        </div>
      </div>

      <h3 class="mt-5">players</h3>
      <div class="mb-2 flex justify-content-center align-items-center gap-2">
        <label for="show-all-players" class="mr-2">show all</label>
        <InputSwitch v-model="showAllPlayers" inputId="show-all-players" />
      </div>
      <SelectButton 
        v-model="selectedPlayers" 
        :options="players" 
        optionLabel="username" 
        multiple
      >
        <template #option="{ option }">
          <div class="text-center">{{ option.username }}</div>
        </template>
      </SelectButton>
    </template>

    <template v-if="selectedPlayers.length > 1">
      <h3 v-if="selectedPlayers.length > 0" class="mt-5">teams</h3>

      <div class="flex gap-2">
        <TeamScore v-model="match.homeScore" class="w-6">
          <template #teamName>home</template>
          <template #team v-if="match.homeTeam">{{match.homeTeam.name}}</template>
          <template #players>
            {{ match.homePlayers.map(p => p.username).join(', ') }}
            <div v-if="homeTeamAvgElo !== null" class="mt-2">avg elo: {{ homeTeamAvgElo }}</div>
            <div v-if="goalPrediction" class="mt-2 text-sm">xG: {{ goalPrediction.homeExpectedGoals }}</div>
          </template>
        </TeamScore>
        <TeamScore v-model="match.awayScore" class="w-6">
          <template #teamName>away</template>
          <template #team v-if="match.awayTeam">{{match.awayTeam.name}}</template>
          <template #players>
            {{ match.awayPlayers.map(p => p.username).join(', ') }}
            <div v-if="awayTeamAvgElo !== null" class="mt-2">avg elo: {{ awayTeamAvgElo }}</div>
            <div v-if="goalPrediction" class="mt-2 text-sm">xG: {{ goalPrediction.awayExpectedGoals }}</div>
          </template>
        </TeamScore>
      </div>

      <div v-if="goalPrediction" class="mt-4 mx-auto prediction-panel">
        <h4>prediction</h4>
        <div class="text-sm mb-2">
          win: home {{ goalPrediction.homeWinProbability }}% · draw {{ goalPrediction.drawProbability }}% · away {{ goalPrediction.awayWinProbability }}%
        </div>
        <div class="text-sm mb-2">
          likely scores:
          <span v-for="(scoreline, index) in goalPrediction.mostLikelyScorelines" :key="`${scoreline.home}-${scoreline.away}`">
            {{ scoreline.home }}:{{ scoreline.away }} ({{ scoreline.probability }}%)<span v-if="index < goalPrediction.mostLikelyScorelines.length - 1"> · </span>
          </span>
        </div>
        <div class="text-xs opacity-70">
          based on {{ goalPrediction.basedOnMatches }} matches
          <span v-if="goalPrediction.headToHeadMatches > 0"> · {{ goalPrediction.headToHeadMatches }} head-to-head</span>
          · confidence: {{ goalPrediction.confidence }}
        </div>
      </div>

      <div class="mt-5">
        <label for="overtime" class="mr-2">overtime win</label><Checkbox v-model="match.overtime" binary inputId="overtime"/>
      </div>

      <div>
        <Button @click="addMatch" label="add match" class="mt-5"/>
      </div>
    </template>
  </div>

</template>

<script setup lang="ts">
import { computed } from 'vue';
import Button from 'primevue/button';
import InputSwitch from 'primevue/inputswitch';
import Dropdown from 'primevue/dropdown';
import SelectButton from 'primevue/selectbutton';
import RadioButton from 'primevue/radiobutton';
import Checkbox from 'primevue/checkbox';
import TeamScore from '@/components/TeamScore.vue';
import { useAddMatchForm } from '@/composables/useAddMatchForm';

const {
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
} = useAddMatchForm();

const gamesScrollHeightPx = computed(() => {
  return games.value.length * 50 + 'px';
});

</script>

<style scoped>

:deep(.p-selectbutton .p-highlight) {
  background-color: white;
  color: #1c1c1c;
}

:deep(.p-button.p-component) {
  width:100px;
  margin: 0.25rem;
  text-align: center;
  display: inline-block;
}

.prediction-panel {
  max-width: 640px;
  padding: 1rem;
  border: 1px solid var(--surface-border, #dee2e6);
  border-radius: 6px;
  background: var(--surface-ground, #f8f9fa);
}

</style>
