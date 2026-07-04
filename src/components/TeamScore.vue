<template>
  <div>
    <div class="mb-2 underline">
      <slot name="teamName"/>
    </div>
    <div class="mb-4 team">
      <slot name="team"/>
    </div>
    <div class="mb-4 players">
      <slot name="players"/>
    </div>
    <div class="w-full flex flex-column">
      <input
        class="text-4xl mb-3 score-input"
        type="number"
        inputmode="numeric"
        min="0"
        :value="model"
        @focus="($event.target as HTMLInputElement).select()"
        @input="onInput"
      />
      <div class="flex justify-content-center">
        <Button @click="incrementScore" icon="pi pi-plus"/>
        <Button @click="decrementScore" icon="pi pi-minus" class="ml-1"/>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button';

const model = defineModel<number>({ required: true })

function incrementScore() {
  model.value++
}

function decrementScore() {
  if (model.value > 0) {
    model.value--
  }
}

function onInput(event: Event) {
  const parsed = Number.parseInt((event.target as HTMLInputElement).value, 10)
  model.value = Number.isNaN(parsed) ? 0 : Math.max(0, parsed)
}

</script>

<style scoped>

.team {
  font-size: 1.2rem;
}

.score-input {
  width: 100%;
  text-align: center;
  background: transparent;
  border: none;
  color: inherit;
  font-family: inherit;
  font-weight: inherit;
  outline: none;
  appearance: textfield;
  -moz-appearance: textfield;
}

.score-input::-webkit-outer-spin-button,
.score-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

</style>
