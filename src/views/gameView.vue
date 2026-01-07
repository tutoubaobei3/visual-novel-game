<script setup>
import { ref, watch, onBeforeUnmount, onMounted, defineAsyncComponent} from 'vue'
import { useGameStore } from '@/stores/game'
import { useAudioStore } from '@/stores/audio'
import dialogBox from '../components/dialogBox.vue'
import backgroundImage from '../components/backgroundImage.vue'
import characterImage from '@/components/characterImage.vue'
import '@/assets/iconfont/iconfont.css'
//非首屏组件懒加载
const systemSettings =defineAsyncComponent(()=>import('../components/systemSettings.vue'))
const servicesMenu =defineAsyncComponent(()=>import('../components/servicesMenu.vue'))
const branchOptions= defineAsyncComponent(()=>import('@/components/branchOptions.vue'))
//挂载时初始化pinia，用pinia启动引擎初始化游戏
const gameStore = useGameStore()

// 是否显示封面
const showCover = ref(true)
//点击封面开始游戏
const startGame = async () => {
  //封面淡出
  showCover.value = false
  await gameStore.initGame()
  await gameStore.startGame()
}

//1.菜单和设置按钮
const isMenu = ref(false)
const isSetting = ref(false)

// 2.实现打字机的效果
const fullText = ref('')
const displayText = ref('')
// 2.1是否正在打字
const isTyping = ref(false)
// 定时器句柄
let timer = null
// 监听 pinia 里的 currentText，每次变就重新打一遍
watch(
  () => gameStore.currentText,
  (newText) => {
    startTyping(newText)
  },
  { immediate: true } // 一开始就把初始值打出来
)
// 2.2开始打一段新的文本
function startTyping(text) {
  // 先清掉上一次的定时器
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  fullText.value = text || ''
  displayText.value = ''
  if (!fullText.value) {
    isTyping.value = false
    return
  }
  isTyping.value = true
  let index = 0
  const speed = 40 // 打字速度：毫秒/字符，可调大或调小
  timer = setInterval(() => {
    displayText.value += fullText.value.charAt(index)
    index++
    if (index >= fullText.value.length) {
      isTyping.value = false
      clearInterval(timer)
      timer = null
    }
  }, speed)
}
//2.3整个页面的点击效果
const clickDown = () => {
  // 如果当前是分支节点，有选项，就完全禁用点击推进对白
  if (gameStore.currentBranchNode) {
    return
  }
  if (!showCover.value) {
    if (isTyping.value) {
      // 正在打字 → 直接跳到完整文本
      if (timer) {
        clearInterval(timer)
        timer = null
      }
      displayText.value = fullText.value
      isTyping.value = false
    } else {
      // 已经打完 → 进入下一句对白
      gameStore.nextDialog()
    }
  }
}
// 组件销毁时清掉计时器
onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})

//3.播放按钮声音
const audioStore = useAudioStore()
//4.重新开始 → 回到封面
const handleRestartToCover = () => {
  // 清空 pinia 状态
  gameStore.$reset()
  gameStore.history = []
  // 确保引擎也回到初始（根据你 state 里写的初始值）
  audioStore.stopBgm()
  gameStore.gameEngine = null
  showCover.value = true
}
// 5.登录功能
const playerNameInput = ref('')

