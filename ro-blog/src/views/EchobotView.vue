<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  appendChatPair,
  createAiSession,
  deleteAiSession,
  getAiModels,
  getCharacterCards,
  getSessionMessages,
  listAiSessions,
  updateAiSession,
  type AiModelInfo,
  type AiSessionRow,
  type CharacterCard,
} from '@/api/ai'

import echobotBgUrl from '@/assets/ab.png'

const router = useRouter()

const leftCanvasBgStyle = {
  backgroundImage: `url(${echobotBgUrl})`,
  backgroundSize: 'cover' as const,
  backgroundPosition: 'center' as const,
  backgroundRepeat: 'no-repeat' as const,
}

function goHome() {
  router.push({ path: '/' })
}

type ChatMsg = { role: 'user' | 'assistant'; content: string }

const models = ref<AiModelInfo[]>([])
const characterCards = ref<CharacterCard[]>([])
const sessions = ref<AiSessionRow[]>([])
const currentSessionId = ref<number | null>(null)
const selectedModel = ref<'qwen-plus' | 'mimo'>('qwen-plus')
const selectedCharacterKey = ref('default')
const messages = ref<ChatMsg[]>([])
const inputText = ref('')
const isSending = ref(false)
const connectionError = ref('')
const activeTab = ref<'chat' | 'sessions'>('chat')
const fileInputRef = ref<HTMLInputElement | null>(null)
const chatScrollRef = ref<HTMLElement | null>(null)
const modelSelectRef = ref<HTMLElement | null>(null)
const charSelectRef = ref<HTMLElement | null>(null)
const modelPickerOpen = ref(false)
const charPickerOpen = ref(false)

let wsActive: WebSocket | null = null

function closePickers() {
  modelPickerOpen.value = false
  charPickerOpen.value = false
}

function toggleModelPicker() {
  charPickerOpen.value = false
  modelPickerOpen.value = !modelPickerOpen.value
}

function toggleCharPicker() {
  modelPickerOpen.value = false
  charPickerOpen.value = !charPickerOpen.value
}

function pickModel(id: AiModelInfo['id']) {
  selectedModel.value = id
  closePickers()
}

function pickCharacter(key: string) {
  selectedCharacterKey.value = key
  closePickers()
}

function onGlobalClickClosePickers(e: MouseEvent) {
  const t = e.target as Node
  if (modelSelectRef.value?.contains(t) || charSelectRef.value?.contains(t)) return
  closePickers()
}

/** 流式用 auto 紧跟光标；平时用 smooth */
function scrollChatToBottom(behavior: ScrollBehavior = 'auto') {
  nextTick(() => {
    requestAnimationFrame(() => {
      const el = chatScrollRef.value
      if (!el || activeTab.value !== 'chat') return
      el.scrollTo({ top: el.scrollHeight, behavior })
    })
  })
}

let mouthAnimTimer: number | null = null

function clearMouthAnim() {
  if (mouthAnimTimer != null) {
    window.clearInterval(mouthAnimTimer)
    mouthAnimTimer = null
  }
  delete window.__ECHOBOT_MOUTH_TARGET
}

/** Echobot：生成中摆手势 + 嘴型（由 live2d-sdk 每帧读取 __ECHOBOT_MOUTH_TARGET 叠加） */
function startStreamingLive2d() {
  window.live2d?.resetWaifuDrag?.()
  window.live2d?.startTapBodyMotion?.()
  clearMouthAnim()
  let phase = 0
  mouthAnimTimer = window.setInterval(() => {
    phase += 0.72
    window.__ECHOBOT_MOUTH_TARGET = 0.42 + (Math.sin(phase) * 0.5 + 0.5) * 0.58
  }, 240)
}

function stopStreamingLive2d() {
  clearMouthAnim()
  window.live2d?.resetWaifuDrag?.()
}

const systemPrompt = computed(() => {
  const c = characterCards.value.find((x) => x.key === selectedCharacterKey.value)
  return c?.systemPrompt ?? ''
})

