<script setup>
import { ref,defineAsyncComponent} from 'vue'
import { useGameStore } from '@/stores/game'
import { useAudioStore } from '@/stores/audio'
import {ElMessage} from 'element-plus'
const cluePanel = defineAsyncComponent(()=>import('./cluePanel.vue'))
const recapPanel = defineAsyncComponent(()=>import('@/components/recapPanel.vue'))

const modelValue = defineModel()
const emit = defineEmits(['restartToCover'])
const gameStore = useGameStore()
//播放音效
const audioStore = useAudioStore()
const playSound = () => {
  audioStore.soundEffect.play();
}

// 1.重新开始游戏
// 确认对话框
const restartConfirm = ref(false)
// 重新开始（回到封面）
const reStart = () => {
  restartConfirm.value = false
  emit('restartToCover')   // 通知父组件（gameview）自己去回封面
  modelValue.value = false // 关闭菜单
}
//2.展示存档面板（和读档共有）
const showSaveAndLoadPanel = ref(false)
const isSaveMode = ref(true) //是读档还是存档模式
const slots = [1, 2, 3, 4, 5, 6]
const showSavePanel = () => {
  showSaveAndLoadPanel.value = true
  isSaveMode.value = true
}
//3.读档界面
const showLoadPanel = () => {
  showSaveAndLoadPanel.value = true
  isSaveMode.value = false

}
//3.1 获取某个档位的预览信息（背景图 + 文本 + 时间）
const getSlotPreview = (slot) => {
  const info = gameStore.getSlotInfo
    ? gameStore.getSlotInfo(slot): null
  if (!info) {
    return {
      empty: true,
      background: '',
      text: '',
      time: null
    }
  }
  return {
    empty: false,
    background: info.background,
    text: info.text,
    time: info.time
  }
}

const formatTime = (time) => {
  if (!time) return ''
  return new Date(time).toLocaleString()
}

// 3.2点击某个档位卡片
const handleClickSlot = async (slot) => {
  if (isSaveMode.value) {
    // 存档
    gameStore.saveToSlot(slot)
    refreshKey.value++
      ElMessage({
        duration:1500,
          message: '存档成功',
          type: 'success',
          customClass:'my-message'
      })
  } else {
    // 读档
    const ok = await gameStore.loadFromSlot(slot)
    if (ok) {
      ElMessage({
        duration:1500,
          message: `已从档位 ${slot} 读取`,
          type: 'success',
      })
      showSaveAndLoadPanel.value = false // 读档成功后关闭存档面板
      modelValue.value = false         // 顺便把菜单也关掉
    }
  }
}

//3.3刷新存档界面
const refreshKey=ref(0)
// const refresh=()=>{

// }
//4.线索界面
const ifClues=ref(false)
//5.剧情回顾
const ifRecap =ref(false)
</script>
<template>
  <!-- 遮罩层 -->
  <div v-if="modelValue" class="overlay" @click.stop></div>
  <!-- 菜单界面 -->
  <div v-show="modelValue" class="menu" @click.stop>
    <div class="menu-content">
      <div class="grid-buttons">
        <button class="save" @mouseenter="playSound" @click="showSavePanel">存储档案</button>
        <button class="load" @mouseenter="playSound" @click="showLoadPanel">读取档案</button>
        <button class="recap" @mouseenter="playSound" @click="ifRecap=true">剧情回顾</button>
        <button class="clues-inquiry" @mouseenter="playSound" @click="ifClues=true">线索查询</button>
        <button class="restart" @mouseenter="playSound" @click="restartConfirm=true">重新开始</button>
        <button class="returnGame" @mouseenter="playSound" @click="modelValue = false">返回游戏</button>
      </div>
    </div>
  </div>
  <!-- 重新开始确认框 -->
  <div class="my-dialog" @click.stop>
    <el-dialog v-model="restartConfirm" width="500" align-center>
      <p>确定要重新开始游戏吗？</p>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="restartConfirm = false">取消</el-button>
          <el-button type="primary" @click="reStart">
            确认
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
  <!-- 存档读档对话框 -->
  <div class="my-dialog" >
    <el-dialog v-model="showSaveAndLoadPanel"
     width="900"
     align-center
     :show-close="false"
    @click.stop
    >
    <!-- 自定义标题 -->
     <p>{{ isSaveMode ? '选择存档槽位' : '选择读取的存档' }}</p>

      <div class="slot-grid" :key="refreshKey">
        <div v-for="slot in slots" :key="slot" class="slot-card" @click="handleClickSlot(slot)">
          <!-- 空档位：只显示“暂无存档”四个大字 -->
          <template v-if="getSlotPreview(slot).empty">
            <div class="slot-empty">
              暂无存档
            </div>
          </template>
          <!-- 有存档：显示背景缩略图 + 文本 + 时间 -->
          <template v-else>
            <div class="slot-thumb">
              <img :src="getSlotPreview(slot).background" alt="存档预览" class="slot-thumb-img" />
            </div>
            <div class="slot-info">
              <div class="slot-title">
                档位 {{ slot }}
              </div>
              <div  class="slot-text">
                {{ getSlotPreview(slot).text }}
              </div>
              <div class="slot-time">
                {{ formatTime(getSlotPreview(slot).time) }}
              </div>
            </div>
          </template>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showSaveAndLoadPanel = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
  <!-- 剧情回顾组件 -->
   <recap-panel v-model="ifRecap"></recap-panel>
