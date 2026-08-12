<template>
  <Teleport to="body">
    <div v-if="modelValue" class="tw:fixed tw:inset-0 tw:z-50 tw:flex tw:items-end tw:justify-center">
      <div class="tw:absolute tw:inset-0 tw:bg-black/65" @click="close" />
      <div
        ref="panel"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        tabindex="-1"
        class="tw:relative tw:flex tw:max-h-[85dvh] tw:w-full tw:max-w-lg tw:flex-col tw:rounded-t-sheet tw:border tw:border-line tw:bg-surface tw:shadow-sheet"
        @keydown="onKeydown"
      >
        <div class="tw:flex tw:items-center tw:justify-between tw:gap-3 tw:border-b tw:border-line tw:px-4 tw:py-3">
          <h2 :id="titleId" class="tw:text-lg tw:font-semibold">{{ title }}</h2>
          <UiIconButton label="close" @click="close">
            <UiIcon name="close" />
          </UiIconButton>
        </div>

        <div class="tw:min-h-0 tw:grow tw:overflow-y-auto tw:px-4 tw:py-4">
          <slot />
        </div>

        <div
          v-if="$slots.footer"
          class="tw:border-t tw:border-line tw:px-4 tw:pt-3 tw:pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
        >
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue';
import UiIcon from './UiIcon.vue';
import UiIconButton from './UiIconButton.vue';
import { useComponentId } from '../composables/useComponentId';

const props = defineProps<{
  modelValue: boolean;
  title: string;
}>();

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>();

const titleId = useComponentId('ui-sheet-title');
const panel = ref<HTMLElement | null>(null);
let previouslyFocused: HTMLElement | null = null;

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function close() {
  emit('update:modelValue', false);
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.stopPropagation();
    close();
    return;
  }

  if (event.key !== 'Tab' || !panel.value) {
    return;
  }

  const focusable = [...panel.value.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null);
  if (focusable.length === 0) {
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = document.activeElement;

  if (event.shiftKey && (active === first || active === panel.value)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}

function lockScroll(locked: boolean) {
  document.body.style.overflow = locked ? 'hidden' : '';
}

watch(() => props.modelValue, async (open) => {
  lockScroll(open);

  if (open) {
    previouslyFocused = document.activeElement as HTMLElement | null;
    await nextTick();
    panel.value?.focus();
  } else {
    previouslyFocused?.focus();
    previouslyFocused = null;
  }
});

onBeforeUnmount(() => lockScroll(false));
</script>