// 封面上的“开始游戏”按钮逻辑
const handleLoginStart = async () => {
  const name = playerNameInput.value.trim()
  if (!name) {
    window.alert('请输入名字')
    return
  }
  gameStore.playerName = name

  // 检查是否有这个名字的自动存档
  const autoKey = gameStore.getAutoSaveKey(name)
  const raw = autoKey ? localStorage.getItem(autoKey) : null

  if (raw) {
    const useContinue = window.confirm(`检测到「${name}」的自动存档，是否继续上次的进度？\n按「确定」继续，按「取消」重新开始。`)

    if (useContinue) {
      // 直接从自动存档继续
      showCover.value = false
      const ok = await gameStore.loadAutoForName(name)
      console.log(ok.value);

      if (!ok) {
        // 如果载入失败，就从头开始
        startGame()
      }
    } else {
      // 玩家选择重新开始
      gameStore.clearAutoForName(name)
      startGame()
    }
  } else {
    // 没有自动存档，正常新游戏
    startGame()
  }
}
// 页面关闭时自动保存一次（尽量保存当前进度）
const handleBeforeUnload = () => {
  gameStore.saveAuto()
}
//空格抬起的效果和鼠标点击一样
const handleKeydown = (e) => {
  if (e.code === 'Space') {

    e.preventDefault(); // 阻止页面滚动
    // 关键：只有菜单关闭时才响应空格
    if (isMenu.value || isSetting.value) {
      return

    }
    else {
      clickDown();
    }
  }
};
onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)
  window.addEventListener('keydown', handleKeydown)
})
</script>
<template>
  <!-- 整个页面 -->
  <div @click="clickDown()">
    <!-- 封面 -->
    <div v-if="showCover" class="cover" @click.stop>
      <div class="cover-title">名侦探柯南：诅咒假面的冷笑</div>
      <!-- 登录 -->
      <div class="cover-login">
        <!-- <div class="cover-hint">输入名称开始游戏</div> -->
        <input v-model="playerNameInput" type="text" class="name-input" placeholder="输入名称开始游戏" />
        <button class="start-button" @click="handleLoginStart">
          开始游戏
        </button>
      </div>

    </div>
    <!-- 背景组件 -->
    <background-image></background-image>
    <!-- 人物立绘 -->
    <character-image></character-image>
    <!-- 对话框组件 -->
    <dialog-box :text="displayText"></dialog-box>
    <!-- 选择组件 -->
    <branch-options v-if="gameStore.currentBranchNode" :options="gameStore.currentBranchNode.options" />
    <!-- 菜单设置选项 -->
    <div class="menuButton" @click.stop="isMenu = true" @mouseenter="audioStore.soundEffect.play">
      <i class="iconfont icon-caidan"></i>
      <span>菜单</span>
    </div>
    <div class="settingsButton" @click.stop="isSetting = true" @mouseenter="audioStore.soundEffect.play">
      <i class="iconfont icon-shezhi"></i>
      <span>设置</span>
    </div>
    <!-- 菜单设置组件 -->
    <services-menu v-model="isMenu" @restart-to-cover="handleRestartToCover"></services-menu>
    <system-settings v-model="isSetting"></system-settings>
  </div>
</template>

<style scoped lang="less">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  width: 100%;
  height: 100%;
  overflow-x: hidden;
}

.cover {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  cursor: pointer;

  background-image: url('@/assets/images/GameCover.jpg');
  background-size: cover;
  background-position: center;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.cover-title {
  color: #ffffff;
  font-size: 48px;
  font-weight: bold;
  text-align: left;
  margin-bottom: 30px;
  margin-top: 130px;

  /* Galgame 常用的发光效果 */
  text-shadow:
    0px 0px 10px rgba(255, 255, 255, 0.8),
    0px 0px 20px rgba(255, 255, 255, 0.6),
    0px 0px 30px rgba(135, 206, 250, 0.7);

  letter-spacing: 4px;
  width: 80%;
}


.cover-login {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px 32px;
  background: rgba(0, 0, 0, 0);
  border-radius: 12px
}

.name-input {
  width: 300px;
  height: 60px;
  display: block;
  padding: 8px 12px;
  text-align: center;
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-color: #ffcc33;
  background: rgba(0, 0, 0, 0);
  color: white;
  outline: none;
  font-size: 25px;
  font-family: 'YouYuan';
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
  transform: translate(-450px, 10px);
}

.name-input:placeholder-shown {
  font-size: 25px;
  font-family: 'YouYuan';
  font-weight: bold;
  animation: blink 2.5s infinite;

}

.name-input:focus {
  border-color: #ffcc33;
  box-shadow: 0 0 8px rgba(255, 204, 51, 0.6);
  background: rgba(0, 0, 0, 0.7);
}

.start-button {
  margin-top: 4px;
  width: 220px;
  height: 60px;
  padding: 8px 12px;
  border: none;
  border-radius: 10px;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 2px;
  color: #1a1a1a;
  background: linear-gradient(135deg, #ffdd66, #ffb733);
  cursor: pointer;
  transform: translate(-150px, -68px);
  transition: transform 0.1s ease, box-shadow 0.1s ease, background 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
}

.start-button:hover {
  background: linear-gradient(135deg, #ffe58a, #ffc24a);
  transform: translate(-150px, -70px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.65);
}


@keyframes blink {
  0% {
    opacity: 0.5;
  }

  50% {
    opacity: 1;
  }

  100% {
    opacity: 0.5;
  }
}

.menuButton,
.settingsButton {
  color: darkgrey;
  position: fixed;
  right: 50px;
  top: 30px;
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.3s;
  font-size: 20px;

  &:hover {
    color: rgb(19, 171, 236);
    opacity: 0.8;
  }

  span {
    text-align: center;
  }
}

.settingsButton {
  top: 120px;
}
</style>
