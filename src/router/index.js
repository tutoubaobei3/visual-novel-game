import { createRouter, createWebHistory } from 'vue-router'
const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/gameView.vue') // 或其他组件
  },
]
const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
