<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { getBlogStatsService } from '@/api/article.js'

import Wave from '@/components/wave.vue'
import SideBar from '@/components/sideBar.vue'
import { Article } from '@/type/Article'
import DummyCard from '@/components/dummyCard.vue'
const data = ref()

const articles = ref<Article[]>()

onMounted(() => {
  getBlogStatsService().then(res => {
    data.value = res.data
    articles.value = data.value.popularArticles
  })
})

const subtitleText = '我们决定登月，他并非轻而易举，而正因为它困难重重。'
const typedText = ref('')
const currentIndex = ref(0)
const isDeleting = ref(false)
const isTyping = ref(true)

const typeWriter = () => {
  if (isTyping.value) {
    if (currentIndex.value < subtitleText.length) {
      typedText.value = subtitleText.substring(0, currentIndex.value + 1)
      currentIndex.value++
      setTimeout(typeWriter, 100)
    } else {
      setTimeout(() => {
        isTyping.value = false
        isDeleting.value = true
        typeWriter()
      }, 2000)
    }
  } else if (isDeleting.value) {
    if (currentIndex.value > 0) {
      typedText.value = subtitleText.substring(0, currentIndex.value - 1)
      currentIndex.value--
      setTimeout(typeWriter, 50)
    } else {
      isDeleting.value = false
      isTyping.value = true
      setTimeout(typeWriter, 500)
    }
  }
}

// 点击箭头滚动到内容区
const scrollToContent = () => {
  const contentEl = document.querySelector('.content-section')
  if (contentEl) {
    contentEl.scrollIntoView({ behavior: 'smooth' })
  }
}

onMounted(() => {
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
        <main class="post-list">
          <div class="card" v-for="article in articles" :key="article.id">
            <DummyCard v-bind="article" />
          </div>
          <router-link to="/articles" class="view-more">查看更多</router-link>
        </main>
        <SideBar />
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
  background: rgba(255, 255, 255, 0.8);
  padding: 10px 20px;
  color: rgb(0, 0, 0);
  border-radius: 60px;
  text-decoration: none;
  margin: 0 auto;
  transition: all 0.3s ease;
}
.view-more:hover {
  transform: translateY(-3px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(78, 101, 205);
}
.hero-bg {
  background-attachment: fixed;
}
.title-card {
  padding: 3rem 4rem;
}

.title-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
}

.maintitle {
  font-size: 5rem;
  font-weight: 800;
  letter-spacing: 4px;
  margin: 0 0 1rem 0;
  text-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  font-family: 'Arial', sans-serif;
}

.cursor {
  display: inline-block;
  margin-left: 2px;
  width: 2px;
  animation: blink 1s infinite;
  background-color: #4e50cd;
  color: transparent;
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

.post-list {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

@media (max-width: 900px) {
  .layout-wrapper {
    flex-direction: column;
  }
  .sidebar {
    width: 100%;
    position: static;
  }
  .card-cover {
    height: 150px;
  }
}
</style>
