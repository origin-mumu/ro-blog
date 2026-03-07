import request from '@/utils/request.js'

// 文章分类列表查询
export function articleCategoryListService() {
  return request.get('/categories')
}

// 获取所有文章（支持分页和搜索）
export function getAllArticlesService(params = {}) {
  return request.get('/articles', { params })
}

// 获取文章详情
export function getArticleByIdService(id: number) {
  return request.get(`/articles/${id}`)
}

// 获取博客统计信息
export function getBlogStatsService() {
  return request.get('/articles/stats/summary')
}


