import axios from 'axios'
import { apiConfig } from '../config/api'

const request = axios.create({
  baseURL: apiConfig.baseURL
})

request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    return response
  },
  error => {
    if (error.response?.status === 401) {
      // token无效或已过期
      localStorage.removeItem('token')
      localStorage.removeItem('user-store')

      // 防止已经在登录页时重复跳转
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default request