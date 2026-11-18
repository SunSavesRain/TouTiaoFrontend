<template>
  <div class="history-container">
    <van-nav-bar :title="$t('history.title')" :left-text="$t('common.back')" left-arrow fixed
                 :right-text="$t('history.clear')" @click-left="onClickLeft"
                 @click-right="onClickClear" />

    <div v-if="historyStore.getHistory.length" class="history-list">
      <div v-for="item in historyStore.getHistory" :key="item.id" class="history-item">
        <van-cell :border="false" @click="goToNewsDetail(item.id)">
          <template #title>
            <div class="news-item">
              <div v-if="item.image" class="news-image">
                <img :src="getImageUrl(item.image)" :alt="item.title">
              </div>
              <div class="news-info">
                <div class="news-title">{{ item.title }}</div>
                <div class="news-meta">
                  <span>{{ item.author }}</span>
                  <span>{{ item.publishTime }}</span>
                  <span>{{ $t('history.viewTime') }}: {{ item.viewTime }}</span>
                </div>
              </div>
            </div>
          </template>
        </van-cell>
        <van-button class="delete-btn" type="danger" size="mini" icon="cross"
                    @click="confirmDelete(item.id)" />
      </div>
    </div>

    <van-empty v-else :description="$t('history.empty')" />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { showDialog } from 'vant'
import { useHistoryStore } from '../store/modules/history'
import { getImageUrl } from '../utils/image'

const router = useRouter()
const historyStore = useHistoryStore()
const { t } = useI18n()

// 返回上一页
const onClickLeft = () => router.back()

// 跳转到新闻详情
const goToNewsDetail = id => router.push(`/news/detail/${id}`)

// 删除单条历史记录
const removeHistory = async id => {
  try {
    const result = await historyStore.removeHistoryApi(id)
    if (!result.success && !result.isLocal) {
      showDialog({
        title: t('common.tip'),
        message: result.message || t('history.deleteFailed')
      })
    }
  } catch (error) {
    console.error('删除历史记录失败:', error)
  }
}

// 确认删除
const confirmDelete = id => {
  showDialog({
    title: t('common.tip'),
    message: t('history.deleteConfirm'),
    showCancelButton: true,
    confirmButtonText: t('common.confirm'),
    cancelButtonText: t('common.cancel')
  }).then(action => {
    if (action === 'confirm') removeHistory(id)
  })
}

// 清空历史记录
const onClickClear = () => {
  showDialog({
    title: t('common.tip'),
    message: t('history.clearConfirm'),
    showCancelButton: true,
    confirmButtonText: t('common.confirm'),
    cancelButtonText: t('common.cancel')
  }).then(async action => {
    if (action !== 'confirm') return
    try {
      const result = await historyStore.clearHistoryApi()
      if (!result.success && !result.isLocal) {
        showDialog({
          title: t('common.tip'),
          message: result.message || t('history.clearFailed')
        })
      }
    } catch (error) {
      console.error('清空历史记录失败:', error)
    }
  })
}

// 页面加载时获取历史记录
onMounted(async () => {
  try {
    const result = await historyStore.getHistoryListApi()
    if (!result?.success) historyStore.loadHistory()
  } catch (error) {
    console.error('浏览历史页面：API请求异常', error)
    historyStore.loadHistory()
  }
})
</script>

<style scoped>
.history-container {
  min-height: 100vh;
  padding-top: 46px;
  padding-bottom: 20px;
  background-color: #f7f8fa;
}

.history-list {
  padding: 10px;
}

.history-item {
  position: relative;
  margin-bottom: 10px;
  overflow: hidden;
  background-color: #fff;
  border-radius: 8px;
}

.news-item {
  display: flex;
  padding: 10px 0;
}

.news-image {
  width: 120px;
  height: 80px;
  flex-shrink: 0;
  margin-right: 12px;
}

.news-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.news-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
}

.news-title {
  display: -webkit-box;
  margin-bottom: 8px;
  overflow: hidden;
  font-size: 16px;
  font-weight: bold;
  line-height: 1.4;
  text-overflow: ellipsis;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.news-meta {
  display: flex;
  flex-wrap: wrap;
  color: #999;
  font-size: 12px;
}

.news-meta span {
  margin-right: 10px;
}

.delete-btn {
  position: absolute;
  top: 50%;
  right: 10px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border-radius: 50%;
  transform: translateY(-50%);
}
</style>