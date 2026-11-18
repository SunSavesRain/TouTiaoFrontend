import { defineStore } from 'pinia'
import request from '../../utils/request'

//state里的量均为响应式
export const useCommentStore = defineStore('comment', {
  state: () => ({
    comments: [],
    loading: false,
    submitting: false,
    total: 0,
    page: 1,
    pageSize: 10,
    hasMore: false
  }),

  getters: {
    commentCount: (state) => state.total
  },

  actions: {
    // 获取某篇新闻的评论
    async getCommentList(newsId, page = 1) {
      this.loading = true
      try {
        const response = await request.get('/api/comments', {
          params: {
            newsId,
            page,
            pageSize: this.pageSize
          }
        })
        if (response.data?.code === 200) {
          const data = response.data.data
          if (page === 1) {
            this.comments = data.list || []
          } else {
            //...为展开运算符
            this.comments.push(...(data.list || []))
          }
          this.total = data.total || 0
          this.hasMore = data.hasMore || false
          this.page = page
          return {
            success: true,
            data: this.comments
          }
        }
        return {
          success: false,
          message: response.data?.message || '获取评论失败'
        }
      } catch (error) {
        console.error('获取评论失败:', error)
        return {
          success: false,
          message: error.response?.data?.detail || '获取评论失败'
        }
      } finally {
        this.loading = false
      }
    },
    // 发表评论
    async addComment(newsId, content) {
      if (this.submitting) {
        return {
          success: false,
          message: '正在提交评论'
        }
      }
      this.submitting = true
      try {
        const response = await request.post('/api/comments', {
          newsId,
          content
        })
        if (response.data?.code === 200) {
          const newComment = response.data.data
          this.comments.unshift(newComment)
          this.total += 1
          return {
            success: true,
            data: newComment
          }
        }
        return {
          success: false,
          message: response.data?.message || '发表评论失败'
        }
      } catch (error) {
        console.error('发表评论失败:', error)
        return {
          success: false,
          message: error.response?.data?.detail || '发表评论失败'
        }
      } finally {
        this.submitting = false
      }
    },

    // 删除评论
    async removeComment(commentId) {
      try {
        const response = await request.delete(
          `/api/comments/${commentId}`
        )
        if (response.data?.code === 200) {
          this.comments = this.comments.filter(
            item => item.id !== commentId
          )
          if (this.total > 0) {
            this.total -= 1
          }
          return {
            success: true
          }
        }
        return {
          success: false,
          message: response.data?.message || '删除评论失败'
        }
      } catch (error) {
        console.error('删除评论失败:', error)
        return {
          success: false,
          message: error.response?.data?.detail || '删除评论失败'
        }
      }
    },
    // 清空当前页面评论状态
    clearComments() {
      this.comments = []
      this.total = 0
      this.page = 1
      this.hasMore = false
    }
  }
})