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
        <SideBar />
        <main class="main-content">
          <div class="content-card about-card-enter">
            <h2 class="section-heading">个人信息</h2>
            <div class="text-body">
              <p>
                你好！我是 robin，一名热爱创造的前端开发者，也是一名正在不断学习全栈的学习爱好者。
              </p>
              <p>
                技术选型： Vue 3 和 TypeScript 为核心技术栈，掌握java和nodejs后端，熟悉mysql数据库。
              </p>
              <p>
                全栈学习中：除了深耕前端（如开发个人组件库 RoUI），我也在积极学习后端。能够使用
                Node.js--express
                构建接口，并独立完成从本地开发到云服务器部署（Nginx/宝塔）的完整项目。
              </p>
            </div>

            <h2 class="section-heading">我的项目</h2>

            <div class="project-grid">
              <div
                class="project-card card-roui"
                @click="openExternalLink('https://github.com/origin-mumu/roui')"
              >
                <div class="card-header">
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
                @click="openExternalLink('https://github.com/origin-mumu/ro-ai-chat')"
              >
                <div class="card-header">
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

              <div
                class="project-card card-admin"
                @click="openExternalLink('https://github.com/origin-mumu/NexusAdmin')"
              >
                <div class="card-header">
                  <div class="project-title">
                    <h3>星图运营中台</h3>
                    <span class="tag">管理后台</span>
                  </div>
                </div>
                <div class="card-desc">
                  基于 Vue 3 + Element Plus
                  的现代化运营中台系统，提供完整的权限管理、数据可视化、用户管理等功能模块。
                </div>
              </div>

              <div
                class="project-card card-exercise"
                @click="
                  openExternalLink(
                    'https://gitee.com/software-engineering-2023183/202318314-jia-xinke'
                  )
                "
              >
                <div class="card-header">
                  <div class="project-title">
                    <h3>练习题生成与批改系统</h3>
                    <span class="tag">教育系统</span>
                  </div>
                </div>
                <div class="card-desc">
                  智能化的练习题生成与自动批改系统，支持多种题型、难度分级，为教师和学生提供高效的学习评估工具。
                </div>
              </div>
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

.title-card {
  padding: 1rem 1rem;
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

.main-content {
  flex: 1;
  min-width: 0;
}

.about-card-enter {
  opacity: 0;
  transform: translateY(14px);
  animation: aboutCardIn 560ms ease forwards;
  animation-delay: 80ms;
}

@keyframes aboutCardIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 标题样式 */
.section-heading {
  font-size: 1.8rem;
  color: #2b3830;
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
  background: #5f7f6d;
  border-radius: 2px;
}
.section-heading:not(:first-child) {
  margin-top: 3rem;
}

.text-body p {
  color: #5f6f66;
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
  background: #fbfdff;
  border-radius: 10px;
  padding: 1.5rem;
  border: 1px solid #d4e0f2;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  box-shadow: none;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  opacity: 0;
  transform: translateY(14px);
  animation: projectCardIn 520ms ease forwards;
}
.project-card:nth-child(1) {
  animation-delay: 60ms;
}
.project-card:nth-child(2) {
  animation-delay: 130ms;
}
.project-card:nth-child(3) {
  animation-delay: 200ms;
}
.project-card:nth-child(4) {
  animation-delay: 270ms;
}
.project-card:hover {
  transform: translateY(-2px);
  border-color: #9ab6df;
  box-shadow: 0 8px 18px -16px rgba(33, 49, 74, 0.45);
}
.project-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background: linear-gradient(to bottom, #7fa7de, #b8cdf0);
}
.project-card:nth-child(2n)::before {
  background: linear-gradient(to bottom, #78a0da, #aec8ee);
}
.project-card:nth-child(3n)::before {
  background: linear-gradient(to bottom, #8bb0e3, #c0d2f1);
}

/* 头部布局 */
.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}



/* 标题文字 */
.project-title h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #2b3830;
  font-weight: 700;
}

.project-title .tag {
  font-size: 0.85rem;
  color: #73827a;
  margin-top: 2px;
  display: block;
}

.card-desc {
  font-size: 0.95rem;
  color: #627168;
  line-height: 1.6;
}

.card-roui {
  transform: none;
}
.icon-roui {
  background: linear-gradient(135deg, #7fa38d, #9fbca9);
}

.card-aigc {
  transform: none;
}
.icon-aigc {
  background: linear-gradient(135deg, #6f947d, #91b5a0);
}

.card-admin {
  transform: none;
}


.card-exercise {
  transform: none;
}

.card-roui:hover,
.card-aigc:hover,
.card-admin:hover,
.card-exercise:hover {
  transform: translateY(-2px);
}

@keyframes projectCardIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@media (max-width: 900px) {
  .layout-wrapper {
    grid-template-columns: 1fr;
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
