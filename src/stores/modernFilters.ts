import { ref } from 'vue';
import { defineStore } from 'pinia';
import { createMatchFilters } from '@/composables/useMatchFilters';

/**
 * Filter state for the modern UI. It lives in a store because standings and
 * matches are separate views there and share the same selection.
 */
export const useModernFiltersStore = defineStore('modernFilters', () => {
  const filters = createMatchFilters();
  const standingsAsWholeTeam = ref(false);

  return {
    ...filters,
    standingsAsWholeTeam,
  };
});
