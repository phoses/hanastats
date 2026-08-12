<template>
  <label class="tw:inline-flex tw:min-h-11 tw:cursor-pointer tw:items-center tw:gap-3">
    <input
      type="checkbox"
      class="tw:sr-only"
      :checked="modelValue"
      :disabled="disabled"
      @change="emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
    >
    <span
      :class="[
        'tw:flex tw:size-6 tw:shrink-0 tw:items-center tw:justify-center tw:rounded-md tw:border tw:transition-colors',
        modelValue ? 'tw:border-accent tw:bg-accent-strong tw:text-white' : 'tw:border-line-strong tw:bg-surface-2',
        disabled ? 'tw:opacity-50' : '',
      ]"
      aria-hidden="true"
    >
      <UiIcon v-if="modelValue" name="check" :size="16" />
    </span>
    <span class="tw:text-ink"><slot>{{ label }}</slot></span>
  </label>
</template>

<script setup lang="ts">
import UiIcon from './UiIcon.vue';

withDefaults(defineProps<{
  modelValue: boolean;
  label?: string;
  disabled?: boolean;
}>(), {
  label: '',
  disabled: false,
});

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>();
</script>
