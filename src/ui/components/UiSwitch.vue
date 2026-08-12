<template>
  <div class="tw:inline-flex tw:min-h-11 tw:items-center tw:gap-3">
    <button
      type="button"
      role="switch"
      :aria-checked="modelValue ? 'true' : 'false'"
      :aria-labelledby="hasVisibleLabel ? labelId : undefined"
      :aria-label="hasVisibleLabel ? undefined : label"
      :disabled="disabled"
      :class="[
        'tw:relative tw:inline-flex tw:h-7 tw:w-12 tw:shrink-0 tw:items-center tw:rounded-full tw:border tw:transition-colors',
        modelValue ? 'tw:border-accent tw:bg-accent-strong' : 'tw:border-line-strong tw:bg-surface-2',
        disabled ? 'tw:opacity-50' : '',
      ]"
      @click="emit('update:modelValue', !modelValue)"
    >
      <span
        :class="[
          'tw:absolute tw:size-5 tw:rounded-full tw:bg-white tw:transition-all',
          modelValue ? 'tw:left-6' : 'tw:left-0.5',
        ]"
        aria-hidden="true"
      />
    </button>
    <span v-if="hasVisibleLabel" :id="labelId" class="tw:text-ink"><slot>{{ label }}</slot></span>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue';
import { useComponentId } from '../composables/useComponentId';

const props = withDefaults(defineProps<{
  modelValue: boolean;
  label?: string;
  hideLabel?: boolean;
  disabled?: boolean;
}>(), {
  label: '',
  hideLabel: false,
  disabled: false,
});

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>();

const slots = useSlots();
const labelId = useComponentId('ui-switch-label');
const hasVisibleLabel = computed(() => !props.hideLabel && Boolean(slots.default || props.label));
</script>
