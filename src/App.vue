<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header>

    <h1>hanastats</h1>

    <div class="wrapper">
      <nav>
        <RouterLink to="/">stats</RouterLink>
        <RouterLink to="/addgame">addgame</RouterLink>
        <RouterLink to="/config">config</RouterLink>
      </nav>
    </div>
  </header>

  <RouterView />
</template>

<style scoped>

</style>
