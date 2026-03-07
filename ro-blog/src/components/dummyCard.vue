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
    <div class="card-cover">
      <div class="cover-overlay">
        <span>READ MORE</span>
      </div>
    </div>

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
  background: white;
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 20px 25px -5px rgba(11, 120, 245, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: row;
  cursor: pointer;
  position: relative;
  transition:
    transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.3s ease;
}

.article-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 25px -5px rgba(11, 120, 245, 0.25);
  border-color: rgba(78, 101, 205);
}

.card-cover {
  width: 35%;
  flex-shrink: 0;
  background: url('../assets/yueling.png');
  position: relative;
  overflow: hidden;
  background-size: cover;
  background-position: center;
  transition: transform 0.5s ease;
}

.article-card:hover .card-cover {
  transform: scale(1.1);
}

.cover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 1;
}

.cover-overlay span {
  color: white;
  border: 1px solid white;
  padding: 0.6rem 1.2rem;
  border-radius: 30px;
  font-size: 0.85rem;
  letter-spacing: 2px;
  font-weight: 600;
  transform: translateY(10px);
  transition: transform 0.3s ease;
}

.article-card:hover .cover-overlay {
  opacity: 1;
  background: rgba(0, 0, 0, 0.4);
}
.article-card:hover .cover-overlay span {
  transform: translateY(0);
}

.card-body {
  padding: 1.5rem 2rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  z-index: 2;
  background: transparent;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.8rem;
  font-size: 0.85rem;
  color: #94a3b8;
}

.meta-cat {
  color: #6366f1;
  font-weight: 600;
  background: rgba(78, 101, 205, 0.1);
  padding: 2px 10px;
  border-radius: 12px;
}

.a-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 1rem 0;
  line-height: 1.4;
  transition: color 0.2s ease;
}

.article-card:hover .a-title {
  color: #4f46e5;
}

.a-content {
  color: #64748b;
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  flex-grow: 1;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.a-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  border-top: 1px solid #f1f5f9;
  padding-top: 1rem;
}

.mini-tag {
  font-size: 0.75rem;
  color: #94a3b8;
  background: #f8fafc;
  padding: 4px 10px;
  border-radius: 6px;
  margin-right: 8px;
  transition: background 0.2s;
}

.article-card:hover .mini-tag {
  background: #f1f5f9;
  color: #64748b;
}

.read-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.arrow {
  color: #94a3b8;
  font-size: 1.2rem;
  transition: transform 0.3s ease;
}

.article-card:hover .read-icon {
  background: #4f46e5;
  box-shadow: 0 4px 10px rgba(79, 70, 229, 0.3);
}

.article-card:hover .arrow {
  color: white;
  transform: translateX(2px);
}

@media (max-width: 768px) {
  .article-card {
    flex-direction: column;
  }
  .card-cover {
    width: 100%;
    height: 200px;
  }
  .card-body {
    padding: 1.2rem;
  }
}
</style>
