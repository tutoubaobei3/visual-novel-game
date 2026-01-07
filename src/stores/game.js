import { defineStore } from 'pinia'
import { GameEngine } from '@/engines/GameEngine'
import { useAudioStore } from '@/stores/audio'
import bgmMap from '@/utils/bgmMap'
export const useGameStore = defineStore('game', {
  state: () => ({
    gameEngine: null,
    //登陆用的名字
    playerName: '',
    // 当前游戏状态
    currentText: '',
    currentBackground: '',
    currentCharacter: '',
    currentExpression: '',
    currentAudio: '',
    // 新增：副立绘、动画、当前说话的角色
    subCharacter: '',
    subExpression: '',
    mainAnim: '',
    subAnim: '',
    currentBgmId: '',

    //是否等待点击
    onAdvance: null,

    //当前进度
    currentNode: '',
    collectedClues: [],
    allClues: [],

    //当前是否选择
    currentBranchNode: null,
    onChoose: null,
    //历史对话
    history: []
  }),
  getters: {
    hasClue: (state) => (id) => state.collectedClues.includes(id),
  },
  actions: {
    //清空游戏状态函数
    resetGameState() {
      this.currentText = ''
      this.currentBackground = ''
      this.currentCharacter = ''
      this.currentExpression = ''
      this.subCharacter = ''
      this.subExpression = ''
      this.mainAnim = ''
      this.subAnim = ''

      this.onAdvance = null

      this.currentNode = ''
      this.collectedClues = []

      this.showChoices = false
      this.currentChoices = []

      this.history = []  // ← 关键：清空历史对话
    },
    //功能1.初始化游戏时，启动游戏引擎并用它来加载剧本
    async initGame() {
      this.resetGameState()
      this.gameEngine = new GameEngine(this)
      await this.gameEngine.loadScript()
    },

    //功能2.开始游戏
    async startGame(startNodeId = "001") {
      console.log('游戏开始');
      await this.gameEngine.startFrom(startNodeId)
    },

    //功能3.推进对话
    nextDialog() {
      //如果在暂停的话
      if (this.onAdvance) {
        console.log("下一句");
        this.onAdvance()  // 调用 engine 暂停的 resolve()
      }
      else {
        console.log('no advance');
      }
    },
    //3.1
    chooseBranch(nextId) {
      if (this.onChoose) {
        this.onChoose(nextId)
      }
    },

    //3.2增加历史对话
    addHistory(ployNode) {
      if (!ployNode.text && !ployNode.speaker) {
        return
      }
      const last = this.history[this.history.length - 1]
      // 如果和最后一条一模一样，就不再重复添加
      if (
        last &&
        last.text === ployNode.text &&
        last.speaker === ployNode.character
      ) {
        return
      }
      this.history.push({
        speaker: ployNode.character || null,
        text: ployNode.text || null
      })
    },

    // 功能4. 重新开始游戏
    async restartGame() {
      // 简单粗暴：重新初始化引擎并从头开始
      await this.initGame()
      await this.startGame('001')
    },

    // 功能5.获取当前存档快照
    getSnapshot() {
      if (!this.gameEngine) return null

      return {
        // 引擎进度（当前在第几个节点）
        engine: {
          currentNodeId: this.gameEngine.currentNodeId
        },
        // 用来恢复画面/状态
        store: {
          currentText: this.currentText,
          currentBackground: this.currentBackground,
          currentCharacter: this.currentCharacter,
          currentExpression: this.currentExpression,
          currentNode: this.currentNode,
          collectedClues: this.collectedClues,
          // 以后有别的状态也可以加进来
          subCharacter: this.subCharacter,
          subExpression: this.subExpression,
          mainAnim: this.mainAnim,
          subAnim: this.subAnim,
          history: this.history,
          currentBranchNode: this.currentBranchNode,
          onChoose: this.onChoose,
          onAdvance: this.onAdvance,
          currentBgmId: this.currentBgmId,

        }
      }
    },

    // 功能6.从快照恢复
    async loadSnapshot(snapshot) {
      if (!snapshot || !this.gameEngine) return

      const { engine, store } = snapshot

      // 恢复 store 显示状态
      this.currentText = store.currentText
      this.currentBackground = store.currentBackground
      this.currentCharacter = store.currentCharacter
      this.currentExpression = store.currentExpression
      this.currentNode = store.currentNode
      this.collectedClues = store.collectedClues || []
      this.history = store.history

      this.subCharacter = store.subCharacter || ''
      this.subExpression = store.subExpression || ''
      this.mainAnim = store.mainAnim || ''
      this.subAnim = store.subAnim || ''
      this.currentBranchNode = store.currentBranchNode,
        this.onChoose = store.onChoose,
        this.onAdvance = store.onAdvance,
        this.currentBgmId = store.currentBgmId,

        // 恢复引擎进度并从这里继续执行
        this.gameEngine.currentNodeId = engine.currentNodeId

    },

    //功能7.存到localStorage的指定档位
    saveToSlot(slotId) {
      const snapshot = this.getSnapshot()
      if (!snapshot) return
      const data = {
        time: Date.now(),  // 存档时间，用来显示
        snapshot
      }
      localStorage.setItem(`detective-save-${slotId}`, JSON.stringify(data))

    },
    //7.1自动存档
    // 自动存档 key：跟玩家名绑定
    getAutoSaveKey(name) {
      const n = name || this.playerName
      if (!n) return null
      return `detective-autosave-${n}`
    },
    // 自动保存当前进度（基于 playerName）
    saveAuto() {
      if (!this.playerName) return
      const snapshot = this.getSnapshot()
      if (!snapshot) return

      const key = this.getAutoSaveKey()
      const data = {
        time: Date.now(),
        snapshot
      }
      localStorage.setItem(key, JSON.stringify(data))
      console.log('已自动保存到', key)
    },

    // 7.2读取指定名字的自动存档并恢复，返回 true/false 表示是否成功
    async loadAutoForName(name) {
      const key = this.getAutoSaveKey(name)
      if (!key) return false
      const raw = localStorage.getItem(key)
      if (!raw) {
        console.log('没有找到自动存档', key)
        return false
      }
      let data
      try {
        data = JSON.parse(raw)
      } catch (e) {
        console.warn('解析自动存档失败', e)
        return false
      }
      // 确保引擎先初始化
      if (!this.gameEngine) {
        await this.initGame()
      }
      this.loadSnapshot(data.snapshot)
      // 恢复 BGM：null / undefined 就停，其他就播对应的
      this.setBgm(data.currentBgmId ?? null)
      // 从存档点继续往下跑
      if (this.gameEngine.currentNodeId) {
        this.gameEngine.executeLoop(this.gameEngine.currentNodeId)
      }
      return true
    },
    // 7.3清除某个名字的自动存档（比如玩家选择“重新开始”）
    clearAutoForName(name) {
      const key = this.getAutoSaveKey(name)
      if (!key) return
      localStorage.removeItem(key)
    },

    // 功能8.从某个档位读取
    async loadFromSlot(slotId) {
      const raw = localStorage.getItem(`detective-save-${slotId}`)
      if (!raw) {
        console.log('没有找到存档')
        return false
      }
      const data = JSON.parse(raw)

      // 确保引擎先初始化过
      if (!this.gameEngine) {
        await this.initGame()
      }
      this.loadSnapshot(data.snapshot)
      // 从这个节点重新跑引擎
      this.setBgm(data.currentBgmId ?? null)
      if (this.gameEngine.currentNodeId) {
        // 不 await，让引擎自己跑，UI 不会卡住
        this.gameEngine.executeLoop(this.gameEngine.currentNodeId)
      }
      return true
    },

    // 9. 获取某个档位的预览信息（供 UI 使用）
    getSlotInfo(slotId) {
      const raw = localStorage.getItem(`detective-save-${slotId}`)
      if (!raw) return null

      try {
        const data = JSON.parse(raw)
        const snap = data.snapshot || {}
        const store = snap.store || {}

        return {
          time: data.time || null,
          background: store.currentBackground || '',
          text: store.currentText || ''
        }
      } catch (e) {
        console.warn('解析存档失败', e)
        return null
      }
    },
    // 新增：更新 BGM 并同步到音频管理器
    setBgm(id) {

      const audio = useAudioStore()

      if (!id || id === 'STOP') {
        // 表示当前节点不在播放bgm的区间
        this.currentBgmId = null
        audio.stopBgm()
        return
      }

      // 这里表示切换到一个新的bgm区间
      this.currentBgmId = id
      if (bgmMap[id]) {
        audio.playBgm(id, bgmMap[id])
      }
    },
    //新增：记录获得的线索
    addClue(id) {
      if (!this.collectedClues.includes(id)) {
        this.collectedClues.push(id)
      }
    },
    resetClues() {
      this.collectedClues = []
    },
  }
})
