<template>
  <div class="favorite-container">
    <van-nav-bar :title="$t('favorite.title')" :left-text="$t('common.back')" left-arrow fixed
                 :right-text="$t('favorite.clear')" @click-left="onClickLeft"
                 @click-right="onClickClear" />

    <div v-if="favoriteStore.getFavorites.length" class="favorite-list">
      <div v-for="item in favoriteStore.getFavorites" :key="item.id" class="favorite-item">
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
                  <span>{{ $t('favorite.favoriteTime') }}: {{ item.favoriteTime }}</span>
                </div>
              </div>
            </div>
          </template>
        </van-cell>

        <van-button class="delete-btn" type="danger" size="mini" icon="cross"
                    @click.stop="confirmDelete(item.id)" />
      </div>
    </div>

    <van-empty v-else :description="$t('favorite.empty')" />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { showDialog, showToast } from 'vant'
import { useFavoriteStore } from '../store/modules/favorite'
import { useUserStore } from '../store/user'
import { getImageUrl } from '../utils/image'

const router = useRouter()
const favoriteStore = useFavoriteStore()
const userStore = useUserStore()
const { t } = useI18n()

// 返回上一页
const onClickLeft = () => router.back()

// 跳转到新闻详情
const goToNewsDetail = id => router.push(`/news/detail/${id}`)

// 删除单条收藏
const removeFavorite = async id => {
  const result = await favoriteStore.removeFavoriteApi(id)

  if (result.success) {
    showToast({ message: t('favorite.removeSuccess'), position: 'bottom' })
  } else {
    showToast({ message: result.message || t('favorite.removeFailed'), position: 'bottom' })
  }
}

// 确认删除
const confirmDelete = id => {
  showDialog({
    title: t('common.tip'),
    message: t('favorite.deleteConfirm'),
    showCancelButton: true,
    confirmButtonText: t('common.confirm'),
    cancelButtonText: t('common.cancel')
  }).then(action => {
    if (action === 'confirm') removeFavorite(id)
  })
}

// 清空收藏
const onClickClear = () => {
  if (!favoriteStore.getFavorites.length) {
    showToast({ message: t('favorite.alreadyEmpty'), position: 'bottom' })
    return
  }

  showDialog({
    title: t('common.tip'),
    message: t('favorite.clearConfirm'),
    showCancelButton: true,
    confirmButtonText: t('common.confirm'),
    cancelButtonText: t('common.cancel')
  }).then(async action => {
    if (action !== 'confirm') return

    const result = await favoriteStore.clearFavoritesApi()

    if (result.success) {
      showToast({ message: t('favorite.clearSuccess'), position: 'bottom' })
    } else {
      showToast({ message: result.message || t('favorite.clearFailed'), position: 'bottom' })
    }
  })
}

// 页面加载时获取收藏列表
onMounted(async () => {
  if (!userStore.getLoginStatus) {
    showToast({ message: t('favorite.loginFirst'), position: 'bottom' })
    router.push('/login')
    return
  }

  const result = await favoriteStore.getFavoriteListApi()

  if (!result.success) {
    showToast({ message: result.message || t('favorite.loadFailed'), position: 'bottom' })
  }
})
</script>

<style scoped>
.favorite-container {
  min-height: 100vh;
  padding-top: 46px;
  padding-bottom: 20px;
  background-color: #f7f8fa;
}

.favorite-list {
  padding: 10px;
}

.favorite-item {
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