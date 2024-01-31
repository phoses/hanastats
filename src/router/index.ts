import { createRouter, createWebHistory } from 'vue-router'
import Stats from '../views/Stats.vue'
import AddGame from '../views/AddGame.vue'
import Config from '../views/Config.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'stats',
      component: Stats,
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
      component: AddGame,
    },
    {
      path: '/config',
      name: 'config',
      component: Config,
    },
  ]
})

export default router
