<script lang="ts" setup>
import { ref, onMounted, computed, watch } from 'vue'
import { getAllArticlesService, articleCategoryListService } from '@/api/article.js'
import { useRoute } from 'vue-router'
import Wave from '@/components/wave.vue'
import SideBar from '@/components/sideBar.vue'
import DummyCard from '@/components/dummyCard.vue'
const route = useRoute()
interface Article {
  id: number
  title: string
  description: string
  category: string
  tags: string[]
  cover_image: string
  view_count: number
  status: 'published' | 'draft'
  createdAt: string
  updatedAt: string
}
interface Category {
  id: number
  name: string
  count: number
}

const currentPage = ref(1)
const pageSize = ref(5)
const totalArticles = ref(0)
const totalPages = ref(0)

const articles = ref<Article[]>()
const filteredArticles = ref<Article[]>()
// 分页相关方法
const fetchArticles = async (page = currentPage.value, category?: string) => {
  try {
    const params: any = {
      page,
      limit: pageSize.value,
    }

    // 添加分类筛选参数
    if (category && category !== '全部') {
      params.category = category
    }

    const res = (await getAllArticlesService(params)) as any

    articles.value = res.data
    filteredArticles.value = articles.value
    totalArticles.value = res.pagination.total
    totalPages.value = res.pagination.pages
    currentPage.value = res.pagination.current
  } catch (error) {
    console.error('获取文章列表失败:', error)
  }
}

onMounted(() => {
  const initialCategory = (route.query.category as string) || '全部'
  activeCategory.value = initialCategory
  fetchArticles(1, initialCategory === '全部' ? undefined : initialCategory)
  articleCategoryListService().then(res => {
    categories.value = res.data
  })
})

// 分类筛选逻辑
const activeCategory = ref('全部')
const categories = ref<Category[]>()

const filterCategory = (cat: string) => {
  console.log('筛选分类', cat)
  activeCategory.value = cat
  // 重置到第一页并重新获取数据
  currentPage.value = 1
  fetchArticles(1, cat)
}
// 监听路由变化，自动筛选分类
watch(
  () => route.query.category,
  newCategory => {
    if (newCategory) {
      activeCategory.value = newCategory as string
      // 直接重新获取数据，而不是在本地筛选
      currentPage.value = 1
      fetchArticles(1, newCategory as string)
    }
  },
  { immediate: true }
)
// 分页控制方法
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    fetchArticles(page, activeCategory.value === '全部' ? undefined : activeCategory.value)
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    goToPage(currentPage.value - 1)
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    goToPage(currentPage.value + 1)
  }
}

// 生成分页按钮数组
const paginationButtons = computed(() => {
  const buttons = []
  const maxVisibleButtons = 5
  let startPage = Math.max(1, currentPage.value - Math.floor(maxVisibleButtons / 2))
  let endPage = Math.min(totalPages.value, startPage + maxVisibleButtons - 1)

  // 调整起始页，确保显示maxVisibleButtons个按钮
  if (endPage - startPage + 1 < maxVisibleButtons) {
    startPage = Math.max(1, endPage - maxVisibleButtons + 1)
  }

  for (let i = startPage; i <= endPage; i++) {
    buttons.push(i)
  }

  return buttons
})
</script>

