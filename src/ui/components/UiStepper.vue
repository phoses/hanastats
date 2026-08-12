<template>
  <div class="tw:flex tw:flex-col tw:items-center tw:gap-3">
    <p class="tw:text-5xl tw:leading-none tw:font-semibold tw:tabular-nums" aria-hidden="true">{{ modelValue }}</p>
    <p class="tw:sr-only" aria-live="polite">{{ label }}: {{ modelValue }}</p>
    <div class="tw:flex tw:items-center tw:gap-2">
      <UiIconButton
        size="lg"
        variant="surface"
        :label="`decrease ${label}`"
        :disabled="modelValue <= min"
        @click="step(-1)"
      >
        <UiIcon name="minus" :size="26" />
      </UiIconButton>
      <UiIconButton
        size="lg"
        variant="accent"
        :label="`increase ${label}`"
        :disabled="modelValue >= max"
        @click="step(1)"
      >
        <UiIcon name="plus" :size="26" />
      </UiIconButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import UiIcon from './UiIcon.vue';
import UiIconButton from './UiIconButton.vue';

const props = withDefaults(defineProps<{
  modelValue: number;
  label: string;
  min?: number;
  max?: number;
}>(), {
  min: 0,
  max: 99,
});

const emit = defineEmits<{ 'update:modelValue': [value: number] }>();

function step(delta: number) {
  const next = Math.min(props.max, Math.max(props.min, props.modelValue + delta));
  emit('update:modelValue', next);
}
</script>
