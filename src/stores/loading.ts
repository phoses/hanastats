import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useLoadingStore = defineStore('loading', () => {
  const loaders = ref(0)

  function addLoader() {
    loaders.value++
  }

  function removeLoader() {
    loaders.value--
  };

  function isLoading() {
    return loaders.value > 0
  }

  return { loaders, addLoader, removeLoader, isLoading };
})
