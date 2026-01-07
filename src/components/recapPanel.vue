<script setup>
import { computed } from 'vue'
import { useGameStore } from '@/stores/game'
const modelValue=defineModel()
const gameStore = useGameStore()

// 假设之前在 store 里有 history，没有的话这里先占个坑
const items = computed(() => gameStore.history || [])
</script>

<template>
  <div v-if="modelValue" class="recap-root" @click.stop>
    <div class="recap-panel">
      <div class="recap-header">
        <div class="recap-title">剧情回顾</div>
        <el-button size="small" type="primary" @click="modelValue=false">
          返回游戏
        </el-button>
      </div>

      <div v-if="items.length === 0" class="recap-empty">
        暂无剧情记录
      </div>

      <div v-else class="recap-list">
        <div
          v-for="item in items"
          :key="item.id"
          class="recap-item"
        >
          <div  class="recap-meta">
            <span v-if="item.speaker" class="recap-speaker">
              {{ item.speaker }}
            </span>
          </div>
          <div v-if="item.text" class="recap-text">
            {{ item.text }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
  html{
    scrollbar-color: #888 rgba(0,0,0,0); /* 滑块颜色 轨道颜色 */
  }
  .recap-root {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  z-index: 101;

  }

/* 中间主面板：类似对话框的卡片风格 */
 .recap-panel {
  width: 80%;
  max-width: 1000px;
  height: 70%;
  max-height: 600px;
  display: flex;
  flex-direction: column;
  padding: 16px 20px;
  border-radius: 12px;
  background: rgba(19, 171, 236, 0.25);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(19, 171, 236, 0.6);
  box-shadow:
    0 0 20px rgba(19, 171, 236, 0.4),
    inset 0 0 30px rgba(19, 171, 236, 0.15);
  font-family: 'YouYuan';
  color: #E0E0E0;
}

/* 头部：标题 + 返回按钮 */
.recap-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.el-button{
  width: 150px;
  height: 50px;
  /* font-size: 40px; */
  background: rgba(19, 171, 236, 0.7)
}
.recap-title {
  font-size: 30px;
  font-weight: 600;
  letter-spacing: 0.1em;
}

/* 空状态 */
.recap-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 25px;
}

/* 列表区域：可滚动 */
.recap-list {
  flex: 1;
  margin-top: 4px;
  padding-right: 8px;
  overflow-y: auto;
}

/* 每一条记录 */
.recap-item {
  padding: 8px 10px;
  margin-bottom: 6px;
  border-radius: 8px;
  /* background: #E0E0E0; */
  color: #05060a;
  border: 1px solid transparent;
  transition: background 0.15s, border-color 0.15s;
}

/* 上面一行：时间 + 说话人 */
.recap-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2px;
}

.recap-speaker {
  font-size: 23px;
  color: rgb(19, 171, 236);
}

/* 文本内容：类似对话文字 */
.recap-text {
  font-size: 19px;
  line-height: 1.5;
  color: #e0e0e0;
  word-break: break-word;
}

</style>
