<script lang="ts" setup>
import { ref, onMounted, nextTick } from 'vue'
import { getArticleByIdService } from '@/api/article.js'
import { useRoute } from 'vue-router'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'
import Wave from '@/components/wave.vue'
import SideBar from '@/components/sideBar.vue'

interface Article {
  id: number
  title: string
  description: string
  content: string
  category: string
  tags: string[]
  cover_image: string
  view_count: number
  status: 'published' | 'draft'
  createdAt: string
  updatedAt: string
}

const route = useRoute()
const article = ref<Article>()
const isLoading = ref(true) // 加载状态
const error = ref<string | null>(null) // 错误信息
const highlightCode = () => {
  //等待dom执行完之后，实现高亮代码
  nextTick(() => {
    //选择所有pre，code标签代码进行操作。
    document.querySelectorAll('pre code').forEach(block => {
      //高亮代码块
      hljs.highlightElement(block as HTMLElement)

      //添加行号
      const pre = block.parentElement
      if (!pre || pre.querySelector('.line-numbers-wrapper')) return

      //获取代码文本，并去除，最后的换行符
      const codeText = (block as HTMLElement).innerText.replace(/\n$/, '')
      //获取行号
      const lines = codeText.split('\n').length
      //创建行号元素
      const lineNumbersWrapper = document.createElement('div')
      lineNumbersWrapper.className = 'line-numbers-wrapper'
      let numbering = ''
      for (let i = 1; i <= lines; i++) {
        numbering += `<span class="line-number">${i}</span>`
      }
      lineNumbersWrapper.innerHTML = numbering
      //将行号放到代码块前面
      pre.insertBefore(lineNumbersWrapper, block)
      //添加复制按钮
      const copyBtn = document.createElement('button')
      copyBtn.className = 'copy-code-btn'
      copyBtn.textContent = '复制'
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(codeText).then(() => {
          copyBtn.textContent = '已复制'
          copyBtn.classList.add('copied')
          setTimeout(() => {
            copyBtn.textContent = '复制'
            copyBtn.classList.remove('copied')
          }, 2000)
        })
      }
      //将复制按钮放到pre的最末尾地方
      pre.appendChild(copyBtn)
    })
  })
}
onMounted(async () => {
  const id = Number(route.params.id)

  if (isNaN(id)) {
    error.value = '文章ID格式错误'
    isLoading.value = false
    return
  }

  try {
    isLoading.value = true
    error.value = null

    const res = (await getArticleByIdService(id)) as any

    if (res.data) {
      article.value = res.data
      highlightCode()
    } else {
      error.value = '文章不存在'
    }
  } catch (err) {
    console.error('获取文章失败:', err)
    error.value = '获取文章失败，请稍后重试'
  } finally {
    isLoading.value = false
  }
})
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}
</script>

<template>
  <div class="page-container">
    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>文章加载中...</p>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <div class="error-content">
        <h2>😔 加载失败</h2>
        <p>{{ error }}</p>
        <button @click="$router.back()" class="back-btn">返回上一页</button>
      </div>
    </div>

    <!-- 正常内容 -->
    <div v-else>
      <section class="hero">
        <div class="hero-bg"></div>
        <div class="hero-overlay"></div>
        <div class="title-card">
          <div class="meta-tag">{{ article?.category || '未分类' }}</div>
          <h1 class="article-title">{{ article?.title || '无标题' }}</h1>
          <div class="article-meta">
            <span>📅 {{ formatDate(article?.createdAt || '未知日期') }}</span>
            <span>👀 {{ article?.view_count || 0 }} 阅读</span>
          </div>
        </div>

        <Wave />
      </section>

      <section class="content-section">
        <div class="layout-wrapper">
          <main class="main-content">
            <div class="content-card">
              <div class="typography">
                <div v-html="article?.content || '文章内容为空'"></div>
              </div>
            </div>
          </main>

          <SideBar />
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
/* 加载状态样式 */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 2rem;
}

.loading-spinner {
  text-align: center;
  color: #666;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #6192fb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-spinner p {
  margin: 0;
  font-size: 1.1rem;
}

/* 错误状态样式 */
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 2rem;
}

.error-content {
  text-align: center;
  max-width: 400px;
}

.error-content h2 {
  color: #ff6b6b;
  margin-bottom: 1rem;
  font-size: 1.8rem;
}

.error-content p {
  color: #666;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.back-btn {
  background: #6192fb;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s;
}

.back-btn:hover {
  background: #4e65cd;
}

.hero {
  height: 55vh;
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
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: -1;
}

.title-card {
  padding: 1rem 3rem;
}
.meta-tag {
  display: inline-block;
  background: rgba(0, 187, 255, 0.9);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: bold;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.article-title {
  font-size: 3rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 1.5rem;
  text-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
}
.article-meta {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
  display: flex;
  justify-content: center;
  gap: 1.5rem;
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

/* 左侧正文 */
.main-content {
  flex: 1;
  min-width: 0;
}

.typography {
  color: #333;
  line-height: 1.8;
}
.typography :deep(h1) {
  font-size: 1.8rem;
  margin: 2.5rem 0 1.2rem;
  color: #181f42;
}
.typography :deep(p) {
  margin-bottom: 0.5rem;
}

.typography :deep(blockquote) {
  background: #f1f8ff;
  border-left: 5px solid #6192fb;
  padding: 1rem 1.5rem;
  margin: 1.5rem 0;
  color: #555;
  border-radius: 10px;
}
.typography :deep(pre) {
  position: relative;
  background: #292d35;
  margin: 1.5rem 0;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
}

.typography :deep(code),
.typography :deep(.line-numbers-wrapper) {
  font-family: 'Fira Code', Consolas, Monaco, 'Courier New', monospace;
  font-size: 14px;
  line-height: 22px;
  padding-top: 16px;
  padding-bottom: 16px;
}
.typography :deep(code) {
  flex: 1;
  overflow-x: auto;
  color: #abb2bf;
}

.typography :deep(.line-numbers-wrapper) {
  width: 40px;
  text-align: center;
  color: #5c6370;
  background: rgba(0, 0, 0, 0.2);
  border-right: 1px solid #3e4451;
  user-select: none;
  display: flex;
  flex-direction: column;
}

.typography :deep(.line-number) {
  height: 22px;
}

.typography :deep(.copy-code-btn) {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 8px;
  font-size: 12px;
  color: #abb2bf;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s;
}

.typography :deep(pre:hover .copy-code-btn) {
  opacity: 1;
}

.typography :deep(.copy-code-btn:hover) {
  background: #4e65cd;
  color: white;
}

.typography :deep(.copy-code-btn.copied) {
  background: #2850a7;
  color: white;
}
.typography :deep(.lead) {
  font-size: 1.25rem;
  font-weight: 300;
  color: #666;
  margin-bottom: 2rem;
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
  .article-title {
    font-size: 2rem;
  }
  .article-card {
    padding: 1.5rem;
  }
  .post-nav {
    grid-template-columns: 1fr;
  }
  .nav-item.next {
    text-align: left;
  }
}
</style>
