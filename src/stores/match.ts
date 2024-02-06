import { ref } from 'vue'
import { defineStore } from 'pinia'

export const matchStore = defineStore('match', () => {
  const matches = ref([
    {
      home: ['op'],
      away: ['pasi'],
      homegoals: 3,
      awaygoals: 2
    },
    {
      home: ['kari'],
      away: ['marko'],
      homegoals: 1,
      awaygoals: 1
    },
    {
      home: ['op'],
      away: ['marko'],
      homegoals: 2,
      awaygoals: 1
    },
    {
      home: ['pasi', 'marko'],
      away: ['kari', 'op'],
      homegoals: 1,
      awaygoals: 2
    },
    {
      home: ['op', 'pasi'],
      away: ['kari', 'marko'],
      homegoals: 3,
      awaygoals: 1
    }
  ])

  return { matches }
})
