<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { articleCategoryListService } from '@/api/article.js'
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
        <main class="category-list">
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
        </main>

        <SideBar />
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

.title-card {
  padding: 1rem 3rem;
}
.maintitle {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  letter-spacing: 3px;
  text-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

.content-section {
  min-height: 100vh;
}
.layout-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  gap: 3rem;
  align-items: flex-start;
}

/* 主内容区 */
.category-list {
  flex: 1;
  min-width: 0;
}

.section-heading {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #333;
  font-weight: bold;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}
.dummy-card {
  background: rgb(255, 255, 255);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 20px 25px -5px rgba(11, 120, 245, 0.1);
  display: flex;
  cursor: pointer;
  margin-bottom: 0rem;
  flex-direction: column;
  transition: all 0.3s ease;
}
.dummy-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 25px -5px rgba(11, 120, 245, 0.2);
}

.category-header {
  padding: 2rem;
  color: rgb(0, 0, 0);
  text-align: center;
  position: relative;
  transition: transform 0.3s ease;
}
.category-header:hover {
  transform: scale(1.1);
}
.category-name {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}
.article-count {
  font-size: 0.9rem;
  opacity: 0.9;
}

/* 响应式适配 */
@media (max-width: 900px) {
  .layout-wrapper {
    flex-direction: column;
  }
  .sidebar {
    width: 100%;
    position: static;
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
