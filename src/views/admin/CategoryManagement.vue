<template>
  <el-card shadow="never">
    <div class="toolbar">
      <el-input v-model="keyword" placeholder="搜索分类" clearable style="width: 240px" />
      <el-button type="primary" @click="openAdd">
        <el-icon><Plus /></el-icon>
        新增分类
      </el-button>
    </div>

    <el-table :data="filteredCategories" stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="分类名称" />
      <el-table-column prop="newsCount" label="新闻数量" width="140" />
      <el-table-column prop="sort" label="排序" width="120" />
      <el-table-column label="状态" width="120">
        <template #default="{ row }">
          <el-switch v-model="row.enabled" @change="changeCategoryStatus(row)" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <el-button type="primary" link @click="editCategory(row)">编辑</el-button>
          <el-button type="danger" link @click="deleteCategory(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑分类' : '新增分类'" width="420px">
      <el-form label-width="80px">
        <el-form-item label="分类名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.enabled" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveCategory">保存</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { computed, reactive, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import request from '../../utils/request'

const keyword = ref('')
const dialogVisible = ref(false)

const categories = ref([])

const form = reactive({
  id: null,
  name: '',
  sort: 1,
  enabled: true
})

const filteredCategories = computed(() => {
  //.filter按条件过滤
  return categories.value.filter(item => !keyword.value || item.name.includes(keyword.value))
})

const openAdd = () => {
  //Object.assign将一个对象的信息按属性复制到另一个里面
  Object.assign(form, {
    id: null,
    name: '',
    sort: categories.value.length + 1,
    enabled: true
  })
  dialogVisible.value = true
}

const getCategories = async () => {
  try {
    const response = await request.get('/api/admin/categories')

    if (response.data?.code === 200) {
      categories.value = response.data.data || []
    }
  } catch (error) {
    console.error('获取分类列表失败:', error)
    ElMessage.error('获取分类列表失败')
  }
}

onMounted(() => {
  getCategories()
})
const editCategory = (row) => {
  Object.assign(form, row)
  dialogVisible.value = true
}

const saveCategory = async () => {
  if (!form.name.trim()) {
    ElMessage.warning('请输入分类名称')
    return
  }
  const data = {
    name: form.name,
    sort: form.sort,
    enabled: form.enabled
  }
  try {
    if (form.id) {
      await request.put(`/api/admin/categories/${form.id}`, data)
      ElMessage.success('修改成功')
    } else {
      await request.post('/api/admin/categories', data)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    await getCategories()
  } catch (error) {
    console.error('保存分类失败:', error)
    ElMessage.error(
      error.response?.data?.detail || '保存分类失败'
    )
  }
}

const deleteCategory = async (row) => {
  if (row.newsCount > 0) {
    ElMessage.warning('该分类下仍有新闻，暂不能删除')
    return
  }
  try {
    await ElMessageBox.confirm(
      `确定删除分类“${row.name}”吗？`,
      '提示',
      {
        type: 'warning'
      }
    )
    await request.delete(`/api/admin/categories/${row.id}`)
    ElMessage.success('删除成功')
    await getCategories()
  } catch (error) {
    if (error === 'cancel' || error === 'close') {
      return
    }
    console.error('删除分类失败:', error)
    ElMessage.error(
      error.response?.data?.detail || '删除分类失败'
    )
  }
}

const changeCategoryStatus = async (row) => {
  try {
    await request.put(`/api/admin/categories/${row.id}`, {
      enabled: row.enabled
    })
    ElMessage.success('状态修改成功')
  } catch (error) {
    row.enabled = !row.enabled
    ElMessage.error(
      error.response?.data?.detail || '状态修改失败'
    )
  }
}
</script>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}
</style>