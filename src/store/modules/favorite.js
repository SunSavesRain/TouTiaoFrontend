import { defineStore } from 'pinia'
import { useUserStore } from '../user'
import request from '../../utils/request'

export const useFavoriteStore = defineStore('favorite', {
  state: () => ({
    // 后端返回的收藏列表
    favorites: [],
    favoriteStatus: {},
    loading: false,
  }),

  getters: {
    getFavorites: (state) => state.favorites,
    // 只读取已经查询过的收藏状态，？？为前者不是null 或 undefined就用它
    isFavorite: (state) => (newsId) => {
      return state.favoriteStatus[newsId] ?? false
    },
  },

  actions: {
    // 检查某篇新闻是否已收藏
    async checkFavoriteStatusApi(newsId) {
      const userStore = useUserStore()
      // 游客直接认为未收藏
      if (!userStore.getLoginStatus) {
        return {
          success: false,
          isFavorite: false,
          message: '请先登录'
        }
      }
      try {
        const response = await request.get('/api/favorite/check', {
          params: {
            newsId
          }
        })
        if (response.data.code === 200) {
          const status = response.data.data.isFavorite
          // 把后端查询结果保存下来
          this.favoriteStatus[newsId] = status
          return {
            success: true,
            isFavorite: status
          }
        }
        return {
          success: false,
          message: response.data.message || '获取收藏状态失败'
        }
      } catch (error) {
        console.error('检查收藏状态请求失败:', error)

        return {
          success: false,
          message: '获取收藏状态失败'
        }
      }
    },

    // 添加收藏
    async addFavoriteApi(newsId) {
      const userStore = useUserStore()
      if (!userStore.getLoginStatus) {
        return {
          success: false,
          message: '请先登录'
        }
      }
      try {
        const response = await request.post(
          '/api/favorite/add',
          {
            newsId
          }
        )
        if (response.data.code === 200) {
          // 收藏成功，直接更新本地状态
          this.favoriteStatus[newsId] = true
          return {
            success: true,
            data: response.data.data
          }
        }
        return {
          success: false,
          message: response.data.message || '收藏失败'
        }
      } catch (error) {
        console.error('添加收藏请求失败:', error)
        return {
          success: false,
          message: error.response?.data?.message || '收藏失败'
        }
      }
    },
    // 取消收藏
    async removeFavoriteApi(newsId) {
      const userStore = useUserStore()
      if (!userStore.getLoginStatus) {
        return {
          success: false,
          message: '请先登录'
        }
      }
      try {
        const response = await request.delete(
          '/api/favorite/remove',
          {
            params: {
              newsId
            }
          }
        )
        if (response.data.code === 200) {
          // 收藏状态改成 false
          this.favoriteStatus[newsId] = false
          // 如果当前收藏列表中有这一条，也一起删掉
          this.favorites = this.favorites.filter(
            item => item.id !== newsId
          )
          return {
            success: true
          }
        }
        return {
          success: false,
          message: response.data.message || '取消收藏失败'
        }
      } catch (error) {
        console.error('取消收藏请求失败:', error)
        return {
          success: false,
          message: error.response?.data?.message || '取消收藏失败'
        }
      }
    },
    // 点击收藏按钮
    async toggleFavorite(news) {
      const userStore = useUserStore()
      if (!news || !news.id) {
        console.error('无效的新闻对象:', news)
        return {
          success: false,
          message: '新闻数据错误'
        }
      }
      // 游客禁止收藏
      if (!userStore.getLoginStatus) {
        return {
          success: false,
          message: '请先登录后收藏'
        }
      }
      // 先向后端确认真实收藏状态
      const statusResult =
        await this.checkFavoriteStatusApi(news.id)
      if (!statusResult.success) {
        return statusResult
      }
      if (statusResult.isFavorite) {
        // 已收藏 → 取消
        const result =
          await this.removeFavoriteApi(news.id)
        if (result.success) {
          return {
            success: true,
            isFavorite: false
          }
        }
        return result
      }
      // 未收藏 → 添加
      const result =
        await this.addFavoriteApi(news.id)
      if (result.success) {
        return {
          success: true,
          isFavorite: true
        }
      }
      return result
    },
    // 获取收藏列表
    async getFavoriteListApi(page = 1, pageSize = 10) {
      const userStore = useUserStore()
      if (!userStore.getLoginStatus) {
        return {
          success: false,
          message: '请先登录'
        }
      }
      try {
        this.loading = true
        const response = await request.get(
          '/api/favorite/list',
          {
            params: {
              page,
              pageSize
            }
          }
        )
        if (response.data.code === 200) {
          const list = response.data.data.list
          this.favorites = list
          // 收藏列表里面出现的新闻肯定都是已收藏
          list.forEach(item => {
            this.favoriteStatus[item.id] = true
          })
          return {
            success: true,
            data: response.data.data
          }
        }
        return {
          success: false,
          message: response.data.message || '获取收藏列表失败'
        }
      } catch (error) {
        console.error('获取收藏列表失败:', error)
        return {
          success: false,
          message: '网络请求失败'
        }
      } finally {
        this.loading = false
      }
    },
    // 清空收藏
    async clearFavoritesApi() {
      const userStore = useUserStore()
      if (!userStore.getLoginStatus) {
        return {
          success: false,
          message: '请先登录'
        }
      }
      try {
        const response = await request.delete(
          '/api/favorite/clear'
        )
        if (response.data.code === 200) {
          this.favorites = []
          this.favoriteStatus = {}
          return {
            success: true
          }
        }
        return {
          success: false,
          message: response.data.message || '清空收藏失败'
        }
      } catch (error) {
        console.error('清空收藏失败:', error)
        return {
          success: false,
          message: '网络请求失败'
        }
      }
    },
    // 用户退出登录时调用
    clearFavoriteState() {
      this.favorites = []
      this.favoriteStatus = {}
    }
  }
})