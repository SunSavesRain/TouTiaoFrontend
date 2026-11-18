<template>
  <div class="news-detail">
    <van-nav-bar :title="$t('detail.title')" :left-text="$t('common.back')" left-arrow fixed
                 @click-left="onClickLeft" />
    <div v-if="newsStore.newsDetail.id" class="detail-content">
      <!-- 新闻标题 -->
      <div class="title-container">
        <h1 class="title">{{ newsStore.newsDetail.title }}</h1>
        <van-button class="favorite-btn" :icon="isFavorite ? 'star' : 'star-o'"
                    :class="{ 'is-favorite': isFavorite }" @click="toggleFavorite" />
      </div>
      <!-- 新闻信息 -->
      <div class="info">
        <span>{{ newsStore.newsDetail.author }}</span>
        <span>{{ newsStore.newsDetail.publishTime }}</span>
        <span>{{ newsStore.newsDetail.views }} {{ $t('home.reading') }}</span>
      </div>
      <!-- 新闻图片 -->
      <div v-if="newsStore.newsDetail.image" class="cover">
        <img :src="getImageUrl(newsStore.newsDetail.image)"
             :alt="newsStore.newsDetail.title">
      </div>
      <!-- 新闻正文 -->
      <div class="content">
        <p v-for="(paragraph, index) in contentParagraphs" :key="index">
          {{ paragraph }}
        </p>
      </div>
      <!-- 相关推荐 -->
      <div v-if="newsStore.newsDetail.relatedNews?.length" class="related-news">
        <h3>{{ $t('detail.relatedNews') }}</h3>
        <div class="related-list">
          <div v-for="item in newsStore.newsDetail.relatedNews" :key="item.id"
               class="related-item" @click="goToRelatedNews(item.id)">
            <div v-if="item.image" class="related-image">
              <img :src="getImageUrl(item.image)" :alt="item.title">
            </div>
            <div class="related-title">{{ item.title }}</div>
          </div>
        </div>
      </div>
      <!-- 评论区域 -->
      <div class="comment-section">
        <div class="comment-header">
          <div class="comment-title">
            <span>{{ $t('comment.title') }}</span>
            <span class="comment-count">{{ commentStore.commentCount }}</span>
          </div>
        </div>
        <!-- 发表评论 -->
        <div class="comment-publish">
          <div class="comment-user">
            <img v-if="userStore.userInfo?.avatar"
                 :src="getImageUrl(userStore.userInfo.avatar)"
                 class="comment-user-avatar">
            <van-icon v-else name="user-circle-o" class="comment-user-icon" />
            <span v-if="userStore.getLoginStatus">
              {{ userStore.userInfo?.username }}
            </span>
            <span v-else class="not-login" @click="goToLogin">
              {{ $t('comment.loginTip') }}
            </span>
          </div>
          <van-field v-model="commentContent" type="textarea" rows="3" autosize
                     maxlength="500" show-word-limit
                     :placeholder="$t('comment.placeholder')"
                     :disabled="!userStore.getLoginStatus" />
          <div class="publish-action">
            <van-button round size="small" type="primary" :loading="commentStore.submitting"
                        :disabled="!userStore.getLoginStatus" @click="submitComment">
              {{ $t('comment.publish') }}
            </van-button>
          </div>
        </div>

        <!-- 评论加载 -->
        <div v-if="commentStore.loading" class="comment-loading">
          <van-loading vertical>{{ $t('common.loading') }}</van-loading>
        </div>
        <!-- 评论列表 -->
        <div v-else-if="commentStore.comments.length" class="comment-list">
          <div v-for="item in commentStore.comments" :key="item.id" class="comment-item">
            <div class="comment-avatar">
              <img v-if="item.avatar" :src="getImageUrl(item.avatar)" :alt="item.username">
              <van-icon v-else name="user-circle-o" />
            </div>
            <div class="comment-main">
              <div class="comment-top">
                <div>
                  <div class="comment-username">{{ item.nickname || item.username }}</div>
                  <div class="comment-time">{{ item.createdAt }}</div>
                </div>
                <van-icon v-if="canDeleteComment(item)" name="delete-o"
                          class="comment-delete" @click="confirmDeleteComment(item.id)" />
              </div>
              <div class="comment-content">{{ item.content }}</div>
            </div>
          </div>
          <van-button v-if="commentStore.hasMore" block plain size="small"
                      :loading="commentStore.loading" @click="loadMoreComments">
            加载更多
          </van-button>
        </div>

        <!-- 暂无评论 -->
        <div v-else class="comment-empty">
          <van-icon name="comment-o" class="comment-empty-icon" />
          <div class="comment-empty-text">{{ $t('comment.empty') }}</div>
        </div>
      </div>
    </div>
    <van-empty v-else :description="$t('common.loading')" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { showDialog, showToast } from 'vant'
