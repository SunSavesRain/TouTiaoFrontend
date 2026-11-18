<template>
  <div class="home">
    <van-nav-bar :title="$t('home.title')" fixed />
    <!-- 右侧功能入口 -->
    <div class="more-options">
      <div class="hot-tab" @click="goToHot">
        {{ $t('home.hot') }}
        <van-icon name="arrow" />
      </div>
      <div class="more-tab" @click="goToCategory">
        {{ $t('home.more') }}
        <van-icon name="arrow" />
      </div>
      <div class="search-tab" @click="goToSearch">
        {{ $t('common.search') }}
        <van-icon name="search" />
      </div>
    </div>

    <!-- 新闻分类 -->
    <div class="category-tabs">
      <van-tabs v-model:active="activeTab" sticky swipeable animated>
        <van-tab v-for="category in displayCategories" :key="category.id"
                 :title="getCategoryTranslation(category.name)">
          <van-pull-refresh v-model="newsStore.refreshing" @refresh="onRefresh">
            <van-list v-model:loading="newsStore.loading" :finished="newsStore.finished"
                      :finished-text="$t('home.noMore')" @load="onLoad">
              <NewsItem v-for="item in newsStore.newsList" :key="item.id" :news="item" />
            </van-list>
          </van-pull-refresh>
        </van-tab>
      </van-tabs>
    </div>

    <TabBar />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useNewsStore } from '../store/modules/news'
import NewsItem from '../components/NewsItem.vue'
import TabBar from '../components/TabBar.vue'

const newsStore = useNewsStore()
const router = useRouter()
const route = useRoute()
const { t } = useI18n()

const activeTab = ref(0)
const tabsTop = ref(0)

// 显示的新闻分类
const displayCategories = computed(() => {
  return newsStore.categories.filter(category => category.name !== '更多')
})

// 获取分类名称翻译
const getCategoryTranslation = categoryName => {
  const categoryMap = {
    '头条': 'headline',
    '社会': 'society',
    '国内': 'domestic',
    '国际': 'international',
    '娱乐': 'entertainment',
    '体育': 'sports',
    '军事': 'military',
    '科技': 'technology',
    '财经': 'finance',
    '更多': 'more'
  }
  const key = categoryMap[categoryName]
  return key ? t(`home.categories.${key}`) : categoryName
}

// 跳转
const goToHot = () => router.push('/hot')
const goToCategory = () => router.push('/category')
const goToSearch = () => router.push('/search')

// 获取分类栏位置
const updateTabsPosition = () => {
  const tabsElement = document.querySelector('.van-tabs__wrap')
  if (tabsElement) tabsTop.value = tabsElement.getBoundingClientRect().top
}

// 页面滚动
const handleScroll = () => updateTabsPosition()

// 下拉刷新
const onRefresh = () => newsStore.getNewsList(true)

// 上拉加载更多
const onLoad = () => newsStore.getNewsList()

// 监听当前分类
watch(activeTab, newVal => {
  const category = displayCategories.value[newVal]
  if (category) newsStore.changeCategory(category.id)
})

// 监听从分类页面返回时携带的 categoryId
watch(
  () => route.query.categoryId,
  newCategoryId => {
    if (!newCategoryId) return
    const categoryId = Number(newCategoryId)
    const index = displayCategories.value.findIndex(category => category.id === categoryId)
    if (index !== -1) activeTab.value = index
  }
)

// 页面加载
onMounted(async () => {
  await newsStore.getCategories()
  if (route.query.categoryId) {
    const categoryId = Number(route.query.categoryId)
    const index = displayCategories.value.findIndex(category => category.id === categoryId)
    if (index !== -1) {
      activeTab.value = index
      newsStore.currentCategory = categoryId
    }
  }
  await newsStore.getNewsList()
  setTimeout(updateTabsPosition, 300)
  window.addEventListener('scroll', handleScroll)
})

// 页面销毁
onBeforeUnmount(() => window.removeEventListener('scroll', handleScroll))
</script>

<style scoped>
.home {
  min-height: 100vh;
  padding-top: 46px;
  padding-bottom: 50px;
  background-color: #f7f8fa;
}

.category-tabs {
  position: relative;
  margin-bottom: 10px;
}

:deep(.van-tabs__wrap) {
  background-color: #fff;
}

:deep(.van-tab) {
  font-size: 14px;
}

:deep(.van-tab--active) {
  color: #1989fa;
  font-weight: bold;
}

/* 右侧热点榜 + 更多 */
.more-options {
  position: fixed;
  top: v-bind('tabsTop + "px"');
  right: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  height: auto;
}

.hot-tab,
.search-tab,
.more-tab {
  position: relative;
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 82px;
  height: 44px;
  padding: 0 10px;
  color: #1989fa;
  font-size: 14px;
  font-weight: bold;
  white-space: nowrap;
  background-color: #fff;
  border-radius: 4px 0 0 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

.hot-tab {
  border-bottom: 1px solid #f5f5f5;
}
</style>