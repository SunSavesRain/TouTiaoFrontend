```vue
<template>
  <div class="register-page">
    <van-nav-bar :title="$t('register.title')" left-arrow fixed @click-left="onClickLeft" />
    <div class="register-container">
      <div class="register-logo">
        <van-image width="80" height="80" src="https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg" round />
        <h2>{{ $t('home.title') }}</h2>
      </div>
      <van-form class="register-form" @submit="onSubmit">
        <van-cell-group inset>
          <van-field v-model="username" name="username" :label="$t('register.username')"
                     :placeholder="$t('register.usernamePlaceholder')"
                     :rules="[{ required: true, message: $t('register.usernameRequired') }]" />
          <van-field v-model="password" type="password" name="password" :label="$t('register.password')"
                     :placeholder="$t('register.passwordPlaceholder')"
                     :rules="[{ required: true, message: $t('register.passwordRequired') }]" />
          <van-field v-model="confirmPassword" type="password" name="confirmPassword"
                     :label="$t('register.confirmPassword')" :placeholder="$t('register.confirmPasswordPlaceholder')"
                     :rules="[
                       { required: true, message: $t('register.confirmPasswordRequired') },
                       { validator: validatePassword, message: $t('register.passwordMismatch') }
                     ]" />
        </van-cell-group>
        <div class="submit-btn">
          <!--button一般联合form使用-->
          <van-button round block type="primary" native-type="submit" size="large">
            {{ $t('common.register') }}
          </van-button>
        </div>
        <div class="login-link">
          {{ $t('register.hasAccount') }}
          <span @click="goToLogin">{{ $t('register.goLogin') }}</span>
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
const confirmPassword = ref('')

// 验证两次密码是否一致
const validatePassword = () => password.value === confirmPassword.value

// 注册
const onSubmit = async () => {
  showToast({
    type: 'loading',
    message: t('register.registering'),
    forbidClick: true,
    //0代表一直显示
    duration: 0
  })
  try {
    const result = await userStore.register({
      username: username.value,
      password: password.value
    })
    if (result.success) {
      showToast({
        type: 'success',
        message: result.message || t('register.registerSuccess')
      })
      router.push('/')
    } else {
      showToast({
        type: 'fail',
        message: result.message || t('register.registerFailed')
      })
    }
  } catch (error) {
    console.error('注册失败:', error)
    showToast({
      type: 'fail',
      message: t('register.registerFailed')
    })
  }
}

// 返回上一页
const onClickLeft = () => router.back()

// 跳转登录页
const goToLogin = () => router.push('/login')
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.register-container {
  padding-top: 56px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.register-logo {
  margin: 40px 0;
  text-align: center;
}

.register-logo h2 {
  margin-top: 16px;
  color: #323233;
  font-size: 22px;
}

.register-form {
  width: 100%;
  padding: 0 16px;
}

.submit-btn {
  margin: 24px 16px;
}

.login-link {
  margin-top: 16px;
  text-align: center;
  color: #969799;
  font-size: 14px;
}

.login-link span {
  color: #1989fa;
  cursor: pointer;
}
</style>
```