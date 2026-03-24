<template>
  <div class="page-container">
    <section class="hero">
      <div class="hero-bg"></div>
      <div class="hero-overlay"></div>

      <div class="title-card">
        <div class="error-code">404</div>
        <h1 class="error-title">页面未找到</h1>
        <p class="error-description">抱歉，您访问的页面不存在或已被移动。</p>
        <div class="action-buttons">
          <button class="action-btn" @click="goHome">返回首页</button>
        </div>
      </div>

      <Wave />
    </section>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.hero {
  height: 100vh;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url('/images/yue.jpg') center/cover fixed;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: -1;
}

.title-card {
  text-align: center;
  color: white;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(12px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  padding: 3rem 4rem;
  max-width: 600px;
  margin: 0 auto;
}

.error-code {
  font-size: 6rem;
  font-weight: 800;
  color: #a7d2fa;
  line-height: 1;
  margin-bottom: 1rem;
  text-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
}

.error-title {
  font-size: 2.5rem;
  color: white;
  margin-bottom: 1rem;
  font-weight: 600;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}

.error-description {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2rem;
  line-height: 1.6;
}

.action-buttons {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  margin-bottom: 0;
}

.action-btn {
  background: rgba(167, 210, 250, 0.9);
  border: none;
  border-radius: 10px;
  padding: 0.75rem 2rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: rgba(167, 210, 250, 1);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(167, 210, 250, 0.4);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .title-card {
    padding: 2rem 1.5rem;
    margin: 0 1rem;
  }

  .error-code {
    font-size: 4rem;
  }

  .error-title {
    font-size: 1.8rem;
  }

  .action-buttons {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
