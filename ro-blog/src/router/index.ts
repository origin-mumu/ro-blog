import { createRouter, createWebHistory } from 'vue-router'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/articles',
      name: 'articles',
      component: () => import('../views/ArticlesView.vue'),
    },
    {
      path: '/articles/:id',
      name: 'articleDetail',
      component: () => import('../views/ArticleDetail.vue'),
    },
    {
      path: '/categories',
      name: 'categories',
      component: () => import('../views/Categories.vue'),
    }  ,
    {
      path: '/test',
      name: 'test',
      component: () => import('../views/Test.vue'),
    }
 
  ],
    scrollBehavior() {
    return { top: 0, behavior: 'smooth' }
  }
})

export default router
