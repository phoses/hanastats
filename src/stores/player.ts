import { ref } from 'vue'
import { defineStore } from 'pinia'

export const usePlayersStore = defineStore('palyer', () => {
  const players = ref([
    { id: 1, name: 'op' },
    { id: 2, name: 'pasi' },
    { id: 3, name: 'kari'},
    { id: 4, name: 'marko' },
  ])

  return { players }
})
