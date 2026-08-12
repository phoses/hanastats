<template>
  <div class="tw:flex tw:flex-col tw:gap-8">
    <section class="tw:flex tw:flex-col tw:gap-3">
      <h2 class="tw:text-lg tw:font-semibold">buttons</h2>
      <div class="tw:flex tw:flex-wrap tw:gap-2">
        <UiButton variant="primary">primary</UiButton>
        <UiButton variant="secondary">secondary</UiButton>
        <UiButton variant="ghost">ghost</UiButton>
        <UiButton variant="danger">danger</UiButton>
        <UiButton variant="primary" loading>loading</UiButton>
        <UiButton variant="secondary" disabled>disabled</UiButton>
        <UiButton variant="secondary" size="sm">small</UiButton>
        <UiButton variant="primary" size="lg">large</UiButton>
      </div>
      <div class="tw:flex tw:flex-wrap tw:gap-2">
        <UiIconButton label="filter"><UiIcon name="filter" /></UiIconButton>
        <UiIconButton label="graph" variant="surface"><UiIcon name="graph" /></UiIconButton>
        <UiIconButton label="add" variant="accent"><UiIcon name="plus" /></UiIconButton>
        <UiIconButton label="pressed example" :pressed="true"><UiIcon name="check" /></UiIconButton>
      </div>
    </section>

    <section class="tw:flex tw:flex-col tw:gap-3">
      <h2 class="tw:text-lg tw:font-semibold">selection</h2>
      <UiSegmented
        v-model="singleChoice"
        :options="fruits"
        option-label="name"
        option-key="id"
        label="single choice"
      />
      <UiSegmented
        v-model="multiChoice"
        :options="fruits"
        option-label="name"
        option-key="id"
        multiple
        label="multiple choice"
      />
      <UiSegmented
        v-model="segmentedChoice"
        :options="fruits"
        option-label="name"
        option-key="id"
        variant="segmented"
        size="sm"
        label="segmented"
      />
      <UiRadioGroup v-model="radioValue" name="kitchen-sink-radio" label="radio group" :options="radioOptions" />
      <div class="tw:flex tw:flex-wrap tw:items-center tw:gap-6">
        <UiCheckbox v-model="checkboxValue" label="checkbox" />
        <UiSwitch v-model="switchValue" label="switch" />
      </div>
      <UiSelect v-model="selectValue" :options="fruits" label="native select" placeholder="select fruit" allow-empty />
    </section>

    <section class="tw:flex tw:flex-col tw:gap-3">
      <h2 class="tw:text-lg tw:font-semibold">feedback</h2>
      <div class="tw:flex tw:flex-wrap tw:gap-2">
        <UiBadge tone="neutral">neutral</UiBadge>
        <UiBadge tone="accent">accent</UiBadge>
        <UiBadge tone="win">win 5</UiBadge>
        <UiBadge tone="loss">loss 3</UiBadge>
        <UiBadge tone="warn">few games</UiBadge>
      </div>
      <div class="tw:flex tw:items-center tw:gap-4">
        <UiSpinner label="loading" />
        <UiSkeleton width="8rem" />
        <UiSkeleton width="4rem" height="2rem" />
      </div>
      <UiEmptyState title="nothing here" description="empty state with an action" icon="list">
        <UiButton variant="secondary" size="sm">do something</UiButton>
      </UiEmptyState>
    </section>

    <section class="tw:flex tw:flex-col tw:gap-3">
      <h2 class="tw:text-lg tw:font-semibold">containers</h2>
      <UiCard>
        <p class="tw:font-semibold">card</p>
        <p class="tw:text-sm tw:text-ink-muted">surface container with border and padding</p>
      </UiCard>
      <UiCollapsible title="collapsible" default-open>
        <p class="tw:text-sm tw:text-ink-muted">collapsible content</p>
      </UiCollapsible>
      <UiButton variant="secondary" @click="sheetOpen = true">open sheet</UiButton>
      <UiSheet v-model="sheetOpen" title="bottom sheet">
        <p class="tw:text-sm tw:text-ink-muted">sheet content with focus trap and escape handling</p>
        <template #footer>
          <UiButton variant="primary" block @click="sheetOpen = false">close</UiButton>
        </template>
      </UiSheet>
    </section>

    <section class="tw:flex tw:flex-col tw:gap-3">
      <h2 class="tw:text-lg tw:font-semibold">score stepper</h2>
      <div class="tw:flex tw:gap-6">
        <UiStepper v-model="homeScore" label="home score" />
        <UiStepper v-model="awayScore" label="away score" />
      </div>
    </section>

    <section class="tw:flex tw:flex-col tw:gap-3">
      <h2 class="tw:text-lg tw:font-semibold">table</h2>
      <UiTable
        :columns="tableColumns"
        :rows="tableRows"
        row-key="player"
        :sort="tableSort"
        expandable
        :expanded-keys="expandedKeys"
        caption="example table"
        @update:sort="tableSort = $event"
        @toggle-row="toggleRow"
      >
        <template #expansion="{ row }">
          <p class="tw:text-sm tw:text-ink-muted">details for {{ row.player }}</p>
        </template>
      </UiTable>
    </section>

    <section class="tw:flex tw:flex-col tw:gap-3">
      <h2 class="tw:text-lg tw:font-semibold">icons</h2>
      <div class="tw:flex tw:flex-wrap tw:gap-3 tw:text-ink-muted">
        <span v-for="name in iconNames" :key="name" class="tw:flex tw:flex-col tw:items-center tw:gap-1">
          <UiIcon :name="name" :size="22" />
          <span class="tw:text-[0.65rem]">{{ name }}</span>
        </span>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import UiBadge from '../components/UiBadge.vue';
