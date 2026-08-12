import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export type UiMode = 'classic' | 'modern';

const STORAGE_KEY = 'hanastats-ui-mode';
const DEFAULT_MODE: UiMode = 'modern';

export function isUiMode(value: unknown): value is UiMode {
  return value === 'classic' || value === 'modern';
}

function readStoredMode(): UiMode | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return isUiMode(stored) ? stored : null;
  } catch {
    return null;
  }
}

function storeMode(mode: UiMode) {
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // Ignore storage failures (private mode, quota); the mode still works for this session.
  }
}

export const useUiStore = defineStore('ui', () => {
  const mode = ref<UiMode>(readStoredMode() ?? DEFAULT_MODE);

  watch(mode, (value) => {
    storeMode(value);
    document.documentElement.dataset.ui = value;
  }, { immediate: true });

  function setMode(next: UiMode) {
    mode.value = next;
  }

  function toggle() {
    mode.value = mode.value === 'modern' ? 'classic' : 'modern';
  }

  return { mode, setMode, toggle };
});