<!-- 线索收集组件 -->
 <clue-panel v-model="ifClues"></clue-panel>

</template>
<style lang="less">
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
  /* 确保在页面上方 */
}

.menu {
  position: fixed;
  width: 1000px;
  height: 470px;
  margin: 150px auto;
  left: 0;
  right: 0;
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 101;

  background-image: url('../assets/images/menu-background.jpg');
  background-size: cover;
  background-color: rgba(0, 0, 0, 0.3);
  background-blend-mode: darken;
  /* 让遮罩与背景图混合得更柔和 */
  box-shadow:
    0 0 20px rgba(19, 171, 236, 0.4),
    inset 0 0 30px rgba(19, 171, 236, 0.15);
  border-radius: 25px;
  transition: all 0.3s ease;

  button {
    margin-top: 30px;
    border: none;
    border-radius: 18px;
    height: 65px;
    width: 180px;
    font-size: 22px;
    font-weight: bold;
    font-family: 'YouYuan';
    color: #E0E0E0;

    background-image: url('../assets/images/menuButton.png');
    background-size: 249%;
    background-position: center;
    background-color: rgba(0, 0, 0, 0.2);
    background-blend-mode: darken;
    transition: 0.2s ease;

  }

  button:hover {
    scale: 1.06;
    box-shadow:
      0 3px 8px rgba(0, 0, 0, 0.2),
      inset 0 0 10px rgba(19, 171, 236, 0.15);
  }

  //调整两排按钮之间的间距
  button:nth-child(1),
  button:nth-child(3) {
    margin-right: 40px;
  }

  button:nth-child(2),
  button:nth-child(4),
  button:nth-child(6) {
    margin-left: 40px;
  }

  .menu-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 40px;
    width: 100%;
    height: 80%;
  }
}
.my-message .el-message{
  top: 50% !important;          /* 垂直居中 */
  left: 50% !important;         /* 水平居中 */
  transform: translate(-50%, -50%) !important;  /* 真正居中 */
}

.grid-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  /* 两列 */
  gap: 25px;
}

.my-dialog .el-dialog {
  background: rgba(19, 171, 236, 0.25);
  /* 玻璃拟态（非常高级） */
  backdrop-filter: blur(10px);
  /* 高级发光边框 */
  border: 2px solid rgba(19, 171, 236, 0.6);
  box-shadow:
    0 0 20px rgba(19, 171, 236, 0.4),
    inset 0 0 30px rgba(19, 171, 236, 0.15);
  border-radius: 25px;
  font-family: 'YouYuan';
  color: #E0E0E0;

  p {
    font-size: 25px;
    color: #E0E0E0;
  }

  .el-button:nth-child(1) {
    background: #E0E0E0;

    span {
      color: dimgrey;
      font-size: 16px;
    }
  }

  .el-button:nth-child(2) {
    background: rgba(19, 171, 236, 0.25);
  }
}

//对话框通用的返回按钮
.el-button {
  width: 70px;
  height: 40px;
  border-radius: 16px;
  font-family: 'YouYuan';

  span {
    color: #E0E0E0;
    font-size: 16px;
  }
}

/* 存档缩略图网格样式 */
.slot-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.slot-card {
  width: 260px;
  height: 150px;
  padding: 8px;
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.35);
  box-shadow:
    0 0 10px rgba(19, 171, 236, 0.3),
    inset 0 0 10px rgba(19, 171, 236, 0.15);
  display: flex;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.slot-card:hover {
  transform: translateY(-2px);
  box-shadow:
    0 0 14px rgba(19, 171, 236, 0.5),
    inset 0 0 12px rgba(19, 171, 236, 0.2);
}
/* 空档位：只显示暂无存档四个大字，居中 */
.slot-empty {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #e0e0e0;
  font-size: 24px; /* 四个大字 */
  letter-spacing: 4px;
}
/* 有存档的缩略图 */
.slot-thumb {
  width: 60%;
  height: 100%;
  border-radius: 10px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
}
.slot-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.slot-info {
  width: 40%;
  padding-left: 8px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.slot-title {
  font-size: 20px;
  font-weight: bold;
  color: #fff;
}
.slot-text {
  font-size: 15px;
  color: #e0e0e0;
  max-height: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
.slot-time {
  font-size: 15px;
  color: #cccccc;
  text-align: right;
}
</style>
