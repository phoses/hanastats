<template>
  <div class="tw:flex tw:min-w-0 tw:flex-col tw:gap-1.5">
    <label :for="inputId" :class="['tw:text-sm tw:text-ink-muted', hideLabel ? 'tw:sr-only' : '']">{{ label }}</label>
    <div class="tw:relative tw:flex tw:items-center">
      <span v-if="icon" class="tw:pointer-events-none tw:absolute tw:left-3 tw:text-ink-subtle">
        <UiIcon :name="icon" :size="18" />
      </span>
      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder || undefined"
        :inputmode="inputmode"
        :disabled="disabled"
        :class="[
          'tw:min-h-11 tw:w-full tw:rounded-ui tw:border tw:border-line tw:bg-surface-2 tw:py-2 tw:pr-3 tw:text-ink tw:transition-colors tw:hover:border-line-strong tw:disabled:opacity-50',
          icon ? 'tw:pl-10' : 'tw:pl-3',
        ]"
        @input="onInput"
      >
      <button
        v-if="clearable && String(modelValue).length > 0"
        type="button"
        class="tw:absolute tw:right-1 tw:flex tw:size-9 tw:items-center tw:justify-center tw:rounded-ui tw:text-ink-subtle tw:hover:text-ink"
        :aria-label="`clear ${label}`"
        @click="emit('update:modelValue', '')"
      >
        <UiIcon name="close" :size="16" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import UiIcon from './UiIcon.vue';
import type { IconName } from './icons';
import { useComponentId } from '../composables/useComponentId';

withDefaults(defineProps<{
  modelValue: string | number;
  label: string;
  type?: 'text' | 'number' | 'search';
  placeholder?: string;
  icon?: IconName | '';
  inputmode?: 'text' | 'numeric' | 'decimal' | 'search';
  hideLabel?: boolean;
  clearable?: boolean;
  disabled?: boolean;
}>(), {
  type: 'text',
  placeholder: '',
  icon: '',
  inputmode: 'text',
  hideLabel: false,
  clearable: false,
  disabled: false,
});

const emit = defineEmits<{ 'update:modelValue': [value: string] }>();

const inputId = useComponentId('ui-input');

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value);
}
</script>
