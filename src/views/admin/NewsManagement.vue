<template>
  <div class="management-page">
    <el-card shadow="never">
      <div class="toolbar">
        <div class="filters">
          <el-input v-model="keyword" placeholder="搜索标题、作者或内容" clearable style="width: 240px"
                    @keyup.enter="handleSearch" @clear="handleSearch" />
          <el-select v-model="categoryFilter" placeholder="全部分类" clearable style="width: 140px"
                     @change="handleSearch">
            <el-option v-for="item in categories" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
          <el-select v-model="statusFilter" placeholder="全部状态" clearable style="width: 140px"
                     @change="handleSearch">
            <el-option label="已发布" value="published" />
            <el-option label="草稿" value="draft" />
            <el-option label="已下架" value="offline" />
          </el-select>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
        </div>
        <el-button type="primary" @click="openAddDialog">
          <el-icon><Plus /></el-icon>
          新增新闻
        </el-button>
      </div>
      <el-table v-loading="loading" :data="newsList" stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="title" label="新闻标题" min-width="280" show-overflow-tooltip />
        <el-table-column prop="category" label="分类" width="100" />
        <el-table-column prop="author" label="作者" width="130" />
        <el-table-column prop="views" label="浏览量" width="100" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="publishTime" label="发布时间" width="170" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="editNews(row)">编辑</el-button>
            <el-button v-if="row.status !== 'published'" type="success" link
                       @click="changeStatus(row, 'published')">发布</el-button>
            <el-button v-else type="warning" link
                       @click="changeStatus(row, 'offline')">下架</el-button>
            <el-button type="danger" link @click="deleteNews(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
                       layout="total, prev, pager, next" :total="total" @current-change="getNewsList" />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑新闻' : '新增新闻'"
               width="720px" @closed="resetForm">
      <el-form label-width="90px">
        <el-form-item label="新闻标题">
          <el-input v-model="form.title" maxlength="100" show-word-limit />
        </el-form-item>

        <el-form-item label="分类">
          <el-select v-model="form.categoryId" style="width: 100%">
            <el-option v-for="item in categories" :key="item.id"
                       :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="作者">
          <el-input v-model="form.author" />
        </el-form-item>
        <el-form-item label="新闻摘要">
          <el-input v-model="form.description" type="textarea" :rows="3"
                    maxlength="200" show-word-limit />
        </el-form-item>
        <el-form-item label="新闻正文">
          <el-input v-model="form.content" type="textarea" :rows="8" />
        </el-form-item>
        <el-form-item label="封面图片">
          <div>
            <el-upload :auto-upload="false" :show-file-list="false"
                       accept="image/jpeg,image/png,image/webp" :on-change="handleCoverChange">
              <el-button>选择图片</el-button>
            </el-upload>
            <img v-if="coverPreview" :src="coverPreview" class="cover-preview">
          </div>
        </el-form-item>

        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio value="draft">草稿</el-radio>
            <el-radio value="published">发布</el-radio>
            <el-radio value="offline">下架</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveNews">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import request from '../../utils/request'
import { apiConfig } from '../../config/api'

const keyword = ref('')
const categoryFilter = ref(null)
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(8)

const total = ref(0)
const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)

const categories = ref([])
const newsList = ref([])
const coverFile = ref(null)
const coverPreview = ref('')
const originalForm = ref(null)

const form = reactive({
  id: null,
  title: '',
  categoryId: null,
  author: '',
  description: '',
  content: '',
  image: '',
  status: 'draft'
})

//用法：statusText('published')
const statusText = status => ({
  published: '已发布',
  draft: '草稿',
  offline: '已下架'
})[status]

const statusType = status => ({
  published: 'success',
  draft: 'info',
  offline: 'warning'
})[status]

// 获取完整图片地址
const getImageUrl = image => {
  if (!image) return ''
  if (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('blob:')) {
    return image
  }
  return `${apiConfig.baseURL}${image}`
}

// 获取新闻分类
const getCategories = async () => {
  try {
    const response = await request.get('/api/admin/categories')
    const data = response.data.data
    categories.value = Array.isArray(data) ? data : data.list || []
  } catch (error) {
    ElMessage.error('获取新闻分类失败')
  }
}

