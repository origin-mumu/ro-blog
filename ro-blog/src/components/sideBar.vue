<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { getBlogStatsService } from '@/api/article.js'
const data = ref()
interface Categories {
  id: number
  name: string
  article_count: number
}
const categories = ref<Categories[]>()
const totalArticles = ref(0)
const totalCategories = ref(0)
onMounted(() => {
  getBlogStatsService().then(res => {
    data.value = res.data
    categories.value = data.value.popularCategories
    totalArticles.value = data.value.totalArticles
    totalCategories.value = data.value.totalCategories
  })
})
</script>
<template>
  <aside class="sidebar">
    <div class="widget-card profile-card">
      <img class="avatar-placeholder" src="../assets/avatar.jpg" alt="头像" />
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
      <h4 class="widget-title">🏷️ 分类</h4>
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
  width: 300px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  position: sticky;
  top: 2rem;
}

.widget-card {
  background: rgba(255, 255, 255);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 20px 25px -5px rgba(11, 120, 245, 0.15);
}

.widget-title {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: #333;
  border-bottom: 1px solid #eee;
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
  background: rgba(78, 101, 205, 0.1);
  border-radius: 50%;
  line-height: 35px;
  color: #555;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: bold;
  font-size: 0.8rem;
}
.social-icons-row span:hover {
  background: #4e59cd;
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
  color: #666;
  font-size: 0.9rem;
}
.stats span {
  display: block;
  font-weight: bold;
  color: #333;
  font-size: 1.1rem;
}

.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
}
.tag {
  background: rgba(78, 101, 205, 0.1);
  color: #666;
  padding: 0.3rem 0.8rem;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}
.tag:hover {
  background: #4e54cd;
  color: white;
}
</style>
