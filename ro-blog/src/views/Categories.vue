<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { articleCategoryListService } from '@/api/article'
import router from '@/router'
import Wave from '@/components/wave.vue'
import SideBar from '@/components/sideBar.vue'
interface Category {
  id: number
  name: string
  article_count: number
}
const categories = ref<Category[]>([])
onMounted(async () => {
  try {
    const res = await articleCategoryListService()
    console.log(res)
    categories.value = res.data
  } catch (error) {
    console.error('获取分类列表失败:', error)
  }
})
const navigateToCategory = (categoryId: number, categoryName: string) => {
  console.log('Navigate to category:', categoryId, categoryName)
  router.push({
    name: 'articles',
    query: {
      category: categoryName,
      categoryId: categoryId.toString(),
    },
  })
}
</script>

<template>
  <div class="page-container">
    <section class="hero">
      <div class="hero-bg"></div>
      <div class="hero-overlay"></div>

      <div class="title-card">
        <h1 class="maintitle">Categories</h1>
      </div>

      <Wave />
    </section>

    <section class="content-section">
      <div class="layout-wrapper">
        <SideBar />
        <main class="category-list">
          <div class="content-card categories-panel">
            <div class="categories-grid">
              <div
                v-for="category in categories"
                :key="category.id"
                class="dummy-card"
                @click="navigateToCategory(category.id, category.name)"
              >
                <div class="category-header">
                  <h3 class="category-name">{{ category.name }}</h3>
                  <div class="article-count">{{ category.article_count }} 篇文章</div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero {
  height: 45vh;
}
.hero-bg {
  position: fixed;
}
.hero-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(3px);
  z-index: -1;
}


.content-section {
  min-height: 100vh;
}
.layout-wrapper {
  max-width: 1040px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  gap: 1.5rem;
  align-items: flex-start;
}

/* 主内容区 */
.category-list {
  flex: 1;
  min-width: 0;
}

.categories-panel {
  padding: 1.1rem 1.4rem;
}

.section-heading {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #28344a;
  font-weight: bold;
}

.categories-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.85rem;
}
.dummy-card {
  background: transparent;
  border: none;
  border-bottom: 1px solid #d4e0f2;
  border-radius: 0;
  box-shadow: none;
  display: flex;
  cursor: pointer;
  margin-bottom: 0;
  flex-direction: column;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
  opacity: 0;
  transform: translateY(10px);
  animation: categoryCardIn 520ms ease forwards;
}

.dummy-card:nth-child(1) {
  animation-delay: 60ms;
}

.dummy-card:nth-child(2) {
  animation-delay: 130ms;
}

.dummy-card:nth-child(3) {
  animation-delay: 200ms;
}

.dummy-card:nth-child(4) {
  animation-delay: 270ms;
}

.dummy-card:nth-child(5) {
  animation-delay: 340ms;
}
.dummy-card:hover {
  transform: translateX(4px);
  border-bottom-color: #95b2dd;
  box-shadow: none;
}
.dummy-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 18%;
  width: 3px;
  height: 64%;
  background: #8cafde;
  opacity: 0;
  transition: opacity 0.25s ease;
}

.dummy-card:hover::before {
  opacity: 1;
}

.category-header {
  padding: 1rem 0.5rem 1rem 0.8rem;
  color: #2d3f5c;
  text-align: left;
  position: relative;
  transition: transform 0.25s ease;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
}
.category-header:hover {
  transform: none;
}
.category-name {
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 0;
  text-shadow: none;
}
.article-count {
  font-size: 0.88rem;
  color: #6d7f98;
  white-space: nowrap;
}

@keyframes categoryCardIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式适配 */
@media (max-width: 900px) {
  .layout-wrapper {
    grid-template-columns: 1fr;
  }
  .categories-grid {
    grid-template-columns: 1fr;
  }
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  .maintitle {
    font-size: 2.5rem;
  }
  .hero {
    height: 50vh;
  }
}
</style>