// 获取新闻列表
const getNewsList = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value
    }
    if (keyword.value.trim()) params.keyword = keyword.value.trim()
    if (categoryFilter.value !== null && categoryFilter.value !== '') {
      params.categoryId = categoryFilter.value
    }
    if (statusFilter.value) params.status = statusFilter.value
    const response = await request.get('/api/admin/news', { params })
    const data = response.data.data
    newsList.value = data.list
    total.value = data.total
  } catch (error) {
    ElMessage.error('获取新闻列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  getNewsList()
}

// 重置表单
const resetForm = () => {
  //清理图片预览产生的临时 URL
  if (coverPreview.value?.startsWith('blob:')) URL.revokeObjectURL(coverPreview.value)
  Object.assign(form, {
    id: null,
    title: '',
    categoryId: null,
    author: '',
    description: '',
    content: '',
    image: '',
    status: 'draft'
  })
  coverFile.value = null
  coverPreview.value = ''
  originalForm.value = null
}

// 打开新增新闻
const openAddDialog = () => {
  resetForm()
  dialogVisible.value = true
}

// 打开编辑新闻
const editNews = async row => {
  try {
    const response = await request.get(`/api/admin/news/${row.id}`)
    const data = response.data.data
    Object.assign(form, {
      id: data.id,
      title: data.title,
      categoryId: data.categoryId,
      author: data.author || '',
      description: data.description || '',
      content: data.content || '',
      image: data.image || '',
      status: data.status
    })
    originalForm.value = {
      title: form.title,
      categoryId: form.categoryId,
      author: form.author,
      description: form.description,
      content: form.content,
      image: form.image,
      status: form.status
    }
    coverFile.value = null
    coverPreview.value = getImageUrl(form.image)
    dialogVisible.value = true
  } catch (error) {
    ElMessage.error('获取新闻详情失败')
  }
}

// 选择封面图片
const handleCoverChange = uploadFile => {
  const file = uploadFile.raw
  if (!file) return
  if (coverPreview.value?.startsWith('blob:')) URL.revokeObjectURL(coverPreview.value)
  coverFile.value = file
  coverPreview.value = URL.createObjectURL(file)
}

// 上传封面图片
const uploadCover = async () => {
  if (!coverFile.value) return form.image
  const formData = new FormData()
  formData.append('file', coverFile.value)
  const response = await request.post('/api/admin/news/image', formData)
  return response.data.data.url
}

// 新增新闻
const addNews = async () => {
  let image = form.image
  if (coverFile.value) image = await uploadCover()
  const data = {
    title: form.title,
    categoryId: form.categoryId,
    author: form.author,
    description: form.description,
    content: form.content,
    image,
    status: form.status
  }
  await request.post('/api/admin/news', data)
}

// 修改新闻
const updateNews = async () => {
  const data = {}
  if (form.title !== originalForm.value.title) data.title = form.title
  if (form.categoryId !== originalForm.value.categoryId) data.categoryId = form.categoryId
  if (form.author !== originalForm.value.author) data.author = form.author
  if (form.description !== originalForm.value.description) data.description = form.description
  if (form.content !== originalForm.value.content) data.content = form.content
  if (form.status !== originalForm.value.status) data.status = form.status
  if (coverFile.value) data.image = await uploadCover()
  if (Object.keys(data).length === 0) {
    ElMessage.info('没有修改任何内容')
    return false
  }
  await request.put(`/api/admin/news/${form.id}`, data)
  return true
}

// 保存新闻
const saveNews = async () => {
  if (!form.title.trim()) {
    ElMessage.warning('请填写新闻标题')
    return
  }
  if (form.categoryId === null) {
    ElMessage.warning('请选择新闻分类')
    return
  }
  saving.value = true
  try {
    if (form.id) {
      const changed = await updateNews()
      if (changed === false) return
      ElMessage.success('新闻修改成功')
    } else {
      await addNews()
      ElMessage.success('新闻新增成功')
    }
    dialogVisible.value = false
    currentPage.value = 1
    await getNewsList()
  } catch (error) {
    ElMessage.error(form.id ? '新闻修改失败' : '新闻新增失败')
  } finally {
    saving.value = false
  }
}

// 发布 / 下架
const changeStatus = async (row, status) => {
  try {
    await request.put(`/api/admin/news/${row.id}`, { status })
    ElMessage.success(status === 'published' ? '新闻已发布' : '新闻已下架')
    await getNewsList()
  } catch (error) {
    ElMessage.error(status === 'published' ? '发布失败' : '下架失败')
  }
}

// 删除新闻
const deleteNews = async row => {
  try {
    await ElMessageBox.confirm(`确定删除新闻“${row.title}”吗？`, '提示', { type: 'warning' })
    await request.delete(`/api/admin/news/${row.id}`)
    ElMessage.success('删除成功')
    if (newsList.value.length === 1 && currentPage.value > 1) currentPage.value--
    await getNewsList()
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') ElMessage.error('删除失败')
  }
}

onMounted(async () => {
  await getCategories()
  await getNewsList()
})
</script>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.filters {
  display: flex;
  gap: 12px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.cover-preview {
  display: block;
  width: 150px;
  height: 100px;
  margin-top: 12px;
  object-fit: cover;
  border-radius: 6px;
}
</style>