<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import Nav from '@/components/nav.vue'
import router from '@/router'
import {
  getAllArticlesService,
  deleteArticleService,
  toggleArticleStatusService,
  articleCategoryListService,
} from '@/api/article'

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

// 分页数据类型
interface Pagination {
  current: number
  total: number
  pages: number
}

// 响应式数据
const articles = ref<Article[]>([])
const searchKeyword = ref('')
const selectedCategory = ref('all')
const selectedStatus = ref('all')
const loading = ref(false)
const categories = ref<string[]>(['all'])
const pagination = ref<Pagination>({
  current: 1,
  total: 0,
  pages: 0,
})

// 获取文章列表
const fetchArticles = async () => {
  try {
    loading.value = true
    const params: any = {
      page: pagination.value.current,
      limit: 10,
    }

    // 添加筛选条件
    if (searchKeyword.value) {
      params.search = searchKeyword.value
    }
    if (selectedCategory.value !== 'all') {
      params.category = selectedCategory.value
    }

    const response = (await getAllArticlesService(params)) as any
    console.log('response', response)

    articles.value = response.data
    pagination.value = response.pagination
  } catch (error) {
    console.error('获取文章列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 获取分类列表
const fetchCategories = async () => {
  try {
    const response = await articleCategoryListService()
    // 直接使用响应数据，不再检查success字段
    // 假设后端返回的分类数据格式为 { id, name }
    const categoryNames = response.data.map((cat: any) => cat.name || cat.category)
    categories.value = ['all', ...categoryNames]
  } catch (error) {
    console.error('获取分类列表失败:', error)
  }
}

// 初始化数据
onMounted(() => {
  fetchCategories()
  fetchArticles()
})

// 监听筛选条件变化，重新获取数据
watch([searchKeyword, selectedCategory, selectedStatus], () => {
  pagination.value.current = 1 // 重置到第一页
  fetchArticles()
})

// 分页相关函数
const prevPage = () => {
  if (pagination.value.current > 1) {
    pagination.value.current--
    fetchArticles()
  }
}

const nextPage = () => {
  if (pagination.value.current < pagination.value.pages) {
    pagination.value.current++
    fetchArticles()
  }
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= pagination.value.pages) {
    pagination.value.current = page
    fetchArticles()
  }
}

// 操作函数
const deleteArticle = async (id: number) => {
  if (confirm('确定要删除这篇文章吗？')) {
    try {
      await deleteArticleService(id)
      // 重新获取数据
      fetchArticles()
    } catch (error) {
      console.error('删除文章失败:', error)
      alert('删除失败，请重试')
    }
  }
}

const toggleStatus = async (article: Article) => {
  try {
    const newStatus = article.status === 'published' ? 'draft' : 'published'
    await toggleArticleStatusService(article.id, newStatus)
    // 更新本地状态
    article.status = newStatus
  } catch (error) {
    console.error('切换状态失败:', error)
    alert('状态切换失败，请重试')
  }
}

const addNewArticle = () => {
  console.log('添加新文章')
  // 这里可以跳转到添加页面
  router.push({ name: 'AddArticle' })
}

// 格式化日期显示
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}
const editArticle = (id: number) => {
  console.log('编辑文章', id)
  router.push({ name: 'EditArticle', params: { id } })
}
</script>

<template>
  <div class="home-layout">
    <div class="sidebar-container">
      <Nav></Nav>
    </div>
    <div class="content-container">
      <div class="content-box">
        <div class="page-header">
          <h1 class="page-title">文章管理</h1>
          <button class="add-btn" @click="addNewArticle">
            <span class="btn-icon">➕</span>
            新建文章
          </button>
        </div>

        <!-- 搜索和筛选区域 -->
        <div class="filter-section">
          <div class="search-box">
            <input
              v-model="searchKeyword"
              type="text"
              placeholder="搜索文章标题或描述..."
              class="search-input"
            />
            <span class="search-icon">🔍</span>
          </div>

          <div class="filter-controls">
            <select v-model="selectedCategory" class="filter-select">
              <option value="all">全部分类</option>
              <option
                v-for="category in categories.filter((c) => c !== 'all')"
                :key="category"
                :value="category"
              >
                {{ category }}
              </option>
            </select>

            <select v-model="selectedStatus" class="filter-select">
              <option value="all">全部状态</option>
              <option value="published">已发布</option>
              <option value="draft">草稿</option>
            </select>
          </div>
        </div>

        <!-- 文章列表 -->
        <div class="articles-table">
          <div v-if="loading" class="loading">加载中...</div>

          <div v-else-if="articles.length === 0" class="empty-state">
            <div class="empty-icon">📝</div>
            <p>没有找到符合条件的文章</p>
          </div>

          <div v-else class="table-container">
            <div class="table-header">
              <div class="header-cell title-cell">文章标题</div>
              <div class="header-cell">分类</div>
              <div class="header-cell">状态</div>
              <div class="header-cell">创建时间</div>
              <div class="header-cell">浏览量</div>
              <div class="header-cell">操作</div>
            </div>

            <div class="table-body">
              <div v-for="article in articles" :key="article.id" class="table-row">
                <div class="table-cell title-cell">
                  <span class="article-title">{{ article.title }}</span>
                </div>
                <div class="table-cell">
                  <span class="category-tag">{{ article.category }}</span>
                </div>
                <div class="table-cell">
                  <span :class="['status-badge', article.status]" @click="toggleStatus(article)">
                    {{ article.status == 'published' ? '已发布' : '草稿' }}
                  </span>
                </div>
                <div class="table-cell">{{ formatDate(article.createdAt) }}</div>
                <div class="table-cell">{{ article.view_count }}</div>
                <div class="table-cell">
                  <div class="action-buttons">
                    <button class="action-btn edit-btn" @click="editArticle(article.id)">
                      编辑
                    </button>
                    <button class="action-btn delete-btn" @click="deleteArticle(article.id)">
                      删除
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.content-box::-webkit-scrollbar {
  width: 8px;
}

.content-box::-webkit-scrollbar-track {
  background: transparent;
  margin: 12px 0;
}

.content-box::-webkit-scrollbar-thumb {
  background-color: #969696;
  border-radius: 10px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e9ecef;
}

.page-title {
  font-size: 32px;
  font-weight: bold;
  color: #2c3e50;
  margin: 0;
}

.add-btn {
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
  display: flex;
  align-items: center;
  gap: 8px;
}

.add-btn:hover {
  background: #1e7c99;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(78, 205, 196, 0.4);
}

.filter-section {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  flex-wrap: wrap;
  align-items: center;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 300px;
}

.search-input {
  width: 80%;
  padding: 12px 16px 12px 40px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #30cfff;
  box-shadow: 0 0 0 2px rgba(48, 207, 255, 0.1);
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
}

.filter-controls {
  display: flex;
  gap: 12px;
}

.filter-select {
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
}

.filter-select:focus {
  outline: none;
  border-color: #30cfff;
}

.articles-table {
  margin-bottom: 30px;
}

.loading,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
  font-size: 1.1rem;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.table-container {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1.5fr;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  font-weight: 600;
  color: #2c3e50;
}

.header-cell {
  padding: 16px;
  text-align: left;
}

.table-body {
  background: white;
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1.5fr;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s ease;
}

.table-row:hover {
  background-color: #f8f9fa;
}

.table-row:last-child {
  border-bottom: none;
}

.table-cell {
  padding: 16px;
  display: flex;
  align-items: center;
}

.title-cell {
  font-weight: 500;
}

.article-title {
  color: #2c3e50;
  font-weight: 500;
}

.category-tag {
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85rem;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.status-badge.published {
  background: #e8f5e8;
  color: #2e7d32;
}

.status-badge.draft {
  background: #fff3e0;
  color: #ef6c00;
}

.status-badge:hover {
  opacity: 0.8;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-btn {
  background: #30cfff;
  color: white;
}

.edit-btn:hover {
  background: #1e7c99;
}

.delete-btn {
  background: #ff6b6b;
  color: white;
}

.delete-btn:hover {
  background: #ff5252;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 30px;
}

.page-btn {
  padding: 8px 16px;
  border: 1px solid #e0e0e0;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-btn:not(:disabled):hover {
  border-color: #30cfff;
  color: #30cfff;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #666;
  font-size: 0.9rem;
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
  }

  .filter-section {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    min-width: auto;
  }

  .table-header,
  .table-row {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .header-cell,
  .table-cell {
    padding: 8px;
  }

  .action-buttons {
    justify-content: center;
  }
}
</style>
