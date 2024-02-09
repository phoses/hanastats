import { defineStore } from "pinia";
import { ref } from "vue";

export const useUserStore = defineStore('user', () => {
  const user = ref([
    { id: 1, name: 'op' },
    { id: 2, name: 'pasi' },
    { id: 3, name: 'kari'},
    { id: 4, name: 'marko' },
  ])

  return { user }
})
