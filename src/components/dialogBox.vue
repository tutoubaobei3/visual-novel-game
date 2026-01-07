<script setup>
import { computed} from 'vue'
import { useGameStore } from '@/stores/game'

const gameStore = useGameStore()
//1.显示角色和文本
const characterName = computed(()=> gameStore.currentCharacter
)
const props=defineProps({
  text:{
    type:String,
    default:''
  }
})

</script>

<template>
  <transition name="dialog-slide">
<div class="dialogBox" v-show="text">
  <div class="characterName">{{characterName}}</div>
  <div class="dialogText">{{ props.text }}</div>
</div>
</transition>
</template>

<style scoped lang="less">
.dialogBox{
  position: fixed;
  bottom: 40px;
  left: 2%;
  width: 90%;
  max-width: 90%;
  height: 25%;
  margin:  0 auto;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color:azure;
  letter-spacing: 2px;
  transition: opacity 0.8s ease;
  user-select: none;
  .characterName{
    width: 200px;
    height: 40px;
    border-radius: 10px;
    background: linear-gradient(to top, rgba(19, 171, 236, 0.6), rgba(255,255,255,0));

    // 文字属性
    text-align: center;
    line-height: 40px;
    color:azure;
    font-family:'YouYuan';
    font-weight: bold;
    font-size: 24px;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  }
  .dialogText{
    width: 100%;
    height: 75%;
    padding: 50px;
    background: linear-gradient(to top, rgba(19, 171, 236, 0.6), rgba(255,255,255,0));
    border-radius: 10px;
    font-family:'YouYuan';
    font-weight: bold;
    font-size: 25px;
    line-height: 38px;
  }
}
/* 对话框整体出现/消失 */
.dialog-slide-enter-active,
.dialog-slide-leave-active {
  transition: opacity 0.8s ease, transform 0.8s ease;
}
.dialog-slide-enter-from,
.dialog-slide-leave-to {
  opacity: 0;
  transform: translate(-50%, 10px); /* 稍微从下往上浮 */
}
</style>


