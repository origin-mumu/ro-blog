import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/login.vue'),
    },
    {
      path: '/admin/articles',
      name: 'articles',
      component: () => import('../views/articles/list.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/admin/categories',
      name: 'categories',
      component: () => import('../views/categories/list.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/admin/articles/add',
      name: 'AddArticle',
      component: () => import('../views/articles/add.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/admin/articles/:id',
      name: 'EditArticle',
      component: () => import('../views/articles/edit.vue'),
      meta: { requiresAuth: true }
    }
  ],
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  
  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/login')
  } else {
    next()
  }
})

export default router