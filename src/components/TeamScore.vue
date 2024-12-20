<template>
  <div>
    <div class="mb-2 underline">
      <slot name="teamName"/>
    </div>
    <div class="mb-3">
      <slot name="team"/>
    </div>
    <div class="flex">
      <Button @click="incrementScore" icon="pi pi-plus"/>
      <div class="mx-3 text-5xl">{{ model }}</div>
      <Button @click="decrementScore" icon="pi pi-minus"/>
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
</style>
