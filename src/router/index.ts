import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/Home.vue'),
    },
    {
      path: '/addmatch',
      name: 'addmatch',
      component: () => import('../views/AddMatchView.vue'),
    },
    {
      path: '/config',
      name: 'config',
      component: () => import('../views/Config.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
});

export default router;
