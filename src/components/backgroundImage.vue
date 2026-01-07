<script setup>
import { computed } from 'vue'
import { useGameStore } from '@/stores/game'

// 从 pinia 读取当前背景
const gameStore = useGameStore()

// 计算属性：当前背景图片
const backgroundImage = computed(() => gameStore.currentBackground)
</script>

<template>
  <transition name="bg-fade">
  <div
    v-if="backgroundImage"
    :key="backgroundImage"
    class="background"
    :style="{ backgroundImage: `url(${backgroundImage})` }"
  ></div>
  </transition>
</template>

<style scoped>
.background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  z-index: -1;   /* 放到最底层 */
}
/* 背景淡入淡出 */
.bg-fade-enter-active,
.bg-fade-leave-active {
  transition: opacity 1s ease;
}
.bg-fade-enter-from,
.bg-fade-leave-to {
  opacity: 0;
}
</style>
