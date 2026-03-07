<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import Nav from '@/components/nav.vue'
import { createCategoryService, updateCategoryService, deleteCategoryService } from '@/api/article'
import { articleCategoryListService } from '@/api/article'
import { ElMessageBox } from 'element-plus'
const dialogVisible = ref(false)

interface Category {
  id: number
  name: string
  createdAt: string
}

// 响应式数据
const categories = ref<Category[]>([])
// 分类名称
const categoryName = ref('')
const title = ref('添加分类')
const loading = ref(false)
const currentCategoryId = ref()
// 获取分类列表
const fetchCategories = async () => {
  try {
    const response = await articleCategoryListService()
    console.log('获取分类列表成功:', response)
    categories.value = response.data.map((cat: any) => ({
      id: cat.id,
      name: cat.name || cat.category,
      createdAt: cat.createdAt,
    }))
  } catch (error) {
    console.error('获取分类列表失败:', error)
  }
}

// 初始化数据
onMounted(() => {
  fetchCategories()
})

const addNewCategory = () => {
  dialogVisible.value = true
  categoryName.value = ''
  title.value = '添加分类'
}

// 格式化日期显示
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}
const editCategory = (category: Category) => {
  currentCategoryId.value = category.id
  console.log('编辑分类', category)
  dialogVisible.value = true
  categoryName.value = category.name
  title.value = '编辑分类'
}

const saveCategory = async () => {
  try {
    loading.value = true
    if (title.value === '添加分类') {
      await createCategoryService({ name: categoryName.value })
    } else {
      await updateCategoryService(currentCategoryId.value, { name: categoryName.value })
    }
    loading.value = false
    dialogVisible.value = false
    fetchCategories()
  } catch (error) {
    loading.value = false
    console.error('保存分类失败:', error)
  }
}
const deleteCategory = async (id: number) => {
  if (confirm('确定要删除分类吗？')) {
    try {
      await deleteCategoryService(id)
      // 重新获取数据
      fetchCategories()
    } catch (error) {
      console.error('删除分类失败:', error)
      alert('删除失败，请重试')
    }
  }
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
          <h1 class="page-title">分类管理</h1>
          <button class="add-btn" @click="addNewCategory">
            <span class="btn-icon">➕</span>
            新建分类
          </button>
        </div>

        <!-- 分类列表 -->
        <div class="articles-table">
          <div v-if="loading" class="loading">加载中...</div>

          <div v-else-if="categories.length === 0" class="empty-state">
            <div class="empty-icon">📝</div>
            <p>没有找到符合条件的分类</p>
          </div>

          <div v-else class="table-container">
            <div class="table-header">
              <div class="header-cell">分类</div>
              <div class="header-cell">创建时间</div>
              <div class="header-cell">操作</div>
            </div>

            <div class="table-body">
              <div v-for="category in categories" :key="category.id" class="table-row">
                <div class="table-cell">
                  <span class="category-name">{{ category.name }}</span>
                </div>
                <div class="table-cell">{{ formatDate(category.createdAt) }}</div>
                <div class="table-cell">
                  <div class="action-buttons">
                    <button class="action-btn edit-btn" @click="editCategory(category)">
                      编辑
                    </button>
                  </div>
                  <button class="action-btn delete-btn" @click="deleteCategory(category.id)">
                    删除
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <el-dialog v-model="dialogVisible" :title="title" width="500">
          <el-input v-model="categoryName" placeholder="请输入分类名称" clearable></el-input>
          <template #footer>
            <div class="dialog-footer">
              <el-button @click="dialogVisible = false">取消</el-button>
              <el-button type="primary" @click="((dialogVisible = false), saveCategory())">
                确认
              </el-button>
            </div>
          </template>
        </el-dialog>
      </div>
    </div>
  </div>
</template>
<style scoped>
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
  box-shadow: 0 6px 20px rgba(48, 207, 255, 0.4);
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
  grid-template-columns: 2fr 1fr 1.5fr;
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
  grid-template-columns: 2fr 1fr 1.5fr;
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
  margin-left: 10px;
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
    padding: 20px;
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
