<template>
  <div class="news-item" @click="goToDetail">
    <div class="news-content">
      <h3 class="news-title">{{ news.title }}</h3>
      <p class="news-desc">{{ news.description }}</p>

      <div class="news-info">
        <span>{{ news.author }}</span>
        <span>{{ news.publishTime }}</span>
        <span>{{ news.views }} {{ $t('home.reading') }}</span>
      </div>
    </div>

    <div v-if="news.image" class="news-image">
      <img :src="getImageUrl(news.image)" :alt="news.title">
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { getImageUrl } from '../utils/image'

const props = defineProps({
  news: {
    type: Object,
    required: true
  }
})

const router = useRouter()

// 跳转到新闻详情
const goToDetail = () => router.push(`/news/detail/${props.news.id}`)
</script>

<style scoped>
.news-item {
  display: flex;
  padding: 12px 16px;
  background-color: #fff;
  border-bottom: 1px solid #f2f2f2;
  cursor: pointer;
}

.news-content {
  flex: 1;
  margin-right: 12px;
  overflow: hidden;
}

.news-title {
  display: -webkit-box;
  margin: 0 0 8px;
  overflow: hidden;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.4;
  text-overflow: ellipsis;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.news-desc {
  display: -webkit-box;
  margin: 0 0 8px;
  overflow: hidden;
  color: #666;
  font-size: 14px;
  line-height: 1.4;
  text-overflow: ellipsis;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.news-info {
  display: flex;
  flex-wrap: wrap;
  color: #999;
  font-size: 12px;
}

.news-info span {
  margin-right: 10px;
}

.news-image {
  width: 110px;
  height: 80px;
  flex-shrink: 0;
}

.news-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}
</style>