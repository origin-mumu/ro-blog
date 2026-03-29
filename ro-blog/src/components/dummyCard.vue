<script setup lang="ts">
import router from '@/router'
import { Article } from '@/type/Article'
const props = defineProps<Article>()

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}
</script>

<template>
  <div
    class="article-card"
    @click="router.push({ name: 'articleDetail', params: { id: props.id } })"
  >
    <div class="card-body">
      <div class="meta-row">
        <span class="meta-date">{{ formatDate(props.createdAt) }}</span>
        <span class="meta-cat">{{ props.category }}</span>
      </div>

      <h3 class="a-title">{{ props.title }}</h3>
      <p class="a-content">{{ props.description }}</p>

      <div class="a-footer">
        <div class="tags">
          <span v-for="tag in props.tags" :key="tag" class="mini-tag">{{ tag }}</span>
        </div>
        <div class="read-icon">
          <span class="arrow">→</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.article-card {
  background: #fcfdff;
  border: 1px solid #dbe4f3;
  border-radius: 14px;
  box-shadow: 0 12px 24px -18px rgba(33, 49, 74, 0.38);
  overflow: hidden;
  cursor: pointer;
  position: relative;
  height: 100%;
  transition:
    transform 0.25s ease,
    box-shadow 0.3s ease;
}

.article-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 28px -16px rgba(33, 49, 74, 0.45);
  border-color: #c9d8ef;
}

.card-body {
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  min-height: 190px;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.8rem;
  font-size: 0.85rem;
  color: #78879c;
}

.meta-cat {
  color: #4e6790;
  font-weight: 600;
  background: #e8effa;
  padding: 2px 10px;
  border-radius: 12px;
}

.a-title {
  font-size: 1.35rem;
  font-weight: 700;
  color: #28344a;
  margin: 0 0 0.7rem 0;
  line-height: 1.35;
  transition: color 0.2s ease;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  max-height: calc(1.35em * 2);
  word-break: break-word;
}

.article-card:hover .a-title {
  color: #4e6790;
}

.a-content {
  color: #66758a;
  font-size: 0.92rem;
  line-height: 1.55;
  margin-bottom: 1rem;
  flex: 0 0 auto;
  min-height: 0;
  max-height: calc(1.55em * 2);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
}

.a-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  border-top: 1px solid #dbe4f3;
  padding-top: 0.8rem;
}

.mini-tag {
  font-size: 0.75rem;
  color: #738299;
  background: #eef3fc;
  padding: 4px 10px;
  border-radius: 6px;
  margin-right: 6px;
  margin-bottom: 4px;
  transition: background 0.2s;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.article-card:hover .mini-tag {
  background: #e6eefb;
  color: #66758a;
}

.read-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #eef3fc;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.arrow {
  color: #738299;
  font-size: 1.2rem;
  transition: transform 0.3s ease;
}

.article-card:hover .read-icon {
  background: #5f7fb2;
  box-shadow: 0 8px 18px -8px rgba(33, 49, 74, 0.58);
}

.article-card:hover .arrow {
  color: white;
  transform: translateX(2px);
}

@media (max-width: 768px) {
  .card-body {
    padding: 1.2rem;
  }
}
</style>
