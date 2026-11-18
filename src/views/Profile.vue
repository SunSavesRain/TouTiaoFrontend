<template>
  <div class="profile-page">
    <van-nav-bar :title="$t('profile.title')" left-arrow fixed @click-left="onClickLeft" />
    <div class="profile-container">
      <!-- 头像 -->
      <van-cell-group inset class="avatar-group">
        <van-cell :title="$t('profile.avatar')" center is-link clickable @click="selectAvatar">
          <template #value>
            <div class="avatar-value">
              <span class="avatar-tip">{{ $t('profile.avatarTip') }}</span>
              <van-image round width="60" height="60" fit="cover" :src="avatarUrl" />
            </div>
          </template>
        </van-cell>
        <input ref="avatarInput" class="avatar-input" type="file"
               accept="image/jpeg,image/png,image/webp" @change="handleAvatarChange">
      </van-cell-group>
      <!-- 基本信息 -->
      <van-cell-group inset class="info-group">
        <van-cell :title="$t('profile.username')" :value="userInfo.username || 'N/A'" />
        <van-cell :title="$t('profile.nickname')" :value="userNickname" is-link @click="openNicknameDialog" />
        <van-cell :title="$t('profile.accountId')" :value="`ID: toutiao-${userId || 'N/A'}`" />
        <van-cell :title="$t('profile.bio')" :value="userBio" is-link @click="openBioDialog" />
      </van-cell-group>
      <!-- 安全设置 -->
      <van-cell-group inset class="security-group">
        <van-cell :title="$t('profile.changePassword')" is-link @click="openPasswordDialog" />
      </van-cell-group>
    </div>
    <!-- 修改昵称 -->
    <!-- before-close在弹窗、抽屉这类组件真正关闭之前，先执行指定的函数，由这个函数决定要不要真的关掉-->
    <van-dialog v-model:show="nicknameDialogVisible" :title="$t('profile.editNickname')" show-cancel-button
                :confirm-button-text="$t('common.confirm')" :cancel-button-text="$t('common.cancel')"
                :before-close="beforeNicknameClose">
      <div class="dialog-content">
        <van-field v-model="nicknameInput" maxlength="50" clearable show-word-limit
                   :placeholder="$t('profile.nicknamePlaceholder')" />
      </div>
    </van-dialog>
    <!-- 修改个人简介 -->
    <van-dialog v-model:show="bioDialogVisible" :title="$t('profile.editBio')" show-cancel-button
                :confirm-button-text="$t('common.confirm')" :cancel-button-text="$t('common.cancel')"
                :before-close="beforeBioClose">
      <div class="dialog-content">
        <van-field v-model="bioInput" type="textarea" rows="4" maxlength="200" autosize show-word-limit
                   :placeholder="$t('profile.bioPlaceholder')" />
      </div>
    </van-dialog>
    <!-- 修改密码 -->
    <van-dialog v-model:show="passwordDialogVisible" :title="$t('profile.changePassword')" show-cancel-button
                :confirm-button-text="$t('common.confirm')" :cancel-button-text="$t('common.cancel')"
                :before-close="beforePasswordClose">
      <div class="dialog-content">
        <van-field v-model="oldPassword" type="password" :label="$t('profile.currentPassword')"
                   :placeholder="$t('profile.currentPasswordPlaceholder')" clearable />
        <van-field v-model="newPassword" type="password" :label="$t('profile.newPassword')"
                   :placeholder="$t('profile.newPasswordPlaceholder')" clearable />
        <van-field v-model="confirmPassword" type="password" :label="$t('profile.confirmPassword')"
                   :placeholder="$t('profile.confirmPasswordPlaceholder')" clearable />
      </div>
    </van-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { showFailToast, showLoadingToast, showSuccessToast, showToast } from 'vant'
import { useUserStore } from '../store/user'
import { apiConfig } from '../config/api'

const router = useRouter()
const userStore = useUserStore()
const { t } = useI18n()

const defaultAvatar = 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'
const avatarInput = ref(null)

const avatarUrl = computed(() => {
  const avatar = userStore.userInfo?.avatar
  if (!avatar) return defaultAvatar
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) return avatar
  return `${apiConfig.baseURL}${avatar}`
})

const nicknameDialogVisible = ref(false)
const bioDialogVisible = ref(false)
const passwordDialogVisible = ref(false)

const nicknameInput = ref('')
const bioInput = ref('')
const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

const userInfo = computed(() => userStore.userInfo || {})
const userId = computed(() => userStore.userInfo?.id || '')
const userNickname = computed(() => userStore.userInfo?.nickname || userStore.userInfo?.username || t('profile.noNickname'))
const userBio = computed(() => userStore.userInfo?.bio || t('profile.noBio'))

// 返回上一页
const onClickLeft = () => router.back()

// 打开本地图片选择器
//avatarInput绑定了一个隐藏的文件输入栏，.value拿到真实的 <input> DOM 元素
const selectAvatar = () => avatarInput.value?.click()

