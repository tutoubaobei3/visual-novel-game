<script setup>
import {  computed } from 'vue'
import { useAudioStore } from '@/stores/audio'
import { storeToRefs } from 'pinia'
const modelValue = defineModel()

const audioStore=useAudioStore()
const {bgmVolume,sfxVolume}=storeToRefs(audioStore)


// 动态百分比变量，用于 linear-gradient
const bgmPercent = computed(() => (bgmVolume.value * 100) + '%')
const sfxPercent = computed(() => (sfxVolume.value * 100) + '%')
</script>
<template>
  <!-- 遮罩层 -->
  <div v-if="modelValue" class="overlay" @click.stop></div>
  <div class="settingDialog" v-if="modelValue" @click.stop>
    <div class="content">
      <div class="volume-controls">
        <div class="Bgm-control">
          <label for="bgm">BGM 音量</label>
          <input id="bgm" type="range" min="0" max="1" step="0.01" v-model="bgmVolume"
            :style="{ '--percent': bgmPercent }" @input="audioStore.setBgmVolume(bgmVolume)"/>
        </div>

        <div class="effects-control">
          <label for="sfx">音效音量</label>
          <input id="sfx" type="range" min="0" max="1" step="0.01" v-model="sfxVolume"
            :style="{ '--percent': sfxPercent }" @input="audioStore.setSfxVolume(sfxVolume)" />
        </div>
      </div>
      <button class="returnGame" @mouseenter="audioStore.soundEffect.play" @click.stop="modelValue = false">
        返回
      </button>

    </div>
  </div>
</template>
<style scoped lang="less">
/* 遮罩层 */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
}

/* 弹窗容器 */
.settingDialog {
  position: fixed;
  width: 900px;
  height: 430px;
  margin: 200px auto;
  left: 0;
  right: 0;
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 101;

  background-image: url('../assets/images/menu-background.jpg');
  background-size: contain;
  background-repeat: no-repeat;
  background-color: rgba(0, 0, 0, 0.2);
  background-blend-mode: darken;
  box-shadow: 0 0 20px rgba(19, 171, 236, 0.4), inset 0 0 30px rgba(19, 171, 236, 0.15);
  border-radius: 25px;
  transition: all 0.3s ease;
}

/* 滑块容器 */
.volume-controls {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 40px;
  margin-bottom: 10px;
}

/* 单个音量控件 */
.Bgm-control,
.effects-control {
  display: flex;
  flex-direction: row;
  /* 左右排列 */
  align-items: center;
  gap: 20px;
}

.Bgm-control label,
.effects-control label {
  width: 160px;
  text-align: right;
  color: #E0E0E0;
  font-size: 22px;
  font-family: 'YouYuan';
  font-weight: bold;
}

/* 滑块样式 */
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 10px;
  border-radius: 5px;
  background: linear-gradient(to right,
      #E0E0E0 0%,
      #0d7bb5 var(--percent),
      rgba(127, 127, 127, 0.6) var(--percent),
      rgba(127, 127, 127, 0.6) 100%);
  cursor: pointer;
  transition: background 0.2s;
}

/* 滑块原点 thumb */
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #13abec;
  border: 2px solid #0d7bb5;
  cursor: pointer;
}

input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #13abec;
  border: 2px solid #0d7bb5;
  cursor: pointer;
}

/* 返回按钮 */
button.returnGame {
  margin-top: 70px;
  // margin: 0,auto;
  margin-left: 70px;
  // margin-bottom: 10px;
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
  background-color: rgba(0, 0, 0, 0.1);
  background-blend-mode: darken;
  transition: 0.2s ease;

}

button.returnGame:hover {
  scale: 1.06;
}
</style>
