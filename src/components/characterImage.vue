<script setup>
import { computed } from 'vue'
import { useGameStore } from '@/stores/game'

const gameStore = useGameStore()

// 只有一个立绘，用 currentCharacter
const mainChar = computed(() => ({
  character: gameStore.currentCharacter,
  expression: gameStore.currentExpression,
  anim: gameStore.mainAnim
}))

function getSrc(ch) {
  if (!ch.character) return null
  const expression = ch.expression || 'normal'
  return `/images/characters/${ch.character}-${expression}.png`
}

function animClass(anim) {
  if (!anim) return ''
  return `anim-${anim}` // 如 anim-fade-in / anim-shake 等
}
</script>

<template>
  <div class="portrait-layer">
    <!-- 一个角色，固定右侧 -->
    <transition name="portrait-fade">
      <img
        v-if="getSrc(mainChar)"
        :key="mainChar.character + '-' + mainChar.expression"
        class="portrait portrait-right"
        :class="animClass(mainChar.anim)"
        :src="getSrc(mainChar)"
        alt=""
      />
    </transition>
  </div>
</template>

<style scoped>
.portrait-layer {
  position: fixed;
  inset: 0;
  pointer-events: none;
}

/* 通用立绘 */
.portrait {
  position: absolute;
  bottom: 0;
  transform-origin: bottom center;
}

/* 右侧单立绘 */
.portrait-right {
  right: 5%;
  transform: translateX(0) scale(1.5); /* 保留之前的大尺寸 */
  z-index: 2;
}

/* 出现/消失的淡入淡出 */
.portrait-fade-enter-active,
.portrait-fade-leave-active {
  transition: opacity 0.4s ease;
}

.portrait-fade-enter-from,
.portrait-fade-leave-to {
  opacity: 0;
}

/* 动画例子（保留） */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(1);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.anim-fade-in {
  animation: fadeIn 0.4s ease-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.anim-shake {
  animation: shake 0.3s ease-in-out;
}

/* 可选：漂浮 idle 动画 */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-6px); }
}

.anim-float {
  animation: float 2s ease-in-out infinite;
}
</style>
