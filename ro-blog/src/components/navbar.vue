<script setup lang="ts">
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { ref } from 'vue'
const router = useRouter()
const navItems = [
  { name: '首页', path: '/', icon: '' },
  { name: '关于', path: '/about', icon: '' },
  { name: '博客', path: '/articles', icon: '' },
  { name: '分类', path: '/categories', icon: '' },
]
const route = useRoute()
const isActive = (path: string) => {
  return route.path == path
}

// --- 核心逻辑开始 ---
const navMenuRef = ref<HTMLElement | null>(null)

// 鼠标移动处理函数
const handleMouseMove = (e: MouseEvent) => {
  const menu = navMenuRef.value
  if (!menu) return

  // 获取容器的位置信息
  const rect = menu.getBoundingClientRect()

  // 计算鼠标相对于容器左上角的坐标
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  // 将坐标写入 CSS 变量，供样式使用
  menu.style.setProperty('--mouse-x', `${x}px`)
  menu.style.setProperty('--mouse-y', `${y}px`)
}
</script>
<template>
  <div class="navbar">
    <div class="nav-container">
      <div class="nav-brand" @click="router.push('/')">
        <span>RO Blog</span>
      </div>
      <ul ref="navMenuRef" class="nav-menu spotlight-menu" @mousemove="handleMouseMove">
        <li v-for="(item, index) in navItems" :key="index" class="nav-item">
          <RouterLink
            :to="item.path"
            class="nav-link"
            :class="{ 'nav-active': isActive(item.path) }"
          >
            <span class="nav-icon">{{ item.icon }}</span>
            <span class="nav-text">{{ item.name }}</span>
          </RouterLink>
        </li>
      </ul>
      <div class="more">
        <span>MORE</span>
      </div>
    </div>
  </div>
</template>
<style scoped>
.navbar {
  z-index: 1000;
  position: fixed;
  top: 10px;
  left: 50%;
  width: auto;
  transform: translateX(-50%);
  --spotlight-color: rgb(107, 225, 255);
}
.nav-container {
  display: flex;
  margin: 0 auto;
  align-items: center;
  justify-content: center;
  padding: 0 10px;
  width: 100%;
}
.nav-brand {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: large;
  font-weight: bold;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  padding: 5px 15px;
  border-radius: 60px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  height: 40px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;
  cursor: pointer;
  overflow: hidden;
}
.nav-brand span {
  transition: all 0.3s ease;
}
.nav-brand:hover {
  transform: scale(1.1);
  margin: 0 10px;
}

.nav-menu::before,
.nav-brand::before,
.more::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  background: radial-gradient(
    240px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    var(--spotlight-color),
    transparent 60%
  );

  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  z-index: -100;
}

.nav-menu:hover::before,
.nav-brand:hover::before,
.more:hover::before {
  opacity: 1;
}
.nav-menu {
  display: flex;
  align-items: center;
  justify-content: center;
  list-style: none;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  padding: 5px 15px;
  border-radius: 60px;
  margin: 0 20px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  height: 40px;
  font-weight: bold;
  border: 1px solid rgba(255, 255, 255, 0.5);
  overflow: hidden;
}
.nav-item {
  margin: 0 10px;
}
.nav-link {
  text-decoration: none;
  border-radius: 60px;
  padding: 5px 15px;
  white-space: nowrap;
  color: #3c3c3c;
  transition: all 0.3s ease;
  display: inline-flex;
  font-size: 1.1rem;
}

.nav-link:hover {
  transform: scale(1.1);
  margin: 0 10px;
}
.nav-active {
  transition: all 0.3s ease;
  background: linear-gradient(to bottom, #1e90ff 0%, #00bfff 100%);
  color: #ffffff;
  transform: scale(1.1);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

.more {
  border: 1px solid rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  padding: 5px 15px;
  border-radius: 60px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  height: 40px;
  transition: all 0.3s ease;
  font-weight: bold;
  overflow: hidden;
}
.more:hover {
  transform: scale(1.1);
  margin: 0 10px;
}
</style>
