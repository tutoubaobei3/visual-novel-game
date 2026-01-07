<!-- src/components/CluePanel.vue -->
<script setup>
import { computed } from 'vue'
import { useGameStore } from '@/stores/game'

const game = useGameStore()
const modelValue = defineModel()
// 已获得线索数量 / 总数
const collectedCount = computed(() => game.collectedClues.length)
const totalCount = computed(() => game.allClues.length)
</script>

<template>
  <div class="clue-root" v-if="modelValue" @click.stop>
    <div class="clue-panel">
      <div class="clue-header">
        <div class="clue-title">线索一览</div>
        <div class="clue-count">
          已获得 {{ collectedCount }} / {{ totalCount }}
        </div>
        <el-button size="small" type="primary" @click="modelValue = false">
          返回游戏
        </el-button>
      </div>

      <div class="clue-list">
        <div v-for="clue in game.allClues" :key="clue.id" class="clue-item"
          :class="{ 'clue-collected': game.hasClue(clue.id), 'clue-locked': !game.hasClue(clue.id) }">
          <div class="clue-name">
            <!-- 已获得显示真名，未获得可以显示 ??? -->
            {{ game.hasClue(clue.id) ? clue.name : '？？？' }}
          </div>

          <div class="clue-desc">
            <!-- 已获得显示描述，未获得显示提示文字 -->
            <span v-if="game.hasClue(clue.id)">
              {{ clue.desc }}
            </span>
            <span v-else>
              尚未发现该线索
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.clue-root {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  z-index: 101;
}

.clue-panel {
  width: 80%;
  max-width: 1000px;
  height: 70%;
  max-height: 600px;
  display: flex;
  flex-direction: column;
  padding: 16px 20px;
  border-radius: 12px;
  background: rgba(19, 171, 236, 0.4);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(19, 171, 236, 0.6);
  box-shadow:
    0 0 20px rgba(19, 171, 236, 0.4),
    inset 0 0 30px rgba(19, 171, 236, 0.15);
  font-family: 'YouYuan';
  color: #E0E0E0;
}

.clue-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.clue-title {
  font-size: 30px;
  font-weight: 600;
  letter-spacing: 0.1em;
}

.clue-count {
  font-size: 16px;
  /* opacity: 0.8; */
}

.el-button {
  width: 150px;
  height: 50px;
  /* font-size: 40px; */
  background: rgba(19, 171, 236, 0.7)
}

.clue-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 60vh;
  overflow-y: auto;
}

.clue-item {
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: background 0.2s, transform 0.1s;
}
.clue-item.clue-collected {
  background: rgba(0, 255, 255, 0.2);
  border-color: rgba(0, 255, 255, 0.7);
  box-shadow: 0 0 8px rgba(0, 255, 255, 0.3);
}
.clue-item:hover {
  transform: translateY(-1px);
}

.clue-name {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 4px;
}

.clue-desc {
  font-size: 17px;
  line-height: 1.5;
}

</style>
