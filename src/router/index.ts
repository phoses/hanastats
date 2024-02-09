import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'stats',
      component: () => import('../views/Stats.vue'),
    },
    // {
    //   path: '/about',
    //   name: 'about',
    //   // route level code-splitting
    //   // this generates a separate chunk (About.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import('../views/AboutView.vue')
    // },
    {
      path: '/addgame',
      name: 'addgame',
      component: () => import('../views/AddGame.vue'),
    },
    {
      path: '/config',
      name: 'config',
      component: () => import('../views/Config.vue'),
    },
  ]
})

export default router
