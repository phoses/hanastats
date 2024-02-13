import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useLoadingStore = defineStore('loading', () => {
  const loaders = ref(0)

  async function doLoading<T>(fn: () => Promise<T>) {
    addLoader()
    try {
      return await fn()
    } finally {
      removeLoader()
    }
  }

  function addLoader() {
    loaders.value++
  }

  function removeLoader() {
    loaders.value--
  };

  function isLoading() {
    return loaders.value > 0
  }

  return { loaders, addLoader, removeLoader, isLoading, doLoading };
})
