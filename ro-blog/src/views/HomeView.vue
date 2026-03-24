<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { getBlogStatsService } from '@/api/article'
import Wave from '@/components/wave.vue'
import SideBar from '@/components/sideBar.vue'
import { Article } from '@/type/Article'
import DummyCard from '@/components/dummyCard.vue'
const data = ref()
const articles = ref<Article[]>()

const subtitleText = '我们决定登月，他并非轻而易举，而正因为它困难重重。'
const typedText = ref('')
const currentIndex = ref(0)

const typeWriter = () => {
  if (currentIndex.value >= subtitleText.length) return
  typedText.value = subtitleText.substring(0, currentIndex.value + 1)
  currentIndex.value++
  setTimeout(typeWriter, 80)
}

const scrollToContent = () => {
  const contentEl = document.querySelector('.content-section')
  if (contentEl) {
    contentEl.scrollIntoView({ behavior: 'smooth' })
  }
}

onMounted(async () => {
  try {
    const res = await getBlogStatsService()
    data.value = res.data
    articles.value = res.data?.popularArticles ?? []
  } catch (err) {
    console.error('获取博客统计失败:', err)
    articles.value = []
  }
  setTimeout(typeWriter, 1000)
})
</script>

<template>
  <div class="page-container">
    <section class="hero">
      <div class="hero-bg"></div>

      <div class="title-card">
        <h1 class="maintitle">RO-BLOG</h1>
        <div class="subtitle">{{ typedText }}<span class="cursor">|</span></div>
      </div>

      <div class="scroll-down" @click="scrollToContent">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </section>
    <Wave />
    <section class="content-section">
      <div class="layout-wrapper">
        <SideBar />
        <main class="post-list">
          <div class="article-items">
            <div
              class="card card-enter"
              v-for="(article, index) in articles"
              :key="article.id"
              :style="{ animationDelay: `${index * 80}ms` }"
            >
              <DummyCard v-bind="article" />
            </div>
          </div>
          <router-link to="/articles" class="view-more">查看更多</router-link>
        </main>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero {
  height: 100vh;
}

.view-more {
  text-align: center;
  background: #FCFDFF;
  padding: 10px 20px;
  color: #2e3b52;
  border: 1px solid #dbe4f3;
  border-radius: 60px;
  text-decoration: none;
  margin: 1.25rem auto 0;
  transition: all 0.3s ease;
}
.view-more:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 26px -16px rgba(33, 49, 74, 0.45);
  border: 1px solid #c9d8ef;
}
.hero-bg {
  background-attachment: fixed;
}
.title-card {
  padding: 3rem 4rem;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 0;
  transform: translateY(18px) scale(0.985);
  animation: heroTitleCardIn 760ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.title-card:hover {
  transform: none;
  box-shadow: none;
}
.maintitle {
  font-size: 7rem;
}

.subtitle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.55rem 1.4rem;
  color: rgba(235, 245, 255, 0.98);
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.35);
  box-shadow: 0 10px 22px -18px rgba(0, 0, 0, 0.45);
  animation: subtitleFloatIn 1000ms ease both;
}

.subtitle .cursor {
  margin-left: 6px;
}

.cursor {
  display: inline-block;
  margin-left: 2px;
  width: 2px;
  animation: blink 1s infinite;
  background-color: #5f7fb2;
  color: transparent;
}

@keyframes titleFloatIn {
  from {
    opacity: 0;
    transform: translateY(12px);
    filter: blur(2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}

@keyframes subtitleFloatIn {
  from {
    opacity: 0;
    transform: translateY(16px);
    filter: blur(2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}

@keyframes heroTitleCardIn {
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
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

.post-list {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.article-items {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.card {
  min-width: 0;
}

.card-enter {
  opacity: 0;
  transform: translateY(14px);
  animation: cardFadeUp 520ms ease forwards;
}

@keyframes cardFadeUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 900px) {
  .layout-wrapper {
    grid-template-columns: 1fr;
  }

  .article-items {
    grid-template-columns: 1fr;
  }
}
</style>
