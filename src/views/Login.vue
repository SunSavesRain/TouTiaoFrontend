```vue
<template>
  <div class="login-page">
    <van-nav-bar :title="$t('login.title')" left-arrow fixed @click-left="onClickLeft" />
    <div class="login-container">
      <div class="login-logo">
        <van-image width="80" height="80"
                   src="https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg" round />
        <h2>{{ $t('home.title') }}</h2>
      </div>
      <van-form class="login-form" @submit="onSubmit">
        <van-cell-group inset>
          <van-field v-model="username" name="username" :label="$t('login.username')"
                     :placeholder="$t('login.usernamePlaceholder')"
                     :rules="[{ required: true, message: $t('login.usernameRequired') }]" />
          <van-field v-model="password" type="password" name="password" :label="$t('login.password')"
                     :placeholder="$t('login.passwordPlaceholder')"
                     :rules="[{ required: true, message: $t('login.passwordRequired') }]" />
        </van-cell-group>
        <div class="submit-btn">
          <van-button round block type="primary" native-type="submit" size="large">
            {{ $t('common.login') }}
          </van-button>
        </div>
        <div class="login-tips">
          <p>{{ $t('login.testAccount') }}：admin</p>
          <p>{{ $t('login.testPassword') }}：123456</p>
        </div>
      </van-form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { showToast } from 'vant'
import { useUserStore } from '../store/user'

const router = useRouter()
const userStore = useUserStore()
const { t } = useI18n()

const username = ref('')
const password = ref('')

// 登录
const onSubmit = async () => {
  showToast({ type: 'loading', message: t('login.loggingIn'), forbidClick: true, duration: 0 })
  try {
    const result = await userStore.login({
      username: username.value,
      password: password.value
    })
    if (result.success) {
      showToast({ type: 'success', message: result.message || t('login.loginSuccess'), duration: 1000 })
      router.push('/')
    } else {
      showToast({ type: 'fail', message: result.message || t('login.loginFailed') })
    }
  } catch (error) {
    console.error('登录失败:', error)
    showToast({ type: 'fail', message: t('login.loginFailed') })
  }
}

// 返回上一页
const onClickLeft = () => router.back()
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 56px;
}

.login-logo {
  margin: 40px 0;
  text-align: center;
}

.login-logo h2 {
  margin-top: 16px;
  color: #323233;
  font-size: 22px;
}

.login-form {
  width: 100%;
  padding: 0 16px;
}

.submit-btn {
  margin: 24px 16px;
}

.login-tips {
  margin-top: 16px;
  color: #969799;
  font-size: 14px;
  text-align: center;
}

.login-tips p {
  margin: 8px 0;
}
</style>
```