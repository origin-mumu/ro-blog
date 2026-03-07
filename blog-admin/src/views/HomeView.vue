<script setup lang="ts">
import Nav from '@/components/nav.vue'
import { getBlogStatsService } from '@/api/article'
import { onMounted } from 'vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
interface BlogStats {
  totalArticles: number
  totalCategories: number
}
const router = useRouter()

const blogStats = ref<BlogStats>()
onMounted(() => {
  getBlogStatsService().then((res) => {
    console.log(res)
    blogStats.value = res.data
  })
})
const handleCreateArticle = () => {
  router.push({ name: 'articles' })
}
const handleManageCategories = () => {
  router.push({ name: 'categories' })
}
</script>

<template>
  <div class="home-layout">
    <div class="sidebar-container">
      <Nav></Nav>
    </div>
    <div class="content-container">
      <div class="content-box">
        <div class="title">博客首页</div>
        <div class="dashboard-content">
          <div class="stats-cards">
            <div class="stat-card">
              <div class="stat-icon">📊</div>
              <div class="stat-info">
                <div class="stat-number">{{ blogStats?.totalArticles || 0 }}</div>
                <div class="stat-label">文章总数</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">📂</div>
              <div class="stat-info">
                <div class="stat-number">{{ blogStats?.totalCategories || 0 }}</div>
                <div class="stat-label">分类数量</div>
              </div>
            </div>
          </div>

          <div class="quick-actions">
            <h3>快速操作</h3>
            <div class="action-buttons">
              <button class="action-btn" @click="handleCreateArticle">新建文章</button>
              <button class="action-btn" @click="handleManageCategories">管理分类</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-layout {
  min-height: 100vh;
  display: flex;
}

.sidebar-container {
  width: 240px;
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}

.content-container {
  flex: 1;
  margin-left: 300px;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.content-box {
  width: 90%;
  box-sizing: border-box;
  height: 90%;
  border-radius: 12px;
  padding: 40px;
  border: 1px solid #ececec;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 30px;
  color: #2c3e50;
  text-align: center;
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 12px;
  padding: 24px;
  color: rgb(0, 0, 0);
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  font-size: 2.5rem;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

.quick-actions {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 30px;
  border: 1px solid #e9ecef;
}

.quick-actions h3 {
  font-size: 1.5rem;
  margin-bottom: 20px;
  color: #2c3e50;
}

.action-buttons {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.action-btn {
  background: #30cfff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(78, 205, 196, 0.3);
}

.action-btn:hover {
  background: #1e7c99;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(78, 205, 196, 0.4);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar-container {
    width: 100%;
    position: static;
    height: auto;
  }

  .content-container {
    margin-left: 0;
    padding: 20px;
  }

  .stats-cards {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
  }
}
</style>
