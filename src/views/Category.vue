<template>
  <div class="category">
    <van-nav-bar
      :title="$t('common.allCategories')" :left-text="$t('common.back')"
      left-arrow @click-left="onClickLeft" fixed/>

    <div class="category-container">
      <van-grid :column-num="3" :border="false" :gutter="12">
        <van-grid-item
          v-for="category in displayCategories" :key="category.id"
          @click="goToCategoryNews(category.id)">
          <van-icon name="newspaper-o" class="category-icon"/>
          <span class="category-name">
            {{ getCategoryTranslation(category.name) }}
          </span>
        </van-grid-item>
      </van-grid>
    </div>

    <tab-bar />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useNewsStore } from '../store/modules/news'
import TabBar from '../components/TabBar.vue'

const newsStore = useNewsStore()
const router = useRouter()
const { t } = useI18n()

// 显示的分类
const displayCategories = computed(() => {
  return newsStore.categories.filter(
    category => category.name !== '更多'
  )
})

// 返回上一页
const onClickLeft = () => {
  router.back()
}

// 跳转到对应分类
const goToCategoryNews = (categoryId) => {
  newsStore.changeCategory(categoryId)
  router.push({
    path: '/home',
    query: {
      categoryId
    }
  })
}

// 分类名称翻译
const getCategoryTranslation = (categoryName) => {
  const categoryMap = {
    '头条': 'headline',
    '社会': 'society',
    '国内': 'domestic',
    '国际': 'international',
    '娱乐': 'entertainment',
    '体育': 'sports',
    '军事': 'military',
    '科技': 'technology',
    '财经': 'finance'
  }
  const key = categoryMap[categoryName]
  return key ? t(`home.categories.${key}`) : categoryName
}
</script>

<style scoped>
.category {
  min-height: 100vh;
  padding-top: 46px;
  padding-bottom: 60px;
  background-color: #f7f8fa;
}

.category-container {
  padding: 16px 12px;
}

:deep(.van-grid) {
  background-color: transparent;
}

:deep(.van-grid-item__content) {
  min-height: 120px;
  padding: 20px 10px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

:deep(.van-grid-item__content:active) {
  background-color: #f2f7ff;
}

.category-icon {
  margin-bottom: 10px;
  font-size: 30px;
  color: #1989fa;
}

.category-name {
  font-size: 15px;
  color: #333;
  font-weight: 500;
}
</style>