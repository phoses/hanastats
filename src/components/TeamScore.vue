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
      <div class="text-4xl mb-3">{{ model }}</div>
      <div class="flex justify-content-center">
        <Button @click="incrementScore" icon="pi pi-plus"/>
        <Button @click="decrementScore" icon="pi pi-minus" class="ml-4"/>
      </div>
    </div>
  </div>
</template>

<script setup>
import Button from 'primevue/button';

  const model = defineModel()

  function incrementScore() {
    model.value++
  }

  function decrementScore() {
    if (model.value > 0) {
      model.value--
    }
  }

</script>

<style scoped>

.team {
  font-size: 1.2rem;
}

</style>