import { useNewsStore } from '../store/modules/news'
import { useHistoryStore } from '../store/modules/history'
import { useFavoriteStore } from '../store/modules/favorite'
import { useCommentStore } from '../store/modules/comment'
import { useUserStore } from '../store/user'
import { apiConfig } from '../config/api'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const newsStore = useNewsStore()
const historyStore = useHistoryStore()
const favoriteStore = useFavoriteStore()
const commentStore = useCommentStore()
const userStore = useUserStore()

const commentContent = ref('')

// 当前新闻ID
const newsId = computed(() => Number(route.params.id))

// 新闻正文分段
const contentParagraphs = computed(() => {
  if (!newsStore.newsDetail.content) return []
  return newsStore.newsDetail.content.split('\n\n').filter(paragraph => paragraph.trim())
})

// 当前收藏状态
const isFavorite = computed(() => favoriteStore.isFavorite(newsId.value))

// 获取图片完整地址
const getImageUrl = image => {
  if (!image) return ''
  if (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('blob:')) return image
  return `${apiConfig.baseURL}${image}`
}

// 返回
const onClickLeft = () => router.back()

// 进入登录页
const goToLogin = () => router.push('/login')

// 进入相关新闻
const goToRelatedNews = id => router.push(`/news/detail/${id}`)

// 切换收藏
const toggleFavorite = async () => {
  if (!userStore.getLoginStatus) {
    showToast({ message: t('detail.loginFavorite'), position: 'bottom' })
    router.push('/login')
    return
  }
  const result = await favoriteStore.toggleFavorite(newsStore.newsDetail)
  if (!result.success) {
    showToast({ message: result.message || t('detail.operationFailed'), position: 'bottom' })
    return
  }
  showToast({
    message: result.isFavorite ? t('detail.favoriteSuccess') : t('detail.favoriteCancel'),
    position: 'bottom'
  })
}

// 发表评论
const submitComment = async () => {
  if (!userStore.getLoginStatus) {
    showToast(t('comment.loginTip'))
    return
  }
  const content = commentContent.value.trim()
  if (!content) {
    showToast(t('comment.emptyContent'))
    return
  }
  const result = await commentStore.addComment(newsId.value, content)
  if (!result.success) {
    showToast(result.message || t('comment.publishFailed'))
    return
  }

  commentContent.value = ''
  showToast({ message: t('comment.publishSuccess'), position: 'bottom' })
}

// 判断是否可以删除评论
const canDeleteComment = comment => {
  if (!userStore.getLoginStatus) return false
  const currentUser = userStore.userInfo
  if (currentUser?.role === 'admin') return true
  return comment.userId === currentUser?.id
}

// 删除评论
const deleteComment = async commentId => {
  const result = await commentStore.removeComment(commentId)
  if (result.success) {
    showToast({ message: t('comment.deleteSuccess'), position: 'bottom' })
  } else {
    showToast({ message: result.message || t('comment.deleteFailed'), position: 'bottom' })
  }
}

// 确认删除评论
const confirmDeleteComment = commentId => {
  showDialog({
    title: t('common.confirm'),
    message: t('comment.deleteConfirm'),
    showCancelButton: true,
    confirmButtonText: t('common.confirm'),
    cancelButtonText: t('common.cancel')
  }).then(action => {
    if (action === 'confirm') deleteComment(commentId)
  })
}

// 加载更多评论
const loadMoreComments = async () => {
  await commentStore.getCommentList(newsId.value, commentStore.page + 1)
}

