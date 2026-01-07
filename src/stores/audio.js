import { defineStore } from "pinia"
import hoverSoundFile from '../assets/video/hoverSound.mp3'
export const useAudioStore=defineStore('audio',{
state:()=>({
  bgmVolume:0.3,
  sfxVolume:0.8,
  bgmAudio:null,
  currentBgmId:null,
  soundEffect:new Audio(hoverSoundFile)

}),
actions:{
  //把设置中的音量应用到所有音频
  applyVolume(){
      if (this.bgmAudio) {
        this.bgmAudio.volume = this.bgmVolume
      }
      this.soundEffect.volume=this.sfxVolume
  },
  //修改背景音乐和音效的声音
  setBgmVolume(v){
    this.bgmVolume=v
    this.applyVolume()
  },
  setSfxVolume(v){
    this.sfxVolume=v
    this.applyVolume()
  },
  //播放背景音乐
    async playBgm(id, src, { loop = true, fade = 0.6 } = {}) {
      if (this.currentBgmId === id && this.bgmAudio) {
        return
      }
      const oldAudio = this.bgmAudio
      const audio = new Audio(src)
      audio.loop = loop
      audio.volume = 0
      audio.play().catch(() => {})

      this.bgmAudio = audio
      this.currentBgmId = id
      this.applyVolume()
      // 简单淡入
      if (fade > 0) {
        this.fadeVolume(audio, 0, this.bgmVolume, fade)
      } else {
        audio.volume = this.bgmVolume
      }
      // 旧 BGM 淡出并停止
      if (oldAudio) {
        this.fadeVolume(oldAudio, oldAudio.volume, 0, fade, () => {
          oldAudio.pause()
        })
      }
    },
    //停止背景音乐
    stopBgm({ fade = 0.4 } = {}) {
      if (!this.bgmAudio) return
      const audio = this.bgmAudio
      this.currentBgmId = null
      if (fade > 0) {
        this.fadeVolume(audio, audio.volume, 0, fade, () => audio.pause())
      } else {
        audio.pause()
      }
    },
    //背景音乐淡入淡出的方法
    fadeVolume(audio, from, to, durationSec, onEnd) {
      const steps = 15
      const stepTime = (durationSec * 1000) / steps
      let current = 0
      const diff = to - from

      const timer = setInterval(() => {
        current++
        const t = current / steps
        audio.volume = from + diff * t
        if (current >= steps) {
          clearInterval(timer)
          audio.volume = to
          onEnd && onEnd()
        }
      }, stepTime)
    },
    //播放音效
    playSfx(src) {
      const audio = new Audio(src)
      audio.volume = this.sfxVolume
      audio.play().catch(() => {})
    },


}
})
