<template>
  <section class="tw:overflow-hidden tw:rounded-card tw:border tw:border-line tw:bg-surface">
    <div class="tw:flex tw:items-center">
      <button
        type="button"
        class="tw:flex tw:min-h-12 tw:grow tw:items-center tw:justify-between tw:gap-3 tw:px-4 tw:text-left tw:transition-colors tw:hover:bg-surface-2"
        :aria-expanded="isOpen ? 'true' : 'false'"
        :aria-controls="contentId"
        @click="toggle"
      >
        <span class="tw:flex tw:min-w-0 tw:items-center tw:gap-2 tw:font-semibold">
          <slot name="title">{{ title }}</slot>
        </span>
        <UiIcon
          name="chevron-down"
          :class="['tw:shrink-0 tw:text-ink-muted tw:transition-transform', isOpen ? 'tw:rotate-180' : '']"
        />
      </button>
      <div v-if="$slots.actions" class="tw:pr-2">
        <slot name="actions" />
      </div>
    </div>

    <div v-show="isOpen" :id="contentId" class="tw:border-t tw:border-line tw:px-4 tw:py-4">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import UiIcon from './UiIcon.vue';
import { useComponentId } from '../composables/useComponentId';

const props = withDefaults(defineProps<{
  title?: string;
  open?: boolean;
  defaultOpen?: boolean;
}>(), {
  title: '',
  open: undefined,
  defaultOpen: false,
});

const emit = defineEmits<{ 'update:open': [value: boolean] }>();

const contentId = useComponentId('ui-collapsible');
const internalOpen = ref(props.defaultOpen);

const isOpen = computed(() => (props.open === undefined ? internalOpen.value : props.open));

function toggle() {
  const next = !isOpen.value;
  internalOpen.value = next;
  emit('update:open', next);
}
</script>
