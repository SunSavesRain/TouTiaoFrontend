import { defineStore } from 'pinia'
import request from '../../utils/request'

export const useNewsStore = defineStore('news', {
  state: () => ({
    newsList: [],
    newsDetail: {},
    categories: [],
    hotNews: [],
    hotSearches: [],
    searchResults: [],
    searchKeyword: '',
    currentCategory: 1,
    loading: false,
    refreshing: false,
    finished: false,
    categoriesLoading: false,
    hotLoading: false,
    searchLoading: false
  }),

  actions: {
    // 获取新闻分类
    async getCategories() {
      if (this.categoriesLoading) return
      this.categoriesLoading = true
      try {
        const response = await request.get('/api/news/categories')
        if (response.data && response.data.code === 200) {
          this.categories = [...response.data.data, { id: 10, name: '更多' }]
        }
      } catch (error) {
        console.error('获取新闻分类失败:', error)
      } finally {
        this.categoriesLoading = false
      }
    },
    // 获取热门搜索
    async getHotSearches(limit = 10) {
      try {
        const response = await request.get('/api/news/hot-search', {
          params: { limit }
        })
        if (response.data && response.data.code === 200) {
          this.hotSearches = response.data.data || []
          return {success: true, data: this.hotSearches}
        }
        this.hotSearches = []
        return {success: false}
      } catch (error) {
        console.error('获取热门搜索失败:', error)
        this.hotSearches = []
        return {success: false}
      }
    },
    // 获取新闻列表，isRefresh代表是不是刷新
    async getNewsList(isRefresh = false) {
      const pageSize = 10
      if (isRefresh) {
        this.refreshing = true
        this.finished = false
      }
      this.loading = true
      try {
        const params = {
          categoryId: this.currentCategory,
          page: isRefresh ? 1 : Math.ceil(this.newsList.length / pageSize) + 1,
          pageSize
        }
        const response = await request.get('/api/news/list', {
          params
        })
        if (response.data && response.data.code === 200) {
          const newsData = response.data.data.list || []
          if (isRefresh) {
            this.newsList = newsData
          } else {
            this.newsList = [...this.newsList, ...newsData]
          }
          if (newsData.length < pageSize) {
            this.finished = true
          }
        }
      } catch (error) {
        console.error('获取新闻列表失败:', error)
      } finally {
        this.loading = false
        this.refreshing = false
      }
    },

    // 获取热点新闻
    async getHotNews(limit = 20) {
      if (this.hotLoading) {
        return {
          success: false,
          message: '热点新闻正在加载'
        }
      }
      this.hotLoading = true
      try {
        const response = await request.get('/api/news/hot', {
          params: {limit}
        })
        if (response.data && response.data.code === 200) {
          this.hotNews = response.data.data.list || []
          return {
            success: true,
            data: this.hotNews
          }
        }
        return {
          success: false,
          message: response.data.message
        }
      } catch (error) {
        console.error('获取热点新闻失败:', error)
        return {
          success: false,
          message: '网络请求失败'
        }
      } finally {
        this.hotLoading = false
      }
    },

    // 搜索新闻
    async searchNews(keyword, page = 1, pageSize = 20) {
      this.searchLoading = true
      this.searchKeyword = keyword
      try {
        const response = await request.get('/api/news/search', {
          params: {keyword, page, pageSize}})
        if (response.data && response.data.code === 200) {
          this.searchResults = response.data.data.list || []
          return {
            success: true,
            data: this.searchResults,
            total: response.data.data.total || 0
          }
        }
        this.searchResults = []
        return {
          success: false,
          message: response.data.message
        }
      } catch (error) {
        console.error('搜索新闻失败:', error)
        this.searchResults = []
        return {
          success: false,
          message: error.response?.data?.message
        }
      } finally {
        this.searchLoading = false
      }
    },

    // 清空搜索结果
    clearSearchResults() {
      this.searchResults = []
      this.searchKeyword = ''
    },

    // 获取新闻详情
    async getNewsDetail(id) {
      try {
        const response = await request.get('/api/news/detail', {
          params: {
            id
          }
        })
        if (response.data && response.data.code === 200) {
          this.newsDetail = response.data.data
          return {
            success: true,
            data: response.data.data
          }
        }
        return {
          success: false,
          message: response.data.message || '获取新闻详情失败'
        }
      } catch (error) {
        console.error('获取新闻详情失败:', error)
        return {
          success: false,
          message: '网络请求失败'
        }
      }
    },

    // 切换新闻分类
    changeCategory(categoryId) {
      if (this.currentCategory !== categoryId) {
        this.currentCategory = categoryId
        this.newsList = []
        this.finished = false
        this.getNewsList(true)
      }
    },

    // 获取分类名称
    getCategoryName(categoryId) {
      const category = this.categories.find(item => item.id === categoryId)
      return category ? category.name : '未知'
    }
  }
})