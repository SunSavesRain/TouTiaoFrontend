<template>
  <div class="my-container">
    <van-nav-bar :title="$t('my.title')" />
    <div v-if="isLogin" class="user-info" @click="goToProfile">
      <div class="avatar">
        <van-image round width="80" height="80" :src="avatarUrl" />
      </div>
      <div class="info">
        <div class="username">{{ userInfo.username }}</div>
        <div class="desc">{{ userBio || $t('profile.bio') }}</div>
      </div>
      <van-icon name="arrow" class="arrow-icon" />
    </div>
    <div v-else class="user-info">
      <div class="avatar">
        <van-image round width="80" height="80"
                   src="https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg" />
      </div>
      <div class="info">
        <div class="username">{{ $t('my.notLoggedIn') }}</div>
        <div class="desc">
          <van-button type="primary" size="small" style="margin-right: 10px"
                      @click="goToLogin">
            {{ $t('my.goToLogin') }}
          </van-button>
          <van-button type="default" size="small" @click="goToRegister">
            {{ $t('my.goToRegister') }}
          </van-button>
        </div>
      </div>
    </div>
    <div class="menu-list">
      <van-cell-group inset>
        <van-cell :title="$t('my.myFavorite')" is-link @click="goToFavorite" />
        <van-cell :title="$t('my.browsingHistory')" is-link @click="goToHistory" />
        <van-cell :title="$t('my.notifications')" is-link />
        <van-cell :title="$t('my.settings')" is-link @click="goToSettings" />
        <van-cell v-if="userStore.getIsAdmin" :title="$t('profile.adminManagement')"
                  icon="setting-o" is-link @click="goToAdmin" />
        <van-cell v-if="isLogin" :title="$t('my.logout')" @click="handleLogout" />
      </van-cell-group>
    </div>

    <TabBar />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { showDialog, showToast } from 'vant'
import { useUserStore } from '../store/user'
import TabBar from '../components/TabBar.vue'
import { apiConfig } from '../config/api'

const userStore = useUserStore()
const router = useRouter()
const { t } = useI18n()

// 从 store 获取用户信息和登录状态
const userInfo = computed(() => userStore.userInfo)
const isLogin = computed(() => userStore.getLoginStatus)
const userBio = computed(() => userStore.getUserBio || t('profile.bio'))

const defaultAvatar = 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'

const avatarUrl = computed(() => {
  const avatar = userStore.userInfo?.avatar
  if (!avatar) return defaultAvatar
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) return avatar
  return `${apiConfig.baseURL}${avatar}`
})

// 跳转到登录页
const goToLogin = () => router.push('/login')

// 跳转到后台管理
const goToAdmin = () => router.push('/admin')

// 跳转到注册页
const goToRegister = () => router.push('/register')

// 跳转到个人信息页
const goToProfile = () => {
  if (isLogin.value) router.push('/profile')
}

// 跳转到浏览历史页面
const goToHistory = () => {
  if (isLogin.value) {
    router.push('/history')
  } else {
    showToast(t('common.login'))
    router.push('/login')
  }
}

// 跳转到我的收藏页面
const goToFavorite = () => {
  if (isLogin.value) {
    router.push('/favorite')
  } else {
    showToast(t('common.login'))
    router.push('/login')
  }
}

// 跳转到设置页面
const goToSettings = () => router.push('/settings')

// 退出登录
const handleLogout = () => {
  showDialog({
    title: t('common.confirm'),
    message: t('my.logout') + '?',
    showCancelButton: true
  }).then(action => {
    if (action === 'confirm') {
      userStore.logout()
      router.push('/login')
    }
  })
}

// 获取用户信息
onMounted(async () => {
  try {
    await userStore.getUserInfoDetail()
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
})
</script>

<style scoped>
.my-container {
  box-sizing: border-box;
  min-height: 100vh;
  padding-top: 46px;
  padding-bottom: 50px;
  color: var(--text-color);
  background-color: var(--background-color);
}

.van-nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;
  width: 100%;
}

.user-info {
  position: relative;
  display: flex;
  align-items: center;
  margin: 16px;
  padding: 20px 16px;
  color: #fff;
  background-color: var(--primary-color);
  border-radius: 8px;
}

.arrow-icon {
  position: absolute;
  right: 16px;
  color: #969799;
}

.avatar {
  margin-right: 16px;
}

.info {
  flex: 1;
}

.username {
  margin-bottom: 4px;
  font-size: 18px;
  font-weight: bold;
}

.desc {
  color: #999;
  font-size: 14px;
}

.menu-list {
  margin: 0 16px;
}
</style>