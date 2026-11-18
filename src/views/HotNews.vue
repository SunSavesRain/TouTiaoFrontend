<template>
  <div class="hot-container">
    <van-nav-bar :title="$t('home.hot')" :left-text="$t('common.back')" left-arrow fixed
                 @click-left="onClickLeft" />
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <div v-if="newsStore.hotNews.length" class="hot-list">
        <div v-for="(item, index) in newsStore.hotNews" :key="item.id"
             class="hot-item" @click="goToNewsDetail(item.id)">
          <div class="rank"
               :class="{ 'rank-first': index === 0, 'rank-second': index === 1, 'rank-third': index === 2 }">
            {{ index + 1 }}
          </div>
          <div class="news-info">
            <div class="news-title">{{ item.title }}</div>
            <div class="news-meta">
              <span>{{ item.author }}</span>
              <span>{{ item.publishTime }}</span>
            </div>
            <div class="news-hot">
              <van-icon name="fire-o" />
              <span>{{ item.views }} {{ $t('home.reading') }}</span>
            </div>
          </div>
          <div v-if="item.image" class="news-image">
            <img :src="getImageUrl(item.image)" :alt="item.title">
          </div>
        </div>
      </div>
      <!--elseif新闻在加载-->
      <van-loading v-else-if="newsStore.hotLoading" class="loading" vertical>
        {{ $t('common.loading') }}
      </van-loading>
      <van-empty v-else :description="$t('home.noHotNews')" />
    </van-pull-refresh>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { showToast } from 'vant'
import { useNewsStore } from '../store/modules/news'
import { getImageUrl } from '../utils/image'

const router = useRouter()
const newsStore = useNewsStore()
const { t } = useI18n()

const refreshing = ref(false)

// 返回上一页
const onClickLeft = () => router.back()

// 跳转到新闻详情
const goToNewsDetail = id => router.push(`/news/detail/${id}`)

// 获取热点新闻
const loadHotNews = async () => {
  const result = await newsStore.getHotNews(20)

  if (!result?.success) {
    showToast({
      message: result?.message || t('home.hotNewsLoadFailed'),
      position: 'bottom'
    })
  }
}

// 下拉刷新
const onRefresh = async () => {
  await loadHotNews()
  refreshing.value = false
}

// 页面加载
onMounted(async () => {
  await loadHotNews()
})
</script>

<style scoped>
.hot-container {
  min-height: 100vh;
  padding-top: 46px;
  background-color: #f7f8fa;
}

.hot-list {
  padding: 10px;
}

.hot-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  padding: 14px 12px;
  background-color: #fff;
  border-radius: 8px;
  cursor: pointer;
}

.rank {
  width: 30px;
  flex-shrink: 0;
  margin-right: 10px;
  color: #999;
  font-size: 18px;
  font-weight: bold;
  text-align: center;
}

.rank-first {
  color: #ee0a24;
  font-size: 22px;
}

.rank-second {
  color: #ff7a00;
  font-size: 21px;
}

.rank-third {
  color: #ffb020;
  font-size: 20px;
}

.news-info {
  flex: 1;
  min-width: 0;
}

.news-title {
  display: -webkit-box;
  margin-bottom: 10px;
  overflow: hidden;
  color: #333;
  font-size: 16px;
  font-weight: bold;
  line-height: 1.4;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.news-meta {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 6px;
  color: #999;
  font-size: 12px;
}

.news-meta span {
  margin-right: 10px;
}

.news-hot {
  display: flex;
  align-items: center;
  color: #ee0a24;
  font-size: 12px;
}

.news-hot span {
  margin-left: 3px;
}

.news-image {
  width: 100px;
  height: 70px;
  flex-shrink: 0;
  margin-left: 12px;
}

.news-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.loading {
  padding-top: 100px;
}
</style>