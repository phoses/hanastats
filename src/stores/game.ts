import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useGamesStore = defineStore('game', () => {
  const games = ref([
    { id: 1, name : 'nhl23' },
    { id: 2, name : 'fifa20' },
  ])

  return { games }
})
