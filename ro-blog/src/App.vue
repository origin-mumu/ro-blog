<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'

import navbar from './components/navbar.vue'
import { ref, onMounted, watch } from 'vue'

const isAppReady = ref(false)
const LIVE2D_ROOT = '/live2d'
const route = useRoute()
const APP_LOADING_MIN_MS = 120
const ICP_RECORD_NUMBER = '蜀ICP备2026809410号-1'
const MIIT_URL = 'https://beian.miit.gov.cn/'

declare global {
  interface Window {
    initWidget?: (config: {
      waifuPath: string
      cdnPath: string
      tools?: string[]
      dragEnable?: boolean
      dragDirection?: Array<'x' | 'y'>
      switchType?: 'order' | 'random'
    }) => void
    __live2dWidgetInited?: boolean
  }
}

const makeAppReadySoon = () => {
  const start = performance.now()
  // 等待至少一帧，确保 DOM 已完成首次绘制
  requestAnimationFrame(() => {
    const elapsed = performance.now() - start
    const remain = Math.max(0, APP_LOADING_MIN_MS - elapsed)
    window.setTimeout(() => {
      isAppReady.value = true
    }, remain)
  })
}

const loadExternalResource = (url: string, type: 'css' | 'js') => {
  return new Promise<void>((resolve, reject) => {
    if (type === 'css') {
      const exists = document.querySelector(`link[href="${url}"]`)
      if (exists) {
        resolve()
        return
      }
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = url
      link.onload = () => resolve()
      link.onerror = () => reject(new Error(`加载样式失败: ${url}`))
      document.head.appendChild(link)
      return
    }

    const exists = document.querySelector(`script[src="${url}"]`)
    if (exists) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = url
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`加载脚本失败: ${url}`))
    document.body.appendChild(script)
  })
}

const initLive2dWidget = async () => {
  if (window.__live2dWidgetInited) return
  if (window.innerWidth < 768) return

  try {
    await Promise.all([
      loadExternalResource(`${LIVE2D_ROOT}/waifu.css`, 'css'),
      loadExternalResource(`${LIVE2D_ROOT}/Core/live2dcubismcore.min.js`, 'js'),
      loadExternalResource(`${LIVE2D_ROOT}/live2d-sdk.js`, 'js'),
      loadExternalResource(`${LIVE2D_ROOT}/waifu-tips.js`, 'js'),
    ])

    if (typeof window.initWidget !== 'function') return

    window.initWidget({
      waifuPath: `${LIVE2D_ROOT}/waifu-tips.json`,
      cdnPath: `${LIVE2D_ROOT}/Resources/`,
      tools: [],
      dragEnable: false,
      switchType: 'order',
    })
    window.__live2dWidgetInited = true
  } catch (error) {
    console.error('初始化 Live2D 看板娘失败:', error)
  }
}

const updateLive2dVisibility = (_path: string) => {
  const shouldHide = false
  const waifu = document.getElementById('waifu')
  const waifuToggle = document.getElementById('waifu-toggle')

  if (waifu) waifu.style.display = shouldHide ? 'none' : ''
  if (waifuToggle) waifuToggle.style.display = shouldHide ? 'none' : ''
}

onMounted(() => {
  makeAppReadySoon()
  initLive2dWidget()
  updateLive2dVisibility(route.path)
})

watch(
  () => route.path,
  (path) => {
    updateLive2dVisibility(path)
  },
)
</script>

<template>
  <div class="app-container">
    <div v-if="!isAppReady" class="loading-container">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>加载中</p>
      </div>
    </div>
    <navbar />
    <RouterView> </RouterView>
    <footer class="site-footer">
      <a :href="MIIT_URL" target="_blank" rel="noopener noreferrer">
        {{ ICP_RECORD_NUMBER }}
      </a>
    </footer>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  background-repeat: no-repeat;
}

.loading-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: rgba(252, 253, 255, 0.75);
  backdrop-filter: blur(6px);
  z-index: 9999;
  pointer-events: none;
}

.loading-spinner {
  text-align: center;
  color: #3a4c63;
}

.spinner {
  width: 28px;
  height: 28px;
  border: 3px solid rgba(58, 76, 99, 0.18);
  border-top: 3px solid #5f7fb2;
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
  font-size: 0.95rem;
}

.site-footer {
  margin-top: auto;
  text-align: center;
  padding: 0.95rem 1rem 1.1rem;
  font-size: 0.86rem;
  color: #6b7a90;
}

.site-footer a {
  color: #6b7a90;
  text-decoration: none;
  transition: color 0.2s ease;
}

.site-footer a:hover {
  color: #2f558f;
}

:global(#waifu) {
  right: 24px !important;
  left: auto !important;
  top: auto !important;
  bottom: 0 !important;
}
</style>