<template>
  <div class="page-container">
    <section class="hero">
      <div class="hero-bg"></div>
      <div class="hero-overlay"></div>

      <div class="title-card">
        <h1 class="maintitle">ARTICLES</h1>
      </div>

      <Wave />
    </section>

    <section class="content-section">
      <div class="layout-wrapper">
        <main class="post-list">
          <div class="filter-bar">
            <span
              class="filter-item"
              :class="{ active: activeCategory === '全部' }"
              @click="filterCategory('全部')"
            >
              全部
            </span>
            <span
              v-for="cat in categories"
              :key="cat.id"
              class="filter-item"
              :class="{ active: activeCategory === cat.name }"
              @click="filterCategory(cat.name)"
            >
              {{ cat.name }}
            </span>
          </div>

          <div class="article-items">
            <div class="card" v-for="article in filteredArticles" :key="article.id">
              <DummyCard v-bind="article" />
            </div>
          </div>

          <div class="pagination">
            <button class="page-btn" :class="{ disabled: currentPage === 1 }" @click="prevPage">
              &lt;
            </button>

            <!-- 第一页 -->
            <button v-if="currentPage > 3" class="page-btn" @click="goToPage(1)">1</button>
            <span v-if="currentPage > 4" class="page-ellipsis">...</span>

            <!-- 中间页码 -->
            <button
              v-for="page in paginationButtons"
              :key="page"
              class="page-btn"
              :class="{ active: currentPage === page }"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>

            <span v-if="currentPage < totalPages - 3" class="page-ellipsis">...</span>

            <!-- 最后一页 -->
            <button
              v-if="currentPage < totalPages - 2"
              class="page-btn"
              @click="goToPage(totalPages)"
            >
              {{ totalPages }}
            </button>

            <button
              class="page-btn"
              :class="{ disabled: currentPage === totalPages }"
              @click="nextPage"
            >
              &gt;
            </button>

            <!-- 分页信息 -->
            <div class="page-info">
              第 {{ currentPage }} 页，共 {{ totalPages }} 页（{{ totalArticles }} 篇文章）
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
  text-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  letter-spacing: 2px;
}

.content-section {
  min-height: 80vh;
}
.layout-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  gap: 3rem;
  align-items: flex-start;
}
.post-list {
  flex: 1;
  min-width: 0;
}

.filter-bar {
  display: flex;
  gap: 10px;
  padding: 10px 15px;
  margin-bottom: 2rem;
  overflow-x: auto;
  color: white;
  background: rgba(255, 255, 255);
  box-shadow: 0 20px 25px -5px rgba(11, 120, 245, 0.15);
  border-radius: 12px;
}
.filter-item {
  font-size: 1rem;
  color: #282828;
  cursor: pointer;
  position: relative;
  font-weight: 500;
  transition: color 0.3s;
  white-space: nowrap;
  padding: 5px 15px;
  border-radius: 12px;
  transition: all 0.3s ease;
  background-color: #edeffa;
}

.filter-item.active,
.filter-item:hover {
  background-color: rgba(34, 58, 175, 0.9);
  color: #ffffff;
  font-weight: bold;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 4rem;
  flex-wrap: wrap;
}

.page-btn {
  width: 40px;
  height: 40px;
  border: 1px solid #eee;
  background: white;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s;
  color: #555;
  font-family: monospace;
  font-size: 0.9rem;
}

.page-btn:hover:not(.disabled) {
  border-color: #4e6ccd;
  color: #000000;
  transform: translateY(-1px);
}

.page-btn.active {
  background: #4e59cd;
  color: white;
  border-color: #4e6ccd;
}

.page-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f9f9f9;
}

.page-ellipsis {
  padding: 0 0.5rem;
  color: #999;
  font-weight: bold;
}

.page-info {
  margin-left: 1rem;
  color: #000000;
  font-size: 0.9rem;
  white-space: nowrap;
}

@media (max-width: 600px) {
  .pagination {
    gap: 0.3rem;
  }

  .page-btn {
    width: 35px;
    height: 35px;
    font-size: 0.8rem;
  }

  .page-info {
    font-size: 0.8rem;
    margin-left: 0.5rem;
  }
}

/* 响应式 */
@media (max-width: 900px) {
  .layout-wrapper {
    flex-direction: column;
  }
  .sidebar {
    width: 100%;
    position: static;
  }
  .hero {
    height: 40vh;
  }

  /* 移动端卡片变为上下结构 */
  .dummy-card {
    flex-direction: column;
    height: auto;
  }
  .card-cover {
    width: 100%;
    height: 180px;
  }
  .maintitle {
    font-size: 2.5rem;
  }
}
</style>
