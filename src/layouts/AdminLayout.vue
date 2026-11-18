<template>
  <el-container class="admin-layout">
    <el-aside :width="collapsed ? '64px' : '220px'" class="admin-aside">
      <div class="logo">
        <span class="logo-icon">N</span>
        <span v-if="!collapsed" class="logo-text">News Admin</span>
      </div>

      <el-menu
        router
        :default-active="route.path"
        :collapse="collapsed"
        :collapse-transition="false"
        class="admin-menu"
      >
        <el-menu-item index="/admin/dashboard">
          <el-icon><DataAnalysis /></el-icon>
          <template #title>数据看板</template>
        </el-menu-item>

        <el-menu-item index="/admin/news">
          <el-icon><Document /></el-icon>
          <template #title>新闻管理</template>
        </el-menu-item>

        <el-menu-item index="/admin/categories">
          <el-icon><Files /></el-icon>
          <template #title>分类管理</template>
        </el-menu-item>

        <el-menu-item index="/admin/users">
          <el-icon><User /></el-icon>
          <template #title>用户管理</template>
        </el-menu-item>

        <el-menu-item index="/admin/comments">
          <el-icon><ChatDotRound /></el-icon>
          <template #title>评论管理</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="admin-header">
        <div class="header-left">
          <el-button text class="collapse-btn" @click="collapsed = !collapsed">
            <el-icon size="20">
              <Fold v-if="!collapsed" />
              <Expand v-else />
            </el-icon>
          </el-button>

          <span class="page-title">{{ route.meta.title || '后台管理' }}</span>
        </div>

        <div class="header-right">
          <el-button text @click="goToFront">
            <el-icon><HomeFilled /></el-icon>
            返回前台
          </el-button>

          <el-dropdown>
            <div class="admin-user">
              <el-avatar :size="34">{{ adminName.charAt(0).toUpperCase() }}</el-avatar>
              <span>{{ adminName }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>

            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="goToProfile">个人信息</el-dropdown-item>
                <el-dropdown-item divided @click="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="admin-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { DataAnalysis, Document, Files, User, ChatDotRound, Fold, Expand, HomeFilled, ArrowDown } from '@element-plus/icons-vue'
import { useUserStore } from '../store/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const collapsed = ref(false)

const adminName = computed(() => {
  return userStore.userInfo?.nickname || userStore.userInfo?.username || 'Admin'
})

const goToFront = () => {
  router.push('/home')
}

const goToProfile = () => {
  router.push('/profile')
}

const logout = () => {
  userStore.logout()
  router.replace('/login')
}
</script>

<style scoped>
.admin-layout {
  width: 100%;
  height: 100vh;
  background: #f5f7fa;
}

.admin-aside {
  background: #001529;
  transition: width 0.2s;
  overflow: hidden;
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 18px;
  color: #fff;
  overflow: hidden;
}

.logo-icon {
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #409eff;
  border-radius: 8px;
  font-size: 18px;
  font-weight: bold;
}

.logo-text {
  margin-left: 12px;
  white-space: nowrap;
  font-size: 18px;
  font-weight: 600;
}

.admin-menu {
  border-right: none;
  background: #001529;
}

:deep(.el-menu-item) {
  color: #bfcbd9;
}

:deep(.el-menu-item:hover) {
  background: #263445;
  color: #fff;
}

:deep(.el-menu-item.is-active) {
  background: #1890ff;
  color: #fff;
}

.admin-header {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid #ebeef5;
  padding: 0 24px;
}

.header-left,
.header-right,
.admin-user {
  display: flex;
  align-items: center;
}

.header-left {
  gap: 12px;
}

.header-right {
  gap: 18px;
}

.collapse-btn {
  padding: 8px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.admin-user {
  gap: 8px;
  cursor: pointer;
  color: #606266;
}

.admin-main {
  padding: 20px;
  overflow-y: auto;
}
</style>