// 修改头像
const handleAvatarChange = async event => {
  const input = event.target
  const file = input.files?.[0]
  if (!file) return
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    showFailToast(t('profile.avatarTypeError'))
    input.value = ''
    return
  }
  if (file.size > 2 * 1024 * 1024) {
    showFailToast(t('profile.avatarSizeError'))
    input.value = ''
    return
  }
  //用 showLoadingToast(...) 的那一刻，就会立刻显示 loading 提示框
  const loadingInstance = showLoadingToast({
    message: t('profile.saving'),
    forbidClick: true,
    duration: 0
  })
  try {
    const result = await userStore.updateAvatar(file)
    if (result?.success) {
      showSuccessToast(t('profile.avatarUpdateSuccess'))
    } else {
      showFailToast(result?.message || t('profile.avatarUpdateFailed'))
    }
  } catch (error) {
    console.error('修改头像失败:', error)
    showFailToast(t('profile.avatarUpdateFailed'))
  } finally {
    loadingInstance.close()
    input.value = ''
  }
}

// 打开修改昵称弹窗
const openNicknameDialog = () => {
  nicknameInput.value = userStore.userInfo?.nickname || ''
  nicknameDialogVisible.value = true
}

// 修改昵称
const beforeNicknameClose = async action => {
  if (action === 'cancel') return true
  const nickname = nicknameInput.value.trim()
  if (!nickname) {
    showToast(t('profile.nicknameRequired'))
    return false
  }
  const loadingInstance = showLoadingToast({
    message: t('profile.saving'),
    forbidClick: true,
    duration: 0
  })
  try {
    const result = await userStore.updateNickname(nickname)
    if (result?.success) {
      showSuccessToast(t('profile.nicknameUpdateSuccess'))
      return true
    }
    showFailToast(result?.message || t('profile.nicknameUpdateFailed'))
    return false
  } catch (error) {
    console.error('修改昵称失败:', error)
    showFailToast(t('profile.nicknameUpdateFailed'))
    return false
  } finally {
    loadingInstance.close()
  }
}

// 打开修改个人简介弹窗
const openBioDialog = () => {
  bioInput.value = userStore.userInfo?.bio || ''
  bioDialogVisible.value = true
}

// 修改个人简介
const beforeBioClose = async action => {
  if (action === 'cancel') return true
  const loadingInstance = showLoadingToast({
    message: t('profile.saving'),
    forbidClick: true,
    duration: 0
  })
  try {
    const result = await userStore.updateUserBio(bioInput.value.trim())
    if (result?.success) {
      showSuccessToast(t('profile.bioUpdateSuccess'))
      return true
    }
    showFailToast(result?.message || t('profile.bioUpdateFailed'))
    return false
  } catch (error) {
    console.error('更新个人简介失败:', error)
    showFailToast(t('profile.bioUpdateFailed'))
    return false
  } finally {
    loadingInstance.close()
  }
}

// 打开修改密码弹窗
const openPasswordDialog = () => {
  oldPassword.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
  passwordDialogVisible.value = true
}

// 修改密码
const beforePasswordClose = async action => {
  if (action === 'cancel') return true
  if (!oldPassword.value) {
    showToast(t('profile.currentPasswordRequired'))
    return false
  }
  if (!newPassword.value) {
    showToast(t('profile.newPasswordRequired'))
    return false
  }
  if (!confirmPassword.value) {
    showToast(t('profile.confirmPasswordRequired'))
    return false
  }
  if (newPassword.value !== confirmPassword.value) {
    showToast(t('profile.passwordMismatch'))
    return false
  }
  const loadingInstance = showLoadingToast({
    message: t('profile.changingPassword'),
    forbidClick: true,
    duration: 0
  })
  try {
    const result = await userStore.updatePassword(oldPassword.value, newPassword.value)
    if (result?.success) {
      showSuccessToast(t('profile.passwordChangeSuccess'))
      return true
    }
    showFailToast(result?.message || t('profile.passwordChangeFailed'))
    return false
  } catch (error) {
    console.error('修改密码失败:', error)
    showFailToast(t('profile.passwordChangeFailed'))
    return false
  } finally {
    loadingInstance.close()
  }
}

// 页面加载
onMounted(async () => {
  if (!userStore.getLoginStatus) {
    router.push('/login')
    return
  }
  const loadingInstance = showLoadingToast({
    message: t('common.loading'),
    forbidClick: true,
    duration: 0
  })
  try {
    const result = await userStore.getUserInfoDetail()
    if (!result?.success) showFailToast(result?.message || t('profile.loadFailed'))
  } catch (error) {
    console.error('获取用户信息请求失败:', error)
    showFailToast(t('profile.loadFailed'))
  } finally {
    loadingInstance.close()
  }
})
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.profile-container {
  padding-top: 56px;
  padding-bottom: 20px;
}

.avatar-group,
.info-group,
.security-group {
  margin-top: 12px;
}

.avatar-value {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: flex-end;
}

.avatar-tip {
  color: #969799;
  font-size: 12px;
}

.avatar-input {
  display: none;
}

.dialog-content {
  padding: 14px 16px;
}

.dialog-content :deep(.van-cell) {
  padding-right: 0;
  padding-left: 0;
}
</style>