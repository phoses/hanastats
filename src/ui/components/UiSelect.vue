<template>
  <div class="tw:flex tw:min-w-0 tw:flex-col tw:gap-1.5">
    <label :for="selectId" :class="['tw:text-sm tw:text-ink-muted', hideLabel ? 'tw:sr-only' : '']">
      {{ label }}
    </label>
    <div class="tw:relative">
      <select
        :id="selectId"
        :value="selectedKey"
        :disabled="disabled"
        class="tw:min-h-11 tw:w-full tw:appearance-none tw:rounded-ui tw:border tw:border-line tw:bg-surface-2 tw:py-2 tw:pr-10 tw:pl-3 tw:text-ink tw:disabled:opacity-50"
        @change="onChange"
      >
        <option v-if="placeholder" value="" :disabled="!allowEmpty">{{ placeholder }}</option>
        <option v-for="option in options" :key="keyOf(option)" :value="String(keyOf(option))">
          {{ labelOf(option) }}
        </option>
      </select>
      <UiIcon
        name="chevron-down"
        class="tw:pointer-events-none tw:absolute tw:top-1/2 tw:right-3 tw:-translate-y-1/2 tw:text-ink-muted"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import UiIcon from './UiIcon.vue';
import { useComponentId } from '../composables/useComponentId';

type Option = any;

const props = withDefaults(defineProps<{
  modelValue: Option;
  options: Option[];
  label: string;
  optionLabel?: string | ((option: Option) => string);
  optionKey?: string | ((option: Option) => string | number);
  placeholder?: string;
  hideLabel?: boolean;
  allowEmpty?: boolean;
  disabled?: boolean;
}>(), {
  optionLabel: 'name',
  optionKey: 'id',
  placeholder: '',
  hideLabel: false,
  allowEmpty: false,
  disabled: false,
});

const emit = defineEmits<{ 'update:modelValue': [value: Option] }>();

const selectId = useComponentId('ui-select');

function labelOf(option: Option): string {
  if (typeof props.optionLabel === 'function') {
    return props.optionLabel(option);
  }
  if (option !== null && typeof option === 'object') {
    return String(option[props.optionLabel] ?? '');
  }
  return String(option);
}

function keyOf(option: Option): string | number {
  if (typeof props.optionKey === 'function') {
    return props.optionKey(option);
  }
  if (option !== null && typeof option === 'object') {
    return option[props.optionKey] ?? labelOf(option);
  }
  return String(option);
}

const selectedKey = computed(() => {
  if (props.modelValue === null || props.modelValue === undefined) {
    return '';
  }
  return String(keyOf(props.modelValue));
});

function onChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value;
  if (value === '') {
    emit('update:modelValue', null);
    return;
  }
  const option = props.options.find((item) => String(keyOf(item)) === value);
  emit('update:modelValue', option ?? null);
}
</script>
