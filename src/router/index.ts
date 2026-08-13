import { createRouter, createWebHistory } from 'vue-router'
import { isUiMode, useUiStore } from '@/stores/ui';
import { classicToModernRoute, isModernRouteName, modernToClassicRoute } from '@/ui/routeMap';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'stats',
      component: () => import('../views/Stats.vue'),
    },
    {
      path: '/addmatch',
      name: 'addmatch',
      component: () => import('../views/AddMatch.vue'),
    },
    {
      path: '/config',
      name: 'config',
      component: () => import('../views/Config.vue'),
    },
    {
      path: '/m',
      component: () => import('../ui/layout/ModernShell.vue'),
      children: [
        {
          path: '',
          redirect: { name: 'modern-standings' },
        },
        {
          path: 'standings',
          name: 'modern-standings',
          component: () => import('../ui/views/StandingsView.vue'),
        },
        {
          path: 'matches',
          name: 'modern-matches',
          component: () => import('../ui/views/MatchesView.vue'),
        },
        {
          path: 'add',
          name: 'modern-add',
          component: () => import('../ui/views/AddMatchView.vue'),
        },
        {
          path: 'trends',
          name: 'modern-trends',
          component: () => import('../ui/views/TrendsView.vue'),
        },
        {
          path: 'more',
          name: 'modern-more',
          component: () => import('../ui/views/MoreView.vue'),
        },
        ...(import.meta.env.DEV
          ? [{
            path: 'dev',
            name: 'modern-kitchen-sink',
            component: () => import('../ui/views/KitchenSinkView.vue'),
          }]
          : []),
      ],
    },
  ]
})

/**
 * Keeps the URL and the selected UI mode in sync: classic routes live at the
 * root, modern routes under /m. `?ui=classic|modern` switches the mode.
 */
router.beforeEach((to) => {
  const uiStore = useUiStore();

  const requestedMode = to.query.ui;
  if (isUiMode(requestedMode)) {
    uiStore.setMode(requestedMode);
  }

  const routeName = String(to.name ?? '');
  const isModernRoute = isModernRouteName(routeName);

  if (uiStore.mode === 'modern' && !isModernRoute) {
    const target = classicToModernRoute[routeName];
    if (target) {
      return { name: target, replace: true };
    }
  }

  if (uiStore.mode === 'classic' && isModernRoute) {
    const target = modernToClassicRoute[routeName];
    if (target) {
      return { name: target, replace: true };
    }
  }

  return true;
});

export default router;
