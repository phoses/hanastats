export type IconName =
  | 'stats'
  | 'list'
  | 'plus'
  | 'minus'
  | 'dots'
  | 'filter'
  | 'close'
  | 'chevron-down'
  | 'chevron-up'
  | 'chevron-right'
  | 'search'
  | 'check'
  | 'settings'
  | 'user'
  | 'login'
  | 'logout'
  | 'refresh'
  | 'database'
  | 'graph'
  | 'trend'
  | 'trophy'
  | 'calendar'
  | 'moon'
  | 'flame'
  | 'snowflake'
  | 'gamepad'
  | 'arrow-up'
  | 'arrow-down'
  | 'sort'
  | 'swap'
  | 'alert'
  | 'info';

/** Inline 24x24 stroke icons, drawn with currentColor so they inherit text color. */
export const icons: Record<IconName, string> = {
  'stats': '<path d="M4 20h16"/><path d="M7 20v-7"/><path d="M12 20V5"/><path d="M17 20v-10"/>',
  'list': '<path d="M8 6h12"/><path d="M8 12h12"/><path d="M8 18h12"/><path d="M4 6h.01"/><path d="M4 12h.01"/><path d="M4 18h.01"/>',
  'plus': '<path d="M12 5v14"/><path d="M5 12h14"/>',
  'minus': '<path d="M5 12h14"/>',
  'dots': '<path d="M5 12h.01"/><path d="M12 12h.01"/><path d="M19 12h.01"/>',
  'filter': '<path d="M4 5h16l-6 7v6l-4 2v-8z"/>',
  'close': '<path d="M6 6l12 12"/><path d="M18 6L6 18"/>',
  'chevron-down': '<path d="M6 9l6 6 6-6"/>',
  'chevron-up': '<path d="M6 15l6-6 6 6"/>',
  'chevron-right': '<path d="M9 6l6 6-6 6"/>',
  'search': '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4.3-4.3"/>',
  'check': '<path d="M5 13l4 4L19 7"/>',
  'settings': '<path d="M4 7h9"/><path d="M18 7h2"/><path d="M4 17h2"/><path d="M11 17h9"/><circle cx="15.5" cy="7" r="2.5"/><circle cx="7.5" cy="17" r="2.5"/>',
  'user': '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5"/>',
  'login': '<path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><path d="M10 17l5-5-5-5"/><path d="M15 12H3"/>',
  'logout': '<path d="M9 3H5a2 2 0 00-2 2v14a2 2 0 002 2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/>',
  'refresh': '<path d="M20.5 12a8.5 8.5 0 11-2.6-6.1"/><path d="M21 3v6h-6"/>',
  'database': '<path d="M12 3c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3z"/><path d="M20 6v12c0 1.7-3.6 3-8 3s-8-1.3-8-3V6"/><path d="M20 12c0 1.7-3.6 3-8 3s-8-1.3-8-3"/>',
  'graph': '<path d="M4 4v16h16"/><path d="M7 15l4-5 3 3 5-7"/>',
  'trend': '<path d="M4 17l5-5 3 3 8-8"/><path d="M14 7h6v6"/>',
  'calendar': '<rect x="4" y="6" width="16" height="14" rx="2"/><path d="M8 3v4"/><path d="M16 3v4"/><path d="M4 10h16"/>',
  'moon': '<path d="M15 4.2A7.2 7.2 0 1012 19.8 6.2 6.2 0 0015 4.2z"/>',
  'trophy': '<path d="M8 4h8v5a4 4 0 01-8 0z"/><path d="M8 5H6a2 2 0 002 2"/><path d="M16 5h2a2 2 0 01-2 2"/><path d="M12 13v4"/><path d="M9 20h6"/>',
  'flame': '<path d="M12 3c3 3.6 5 5.9 5 9a5 5 0 01-10 0c0-1.6.8-3 2.2-4.3.4 1 1 1.7 1.8 2C10.3 7.4 11 5.2 12 3z"/>',
  'snowflake': '<path d="M12 3v18"/><path d="M4.5 7.5l15 9"/><path d="M19.5 7.5l-15 9"/><path d="M9.5 4.5L12 6l2.5-1.5"/><path d="M9.5 19.5L12 18l2.5 1.5"/>',
  'gamepad': '<path d="M6 8h12a3 3 0 013 3v2a3 3 0 01-3 3H6a3 3 0 01-3-3v-2a3 3 0 013-3z"/><path d="M7 12h2"/><path d="M8 11v2"/><path d="M15.5 12h.01"/><path d="M17.5 12h.01"/>',
  'arrow-up': '<path d="M12 19V5"/><path d="M6 11l6-6 6 6"/>',
  'arrow-down': '<path d="M12 5v14"/><path d="M6 13l6 6 6-6"/>',
  'sort': '<path d="M8 8l-3-3-3 3"/><path d="M5 5v14"/><path d="M16 16l3 3 3-3"/><path d="M19 19V5"/>',
  'swap': '<path d="M8 7L4 11l4 4"/><path d="M4 11h16"/><path d="M16 17l4-4-4-4"/><path d="M20 13H4"/>',
  'alert': '<path d="M12 3l9 16H3z"/><path d="M12 9v5"/><path d="M12 17h.01"/>',
  'info': '<circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><path d="M12 8h.01"/>',
};
