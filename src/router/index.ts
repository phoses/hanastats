import { createRouter, createWebHistory } from 'vue-router'

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
  ]
})

export default router
