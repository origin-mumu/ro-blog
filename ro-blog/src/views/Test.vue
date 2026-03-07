<script lang="ts" setup>
import { ref, computed, onMounted, watch, nextTick, onUnmounted } from 'vue'
import { useChatData } from '@/type/useChatData'
import * as echarts from 'echarts'

// ECharts相关代码
const chartRef = ref<HTMLElement | null>(null)
let chartInstance: echarts.ECharts | null = null

// 计算消息分布
const calculateMessageDistribution = (role: string) => {
  const distribution = [0, 0, 0, 0, 0, 0]
  messages.value.forEach((msg, index) => {
    if (msg.role === role) {
      if (index < 10) distribution[0]++
      else if (index < 20) distribution[1]++
      else if (index < 30) distribution[2]++
      else if (index < 40) distribution[3]++
      else if (index < 50) distribution[4]++
      else distribution[5]++
    }
  })
  return distribution
}
// 初始化ECharts图表
const initChart = () => {
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value)

    const option = {
      title: {
        text: '消息统计图表',
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: ['用户消息', 'AI消息'],
        top: '12%',
      },
      xAxis: {
        type: 'category',
        data: ['0-10', '11-20', '21-30', '31-40', '41-50', '51+'],
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          name: '用户消息',
          type: 'bar',
          data: calculateMessageDistribution('user'),
          itemStyle: {
            color: '#67C23A',
          },
        },
        {
          name: 'AI消息',
          type: 'bar',
          data: calculateMessageDistribution('ai'),
          itemStyle: {
            color: '#409EFF',
          },
        },
      ],
    }

    chartInstance.setOption(option)
  }
}

const { messages } = useChatData(60)
//定义参数变量 缓存，预估高度
const itemHeight = 50
const buffer = 10
interface ItemPosition {
  index: number
  top: number
  height: number
  bottom: number
}
//首先定义每一条的位置信息
const itemPositions = ref<ItemPosition[]>([])
//初始化位置信息
const initPositions = () => {
  itemPositions.value = messages.value.map((_, index) => ({
    index,
    height: itemHeight,
    top: index * itemHeight,
    bottom: (index + 1) * itemHeight,
  }))
}
const scrolltop = ref(0)
const containerHeight = ref(0)
const getStartIndex = (scrollTop: number) => {
  let low = 0
  let high = itemPositions.value.length - 1
  let res = -1
  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    const pos = itemPositions.value[mid]
    if (pos.bottom > scrollTop) {
      res = mid
      high = mid - 1
    } else {
      low = mid + 1
    }
  }
  if (res == -1) {
    return itemPositions.value.length - 1
  }
  return res
}
const startIndex = computed(() => {
  const idx = getStartIndex(scrolltop.value)
  return Math.max(0, idx - buffer)
})
const endIndex = computed(() => {
  const idx = getStartIndex(scrolltop.value + containerHeight.value)
  return Math.min(itemPositions.value.length, idx + buffer)
})

const visibleItems = computed(() => {
  return messages.value.slice(startIndex.value, endIndex.value)
})
const placeHeight = computed(() => {
  return itemPositions.value.length > 0
    ? itemPositions.value[itemPositions.value.length - 1].bottom
    : 0
})

//列表移动偏移
const offset = computed(() => {
  if (startIndex.value <= 0) {
    return 0
  }
  return itemPositions.value[startIndex.value].top
})

const itemsRef = ref<HTMLElement[]>([])
const setItemRef = (el: any) => {
  if (el) itemsRef.value.push(el)
}
const updatePositions = () => {
  const nodes = itemsRef.value
  if (nodes.length === 0 || !nodes) return
  let offsetDelta = 0
  nodes.forEach(node => {
    const index = parseInt(node.dataset.index || '0')
    const rect = node.getBoundingClientRect()
    const oldHeight = itemPositions.value[index].height
    const dv = rect.height - oldHeight
    if (dv) {
      itemPositions.value[index].height = rect.height
      itemPositions.value[index].bottom = itemPositions.value[index].top + rect.height
      offsetDelta += dv
    }
  })
  const startUdx = parseInt(nodes[0].dataset.index || '0')
  const len = itemPositions.value.length
  for (let i = startUdx; i < len; i++) {
    const item = itemPositions.value[i]
    if (i > 0) {
      item.top = itemPositions.value[i - 1].bottom
    } else {
      item.top = 0
    }
    item.bottom = item.top + item.height
  }
}
const containRef = ref<HTMLElement | null>(null)
onMounted(() => {
  initPositions()
  if (containRef.value) {
    containerHeight.value = containRef.value.clientHeight
  }

  // 初始化图表
  nextTick(() => {
    initChart()

    // 添加调试信息
    console.log('图表初始化完成，chartInstance:', chartInstance)

    // 正确的窗口大小变化监听
    const handleResize = () => {
      console.log('窗口大小变化，当前宽度:', window.innerWidth)
      if (chartInstance) {
        chartInstance.resize()
        console.log('图表已重新调整大小')
      } else {
        console.warn('chartInstance 未初始化')
      }
    }

    window.addEventListener('resize', handleResize)

    // 添加组件销毁时的清理
    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
      chartInstance?.dispose()
    })
  })
})
watch(visibleItems, () => {
  itemsRef.value = []
  nextTick(() => {
    updatePositions()
  })
})
const handleScroll = (e: Event) => {
  const target = e.target as HTMLElement
  scrolltop.value = target.scrollTop
}
</script>

<template>
  <div class="test-container">
    <div class="chart-section">
      <div ref="chartRef" class="chart-container"></div>
    </div>

    <div class="list-container">
      <div class="description">测试聊天记录，共{{ messages.length }}条</div>
      <div class="virtual-list" ref="containRef" @scroll="handleScroll">
        <div class="place" :style="{ height: placeHeight + 'px' }"></div>
        <div class="list" :style="{ transform: `translate3d(0, ${offset}px, 0)` }">
          <div
            class="list-item"
            :class="item.role"
            v-for="item in visibleItems"
            :data-index="item.id"
            :ref="setItemRef"
            :key="item.id"
          >
            <div class="avatar" :class="item.role"></div>
            <div class="bubble">{{ item.id }} {{ item.content }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.test-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  padding-top: 120px;
  gap: 20px;
}

.chart-section {
  width: 600px;
  height: 350px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  box-sizing: border-box;
}
.chart-container {
  width: 100%;
  height: 100%;
}
.list-container {
  display: flex;
  flex-direction: row;
  height: 500px;
  width: 80vw;
  margin: 100px auto;
  border: 1px solid #ccc;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  overflow: hidden;
}
.description {
  width: 200px;
  padding: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #dff9fc;
}
.virtual-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  position: relative;
}
.list {
  position: absolute;
  padding: 20px;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
}
.place {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}
.list-item {
  display: flex;
  padding-bottom: 16px;
  box-sizing: border-box;
  gap: 12px;
  width: 100%;
  position: relative;
}
.list-item.user {
  flex-direction: row-reverse;
}
.avatar {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #ccc;
}
.bubble {
  padding: 10px 15px;
  border: 1px solid #eee;
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  max-width: 83.5%;
}
</style>
