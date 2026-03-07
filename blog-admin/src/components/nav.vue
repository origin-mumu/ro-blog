<template>
  <nav class="sidebar">
    <div class="sidebar-header">
      <h2 class="logo">博客后台</h2>
    </div>

    <ul class="nav-menu">
      <li class="nav-item">
        <router-link to="/" class="nav-link" active-class="active">
          <span class="nav-icon">📊</span>
          <span class="nav-text">仪表盘</span>
        </router-link>
      </li>

      <li class="nav-item">
        <router-link to="/admin/articles" class="nav-link" active-class="active">
          <span class="nav-icon">📝</span>
          <span class="nav-text">文章管理</span>
        </router-link>
      </li>

      <li class="nav-item">
        <router-link to="/admin/categories" class="nav-link" active-class="active">
          <span class="nav-icon">📂</span>
          <span class="nav-text">分类管理</span>
        </router-link>
      </li>

      <li class="nav-item">
        <a href="#" class="nav-link" @click="handleLogout">
          <span class="nav-icon">🚪</span>
          <span class="nav-text">退出登录</span>
        </a>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const handleLogout = () => {
  localStorage.removeItem('isLoggedIn')
  router.push('/login')
}
</script>

<style scoped>
.sidebar {
  width: 240px;
  height: 90%;
  border: 1px solid #ececec;
  border-radius: 30px;
  position: fixed;
  left: 30px;
  top: 50%;
  transform: translateY(-50%);
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  background: #ffffff;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
}

.logo {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: rgb(0, 0, 0);
}

.nav-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  margin: 5px 10px;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  color: rgba(0, 0, 0, 0.8);
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.nav-link:hover {
  background: rgba(70, 70, 70, 0.1);
  color: rgb(0, 0, 0);
  transform: translateX(5px);
}

.nav-link.active {
  background: rgba(70, 70, 70, 0.3);
  color: rgb(0, 0, 0);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.nav-icon {
  font-size: 1.2rem;
  margin-right: 12px;
  width: 24px;
  text-align: center;
}

.nav-text {
  font-size: 0.95rem;
}

@media (max-width: 768px) {
  .sidebar {
    width: 200px;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  .sidebar.open {
    transform: translateX(0);
  }
}
</style>
