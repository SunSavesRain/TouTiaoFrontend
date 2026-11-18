import { defineStore } from 'pinia'
import { useUserStore } from '../user'
import request from '../../utils/request'
//创建一个名字叫 history 的 Pinia Store,这个 Store的history存储历史，初始值是空数组
//后面的this都是在store里面表示store
export const useHistoryStore = defineStore('history', {
  state: () => ({
    history: [],
  }),

  getters: {
    //返回state里面的历史记录
    getHistory: (state) => state.history,
  },

  actions: {
    // 添加浏览历史 - API请求
    async addHistoryApi(newsId) {
      const userStore = useUserStore()
      if (!userStore.getLoginStatus) {
        return { success: false, message: '请先登录' }
      }
      try {
        const response = await request.post('/api/history/add', {
          newsId
        })
        if (response.data.code === 200) {
          return { success: true, data: response.data.data }
        } else {
          return { success: false, message: response.data.message || '添加浏览历史失败' }
        }
      } catch (error) {
        console.error('添加浏览历史请求失败:', error)
        return { success: false, message: '网络请求失败' }
      }
    },

    // 添加浏览历史 - 本地
    addHistory(news) {
      const existingIndex = this.history.findIndex(item => item.id === news.id)
      if (existingIndex !== -1) {
        this.history.splice(existingIndex, 1)
      }
      this.history.unshift({
        ...news,
        viewTime: new Date().toLocaleString()
      })
      if (this.history.length > 50) {
        this.history.pop()
      }
      this.saveHistory()
    },

    // 清空浏览历史
    clearHistory() {
      this.history = []
      this.saveHistory()
    },

    // 清空浏览历史 - API请求
    async clearHistoryApi() {
      const userStore = useUserStore()
      if (!userStore.getLoginStatus) {
        console.log('清空浏览历史API：用户未登录，使用本地操作')
        this.clearHistory()
        return { success: true, isLocal: true }
      }
      try {
        console.log('清空浏览历史API：开始请求')
        const response = await request.delete('/api/history/clear')
        if (response.data.code === 200) {
          console.log('清空浏览历史API：清空成功')
          this.clearHistory()
          return { success: true }
        } else {
          console.error('清空浏览历史API：请求失败', response.data.message)
          return { success: false, message: response.data.message || '清空浏览历史失败' }
        }
      } catch (error) {
        console.error('清空浏览历史API：请求异常', error)
        return { success: false, message: '网络请求失败' }
      }
    },

    // 删除单条浏览历史
    removeHistory(id) {
      this.history = this.history.filter(item => item.id !== id)
      this.saveHistory()
    },

    // 删除单条浏览历史 - API请求
    async removeHistoryApi(id) {
      const userStore = useUserStore()
      if (!userStore.getLoginStatus) {
        console.log('删除浏览历史API：用户未登录，使用本地操作')
        this.removeHistory(id)
        return { success: true, isLocal: true }
      }
      try {
        console.log('删除浏览历史API：开始请求', id)
        const response = await request.delete(`/api/history/delete/${id}`)
        if (response.data.code === 200) {
          console.log('删除浏览历史API：删除成功')
          this.removeHistory(id)
          return { success: true }
        } else {
          console.error('删除浏览历史API：请求失败', response.data.message)
          return { success: false, message: response.data.message || '删除浏览历史失败' }
        }
      } catch (error) {
        console.error('删除浏览历史API：请求异常', error)
        return { success: false, message: '网络请求失败' }
      }
    },

    // 保存到本地存储
    saveHistory() {
      localStorage.setItem('news_history', JSON.stringify(this.history))
    },

    // 从本地存储加载
    loadHistory() {
      const savedHistory = localStorage.getItem('news_history')
      if (savedHistory) {
        this.history = JSON.parse(savedHistory)
      }
    },

    // 获取浏览历史 - API请求
    async getHistoryListApi() {
      const userStore = useUserStore()
      if (!userStore.getLoginStatus) {
        console.log('获取浏览历史API：用户未登录，使用本地数据')
        return { success: false, message: '请先登录', isLocal: true }
      }
      try {
        console.log('获取浏览历史API：开始请求')
        const response = await request.get('/api/history/list')
        if (response.data.code === 200) {
          const historyList = response.data.data.list || []
          this.history = historyList
          this.saveHistory()
          return { success: true, data: historyList }
        } else {
          return { success: false, message: response.data.message || '获取浏览历史失败' }
        }
      } catch (error) {
        console.error('获取浏览历史API：请求异常', error)
        return { success: false, message: '网络请求失败' }
      }
    },
  },
})