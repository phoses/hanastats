export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type IconButtonVariant = 'ghost' | 'surface' | 'accent';
export type IconButtonSize = 'sm' | 'md' | 'lg';

export type BadgeTone = 'neutral' | 'accent' | 'win' | 'loss' | 'warn';

export interface RadioOption {
  value: string | number;
  label: string;
}

/**
 * Column visibility priority. `core` columns are always visible (mobile first),
 * `md` and `lg` appear on wider screens only, and `mobile` is a condensed
 * column that gets replaced by the detailed ones from `md` upwards.
 */
export type ColumnPriority = 'core' | 'mobile' | 'xs' | 'md' | 'lg';

export interface TableColumn {
  key: string;
  label: string;
  /** Longer description announced to screen readers and shown as a title. */
  description?: string;
  priority?: ColumnPriority;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  numeric?: boolean;
}

export interface TableSort {
  key: string;
  direction: 'asc' | 'desc';
}
