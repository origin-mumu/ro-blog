<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { getBlogStatsService } from '@/api/article'
const data = ref()
interface Categories {
  id: number
  name: string
  article_count: number
}
const categories = ref<Categories[]>()
const totalArticles = ref(0)
const totalCategories = ref(0)
onMounted(async () => {
  try {
    const res = await getBlogStatsService()
    const stats = res.data
    data.value = stats
    categories.value = stats?.popularCategories ?? []
    totalArticles.value = stats?.totalArticles ?? 0
    totalCategories.value = stats?.totalCategories ?? 0
  } catch (err) {
    console.error('获取侧边栏数据失败:', err)
  }
})
</script>
<template>
  <aside class="sidebar">
    <div class="widget-card profile-card">
      <img class="avatar-placeholder" src="@/assets/avatar.jpg" alt="头像" />
      <h2>robin</h2>
      <br />
      <b
        ><p>未完成的课题会重复出现，<br />直到你做出改变</p></b
      >

      <div class="social-icons-row"><span>G</span><span>B</span><span>X</span></div>
      <div class="stats">
        <div>
          <span>{{ totalArticles }}</span
          >文章
        </div>
        <div>
          <span>{{ totalCategories }}</span
          >分类
        </div>
      </div>
    </div>

    <div class="widget-card">
      <h4 class="widget-title">分类</h4>
      <div class="tags-cloud">
        <span class="tag" v-for="category in categories" :key="category.name">{{
          category.name
        }}</span>
      </div>
    </div>
  </aside>
</template>
<style scoped>
.sidebar {
  width: 240px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  position: sticky;
  top: 5.5rem;
}

.widget-card {
  background: #f8fbff;
  border: 1px solid #d6e2f2;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 14px 26px -18px rgba(33, 49, 74, 0.4);
  opacity: 0;
  transform: translateY(12px);
  animation: sidebarCardIn 520ms ease forwards;
}

.widget-card:nth-child(1) {
  animation-delay: 60ms;
}

.widget-card:nth-child(2) {
  animation-delay: 140ms;
}

@keyframes sidebarCardIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.widget-title {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: #28344a;
  border-bottom: 1px solid #dbe4f3;
  padding-bottom: 0.5rem;
}

.profile-card {
  text-align: center;
}
.social-icons-row {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
}
.social-icons-row span {
  display: block;
  width: 35px;
  height: 35px;
  background: #e8effa;
  border-radius: 50%;
  line-height: 35px;
  color: #66758a;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: bold;
  font-size: 0.8rem;
}
.social-icons-row span:hover {
  background: #5f7fb2;
  color: white;
  transform: translateY(-3px);
}
.avatar-placeholder {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin: 0 auto 1rem;
  border: 3px solid #f0f0f0;
}
.stats {
  display: flex;
  justify-content: space-around;
  margin-top: 1rem;
  color: #67758a;
  font-size: 0.9rem;
}
.stats span {
  display: block;
  font-weight: bold;
  color: #28344a;
  font-size: 1.1rem;
}

.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
}
.tag {
  background: #e8effa;
  color: #66758a;
  padding: 0.3rem 0.8rem;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}
.tag:hover {
  background: #5f7fb2;
  color: white;
}
</style>