const sessionTitle = computed(() => {
  const s = sessions.value.find((x) => x.id === currentSessionId.value)
  return s?.title ?? '未选择会话'
})

const configuredForCurrent = computed(() => {
  const m = models.value.find((x) => x.id === selectedModel.value)
  return m?.configured !== false
})

function buildWsUrl() {
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${proto}//${window.location.host}/api/ai/ws`
}

function closeWs() {
  if (wsActive) {
    wsActive.close()
    wsActive = null
  }
}

function buildApiMessages(): { role: string; content: string }[] {
  const out: { role: string; content: string }[] = []
  const sys = systemPrompt.value.trim()
  if (sys) out.push({ role: 'system', content: sys })
  for (const m of messages.value) {
    if (m.role === 'assistant' && !m.content.trim()) continue
    out.push({ role: m.role, content: m.content })
  }
  return out
}

async function ensureSession() {
  if (currentSessionId.value != null) return currentSessionId.value
  const { session } = await createAiSession({
    characterKey: selectedCharacterKey.value,
    modelId: selectedModel.value,
  })
  currentSessionId.value = session.id
  await refreshSessions()
  return session.id
}

async function refreshSessions() {
  try {
    const res = await listAiSessions()
    sessions.value = res.sessions || []
  } catch {
    sessions.value = []
  }
}

async function loadSession(id: number) {
  const res = await getSessionMessages(id)
  currentSessionId.value = id
  selectedModel.value = (res.session.modelId as 'qwen-plus' | 'mimo') || 'qwen-plus'
  selectedCharacterKey.value = res.session.characterKey || 'default'
  messages.value = res.messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }))
  activeTab.value = 'chat'
}

async function newSession() {
  const { session } = await createAiSession({
    characterKey: selectedCharacterKey.value,
    modelId: selectedModel.value,
  })
  currentSessionId.value = session.id
  messages.value = []
  await refreshSessions()
  activeTab.value = 'chat'
}

async function removeSession(id: number, e: Event) {
  e.stopPropagation()
  if (!confirm('确定删除该会话？')) return
  await deleteAiSession(id)
  if (currentSessionId.value === id) {
    currentSessionId.value = null
    messages.value = []
  }
  await refreshSessions()
  if (!sessions.value.length) {
    await newSession()
  } else if (currentSessionId.value === null) {
    await loadSession(sessions.value[0].id)
  }
}

function stopGeneration() {
  closeWs()
  isSending.value = false
  document.documentElement.classList.remove('echobot-streaming')
  stopStreamingLive2d()
  const last = messages.value[messages.value.length - 1]
  if (last?.role === 'assistant' && !last.content.trim()) {
    messages.value.pop()
  }
}

