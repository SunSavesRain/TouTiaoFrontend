<template>
  <div class="search-container">
    <van-nav-bar :title="$t('search.title')" :left-text="$t('common.back')" left-arrow fixed
                 @click-left="onClickLeft" />
    <!-- 搜索栏 -->
    <div class="search-panel">
      <!--show-action是否显示右侧的操作按钮区域(取消搜索按钮）-->
      <!--第一个@search是非按钮触发搜索，比如回车 -->
      <van-search v-model="keyword" :placeholder="$t('search.placeholder')" show-action shape="round"
                  @search="onSearch" @clear="clearSearch">
        <template #action>
          <div class="search-button" @click="onSearch">{{ $t('common.search') }}</div>
        </template>
      </van-search>
    </div>

    <!-- 搜索前 -->
    <template v-if="!hasSearched">
      <!-- 最近搜索 -->
      <div v-if="searchHistory.length" class="section-card">
        <div class="section-header">
          <div class="section-title">
            <van-icon name="clock-o" />
            <span>{{ $t('search.history') }}</span>
          </div>
          <div class="section-action" @click="clearHistory">
            <van-icon name="delete-o" />
            <span>{{ $t('search.clear') }}</span>
          </div>
        </div>
        <div class="history-list">
          <div v-for="item in searchHistory" :key="item" class="history-item"
               @click="searchFromKeyword(item)">
            {{ item }}
          </div>
        </div>
      </div>
      <!-- 热门搜索 -->
      <div class="section-card">
        <div class="section-header">
          <div class="section-title hot-title">
            <van-icon name="fire-o" />
            <span>{{ $t('search.hotSearch') }}</span>
          </div>
        </div>
        <div class="hot-list">
          <div v-for="(item, index) in newsStore.hotSearches" :key="item.keyword"
               class="hot-item" @click="searchFromKeyword(item.keyword)">
            <span class="hot-rank"
                  :class="{ first: index === 0, second: index === 1, third: index === 2 }">
              {{ index + 1 }}
            </span>
            <span class="hot-keyword">{{ item.keyword }}</span>
            <van-icon name="arrow" class="hot-arrow" />
          </div>
        </div>
      </div>
    </template>

    <!-- 搜索后 -->
    <template v-else>
      <!-- 加载 -->
      <div v-if="newsStore.searchLoading" class="loading-container">
        <van-loading vertical>{{ $t('common.loading') }}</van-loading>
      </div>
      <!-- 搜索结果 -->
      <div v-else-if="newsStore.searchResults.length" class="result-container">
        <div class="result-header">
          <div class="result-title">
            <van-icon name="search" />
            <span>{{ $t('search.result') }}</span>
          </div>
          <span class="result-count">
            {{ newsStore.searchResults.length }} {{ $t('search.resultCount') }}
          </span>
        </div>
        <div class="result-list">
          <NewsItem v-for="item in newsStore.searchResults" :key="item.id" :news="item" />
        </div>
      </div>
      <!-- 无结果 -->
      <div v-else class="empty-result">
        <van-empty image="search" :description="$t('search.noResult')">
          <van-button round size="small" type="primary" @click="clearSearch">
            {{ $t('search.searchAgain') }}
          </van-button>
        </van-empty>
      </div>
    </template>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { showToast } from 'vant'
import { useNewsStore } from '../store/modules/news'
import NewsItem from '../components/NewsItem.vue'

const router = useRouter()
const newsStore = useNewsStore()
const { t } = useI18n()

const keyword = ref('')
const searchHistory = ref([])
const hasSearched = ref(false)

// 返回
const onClickLeft = () => router.back()

// 执行搜索
const onSearch = async () => {
  const value = keyword.value.trim()
  if (!value) {
    showToast(t('search.inputTip'))
    return
  }
  saveSearchHistory(value)
  hasSearched.value = true
  const result = await newsStore.searchNews(value)
  if (!result.success) {
    showToast(result.message || t('search.searchFailed'))
  }
  await newsStore.getHotSearches(10)
}

// 点击关键词搜索
const searchFromKeyword = value => {
  keyword.value = value
  onSearch()
}

// 保存搜索历史
const saveSearchHistory = value => {
  searchHistory.value = searchHistory.value.filter(item => item !== value)
  //unshift把一个元素添加到数组最前面
  searchHistory.value.unshift(value)
  if (searchHistory.value.length > 10) searchHistory.value.pop()
  localStorage.setItem('search_history', JSON.stringify(searchHistory.value))
}

// 清空搜索历史
const clearHistory = () => {
  searchHistory.value = []
  localStorage.removeItem('search_history')
}

// 加载搜索历史
const loadSearchHistory = () => {
  const history = localStorage.getItem('search_history')
  if (!history) return
  try {
    searchHistory.value = JSON.parse(history)
  } catch (error) {
    console.error('读取搜索历史失败:', error)
    searchHistory.value = []
  }
}

// 清空当前搜索
const clearSearch = () => {
  keyword.value = ''
  hasSearched.value = false
  newsStore.clearSearchResults()
}

// 页面加载
onMounted(async () => {
  loadSearchHistory()
  await newsStore.getHotSearches(10)
})

// 页面离开
onBeforeUnmount(() => newsStore.clearSearchResults())
</script>

<style scoped>
.search-container {
  min-height: 100vh;
  padding-top: 46px;
  padding-bottom: 30px;
  background-color: #f6f7f9;
}

/* 搜索栏 */
.search-panel {
  padding: 14px;
  background-color: #fff;
}

:deep(.van-search) {
  padding: 0;
  background-color: transparent;
}

:deep(.van-search__content) {
  height: 42px;
  padding-left: 14px;
  background-color: #f3f5f7;
  border-radius: 22px;
}

:deep(.van-search__field) {
  font-size: 15px;
}

:deep(.van-search__action) {
  padding-left: 10px;
  padding-right: 0;
}

:deep(.van-search__action:active) {
  background-color: transparent;
}

.search-button {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  padding: 0 20px;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  background-color: #1989fa;
  border-radius: 20px;
  box-shadow: 0 3px 8px rgba(25, 137, 250, 0.18);
  cursor: pointer;
}

.search-button:active {
  opacity: 0.85;
}

/* 卡片 */
.section-card {
  margin: 12px;
  padding: 18px 16px;
  background-color: #fff;
  border-radius: 14px;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.035);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.section-title :deep(.van-icon) {
  color: #1989fa;
  font-size: 19px;
}

.hot-title :deep(.van-icon) {
  color: #ee0a24;
}

.section-action {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 8px;
  color: #969799;
  font-size: 13px;
  border-radius: 14px;
  cursor: pointer;
}

.section-action:active {
  background-color: #f5f5f5;
}

/* 最近搜索 */
.history-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.history-item {
  max-width: 160px;
  padding: 7px 14px;
  overflow: hidden;
  color: #4b5563;
  font-size: 14px;
  white-space: nowrap;
  text-overflow: ellipsis;
  background-color: #f4f7fb;
  border: 1px solid #edf1f5;
  border-radius: 18px;
  cursor: pointer;
}

.history-item:active {
  color: #1989fa;
  background-color: #edf5ff;
  border-color: #d8eaff;
}

/* 热门搜索 */
.hot-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  column-gap: 24px;
}