import UiButton from '../components/UiButton.vue';
import UiCard from '../components/UiCard.vue';
import UiCheckbox from '../components/UiCheckbox.vue';
import UiCollapsible from '../components/UiCollapsible.vue';
import UiEmptyState from '../components/UiEmptyState.vue';
import UiIcon from '../components/UiIcon.vue';
import UiIconButton from '../components/UiIconButton.vue';
import UiRadioGroup from '../components/UiRadioGroup.vue';
import UiSegmented from '../components/UiSegmented.vue';
import UiSelect from '../components/UiSelect.vue';
import UiSheet from '../components/UiSheet.vue';
import UiSkeleton from '../components/UiSkeleton.vue';
import UiSpinner from '../components/UiSpinner.vue';
import UiStepper from '../components/UiStepper.vue';
import UiSwitch from '../components/UiSwitch.vue';
import UiTable from '../components/UiTable.vue';
import { icons, type IconName } from '../components/icons';
import type { RadioOption, TableColumn, TableSort } from '../components/types';

const fruits = [
  { id: 'a', name: 'apple' },
  { id: 'b', name: 'banana' },
  { id: 'c', name: 'cloudberry' },
];

const singleChoice = ref<typeof fruits[number] | null>(fruits[0]);
const multiChoice = ref<typeof fruits[number][]>([fruits[1]]);
const segmentedChoice = ref<typeof fruits[number] | null>(fruits[0]);
const radioValue = ref('elo-based');
const checkboxValue = ref(true);
const switchValue = ref(false);
const selectValue = ref<typeof fruits[number] | null>(null);
const sheetOpen = ref(false);
const homeScore = ref(2);
const awayScore = ref(1);
const tableSort = ref<TableSort>({ key: 'elo', direction: 'desc' });
const expandedKeys = ref<(string | number)[]>([]);

const radioOptions: RadioOption[] = [
  { value: 'elo-based', label: 'elo-based' },
  { value: 'random', label: 'random' },
  { value: 'fixed', label: 'fixed' },
];

const tableColumns: TableColumn[] = [
  { key: 'player', label: 'player', sortable: true },
  { key: 'gp', label: 'gp', align: 'center', numeric: true, sortable: true },
  { key: 'record', label: 'w-l', align: 'center', numeric: true },
  { key: 'elo', label: 'elo', align: 'center', numeric: true, sortable: true },
  { key: 'diff', label: 'g-diff', align: 'center', numeric: true, priority: 'md' },
  { key: 'points', label: 'pts', align: 'center', numeric: true, priority: 'lg' },
];

const tableRows = [
  { player: 'jere', gp: 220, record: '158-51', elo: 1865, diff: 608, points: 380 },
  { player: 'marko', gp: 528, record: '283-213', elo: 1542, diff: 98, points: 612 },
  { player: 'kaira', gp: 486, record: '207-179', elo: 1509, diff: -44, points: 501 },
];

const iconNames = Object.keys(icons) as IconName[];

function toggleRow(row: Record<string, any>) {
  const key = row.player as string;
  expandedKeys.value = expandedKeys.value.includes(key)
    ? expandedKeys.value.filter((item) => item !== key)
    : [...expandedKeys.value, key];
}
</script>