async function sendMessage() {
  const text = inputText.value.trim()
  if (!text || isSending.value) return

  connectionError.value = ''
  let sid: number
  try {
    sid = await ensureSession()
  } catch {
    connectionError.value = '无法创建会话，请检查数据库与网络'
    return
  }

  messages.value.push({ role: 'user', content: text })
  inputText.value = ''
  scrollChatToBottom('smooth')
  isSending.value = true
  messages.value.push({ role: 'assistant', content: '' })
  const assistantIndex = messages.value.length - 1
  document.documentElement.classList.add('echobot-streaming')

  const history = buildApiMessages()

  try {
    closeWs()
    const socket = new WebSocket(buildWsUrl())
    wsActive = socket

    await new Promise<void>((resolve, reject) => {
      const t = window.setTimeout(() => reject(new Error('连接超时')), 20000)
      socket.onopen = () => {
        window.clearTimeout(t)
        startStreamingLive2d()
        socket.send(
          JSON.stringify({
            model: selectedModel.value,
            messages: history,
          }),
        )
        resolve()
      }
      socket.onerror = () => {
        window.clearTimeout(t)
        reject(new Error('WebSocket 连接失败'))
      }
    })

    await new Promise<void>((resolve) => {
      socket.onmessage = (ev) => {
        try {
          const data = JSON.parse((ev as MessageEvent).data as string)
          if (data.error) {
            messages.value[assistantIndex].content = `错误：${data.error}`
            socket.close()
            resolve()
            return
          }
          if (data.content) {
            messages.value[assistantIndex].content += data.content
          }
          if (data.done) {
            socket.close()
            resolve()
          }
        } catch {
          socket.close()
          resolve()
        }
      }
      socket.onclose = () => resolve()
    })

    const userContent = messages.value[messages.value.length - 2]?.content ?? text
    const assistantContent = messages.value[assistantIndex].content
    if (assistantContent && !assistantContent.startsWith('错误：')) {
      await appendChatPair(sid, userContent, assistantContent)
      await refreshSessions()
    }
  } catch (e) {
    connectionError.value = (e as Error).message || '发送失败'
    messages.value[assistantIndex].content = connectionError.value
  } finally {
    isSending.value = false
    closeWs()
    wsActive = null
    document.documentElement.classList.remove('echobot-streaming')
    stopStreamingLive2d()
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}

function triggerTxtUpload() {
  fileInputRef.value?.click()
}

async function onTxtFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  try {
    const text = await file.text()
    if (text) {
      const t = text.trim()
      if (t.length > 120000) {
        connectionError.value = '文本过长（请小于约 120KB）'
        return
      }
      inputText.value = (inputText.value ? `${inputText.value}\n\n` : '') + t
    }
  } catch {
    connectionError.value = '读取 TXT 失败'
  }
}

watch(
  messages,
  () => {
    scrollChatToBottom(isSending.value ? 'auto' : 'smooth')
  },
  { deep: true },
)

watch(activeTab, (t) => {
  if (t === 'chat') scrollChatToBottom('smooth')
})

watch(isSending, (s) => {
  if (s) closePickers()
})

watch([selectedModel, selectedCharacterKey], async () => {
  if (currentSessionId.value == null) return
  try {
    await updateAiSession(currentSessionId.value, {
      modelId: selectedModel.value,
      characterKey: selectedCharacterKey.value,
    })
    await refreshSessions()
  } catch {
    /* ignore */
  }
})

onMounted(async () => {
  document.addEventListener('click', onGlobalClickClosePickers)
  document.documentElement.classList.add('echobot-route')
  window.__LIVE2D_ECHOBOT_NO_DRAG = true
  window.live2d?.resetWaifuDrag?.()
  try {
    const [m, cards] = await Promise.all([getAiModels(), getCharacterCards()])
    models.value = m.models || []
    characterCards.value = cards.cards || []
    const first = models.value.find((x) => x.configured)
    if (first) selectedModel.value = first.id
  } catch {
    models.value = [
      { id: 'qwen-plus', name: '通义千问 Plus', configured: true },
      { id: 'mimo', name: '小米 MiMo', configured: true },
    ]
  }

  await refreshSessions()
  if (sessions.value.length > 0) {
    await loadSession(sessions.value[0].id)
  } else {
    await newSession()
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onGlobalClickClosePickers)
  document.documentElement.classList.remove('echobot-route')
  document.documentElement.classList.remove('echobot-streaming')
  stopStreamingLive2d()
  window.__LIVE2D_ECHOBOT_NO_DRAG = false
  window.live2d?.resetWaifuDrag?.()
  closeWs()
})
</script>

