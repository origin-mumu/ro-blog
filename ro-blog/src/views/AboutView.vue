<script lang="ts" setup>
import Wave from '@/components/wave.vue'
import SideBar from '@/components/sideBar.vue'
const openExternalLink = (url: string) => {
  window.open(url, '_blank')
}
</script>

<template>
  <div class="page-container">
    <section class="hero">
      <div class="hero-bg"></div>
      <div class="hero-overlay"></div>
      <div class="title-card">
        <h1 class="maintitle">About</h1>
      </div>

      <Wave />
    </section>

    <section class="content-section">
      <div class="layout-wrapper">
        <main class="main-content">
          <div class="content-card">
            <h2 class="section-heading">个人信息</h2>
            <div class="text-body">
              <p>
                你好！我是
                rorobin，一名热爱创造的前端开发者，也是一名正在不断探索全栈技术的“折腾”爱好者。
              </p>
              <p>
                技术选型：我以 Vue 3 和 TypeScript 为核心核心技术栈，对构建现代化、交互流畅的 Web
                应用充满热情。
              </p>
              <p>
                全栈学习中：除了深耕前端（如开发个人组件库
                RoUI），我也在积极拓展后端边界。能够熟练使用 Node.js
                构建接口，并独立完成从本地开发到云服务器部署（Nginx/宝塔）的完整项目闭环。
              </p>
              <p>
                我相信优秀的产品不仅需要好看的皮囊，还需要稳健的底层支撑。这里是我的数字花园，主要记录技术踩坑、项目复盘以及一些日常随笔。很高兴认识你！
              </p>
            </div>

            <h2 class="section-heading">我的项目</h2>

            <div class="project-grid">
              <div
                class="project-card card-roui"
                @click="openExternalLink('https://github.com/origin-cloud/roui')"
              >
                <div class="card-header">
                  <div class="project-icon icon-roui">
                    <span>RO</span>
                  </div>
                  <div class="project-title">
                    <h3>RoUI</h3>
                    <span class="tag">组件库</span>
                  </div>
                </div>
                <div class="card-desc">
                  RoUI 是一个基于 Vue 3 开发的轻量级、可定制的 UI
                  组件库，旨在帮助开发者快速构建美观的 Web 应用界面。
                </div>
              </div>

              <div
                class="project-card card-aigc"
                @click="openExternalLink('https://github.com/origin-cloud/llm-chat-platform')"
              >
                <div class="card-header">
                  <div class="project-icon icon-aigc">
                    <span>AI</span>
                  </div>
                  <div class="project-title">
                    <h3>AIGC Platform</h3>
                    <span class="tag">对话平台</span>
                  </div>
                </div>
                <div class="card-desc">
                  集成多种大语言模型的智能对话平台，支持上下文记忆与多模态交互，为用户提供流畅的 AI
                  辅助创作体验。
                </div>
              </div>
            </div>
          </div>
        </main>

        <aside class="sidebar">
          <SideBar />
        </aside>
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
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  gap: 3rem;
  align-items: flex-start;
}

.main-content {
  flex: 1;
  min-width: 0;
}

/* 标题样式 */
.section-heading {
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 1.5rem;
  position: relative;
  padding-bottom: 10px;
}
.section-heading::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 50px;
  height: 3px;
  background: #4e63cd;
  border-radius: 2px;
}
.section-heading:not(:first-child) {
  margin-top: 3rem;
}

.text-body p {
  color: #555;
  line-height: 1.8;
  margin-bottom: 1rem;
  font-size: 1.05rem;
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}
.project-card {
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e5e7eb; /* 默认浅灰边框 */
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}
.project-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
}

/* 头部布局 */
.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

/* 图标容器样式 */
.project-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1.2rem;
  flex-shrink: 0;
}

/* 标题文字 */
.project-title h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #1f2937;
  font-weight: 700;
}

.project-title .tag {
  font-size: 0.85rem;
  color: #6b7280;
  margin-top: 2px;
  display: block;
}

.card-desc {
  font-size: 0.95rem;
  color: #4b5563;
  line-height: 1.6;
}

.card-roui {
  border-color: #ff9ca1;
  box-shadow: 0 4px 10px rgba(255, 156, 161, 0.3);
}
.icon-roui {
  background: linear-gradient(135deg, #ff7e5f, #feb47b);
}

.card-aigc {
  border-color: #a78bfa;
  box-shadow: 0 4px 10px rgba(167, 139, 250, 0.3);
}
.icon-aigc {
  background: linear-gradient(135deg, #8b5cf6, #c4b5fd);
}
@media (max-width: 900px) {
  .layout-wrapper {
    flex-direction: column;
  }
  .sidebar {
    width: 100%;
    position: static;
  }
  .content-card {
    padding: 1.5rem;
  }
  .hero {
    height: 50vh;
  }
  .maintitle {
    font-size: 2.5rem;
  }
}
</style>
