<template>
  <div class="ai-chat-container">
    <van-nav-bar title="AI问答" fixed />

    <div class="chat-content">
      <div class="messages-container" ref="messagesContainer">
        <div
          v-for="(message, index) in messages"
          :key="index"
          :class="['message', message.role === 'user' ? 'user-message' : 'ai-message']"
        >
          <div class="message-content">
            {{ message.content }}
          </div>
        </div>
      </div>

      <div class="input-container">
        <van-field
          v-model="userInput"
          rows="1"
          autosize
          type="textarea"
          placeholder="请输入问题..."
          class="chat-input"
          @keypress.enter.prevent="sendMessage"
        />

        <van-button
          type="primary"
          class="send-button"
          :disabled="!userInput.trim()"
          @click="sendMessage"
        >
          发送
        </van-button>
      </div>
    </div>

    <tab-bar />
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import TabBar from '../components/TabBar.vue'
import { showToast } from 'vant'

// 聊天消息
const messages = ref([
  {
    role: 'assistant',
    content: '你好！AI智能问答功能正在开发中，敬请期待。'
  }
])

const userInput = ref('')
const messagesContainer = ref(null)

// 发送消息
const sendMessage = async () => {
  if (!userInput.value.trim()) return

  // 添加用户消息
  const userMessage = userInput.value.trim()
  messages.value.push({
    role: 'user',
    content: userMessage
  })

  userInput.value = ''

  // 临时占位回复
  messages.value.push({
    role: 'assistant',
    content: 'AI智能问答功能正在开发中，暂时无法回答你的问题。'
  })

  showToast('AI问答功能正在开发中')

  await nextTick()
  scrollToBottom()
}

// 滚动到底部
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// 监听消息变化，自动滚动
watch(
  messages,
  () => {
    nextTick(scrollToBottom)
  },
  { deep: true }
)

// 组件挂载时滚动到底部
onMounted(() => {
  scrollToBottom()
})
</script>

<style scoped>
.ai-chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding-top: 46px;
  padding-bottom: 50px;
  box-sizing: border-box;
}

.chat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.message {
  margin-bottom: 10px;
  max-width: 80%;
}

.user-message {
  margin-left: auto;
}

.ai-message {
  margin-right: auto;
}

.message-content {
  padding: 10px;
  border-radius: 10px;
  word-break: break-word;
  white-space: pre-wrap;
}

.user-message .message-content {
  background-color: #007aff;
  color: white;
}

.ai-message .message-content {
  background-color: #f2f2f2;
  color: #333;
}

.input-container {
  display: flex;
  padding: 10px;
  border-top: 1px solid #eee;
  background-color: #fff;
}

.chat-input {
  flex: 1;
  margin-right: 10px;
}

.send-button {
  align-self: flex-end;
}
</style>