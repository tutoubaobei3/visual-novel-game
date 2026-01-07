<!-- src/components/BranchOptions.vue -->
<script setup>
import { defineProps } from 'vue'
import { useGameStore } from '@/stores/game'

const props = defineProps({
  options: {
    type: Array,
    required: true
  }
})

const gameStore = useGameStore()

const handleClick = (opt) => {
  // 通知引擎跳到 opt.next 对应的节点
  gameStore.chooseBranch(opt.next)
}
</script>

<template>
  <div class="branch-options">
    <div v-for="(opt, idx) in props.options" :key="opt.id || idx" class="branch-option" @click.stop="handleClick(opt)">
      {{ opt.text }}
    </div>
  </div>
</template>

<style scoped>
.branch-options {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  gap: 50px;
  /* z-index: 3; */
}

.branch-option {

  border: none;
  border-radius: 18px;
  line-height: 65px;
  height: 65px;
  width: 700px;
  font-size: 30px;
user-select: none;
  font-family: 'YouYuan';
  text-align: center;
  color: #E0E0E0;
  padding: 20px;

  background: rgba(19, 171, 236, 0.4);
  /* 玻璃拟态*/
  backdrop-filter: blur(8px);
  /* 高级发光边框 */
  border: 2px solid rgba(19, 171, 236, 0.6);
  box-shadow:
    0 0 20px rgba(19, 171, 236, 0.4),
    inset 0 0 30px rgba(19, 171, 236, 0.15);
  border-radius: 25px;
  font-family: 'YouYuan';
  color: #E0E0E0;
}

.branch-option:hover {
  scale: 1.01;
  box-shadow:
    0 3px 8px rgba(0, 0, 0, 0.2),
    inset 0 0 10px rgba(19, 171, 236, 0.15);
}
</style>
