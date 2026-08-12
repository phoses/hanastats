<template>
  <!--
    No scroll container here on purpose: the page itself scrolls, which keeps
    the table free of nested scrollbars and lets the header stick below the top
    bar. Columns are dropped by priority instead of scrolled to.
  -->
  <div class="tw:rounded-card tw:border tw:border-line tw:bg-surface">
    <table class="tw:w-full tw:border-collapse tw:text-sm">
      <caption v-if="caption" class="tw:sr-only">{{ caption }}</caption>
      <thead>
        <tr>
          <th
            v-for="(column, columnIndex) in columns"
            :key="column.key"
            scope="col"
            :aria-sort="ariaSort(column)"
            :class="[
              'tw:sticky tw:top-[calc(3.5rem+env(safe-area-inset-top))] tw:z-20 tw:border-b tw:border-line tw:bg-surface-2 tw:font-semibold tw:text-ink-muted tw:whitespace-nowrap',
              priorityClass(column),
              alignClass(column),
              columnIndex === 0 ? 'tw:rounded-tl-card' : '',
              columnIndex === columns.length - 1 ? 'tw:rounded-tr-card' : '',
              column.sortable ? '' : 'tw:px-1 tw:py-2 tw:sm:px-2',
            ]"
          >
            <button
              v-if="column.sortable"
              type="button"
              class="tw:inline-flex tw:min-h-11 tw:w-full tw:items-center tw:gap-1 tw:px-1 tw:transition-colors tw:hover:text-ink tw:sm:px-2"
              :class="alignButtonClass(column)"
              :title="column.description || column.label"
              @click="onSort(column)"
            >
              <span>{{ column.label }}</span>
              <UiIcon
                v-if="sort && sort.key === column.key"
                :name="sort.direction === 'asc' ? 'arrow-up' : 'arrow-down'"
                :size="14"
                class="tw:text-accent"
              />
            </button>
            <span v-else :title="column.description || undefined">{{ column.label }}</span>
          </th>
        </tr>
      </thead>

      <tbody>
        <template v-for="(row, rowIndex) in rows" :key="keyOf(row)">
          <tr :class="['tw:border-b tw:border-line/50', rowClass ? rowClass(row) : '']">
            <td
              v-for="(column, columnIndex) in columns"
              :key="column.key"
              :class="[
                'tw:px-1 tw:py-1.5 tw:sm:px-2',
                priorityClass(column),
                alignClass(column),
                column.numeric ? 'tw:tabular-nums tw:whitespace-nowrap' : '',
              ]"
            >
              <button
                v-if="expandable && columnIndex === 0"
                type="button"
                class="tw:inline-flex tw:min-h-11 tw:w-full tw:items-center tw:gap-1 tw:text-left"
                :aria-expanded="isExpanded(row) ? 'true' : 'false'"
                :aria-controls="`${expansionIdPrefix}-${keyOf(row)}`"
                @click="emit('toggleRow', row)"
              >
                <UiIcon
                  name="chevron-right"
                  :size="14"
                  :class="['tw:shrink-0 tw:text-ink-subtle tw:transition-transform', isExpanded(row) ? 'tw:rotate-90' : '']"
                />
                <slot :name="`cell-${column.key}`" :row="row" :index="rowIndex">{{ row[column.key] }}</slot>
              </button>
              <slot v-else :name="`cell-${column.key}`" :row="row" :index="rowIndex">{{ row[column.key] }}</slot>
            </td>
          </tr>

          <tr v-if="expandable && isExpanded(row)" :id="`${expansionIdPrefix}-${keyOf(row)}`">
            <td :colspan="columns.length" class="tw:border-b tw:border-line tw:bg-surface-2/60 tw:px-3 tw:py-3">
              <slot name="expansion" :row="row" />
            </td>
          </tr>
        </template>
      </tbody>
    </table>

    <div v-if="rows.length === 0" class="tw:px-4 tw:py-8 tw:text-center tw:text-sm tw:text-ink-muted">
      <slot name="empty">no rows</slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import UiIcon from './UiIcon.vue';
import { useComponentId } from '../composables/useComponentId';
import type { TableColumn, TableSort } from './types';

type Row = Record<string, any>;

const props = withDefaults(defineProps<{
  columns: TableColumn[];
  rows: Row[];
  rowKey: string | ((row: Row) => string | number);
  sort?: TableSort | null;
  expandable?: boolean;
  expandedKeys?: (string | number)[];
  caption?: string;
  rowClass?: (row: Row) => string;
}>(), {
  sort: null,
  expandable: false,
  expandedKeys: () => [],
  caption: '',
  rowClass: undefined,
});

const emit = defineEmits<{
  'update:sort': [value: TableSort];
  toggleRow: [row: Row];
}>();

const expansionIdPrefix = useComponentId('ui-table-row');

function keyOf(row: Row): string | number {
  return typeof props.rowKey === 'function' ? props.rowKey(row) : row[props.rowKey];
}

function isExpanded(row: Row): boolean {
  return props.expandedKeys.includes(keyOf(row));
}

function priorityClass(column: TableColumn): string {
  if (column.priority === 'mobile') {
    return 'tw:md:hidden';
  }
  if (column.priority === 'xs') {
    return 'tw:hidden tw:xs:table-cell';
  }
  if (column.priority === 'md') {
    return 'tw:hidden tw:md:table-cell';
  }
  if (column.priority === 'lg') {
    return 'tw:hidden tw:lg:table-cell';
  }
  return '';
}

function alignClass(column: TableColumn): string {
  if (column.align === 'right') {
    return 'tw:text-right';
  }
  if (column.align === 'center') {
    return 'tw:text-center';
  }
  return 'tw:text-left';
}

function alignButtonClass(column: TableColumn): string {
  if (column.align === 'right') {
    return 'tw:justify-end';
  }
  if (column.align === 'center') {
    return 'tw:justify-center';
  }
  return 'tw:justify-start';
}

function ariaSort(column: TableColumn): 'ascending' | 'descending' | 'none' | undefined {
  if (!column.sortable) {
    return undefined;
  }
  if (props.sort?.key !== column.key) {
    return 'none';
  }
  return props.sort.direction === 'asc' ? 'ascending' : 'descending';
}

function onSort(column: TableColumn) {
  const sameColumn = props.sort?.key === column.key;
  const direction = sameColumn && props.sort?.direction === 'desc' ? 'asc' : 'desc';
  emit('update:sort', { key: column.key, direction });
}
</script>
