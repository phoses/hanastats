<template>
  <UiSegmented
    :model-value="selected"
    :options="options"
    option-label="label"
    option-key="value"
    variant="segmented"
    size="sm"
    label="user interface"
    @update:model-value="onSelect"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import UiSegmented from '../components/UiSegmented.vue';
import { useUiStore, type UiMode } from '@/stores/ui';
import { classicToModernRoute, modernToClassicRoute } from '../routeMap';

interface ModeOption {
  value: UiMode;
  label: string;
}

const options: ModeOption[] = [
  { value: 'modern', label: 'new' },
  { value: 'classic', label: 'classic' },
];

const uiStore = useUiStore();
const router = useRouter();
const route = useRoute();

const selected = computed(() => options.find((option) => option.value === uiStore.mode) ?? options[0]);

function onSelect(option: ModeOption | ModeOption[] | null) {
  const next = Array.isArray(option) ? option[0] : option;
  if (!next || next.value === uiStore.mode) {
    return;
  }

  uiStore.setMode(next.value);

  const currentName = String(route.name ?? '');
  const targetName = next.value === 'modern'
    ? classicToModernRoute[currentName]
    : modernToClassicRoute[currentName];

  router.replace({ name: targetName ?? (next.value === 'modern' ? 'modern-standings' : 'stats') });
}
</script>