<template>
  <div class="echobot-page page-container">
    <div class="echobot-shell">
      <section class="echobot-left echobot-card" aria-label="Live2D 与控制">
        <header class="left-topbar">
          <button type="button" class="back-btn" title="返回首页" @click="goHome">← 返回</button>
          <div class="brand">
            <span class="brand-title">RO ECHOBOT</span>
            <span class="badge" :class="{ on: !isSending }">{{ isSending ? '生成中' : '就绪' }}</span>
          </div>
          <span class="sess-label">会话：{{ sessionTitle }}</span>
          <div class="left-actions">
            <button type="button" class="ghost-btn" @click="stopGeneration" :disabled="!isSending">停止生成</button>
          </div>
        </header>
        <div class="left-canvas" :style="leftCanvasBgStyle" aria-hidden="true" />
      </section>

    <aside class="echobot-right echobot-card">
      <nav class="right-tabs">
        <button type="button" :class="{ active: activeTab === 'chat' }" @click="activeTab = 'chat'">对话</button>
        <button type="button" :class="{ active: activeTab === 'sessions' }" @click="activeTab = 'sessions'">会话列表</button>
        <button type="button" class="new-chat" @click="newSession">＋ 新会话</button>
      </nav>

      <div v-show="activeTab === 'chat'" class="panel-chat">
        <div class="panel-toolbar">
          <div class="toolbar-well">
            <div ref="modelSelectRef" class="fld">
              <span class="lbl">模型</span>
              <div class="ui-select" :class="{ open: modelPickerOpen, disabled: isSending }">
                <button
                  type="button"
                  class="ui-select-trigger"
                  :disabled="isSending"
                  @click.stop="toggleModelPicker"
                >
                  <span class="ui-select-value">{{
                    models.find((x) => x.id === selectedModel)?.name || '—'
                  }}{{
                    models.find((x) => x.id === selectedModel)?.configured === false ? ' · 未配置' : ''
                  }}</span>
                  <svg class="ui-select-chev" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="currentColor"
                      d="M7 10l5 5 5-5H7z"
                    />
                  </svg>
                </button>
                <div v-show="modelPickerOpen" class="ui-select-panel" role="listbox">
                  <button
                    v-for="m in models"
                    :key="m.id"
                    type="button"
                    class="ui-select-opt"
                    :class="{ active: m.id === selectedModel }"
                    role="option"
                    @click.stop="pickModel(m.id)"
                  >
                    <span class="ui-select-opt-main">{{ m.name }}</span>
                    <span v-if="!m.configured" class="ui-select-opt-sub">未配置</span>
                  </button>
                </div>
              </div>
            </div>
            <div ref="charSelectRef" class="fld fld-grow">
              <span class="lbl">角色卡</span>
              <div class="ui-select ui-select-wide" :class="{ open: charPickerOpen, disabled: isSending }">
                <button
                  type="button"
                  class="ui-select-trigger"
                  :disabled="isSending"
                  @click.stop="toggleCharPicker"
                >
                  <span class="ui-select-value">{{
                    characterCards.find((x) => x.key === selectedCharacterKey)?.name || '—'
                  }}</span>
                  <svg class="ui-select-chev" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="currentColor" d="M7 10l5 5 5-5H7z" />
                  </svg>
                </button>
                <div v-show="charPickerOpen" class="ui-select-panel" role="listbox">
                  <button
                    v-for="c in characterCards"
                    :key="c.key"
                    type="button"
                    class="ui-select-opt"
                    :class="{ active: c.key === selectedCharacterKey }"
                    role="option"
                    @click.stop="pickCharacter(c.key)"
                  >
                    <span class="ui-select-opt-main">{{ c.name }}</span>
                    <span class="ui-select-opt-sub">{{ c.description }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <p v-if="!configuredForCurrent" class="warn">请在服务端 .env 配置 AI_KEY_QWEN / AI_KEY_MIMO</p>

        <div ref="chatScrollRef" class="chat-scroll">
          <p v-if="!messages.length" class="chat-empty">输入消息开始对话，支持上传 TXT。</p>
          <div
            v-for="(msg, i) in messages"
            :key="i"
            class="row"
            :class="msg.role === 'user' ? 'is-user' : 'is-ai'"
          >
            <div class="bubble">{{ msg.content }}</div>
          </div>
        </div>

        <div class="input-block">
          <textarea
            v-model="inputText"
            class="area"
            rows="4"
            placeholder="例如：今天帮我安排一下工作重点。"
            :disabled="isSending"
            @keydown="onKeydown"
          />
          <div class="input-bar">
            <span class="tip">Shift + Enter 换行</span>
            <div class="input-bar-right">
              <input
                ref="fileInputRef"
                type="file"
                accept=".txt,text/plain"
                class="hidden-file"
                @change="onTxtFile"
              />
              <button type="button" class="icon-btn" title="上传 TXT" @click="triggerTxtUpload">📄</button>
              <button type="button" class="send" :disabled="isSending || !inputText.trim()" @click="sendMessage">
                {{ isSending ? '生成中…' : '发送' }}
              </button>
            </div>
          </div>
          <p v-if="connectionError" class="err">{{ connectionError }}</p>
        </div>
      </div>

      <div v-show="activeTab === 'sessions'" class="panel-sessions">
        <ul class="sess-list">
          <li
            v-for="s in sessions"
            :key="s.id"
            class="sess-item"
            :class="{ current: s.id === currentSessionId }"
            @click="loadSession(s.id)"
          >
            <div class="sess-title">{{ s.title }}</div>
            <div class="sess-meta">{{ s.modelId }} · {{ s.characterKey }}</div>
            <button type="button" class="del" @click="removeSession(s.id, $event)">删</button>
          </li>
        </ul>
        <p v-if="!sessions.length" class="empty">暂无会话，点「新会话」开始</p>
      </div>
    </aside>
    </div>
  </div>
</template>

<style scoped>
/* 填满 router-outlet，高度由 flex 链约束，禁止整页滚动；仅聊天区/会话列表内部滚动 */
.echobot-page {
  flex: 1;
  min-height: 0;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  padding: 0.65rem 0.85rem 0.55rem;
  background: linear-gradient(165deg, #e8f1fc 0%, #dce8f8 42%, #cfdcf5 100%);
  overflow: hidden;
}

.echobot-page.page-container {
  overflow-x: hidden;
  overflow-y: hidden;
}

.echobot-shell {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 400px;
  gap: 0.85rem;
  align-items: stretch;
}

.echobot-card {
  border-radius: 22px;
  overflow: hidden;
  box-shadow:
    0 18px 44px -22px rgba(28, 55, 100, 0.38),
    0 6px 18px -10px rgba(45, 107, 179, 0.2);
  border: 1px solid rgba(95, 127, 178, 0.18);
  background: rgba(255, 255, 255, 0.52);
  min-height: 0;
}

.echobot-left {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.left-topbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 1rem;
  padding: 0.65rem 1rem;
  background: rgba(248, 251, 255, 0.94);
  border-bottom: 1px solid rgba(70, 120, 180, 0.14);
  z-index: 5;
}

.back-btn {
  flex-shrink: 0;
  padding: 0.32rem 0.75rem;
  border-radius: 999px;
  border: 1px solid rgba(70, 120, 180, 0.35);
  background: linear-gradient(180deg, #fff 0%, #f0f6ff 100%);
  color: #2a5080;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.2s ease,
    box-shadow 0.2s ease;
}

.back-btn:hover {
  background: #fff;
  box-shadow: 0 4px 14px -8px rgba(42, 80, 128, 0.45);
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.brand-title {
  font-weight: 800;
  letter-spacing: 0.12em;
  font-size: 0.82rem;
  color: #1e3a5f;
}

.badge {
  font-size: 0.72rem;
  padding: 0.12rem 0.45rem;
  border-radius: 999px;
  background: #dde8f5;
  color: #4a6b8a;
}

.badge.on {
  background: #c8e8f0;
  color: #1d5a6e;
}

.sess-label {
  font-size: 0.78rem;
  color: #4a6b8a;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.left-actions {
  margin-left: auto;
}

.ghost-btn {
  padding: 0.28rem 0.65rem;
  border-radius: 999px;
  border: 1px solid rgba(70, 120, 180, 0.38);
  background: #fff;
  color: #35507c;
  font-size: 0.78rem;
  cursor: pointer;
}

.ghost-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.left-canvas {
  flex: 1;
  min-height: 0;
  background-color: #dfe8f5;
}

.echobot-right {
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  background: linear-gradient(180deg, #f5f9ff 0%, #f0f6ff 100%);
}

.right-tabs {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.6rem;
  border-bottom: 1px solid rgba(70, 120, 180, 0.12);
  background: rgba(252, 253, 255, 0.98);
}

.right-tabs button {
  padding: 0.35rem 0.75rem;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: #4a6b8a;
  font-size: 0.85rem;
  cursor: pointer;
}

.right-tabs button.active {
  background: rgba(95, 127, 178, 0.18);
  color: #1e3a5f;
  font-weight: 700;
}

.new-chat {
  margin-left: auto;
  background: rgba(95, 127, 178, 0.14) !important;
}

.panel-chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.panel-toolbar {
  flex-shrink: 0;
  padding: 0.55rem 0.65rem 0.65rem;
  border-bottom: 1px solid rgba(70, 120, 180, 0.1);
}

.toolbar-well {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 0.55rem 0.75rem;
  padding: 0.65rem 0.75rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(95, 127, 178, 0.14);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.85),
    0 4px 18px -12px rgba(33, 72, 120, 0.22);
}

.fld {
  display: flex;
  flex-direction: column;
  gap: 0.28rem;
  min-width: 0;
}

.fld-grow {
  flex: 1 1 200px;
}

.lbl {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: #5a7394;
  text-transform: none;
}

.ui-select {
  position: relative;
  width: 100%;
  max-width: 200px;
}

.ui-select-wide {
  max-width: none;
}

.ui-select.disabled .ui-select-trigger {
  opacity: 0.55;
  cursor: not-allowed;
}

.ui-select-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.42rem 0.65rem 0.42rem 0.85rem;
  border-radius: 14px;
  border: 1px solid rgba(95, 127, 178, 0.22);
  background: linear-gradient(180deg, #ffffff 0%, #f5f8ff 100%);
  color: #1e3a5f;
  font-size: 0.82rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  box-shadow: 0 2px 10px -6px rgba(33, 72, 120, 0.35);
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.ui-select-trigger:hover:not(:disabled) {
  border-color: rgba(74, 143, 212, 0.45);
  box-shadow: 0 4px 14px -8px rgba(45, 107, 179, 0.35);
}

.ui-select.open .ui-select-trigger {
  border-color: rgba(74, 143, 212, 0.55);
  box-shadow:
    0 0 0 2px rgba(74, 143, 212, 0.18),
    0 6px 20px -10px rgba(45, 107, 179, 0.38);
}

.ui-select-chev {
  flex-shrink: 0;
  color: #6b8cb8;
  transition: transform 0.2s ease;
}

.ui-select.open .ui-select-chev {
  transform: rotate(180deg);
}

.ui-select-value {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
}

.ui-select-panel {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(100% + 6px);
  z-index: 40;
  padding: 6px;
  border-radius: 16px;
  background: linear-gradient(180deg, #fbfcff 0%, #f2f6ff 100%);
  border: 1px solid rgba(95, 127, 178, 0.18);
  box-shadow:
    0 12px 40px -16px rgba(28, 55, 100, 0.35),
    0 4px 16px -8px rgba(45, 107, 179, 0.2);
  max-height: 240px;
  overflow-y: auto;
}

.ui-select-opt {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.12rem;
  width: 100%;
  padding: 0.5rem 0.72rem;
  border: none;
  border-radius: 12px;
  background: transparent;
  color: #1e3a5f;
  font-size: 0.8rem;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition: background 0.12s ease;
}

.ui-select-opt:hover {
  background: rgba(74, 143, 212, 0.12);
}

.ui-select-opt.active {
  background: linear-gradient(135deg, rgba(74, 143, 212, 0.22) 0%, rgba(45, 107, 179, 0.14) 100%);
  box-shadow: inset 0 0 0 1px rgba(74, 143, 212, 0.28);
}

.ui-select-opt-main {
  font-weight: 700;
  line-height: 1.3;
}

.ui-select-opt-sub {
  font-size: 0.72rem;
  font-weight: 500;
  color: #6a7f99;
  line-height: 1.35;
}

.warn {
  flex-shrink: 0;
  margin: 0 0.75rem;
  font-size: 0.72rem;
  color: #b4532d;
}

.chat-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.chat-empty {
  margin: 0;
  padding: 1rem 0.5rem;
  text-align: center;
  font-size: 0.86rem;
  color: #7a8fa8;
  line-height: 1.6;
}

.row {
  display: flex;
}

.row.is-user {
  justify-content: flex-end;
}

.row.is-ai {
  justify-content: flex-start;
}

.bubble {
  max-width: 92%;
  padding: 0.5rem 0.7rem;
  border-radius: 16px;
  font-size: 0.88rem;
  line-height: 1.55;
  white-space: pre-wrap;
  word-break: break-word;
}

.is-user .bubble {
  background: linear-gradient(135deg, #4a8fd4 0%, #2d6bb3 100%);
  color: #fbfdff;
  border-bottom-right-radius: 4px;
  box-shadow: 0 8px 18px -10px rgba(33, 80, 140, 0.45);
}

.is-ai .bubble {
  background: #fff;
  color: #1e3a5f;
  border: 1px solid rgba(95, 127, 178, 0.22);
  border-bottom-left-radius: 4px;
}

.input-block {
  flex-shrink: 0;
  padding: 0.6rem 0.75rem 0.75rem;
  border-top: 1px solid rgba(70, 120, 180, 0.12);
  background: linear-gradient(180deg, #f2f7ff 0%, #f7faff 100%);
}

.area {
  width: 100%;
  box-sizing: border-box;
  border-radius: 14px;
  border: 1px solid rgba(95, 127, 178, 0.25);
  padding: 0.55rem 0.65rem;
  font-size: 0.88rem;
  font-family: inherit;
  resize: none;
  min-height: 76px;
  max-height: 140px;
  background: #fff;
  color: #1e3a5f;
}

.area:focus {
  outline: none;
  border-color: rgba(95, 127, 178, 0.5);
  box-shadow: 0 0 0 2px rgba(95, 127, 178, 0.14);
}

.input-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.45rem;
  gap: 0.5rem;
}

.tip {
  font-size: 0.72rem;
  color: #8a9bb5;
}

.input-bar-right {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.hidden-file {
  display: none;
}

.icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  border: 1px solid rgba(95, 127, 178, 0.28);
  background: #fff;
  cursor: pointer;
  font-size: 1rem;
}

.send {
  padding: 0.45rem 1.5rem;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 700;
  font-size: 0.88rem;
  color: #fbfdff;
  background: linear-gradient(135deg, #4a8fd4, #2d6bb3);
  box-shadow: 0 8px 20px -10px rgba(33, 80, 140, 0.5);
}

.send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.err {
  margin: 0.35rem 0 0;
  font-size: 0.78rem;
  color: #c44a4a;
}

.panel-sessions {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 0.5rem;
}

.sess-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.sess-item {
  position: relative;
  padding: 0.65rem 2rem 0.65rem 0.65rem;
  margin-bottom: 0.35rem;
  border-radius: 12px;
  border: 1px solid rgba(95, 127, 178, 0.15);
  background: #fff;
  cursor: pointer;
}

.sess-item.current {
  border-color: rgba(95, 127, 178, 0.4);
  background: rgba(95, 127, 178, 0.08);
}

.sess-title {
  font-weight: 600;
  font-size: 0.88rem;
  color: #1e3a5f;
}

.sess-meta {
  font-size: 0.72rem;
  color: #7a8fa8;
  margin-top: 0.2rem;
}

.del {
  position: absolute;
  right: 0.4rem;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: rgba(200, 90, 70, 0.1);
  color: #b04444;
  border-radius: 8px;
  padding: 0.2rem 0.4rem;
  cursor: pointer;
  font-size: 0.72rem;
}

.empty {
  text-align: center;
  color: #7a8fa8;
  font-size: 0.85rem;
  padding: 2rem;
}



@media (max-width: 900px) {
  .echobot-shell {
    grid-template-columns: 1fr;
    grid-template-rows: minmax(160px, 26vh) minmax(0, 1fr);
  }

  .echobot-page {
    padding: 0.45rem 0.5rem 0.45rem;
  }
}
</style>
