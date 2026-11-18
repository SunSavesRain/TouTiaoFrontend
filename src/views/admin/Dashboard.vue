<template>
  <div class="dashboard">
    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-icon news-icon">
          <el-icon><Document /></el-icon>
        </div>
        <div>
          <div class="stat-value">{{ stats.news }}</div>
          <div class="stat-label">新闻总数</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon user-icon">
          <el-icon><User /></el-icon>
        </div>
        <div>
          <div class="stat-value">{{ stats.users }}</div>
          <div class="stat-label">用户总数</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon comment-icon">
          <el-icon><ChatDotRound /></el-icon>
        </div>
        <div>
          <div class="stat-value">{{ stats.comments }}</div>
          <div class="stat-label">评论总数</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon view-icon">
          <el-icon><View /></el-icon>
        </div>
        <div>
          <div class="stat-value">{{ formatNumber(stats.views) }}</div>
          <div class="stat-label">总浏览量</div>
        </div>
      </div>
    </div>

    <div class="chart-grid">
      <el-card shadow="never">
        <template #header>
          <span class="card-title">近七日访问趋势</span>
        </template>
        <div ref="lineChartRef" class="chart"></div>
      </el-card>

      <el-card shadow="never">
        <template #header>
          <span class="card-title">新闻分类分布</span>
        </template>
        <div ref="pieChartRef" class="chart"></div>
      </el-card>
    </div>

    <el-card shadow="never" class="hot-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">热门新闻 Top 10</span>
          <el-button type="primary" link @click="router.push('/admin/news')">查看全部</el-button>
        </div>
      </template>

      <el-table :data="hotNews" stripe>
        <el-table-column type="index" label="排名" width="80" />
        <el-table-column prop="title" label="新闻标题" min-width="320" />
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column label="浏览量" width="120">
          <template #default="{ row }">
            {{ formatNumber(row.views) }}
          </template>
        </el-table-column>
        <el-table-column prop="comments" label="评论数" width="100" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Document, User, ChatDotRound, View } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import request from '../../utils/request'

const router = useRouter()
const lineChartRef = ref(null)
const pieChartRef = ref(null)
let lineChart = null
let pieChart = null

const stats = ref({
  news: 0,
  users: 0,
  comments: 0,
  views: 0
})

const hotNews = ref([])
const visitTrend = ref([])
const categoryDistribution = ref([])
const formatNumber = (value) => {
  return Number(value).toLocaleString()
}

// 获取看板数据
const getDashboardData = async () => {
  try {
    const response = await request.get('/api/admin/dashboard')
    if (response.data?.code === 200) {
      const data = response.data.data
      stats.value = data.stats || {
        news: 0,
        users: 0,
        comments: 0,
        views: 0
      }
      visitTrend.value = data.visitTrend || []
      categoryDistribution.value = data.categoryDistribution || []
      hotNews.value = data.hotNews || []
      updateCharts()
    }
  } catch (error) {
    console.error('获取看板数据失败:', error)
    ElMessage.error(
      error.response?.data?.detail ||
      error.response?.data?.message ||
      '获取看板数据失败'
    )
  }
}

// 初始化图表
const initCharts = () => {
  lineChart = echarts.init(lineChartRef.value)
  pieChart = echarts.init(pieChartRef.value)
}

// 根据后端数据更新图表
const updateCharts = () => {
  if (!lineChart || !pieChart) {
    return
  }
  lineChart.setOption({
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: 40,
      right: 20,
      top: 30,
      bottom: 30
    },
    xAxis: {
      type: 'category',
      data: visitTrend.value.map(item => item.date)
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '访问量',
        type: 'line',
        smooth: true,
        areaStyle: {},
        data: visitTrend.value.map(item => item.views)
      }
    ]
  })
  pieChart.setOption({
    tooltip: {
      trigger: 'item'
    },
    legend: {
      type: 'scroll',
      orient: 'horizontal',
      left: 'center',
      bottom: 0
    },
    series: [
      {
        type: 'pie',
        radius: ['42%', '68%'],
        data: categoryDistribution.value
      }
    ]
  })
}

const resizeCharts = () => {
  lineChart?.resize()
  pieChart?.resize()
}

onMounted(async () => {
  initCharts()
  await getDashboardData()
  window.addEventListener('resize', resizeCharts)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCharts)
  lineChart?.dispose()
  pieChart?.dispose()
})
</script>

<style scoped>
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 24px;
  background: #fff;
  border-radius: 10px;
  border: 1px solid #ebeef5;
}

.stat-icon {
  width: 54px;
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 26px;
}

.news-icon {
  background: #ecf5ff;
  color: #409eff;
}

.user-icon {
  background: #f0f9eb;
  color: #67c23a;
}

.comment-icon {
  background: #fdf6ec;
  color: #e6a23c;
}

.view-icon {
  background: #fef0f0;
  color: #f56c6c;
}

.stat-value {
  margin-bottom: 4px;
  font-size: 28px;
  font-weight: 700;
  color: #303133;
}

.stat-label {
  color: #909399;
  font-size: 14px;
}

.chart-grid {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 20px;
  margin-bottom: 20px;
}

.chart {
  width: 100%;
  height: 330px;
}

.card-title {
  font-weight: 600;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.hot-card {
  margin-bottom: 20px;
}

@media (max-width: 1300px) {
  .stat-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .chart-grid {
    grid-template-columns: 1fr;
  }
}
</style>