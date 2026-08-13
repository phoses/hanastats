import type { IconName } from './components/icons';

export interface RouteChrome {
  title: string;
  headerIcon: IconName;
  headerIconClass: string;
  favicon: string;
}

const standingsChrome: RouteChrome = {
  title: 'standings',
  headerIcon: 'trophy',
  headerIconClass: 'tw:text-amber-400',
  favicon: '/favicons/standings.svg',
};

const matchesChrome: RouteChrome = {
  title: 'matches',
  headerIcon: 'list',
  headerIconClass: 'tw:text-emerald-300',
  favicon: '/favicons/matches.svg',
};

const addChrome: RouteChrome = {
  title: 'add match',
  headerIcon: 'plus',
  headerIconClass: 'tw:text-violet-300',
  favicon: '/favicons/add.svg',
};

const trendsChrome: RouteChrome = {
  title: 'trends',
  headerIcon: 'trend',
  headerIconClass: 'tw:text-fuchsia-300',
  favicon: '/favicons/trends.svg',
};

const moreChrome: RouteChrome = {
  title: 'more',
  headerIcon: 'settings',
  headerIconClass: 'tw:text-amber-300',
  favicon: '/favicons/more.svg',
};

const configChrome: RouteChrome = {
  title: 'config',
  headerIcon: 'database',
  headerIconClass: 'tw:text-cyan-300',
  favicon: '/favicons/config.svg',
};

export const defaultRouteChrome: RouteChrome = standingsChrome;

export const routeChromeByName: Record<string, RouteChrome> = {
  'modern-standings': standingsChrome,
  'modern-matches': matchesChrome,
  'modern-add': addChrome,
  'modern-trends': trendsChrome,
  'modern-more': moreChrome,
  'modern-kitchen-sink': {
    title: 'components',
    headerIcon: 'info',
    headerIconClass: 'tw:text-accent',
    favicon: '/favicons/more.svg',
  },
  stats: {
    ...standingsChrome,
    title: 'stats',
  },
  addmatch: addChrome,
  config: configChrome,
};

export function chromeForRoute(routeName: string | symbol | null | undefined): RouteChrome {
  if (routeName === null || routeName === undefined) {
    return defaultRouteChrome;
  }
  return routeChromeByName[String(routeName)] ?? defaultRouteChrome;
}