// 页面加载
onMounted(async () => {
  await newsStore.getNewsDetail(newsId.value)
  if (newsStore.newsDetail.id && userStore.getLoginStatus) {
    try {
      await historyStore.addHistoryApi(newsStore.newsDetail.id)
    } catch (error) {
      console.error('记录浏览历史失败:', error)
    }
    await favoriteStore.checkFavoriteStatusApi(newsStore.newsDetail.id)
  }
  if (newsStore.newsDetail.id) {
    await commentStore.getCommentList(newsStore.newsDetail.id)
  }
})
</script>

<style scoped>
.news-detail {
  min-height: 100vh;
  padding-top: 46px;
  background-color: #f7f8fa;
}

.detail-content {
  padding: 18px 16px 0;
  background-color: #fff;
}

.title-container {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12px;
}

.title {
  flex: 1;
  margin: 0;
  color: #222;
  font-size: 22px;
  font-weight: bold;
  line-height: 1.45;
}

.favorite-btn {
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  margin-left: 12px;
  padding: 0;
  border-radius: 50%;
}

.favorite-btn.is-favorite {
  color: #ff9500;
}

.info {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 18px;
  color: #999;
  font-size: 12px;
}

.info span {
  margin-right: 12px;
}

.cover {
  margin-bottom: 18px;
}

.cover img {
  display: block;
  width: 100%;
  border-radius: 8px;
}

.content {
  color: #333;
  font-size: 16px;
  line-height: 1.9;
}

.content p {
  margin-bottom: 18px;
  text-align: justify;
}

.related-news {
  margin: 28px -16px 0;
  padding: 20px 16px;
  border-top: 10px solid #f7f8fa;
}

.related-news h3 {
  margin: 0 0 16px;
  font-size: 18px;
}

.related-list {
  display: flex;
  flex-direction: column;
}

.related-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f2f3f5;
  cursor: pointer;
}

.related-item:last-child {
  border-bottom: none;
}

.related-image {
  width: 92px;
  height: 66px;
  flex-shrink: 0;
  margin-right: 12px;
}

.related-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}

.related-title {
  flex: 1;
  color: #333;
  font-size: 15px;
  line-height: 1.5;
}

/* 评论区域 */
.comment-section {
  margin: 0 -16px;
  padding: 20px 16px 40px;
  border-top: 10px solid #f7f8fa;
}

.comment-header {
  margin-bottom: 16px;
}

.comment-title {
  display: flex;
  align-items: center;
  color: #333;
  font-size: 18px;
  font-weight: bold;
}

.comment-count {
  margin-left: 8px;
  color: #999;
  font-size: 13px;
  font-weight: normal;
}

/* 评论输入 */
.comment-publish {
  margin-bottom: 20px;
  padding: 14px;
  background-color: #f7f8fa;
  border-radius: 12px;
}

.comment-user {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  color: #555;
  font-size: 14px;
}

.comment-user-avatar {
  display: block;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  margin-right: 6px;
  object-fit: cover;
  border-radius: 50%;
}

.comment-user-icon {
  margin-right: 6px;
  color: #1989fa;
  font-size: 20px;
}

.not-login {
  color: #1989fa;
  cursor: pointer;
}

.comment-publish :deep(.van-cell) {
  padding: 10px 12px;
  background-color: #fff;
  border-radius: 8px;
}

.publish-action {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

/* 评论列表 */
.comment-loading {
  padding: 30px 0;
}

.comment-list {
  margin-top: 6px;
}

.comment-item {
  display: flex;
  padding: 18px 0;
  border-bottom: 1px solid #f2f3f5;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-avatar {
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  margin-right: 12px;
}

.comment-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.comment-avatar :deep(.van-icon) {
  color: #c8c9cc;
  font-size: 38px;
}

.comment-main {
  flex: 1;
  min-width: 0;
}

.comment-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.comment-username {
  color: #555;
  font-size: 14px;
  font-weight: 500;
}

.comment-time {
  margin-top: 3px;
  color: #aaa;
  font-size: 11px;
}

.comment-delete {
  padding: 4px;
  color: #bbb;
  font-size: 17px;
  cursor: pointer;
}

.comment-content {
  margin-top: 10px;
  color: #333;
  font-size: 15px;
  line-height: 1.6;
  word-break: break-word;
}

.comment-empty {
  padding: 40px 0;
  text-align: center;
}

.comment-empty-icon {
  color: #c8c9cc;
  font-size: 46px;
}

.comment-empty-text {
  margin-top: 12px;
  color: #969799;
  font-size: 14px;
}
</style>