.hot-item {
  display: flex;
  align-items: center;
  min-width: 0;
  height: 48px;
  border-bottom: 1px solid #f2f3f5;
  cursor: pointer;
}

.hot-item:nth-last-child(-n + 2) {
  border-bottom: none;
}

.hot-rank {
  width: 22px;
  flex-shrink: 0;
  color: #a8abb2;
  font-size: 15px;
  font-weight: 600;
  text-align: center;
}

.hot-rank.first {
  color: #ee0a24;
  font-size: 18px;
}

.hot-rank.second {
  color: #ff7a00;
  font-size: 17px;
}

.hot-rank.third {
  color: #f5b400;
  font-size: 16px;
}

.hot-keyword {
  flex: 1;
  min-width: 0;
  margin-left: 8px;
  overflow: hidden;
  color: #323233;
  font-size: 14px;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.hot-arrow {
  flex-shrink: 0;
  margin-left: 5px;
  color: #c8c9cc;
  font-size: 12px;
}

.hot-item:active .hot-keyword {
  color: #1989fa;
}

/* 搜索加载 */
.loading-container {
  display: flex;
  justify-content: center;
  padding-top: 100px;
}

/* 搜索结果 */
.result-container {
  margin-top: 12px;
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 12px 10px;
  padding: 14px 16px;
  background-color: #fff;
  border-radius: 12px;
}

.result-title {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.result-title :deep(.van-icon) {
  color: #1989fa;
}

.result-count {
  color: #969799;
  font-size: 13px;
}

.result-list {
  background-color: #fff;
}

/* 无结果 */
.empty-result {
  margin: 12px;
  padding: 30px 0;
  background-color: #fff;
  border-radius: 14px;
}
</style>