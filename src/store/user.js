import { defineStore } from 'pinia'
import request from '../utils/request'

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null,
    token: '',
    isLogin: false,
    userBio: '这是我的个人简介'
  }),

  getters: {
    getUserInfo: (state) => state.userInfo,
    getToken: (state) => state.token,
    getIsAdmin: (state) => {return state.userInfo?.role === 'admin'},
    getLoginStatus: (state) => state.isLogin,
    getUserBio: (state) => state.userInfo?.bio || state.userBio,
    getNickname: (state) => state.userInfo?.nickname || state.userInfo?.username || ''
  },

  actions: {
    async login(userData) {
      try {
        const response = await request.post('/api/user/login', {
          username: userData.username,
          password: userData.password
        })
        if (response.data && response.data.code === 200) {
          const userInfo = response.data.data.userInfo
          const token = response.data.data.token
          this.userInfo = userInfo
          this.token = token
          this.isLogin = true
          localStorage.setItem('token', token)
          return {
            success: true,
            message: '登录成功'
          }
        } else {
          return {
            success: false,
            message: response.data.message || '登录失败'
          }
        }
      } catch (error) {
        console.error('登录请求失败:', error)
        return {
          success: false,
          message: error.response?.data?.message || '登录请求失败，请稍后再试'
        }
      }
    },

    async register(userData) {
      try {
        const response = await request.post('/api/user/register', {
          username: userData.username,
          password: userData.password
        })
        if (response.data && response.data.code === 200) {
          const userInfo = response.data.data.userInfo
          const token = response.data.data.token
          this.userInfo = userInfo
          this.token = token
          this.isLogin = true
          localStorage.setItem('token', token)
          return {
            success: true,
            message: '注册成功'
          }
        } else {
          return {
            success: false,
            message: response.data.message || '注册失败'
          }
        }
      } catch (error) {
        console.error('注册请求失败:', error)
        return {
          success: false,
          message: error.response?.data?.message || '注册请求失败，请稍后再试'
        }
      }
    },

    logout() {
      this.userInfo = null
      this.token = ''
      this.isLogin = false
      localStorage.removeItem('token')
    },

    // 获取用户信息
    async getUserInfoDetail() {
      try {
        if (!this.token) {
          return {
            success: false,
            message: '未登录'
          }
        }
        const response = await request.get('/api/user/info')
        if (response.data && response.data.code === 200) {
          this.userInfo = response.data.data
          return {
            success: true,
            message: '获取用户信息成功',
            data: response.data.data
          }
        } else {
          return {
            success: false,
            message: response.data.message || '获取用户信息失败'
          }
        }
      } catch (error) {
        console.error('获取用户信息请求失败:', error)
        return {
          success: false,
          message: error.response?.data?.message || '获取用户信息请求失败，请稍后再试'
        }
      }
    },

    // 修改昵称
    async updateNickname(nickname) {
      try {
        if (!this.token) {
          return {
            success: false,
            message: '未登录'
          }
        }
        const response = await request.put('/api/user/update', {
          nickname
        })
        if (response.data && response.data.code === 200) {
          if (this.userInfo) {
            this.userInfo.nickname = nickname
          }
          return {
            success: true,
            message: '昵称修改成功'
          }
        } else {
          return {
            success: false,
            message: response.data.message || '昵称修改失败'
          }
        }
      } catch (error) {
        console.error('修改昵称请求失败:', error)
        return {
          success: false,
          message: error.response?.data?.message || '修改昵称请求失败，请稍后再试'
        }
      }
    },

    // 更新个人简介
    async updateUserBio(bio) {
      try {
        if (!this.token) {
          return {
            success: false,
            message: '未登录'
          }
        }
        const response = await request.put('/api/user/update', {
          bio
        })
        if (response.data && response.data.code === 200) {
          if (this.userInfo) {
            this.userInfo.bio = bio
          }
          return {
            success: true,
            message: '更新个人简介成功'
          }
        } else {
          return {
            success: false,
            message: response.data.message || '更新个人简介失败'
          }
        }
      } catch (error) {
        console.error('更新个人简介请求失败:', error)
        return {
          success: false,
          message: error.response?.data?.message || '更新个人简介请求失败，请稍后再试'
        }
      }
    },

    // 修改头像
    async updateAvatar(file) {
      try {
        if (!this.token) {
          return {
            success: false,
            message: '未登录'
          }
        }
        const formData = new FormData()
        formData.append('file', file)
        const response = await request.put('/api/user/avatar', formData)
        if (response.data && response.data.code === 200) {
          const avatar = response.data.data.avatar
          if (this.userInfo) {
            this.userInfo.avatar = avatar
          }
          return {
            success: true,
            avatar
          }
        }
        return {
          success: false,
          message: response.data.message || '头像修改失败'
        }
      } catch (error) {
        console.error('修改头像失败:', error)
        return {
          success: false,
          message: error.response?.data?.detail || error.response?.data?.message || '头像修改失败'
        }
      }
    },

    // 修改密码
    async updatePassword(oldPassword, newPassword) {
      try {
        if (!this.token) {
          return {
            success: false,
            message: '未登录'
          }
        }
        const response = await request.put('/api/user/password', {
          oldPassword,
          newPassword
        })
        if (response.data && response.data.code === 200) {
          return {
            success: true,
            message: '密码修改成功'
          }
        } else {
          return {
            success: false,
            message: response.data.message || '密码修改失败'
          }
        }
      } catch (error) {
        console.error('修改密码请求失败:', error)
        return {
          success: false,
          message: error.response?.data?.message || '修改密码请求失败，请稍后再试'
        }
      }
    }
  },
//持久化固定写法
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'user-store',
        storage: localStorage
      }
    ]
  }
})