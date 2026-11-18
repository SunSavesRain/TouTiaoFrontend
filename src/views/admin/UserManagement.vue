<template>
  <el-card shadow="never">
    <div class="toolbar">
      <div class="filters">
        <!--@keyup.enter：当这个输入框发生 keyup，并且按下的是 Enter 键时，执行 searchUsers()-->
        <!--@clear：当这个输入框被清空时，执行 searchUsers()，联合clearable加一个清除按钮-->
        <el-input v-model="keyword" placeholder="搜索用户名或昵称" clearable style="width: 240px"
                  @keyup.enter="searchUsers" @clear="searchUsers" />
        <el-select v-model="genderFilter" placeholder="全部性别" clearable style="width: 130px" @change="searchUsers">
          <el-option label="男" value="male" />
          <el-option label="女" value="female" />
          <el-option label="未知" value="unknown" />
        </el-select>
        <el-select v-model="roleFilter" placeholder="全部角色" clearable style="width: 130px" @change="searchUsers">
          <el-option label="普通用户" value="user" />
          <el-option label="管理员" value="admin" />
        </el-select>
        <el-select v-model="statusFilter" placeholder="全部状态" clearable style="width: 130px" @change="searchUsers">
          <el-option label="正常" value="active" />
          <el-option label="已禁用" value="disabled" />
        </el-select>
        <el-button type="primary" @click="searchUsers">搜索</el-button>
        <el-button @click="resetFilters">重置</el-button>
      </div>
    </div>

    <el-table v-loading="loading" :data="users" stripe>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column label="头像" width="80">
        <template #default="{ row }">
          <el-avatar v-if="row.avatar" :size="38" :src="getImageUrl(row.avatar)" />
          <el-avatar v-else :size="38">无</el-avatar>
        </template>
      </el-table-column>
      <el-table-column prop="username" label="用户名" width="140" />
      <el-table-column label="昵称" width="140">
        <template #default="{ row }">{{ row.nickname || '-' }}</template>
      </el-table-column>
      <el-table-column label="性别" width="90">
        <template #default="{ row }">{{ genderText(row.gender) }}</template>
      </el-table-column>
      <el-table-column label="手机号" width="150">
        <template #default="{ row }">{{ row.phone || '-' }}</template>
      </el-table-column>
      <el-table-column label="角色" width="140">
        <template #default="{ row }">
          <el-select v-model="row.role" size="small" @change="changeRole(row)">
            <el-option label="普通用户" value="user" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
            {{ row.status === 'active' ? '正常' : '已禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="注册时间" width="180">
        <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="300" fixed="right">
        <template #default="{ row }">
          <el-button v-if="row.status === 'active'" type="danger" link
                     @click="changeUserStatus(row, 'disabled')">禁用</el-button>
          <el-button v-else type="success" link
                     @click="changeUserStatus(row, 'active')">启用</el-button>
          <el-button type="warning" link @click="resetPassword(row)">重置密码</el-button>
          <el-button type="primary" link @click="showDetail(row)">查看</el-button>
          <el-button type="danger" link @click="deleteUser(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[8, 16, 24, 40]"
        layout="total, sizes, prev, pager, next"
        @current-change="getUsers"
        @size-change="handlePageSizeChange"
      />
    </div>

    <el-dialog v-model="detailVisible" title="用户详情" width="520px">
      <!--el-descriptions不能修改的form-->
      <el-descriptions v-if="currentUser" :column="1" border>
        <el-descriptions-item label="用户ID">{{ currentUser.id }}</el-descriptions-item>
        <el-descriptions-item label="头像">
          <el-avatar v-if="currentUser.avatar" :size="60" :src="getImageUrl(currentUser.avatar)" />
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="用户名">{{ currentUser.username }}</el-descriptions-item>
        <el-descriptions-item label="昵称">{{ currentUser.nickname || '-' }}</el-descriptions-item>
        <el-descriptions-item label="性别">{{ genderText(currentUser.gender) }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ currentUser.phone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="角色">{{ currentUser.role === 'admin' ? '管理员' : '普通用户' }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ currentUser.status === 'active' ? '正常' : '已禁用' }}</el-descriptions-item>
        <el-descriptions-item label="个人简介">{{ currentUser.bio || '-' }}</el-descriptions-item>
        <el-descriptions-item label="注册时间">{{ formatDate(currentUser.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ formatDate(currentUser.updatedAt) }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '../../utils/request'
import { getImageUrl } from '../../utils/image'

const keyword = ref('')
const genderFilter = ref('')
const roleFilter = ref('')
const statusFilter = ref('')

const users = ref([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(8)
const total = ref(0)

const detailVisible = ref(false)
const currentUser = ref(null)

const getUsers = async () => {
  try {
    loading.value = true
    const params = {
      page: page.value,
      pageSize: pageSize.value
    }
    if (keyword.value.trim()) params.keyword = keyword.value.trim()
    if (genderFilter.value) params.gender = genderFilter.value
    if (roleFilter.value) params.role = roleFilter.value
    if (statusFilter.value) params.status = statusFilter.value
    const res = await request.get('/api/admin/users', { params })
    users.value = res.data.data.list
    total.value = res.data.data.total
  } catch (error) {
    ElMessage.error(error.response?.data?.detail || '获取用户列表失败')
  } finally {
    loading.value = false
  }
}

const searchUsers = () => {
  page.value = 1
  getUsers()
}

const resetFilters = () => {
  keyword.value = ''
  genderFilter.value = ''
  roleFilter.value = ''
  statusFilter.value = ''
  page.value = 1
  getUsers()
}

const handlePageSizeChange = () => {
  page.value = 1
  getUsers()
}

const genderText = gender => ({
  male: '男',
  female: '女',
  unknown: '未知'
})[gender] || '未知'

const formatDate = value => {
  if (!value) return '-'
  return value.replace('T', ' ').slice(0, 19)
}

const changeRole = async row => {
  try {
    await request.patch(`/api/admin/users/${row.id}/role`, { role: row.role })
    ElMessage.success(`用户 ${row.username} 角色已更新`)
  } catch (error) {
    ElMessage.error(error.response?.data?.detail || '更新用户角色失败')
    await getUsers()
  }
}

const changeUserStatus = async (row, status) => {
  try {
    const text = status === 'disabled' ? '禁用' : '启用'
    await ElMessageBox.confirm(`确定${text}用户“${row.username}”吗？`, '提示', {
      type: 'warning'
    })
    await request.patch(`/api/admin/users/${row.id}/status`, { status })
    row.status = status
    ElMessage.success(`${text}成功`)
  } catch (error) {
    if (error === 'cancel' || error === 'close') return
    ElMessage.error(error.response?.data?.detail || '更新用户状态失败')
  }
}

const resetPassword = async row => {
  try {
    const { value } = await ElMessageBox.prompt(
      `请输入用户“${row.username}”的新密码`,
      '重置密码',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputType: 'password',
        inputPlaceholder: '请输入新密码',
        inputPattern: /^.{6,}$/,
        inputErrorMessage: '密码长度不能少于6位'
      }
    )
    await request.patch(`/api/admin/users/${row.id}/password`, { password: value })
    ElMessage.success('密码重置成功')
  } catch (error) {
    if (error === 'cancel' || error === 'close') return
    ElMessage.error(error.response?.data?.detail || '重置密码失败')
  }
}

const showDetail = async row => {
  try {
    const res = await request.get(`/api/admin/users/${row.id}`)
    currentUser.value = res.data.data
    detailVisible.value = true
  } catch (error) {
    ElMessage.error(error.response?.data?.detail || '获取用户详情失败')
  }
}

const deleteUser = async row => {
  try {
    await ElMessageBox.confirm(
      `确定删除用户“${row.username}”吗？删除后相关数据也会被删除，此操作不可恢复。`,
      '删除用户',
      { type: 'warning' }
    )
    await request.delete(`/api/admin/users/${row.id}`)
    ElMessage.success('删除用户成功')
    if (users.value.length === 1 && page.value > 1) page.value--
    await getUsers()
  } catch (error) {
    if (error === 'cancel' || error === 'close') return
    ElMessage.error(error.response?.data?.detail || '删除用户失败')
  }
}

onMounted(() => {
  getUsers()
})
</script>

<style scoped>
.toolbar {
  margin-bottom: 20px;
}

.filters {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>