<template>
  <el-card shadow="never">
    <div class="toolbar">
      <el-input v-model="keyword" placeholder="搜索评论、用户或新闻" clearable style="width: 320px"
      @keyup.enter="handleSearch" @clear="handleSearch"/>
    </div>
    <el-table :data="comments" stripe>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column label="评论用户" width="150">
        <template #default="{ row }">
          {{ row.nickname || row.username }}
        </template>
      </el-table-column>
      <el-table-column prop="newsTitle" label="所属新闻" min-width="220" show-overflow-tooltip />
      <el-table-column prop="content" label="评论内容" min-width="300" show-overflow-tooltip />
      <el-table-column prop="createdAt" label="评论时间" width="180" />
      <el-table-column label="操作" width="100">
        <template #default="{ row }">
          <el-button type="danger" link @click="deleteComment(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage" :page-size="pageSize"
        layout="total, prev, pager, next" :total="total" @current-change="getComments"/>
    </div>
  </el-card>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '../../utils/request'

const keyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const comments = ref([])

const deleteComment = async (row) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这条评论吗？',
      '提示',
      {
        type: 'warning'
      }
    )
    await request.delete(`/api/admin/comments/${row.id}`)
    ElMessage.success('评论已删除')
    await getComments()
  } catch (error) {
    if (error === 'cancel' || error === 'close') {
      return
    }
    console.error('删除评论失败:', error)
    ElMessage.error(
      error.response?.data?.detail || '删除评论失败'
    )
  }
}

const getComments = async () => {
  try {
    const response = await request.get('/api/admin/comments', {
      params: {
        keyword: keyword.value.trim() || undefined,
        page: currentPage.value,
        pageSize: pageSize.value
      }
    })
    if (response.data?.code === 200) {
      comments.value = response.data.data.list || []
      total.value = response.data.data.total || 0
    }
  } catch (error) {
    console.error('获取评论列表失败:', error)
    ElMessage.error(
      error.response?.data?.detail || '获取评论列表失败'
    )
  }
}

const handleSearch = () => {
  currentPage.value = 1
  getComments()
}
onMounted(() => {
  getComments()
})
</script>

<style scoped>
.toolbar {
  margin-bottom: 20px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>