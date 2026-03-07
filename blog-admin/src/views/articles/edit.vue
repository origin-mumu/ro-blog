<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  updateArticleService,
  getArticleByIdService,
  articleCategoryListService,
} from '@/api/article'
import router from '@/router'
import Nav from '@/components/nav.vue'
import '@wangeditor/editor/dist/css/style.css'

import { onBeforeUnmount, shallowRef } from 'vue'
// @ts-ignore
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import type { IDomEditor } from '@wangeditor/editor'
const route = useRoute()
const title = ref('')

const category = ref('')
const categories = ref<{ id: number; name: string }[]>([])

// 获取文章分类列表
onMounted(() => {
  articleCategoryListService().then((res) => {
    categories.value = res.data
    console.log(categories.value)
  })
})
const status = ref('')

// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef()

// 内容 HTML
const valueHtml = ref('')

// 编辑器模式
const mode = ref('default')

// 模拟 ajax 异步获取内容

const toolbarConfig = {}
const editorConfig = { placeholder: '请输入内容...' }

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})

const handleCreated = (editor: IDomEditor) => {
  // 添加类型注解
  editorRef.value = editor // 记录 editor 实例，重要！
}

const createArticle = async () => {
  try {
    // 获取编辑器内容
    const editorContent = valueHtml.value
    console.log(editorContent, category.value, status.value)
    await updateArticleService(Number(route.params.id), {
      title: title.value,
      content: editorContent,
      category: category.value,
      status: status.value,
    })
    alert('文章编辑成功')
    router.push({ name: 'articles' })
  } catch (error) {
    console.error('编辑文章失败:', error)
    alert('编辑文章失败')
  }
}
const loadArticle = async () => {
  try {
    const response = await getArticleByIdService(Number(route.params.id))
    const article = response.data
    title.value = article.title
    valueHtml.value = article.content
    category.value = article.category
    status.value = article.status
  } catch (error) {
    console.error('加载文章失败:', error)
    alert('加载文章失败')
  }
}
onMounted(() => {
  loadArticle()
})
</script>

<template>
  <div class="home-layout">
    <div class="sidebar-container">
      <Nav></Nav>
    </div>
    <div class="content-container">
      <div class="content-box">
        <div class="top">
          <div class="back" @click="router.push({ name: 'articles' })">⬅</div>
          <div class="title">编辑文章</div>
          <div class="save" @click="createArticle">保存</div>
        </div>

        <div class="article-form">
          <label class="form-label">
            标题:
            <input class="title-input" type="text" v-model="title" />
          </label>
          <label class="form-label">
            分类:
            <select class="category-select" v-model="category">
              <option v-for="item in categories" :key="item.id" :value="item.name">
                {{ item.name }}
              </option>
            </select>
          </label>

          <label class="form-label">
            状态:
            <select class="category-select" v-model="status">
              <option value="draft">草稿</option>
              <option value="published">已发布</option>
            </select>
          </label>

          <div class="content-input">
            <div class="editor-wrapper">
              <Toolbar
                class="editor-toolbar"
                :editor="editorRef"
                :defaultConfig="toolbarConfig"
                :mode="mode"
              />
              <Editor
                class="editor-textarea"
                v-model="valueHtml"
                :defaultConfig="editorConfig"
                :mode="mode"
                @onCreated="handleCreated"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.top {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #757575;
}
.back {
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 20px;
  background: #b9d6f0;
  margin-right: 10px;
}
.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
}
.save {
  margin-left: auto;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  background: #4caf50;
  color: white;
}
.form-label {
  margin-bottom: 12px;
  margin-left: 30px;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}
.title-input {
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #959595;
  font-size: 16px;
  margin-bottom: 20px;
}
.category-select {
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #868686;
  font-size: 16px;
  margin-bottom: 20px;
}

.editor-wrapper {
  width: 100%;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}

.editor-toolbar {
  border-bottom: 1px solid #e0e0e0;
  background-color: #f8f9fa;
}

.editor-textarea {
  height: 400px;
  overflow-y: hidden;
  min-height: 300px;
}
</style>
