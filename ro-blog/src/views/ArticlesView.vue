<script lang="ts" setup>
import { ref, onMounted, computed, watch } from 'vue'
import { getAllArticlesService, articleCategoryListService } from '@/api/article'
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
  article_count: number
}

const currentPage = ref(1)
const pageSize = ref(5)
const totalArticles = ref(0)
const totalPages = ref(0)

const articles = ref<Article[]>([])
const filteredArticles = ref<Article[]>([])
const isLoading = ref(false)
const hasArticles = computed(() => filteredArticles.value.length > 0)

const fetchArticles = async (page = currentPage.value, category?: string) => {
  isLoading.value = true
  try {
    const params: any = {
      page,
      limit: pageSize.value,
    }

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
    articles.value = []
    filteredArticles.value = []
    totalArticles.value = 0
    totalPages.value = 0
    currentPage.value = 1
  } finally {
    isLoading.value = false
  }
}

const activeCategory = ref('全部')
const categories = ref<Category[]>([])

onMounted(async () => {
  const initialCategory = (route.query.category as string) || '全部'
  activeCategory.value = initialCategory
  await Promise.all([
    fetchArticles(1, initialCategory === '全部' ? undefined : initialCategory),
    articleCategoryListService().then(res => {
      categories.value = res.data
    }),
  ])
})

watch(
  () => route.query.category,
  newCategory => {
    if (newCategory && newCategory !== activeCategory.value) {
      activeCategory.value = newCategory as string
      currentPage.value = 1
      fetchArticles(1, newCategory as string)
    }
  }
)

const filterCategory = (cat: string) => {
  activeCategory.value = cat
  currentPage.value = 1
  fetchArticles(1, cat === '全部' ? undefined : cat)
}

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

const paginationButtons = computed(() => {
  const buttons = []
  const maxVisibleButtons = 5
  let startPage = Math.max(1, currentPage.value - Math.floor(maxVisibleButtons / 2))
  let endPage = Math.min(totalPages.value, startPage + maxVisibleButtons - 1)

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
        <SideBar />
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
            <div v-if="isLoading" class="loading-state">
              <span class="loading-spinner"></span>
              <p class="loading-text">正在加载文章...</p>
            </div>
            <div
              v-else-if="hasArticles"
              class="card"
              v-for="article in filteredArticles"
              :key="`${activeCategory}-${currentPage}-${article.id}`"
            >
              <DummyCard v-bind="article" />
            </div>
            <div v-else class="empty-state">
              <p class="empty-title">当前分类暂无文章</p>
              <p class="empty-desc">试试切换到“全部”或其他分类看看。</p>
              <button class="empty-action" @click="filterCategory('全部')">查看全部文章</button>
            </div>
          </div>

          <div v-if="!isLoading && hasArticles" class="pagination">
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
  min-height: 80vh;
}
.layout-wrapper {
  max-width: 1040px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  gap: 1.5rem;
  align-items: flex-start;
}
.post-list {
  flex: 1;
  min-width: 0;
}

.article-items {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.loading-state {
  grid-column: 1 / -1;
  min-height: 220px;
  border: 1px dashed #bfd1ec;
  border-radius: 20px;
  background: rgba(251, 253, 255, 0.92);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  width: 34px;
  height: 34px;
  border: 3px solid rgba(149, 178, 221, 0.35);
  border-top-color: #5f7fb2;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-text {
  margin-top: 0.7rem;
  color: #5a6f90;
  font-size: 0.95rem;
}

.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 240px;
  padding: 2rem 1.5rem;
  border: 1px dashed #bfd1ec;
  border-radius: 20px;
  background: rgba(251, 253, 255, 0.92);
  color: #4f6281;
  text-align: center;
}

.empty-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #364c70;
}

.empty-desc {
  margin: 0.55rem 0 1rem;
  color: #6a7e9d;
}

.empty-action {
  border: 1px solid #b8cceb;
  background: #eef4ff;
  color: #2f558f;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.empty-action:hover {
  background: #e2edff;
  border-color: #95b2dd;
}

.card {
  min-width: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.filter-bar {
  display: flex;
  gap: 10px;
  padding: 10px 15px;
  margin-bottom: 2rem;
  overflow-x: auto;
  color: #2e3b52;
  background: rgba(251, 253, 255, 0.95);
  border: 1px solid #d4e0f2;
  border-radius: 30px;
  box-shadow: none;
}
.filter-item {
  font-size: 1rem;
  color: #3a4d6c;
  cursor: pointer;
  position: relative;
  font-weight: 500;
  transition: color 0.3s;
  white-space: nowrap;
  padding: 5px 12px;
  border-radius: 30px;
  transition: all 0.3s ease;
  background-color: transparent;
  border: 1px solid #d4e0f2;
}

.filter-item.active,
.filter-item:hover {
  background-color: #eef4ff;
  border-color: #95b2dd;
  color: #2f558f;
  font-weight: bold;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.45rem;
  margin-top: 2.3rem;
  flex-wrap: wrap;
  padding: 0.6rem 0.9rem;
  border: 1px solid #d4e0f2;
  border-radius: 999px;
  background: rgba(251, 253, 255, 0.92);
}

.page-btn {
  min-width: 34px;
  height: 34px;
  border: 1px solid #d4e0f2;
  background: transparent;
  border-radius: 999px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.25s;
  color: #4a5d7a;
  font-family: monospace;
  font-size: 0.82rem;
  padding: 0 0.55rem;
}

.page-btn:hover:not(.disabled) {
  border-color: #95b2dd;
  color: #2f558f;
  background: #eef4ff;
}

.page-btn.active {
  background: #5f7fb2;
  color: white;
  border-color: #5f7fb2;
  box-shadow: 0 8px 16px -12px rgba(33, 49, 74, 0.6);
}

.page-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: transparent;
}

.page-ellipsis {
  padding: 0 0.5rem;
  color: #999;
  font-weight: bold;
}

.page-info {
  margin-left: 0.6rem;
  color: #51627e;
  font-size: 0.84rem;
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
    grid-template-columns: 1fr;
  }

  .article-items {
    grid-template-columns: 1fr;
  }
  .hero {
    height: 40vh;
  }
  .maintitle {
    font-size: 2.5rem;
  }
}
</style>
