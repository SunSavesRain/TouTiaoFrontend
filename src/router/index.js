import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../store/user'
const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: {
      title: '登录',
      keepAlive: false
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: {
      title: '注册',
      keepAlive: false
    }
  },
  {
  path: '/hot',
  name: 'HotNews',
  component: () => import('../views/HotNews.vue'),
  meta: {
    title: '热点新闻',
    keepAlive: false
   }
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: {
      title: '首页',
      keepAlive: true
    }
  },
  {
    path: '/news/detail/:id',
    name: 'NewsDetail',
    component: () => import('../views/NewsDetail.vue'),
    meta: {
      title: '新闻详情',
      keepAlive: false
    }
  },
  {
    path: '/history',
    name: 'History',
    component: () => import('../views/History.vue'),
    meta: {
      title: '浏览历史',
      keepAlive: false
    }
  },
  {
    path: '/favorite',
    name: 'Favorite',
    component: () => import('../views/Favorite.vue'),
    meta: {
      title: '我的收藏',
      keepAlive: false
    }
  },
  {
  path: '/search',
  name: 'Search',
  component: () => import('../views/Search.vue'),
  meta: {
    title: '新闻搜索',
    keepAlive: false
    }
  },
  {
    path: '/category',
    name: 'Category',
    component: () => import('../views/Category.vue'),
    meta: {
      title: '分类',
      keepAlive: false
    }
  },
  {
    path: '/aichat',
    name: 'AIChat',
    component: () => import('../views/AIChat.vue'),
    meta: {
      title: 'AI问答',
      keepAlive: true
    }
  },
  {
    path: '/my',
    name: 'My',
    component: () => import('../views/My.vue'),
    meta: {
      title: '我的',
      keepAlive: true
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: {
      title: '个人信息',
      keepAlive: false
    }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/Settings.vue'),
    meta: {
      title: '设置',
      keepAlive: false
    }
  },
   {
  path: '/admin',
  component: () => import('../layouts/AdminLayout.vue'),
  redirect: '/admin/dashboard',
  meta: {
    requiresAdmin: true
  },
  children: [
    {
      path: 'dashboard',
      name: 'AdminDashboard',
      component: () => import('../views/admin/Dashboard.vue'),
      meta: {
        title: '数据看板'
      }
    },
    {
      path: 'news',
      name: 'AdminNews',
      component: () => import('../views/admin/NewsManagement.vue'),
      meta: {
        title: '新闻管理'
      }
    },
    {
      path: 'categories',
      name: 'AdminCategories',
      component: () => import('../views/admin/CategoryManagement.vue'),
      meta: {
        title: '分类管理'
      }
    },
    {
      path: 'users',
      name: 'AdminUsers',
      component: () => import('../views/admin/UserManagement.vue'),
      meta: {
        title: '用户管理'
      }
    },
    {
      path: 'comments',
      name: 'AdminComments',
      component: () => import('../views/admin/CommentManagement.vue'),
      meta: {
        title: '评论管理'
      }
    }
  ]
}
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title || '新闻资讯'
  
  // 直接允许访问所有页面
  next()
})
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  if (to.meta.requiresAdmin) {
    if (!userStore.getLoginStatus) {
      next({
        path: '/login',
        query: {
          redirect: to.fullPath
        }
      })
      return
    }

    if (!userStore.getIsAdmin) {
      next('/home')
      return
    }
  }
  next()
})
export default router