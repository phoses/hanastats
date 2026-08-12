<template>
  <div
    role="group"
    :aria-label="label || undefined"
    :class="wrapperClasses"
    :style="fillGridStyle"
  >
    <button
      v-for="option in options"
      :key="keyOf(option)"
      type="button"
      :aria-pressed="isSelected(option) ? 'true' : 'false'"
      :class="optionClasses(isSelected(option))"
      @click="toggle(option)"
    >
      <slot name="option" :option="option" :selected="isSelected(option)">{{ labelOf(option) }}</slot>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type Option = any;

const props = withDefaults(defineProps<{
  modelValue: Option | Option[];
  options: Option[];
  optionLabel?: string | ((option: Option) => string);
  optionKey?: string | ((option: Option) => string | number);
  multiple?: boolean;
  label?: string;
  variant?: 'chips' | 'segmented';
  size?: 'sm' | 'md';
  fill?: boolean;
  /** Minimum column width when `fill` lays options out in a grid. */
  fillMinWidth?: string;
}>(), {
  optionLabel: 'name',
  optionKey: 'id',
  multiple: false,
  label: '',
  variant: 'chips',
  size: 'md',
  fill: false,
  fillMinWidth: '4.5rem',
});

const emit = defineEmits<{ 'update:modelValue': [value: Option | Option[]] }>();

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

const selectedKeys = computed(() => {
  if (props.multiple) {
    return (props.modelValue as Option[] | undefined ?? []).map(keyOf);
  }
  return props.modelValue === null || props.modelValue === undefined ? [] : [keyOf(props.modelValue)];
});

function isSelected(option: Option): boolean {
  return selectedKeys.value.includes(keyOf(option));
}

function toggle(option: Option) {
  if (props.multiple) {
    const current = (props.modelValue as Option[] | undefined) ?? [];
    const next = isSelected(option)
      ? current.filter((item) => keyOf(item) !== keyOf(option))
      : [...current, option];
    emit('update:modelValue', next);
    return;
  }

  emit('update:modelValue', isSelected(option) ? null : option);
}

const wrapperClasses = computed(() => {
  if (props.variant === 'segmented') {
    return 'tw:inline-flex tw:gap-1 tw:rounded-ui tw:border tw:border-line tw:bg-surface-2 tw:p-1';
  }
  if (props.fill) {
    return 'tw:grid tw:w-full tw:gap-2';
  }
  return 'tw:flex tw:flex-wrap tw:gap-2';
});

const fillGridStyle = computed(() => {
  if (!props.fill || props.variant === 'segmented') {
    return undefined;
  }
  return {
    gridTemplateColumns: `repeat(auto-fill, minmax(${props.fillMinWidth}, 1fr))`,
  };
});

function optionClasses(selected: boolean) {
  const base = 'tw:inline-flex tw:items-center tw:justify-center tw:font-medium tw:transition-colors tw:select-none';
  const size = props.size === 'sm'
    ? 'tw:min-h-9 tw:px-3 tw:text-sm'
    : 'tw:min-h-11 tw:px-4';

  if (props.variant === 'segmented') {
    return [
      base,
      size,
      'tw:rounded-[0.4rem]',
      selected ? 'tw:bg-accent-strong tw:text-white' : 'tw:text-ink-muted tw:hover:text-ink',
    ];
  }

  return [
    base,
    size,
    'tw:rounded-ui tw:border',
    props.fill ? 'tw:w-full tw:min-w-0' : '',
    selected
      ? 'tw:border-accent tw:bg-accent-soft tw:text-ink'
      : 'tw:border-line tw:bg-surface-2 tw:text-ink-muted tw:hover:border-line-strong tw:hover:text-ink',
  ];
}
</script>
