<template>
  <fieldset class="tw:m-0 tw:min-w-0 tw:border-0 tw:p-0">
    <legend v-if="label" class="tw:mb-2 tw:block tw:w-full tw:p-0 tw:text-sm tw:text-ink-muted">{{ label }}</legend>
    <div class="tw:flex tw:flex-wrap tw:gap-2">
      <label
        v-for="option in options"
        :key="String(option.value)"
        :class="[
          'tw:inline-flex tw:min-h-11 tw:cursor-pointer tw:items-center tw:gap-2 tw:rounded-ui tw:border tw:px-4 tw:transition-colors',
          option.value === modelValue
            ? 'tw:border-accent tw:bg-accent-soft tw:text-ink'
            : 'tw:border-line tw:bg-surface-2 tw:text-ink-muted tw:hover:border-line-strong tw:hover:text-ink',
        ]"
      >
        <input
          type="radio"
          class="tw:sr-only"
          :name="name"
          :value="option.value"
          :checked="option.value === modelValue"
          @change="emit('update:modelValue', option.value)"
        >
        <span
          :class="[
            'tw:flex tw:size-4 tw:shrink-0 tw:items-center tw:justify-center tw:rounded-full tw:border',
            option.value === modelValue ? 'tw:border-accent' : 'tw:border-line-strong',
          ]"
          aria-hidden="true"
        >
          <span v-if="option.value === modelValue" class="tw:size-2 tw:rounded-full tw:bg-accent" />
        </span>
        <span>{{ option.label }}</span>
      </label>
    </div>
  </fieldset>
</template>

<script setup lang="ts">
import type { RadioOption } from './types';

defineProps<{
  modelValue: string | number;
  options: RadioOption[];
  name: string;
  label?: string;
}>();

const emit = defineEmits<{ 'update:modelValue': [value: string | number] }>();
</script>
