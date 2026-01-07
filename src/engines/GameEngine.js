import sfxMap from '@/utils/sfxMap'
import { useAudioStore } from '@/stores/audio'
export class GameEngine {
  constructor(gameStore) {
    this.store = gameStore
    this.audioStore = useAudioStore()
    this.scriptData = null
    this.currentNodeId = null
    this.nodes = {}
  }
  //加载并解析剧本
  async loadScript() {
    const response = await fetch('/scripts/playBook.json')
    if (!response.ok) {
      throw new Error(`HTTP错误! 状态码: ${response.status}`)
    }
    this.scriptData = await response.json()
    for (const node of this.scriptData.nodes) {
      this.nodes[node.id] = node;
    }
    // 把 json 里的 clues 放到 store 中
    if (Array.isArray(this.scriptData.clues)) {
      this.store.allClues = this.scriptData.clues
    } else {
      this.store.allClues = []
    }
    console.log("剧本加载完成");
    return true

  }

  getCurrentNode() {
    // 获取当前节点
    return this.nodes[this.currentNodeId] || null;
  }

  jumpToNode(nodeId) {
    // 跳转到指定节点
    if (!this.nodes[nodeId]) {
      console.warn('节点不存在', nodeId);
      return false;
    }
    this.currentNodeId = nodeId;
    console.log("跳转到了:", this.currentNodeId);

    return true;
  }

  startFrom(nodeId) {
    // this.running = true;
    //从某个节点开始
    console.log("startFrom", this.nodes[nodeId]);
    this.jumpToNode(nodeId);
    return this.executeLoop();
  }

  //决定下一个节点执行哪个
  goNext(node, override) {
    const nextId = override || node.next || null;
    if (nextId && this.nodes[nextId]) {
      this.currentNodeId = nextId;
    } else {
      // 若没有 next 则停止引擎
      this.currentNodeId = null;
      // this.running = false;
    }
  }

  //执行剧本的所有节点直到结束
  async executeLoop(startNodeId) {
    // 如果传入了开始节点，先跳过去
    if (startNodeId) this.jumpToNode(startNodeId);
    // 每次循环执行一个节点
    while (this.currentNodeId) {
      await this.executeNode(this.currentNodeId);
    }
  }

  //执行每一个节点的逻辑
  async executeNode(nodeId) {
    const node = this.nodes[nodeId];
    if (!node) {
      console.warn('执行不存在节点', nodeId);
      // this.running = false;
      return;
    }
    this.currentNode = nodeId
    this.store.currentNode = nodeId

    switch (node.type) {
      case 'scene':
        await this.handleScene(node);
        break;
      case 'dialog':
        await this.handleDialog(node);
        break;
      case 'branch':
        await this.handleBranch(node);
        break;
      default:
        console.warn('未知节点类型', node.type);
        break;
    }

  }
  //1.处理场景切换节点
  async handleScene(node) {

    // 1.1 切换背景（有就换，没有就保持原样）
    if (node.background) {
      this.store.currentBackground = node.background
    }
      this.store.currentCharacter = node.character
    this.store.currentText = node.text
    // 1.2 处理bgm、sfx
    if (node.bgm !== undefined) {
      // 显式声明了 bgm 字段（包括 'STOP'）
      this.store.setBgm(node.bgm);
    }
    if (node.sfx) {
      const src = sfxMap[node.sfx]
      if (src) {
        this.audioStore.playSfx(src)
      }
    }
    //新增：处理线索
    if (node.clueId) {
      this.store.addClue(node.clueId)
    }
    // 1.3 等待3秒之后，直接跳到下一个节点
    await new Promise(resolve => {
      setTimeout(resolve, 3000)
    })
    this.goNext(node)

  }

  //2.处理对话节点
  async handleDialog(node) {
    // 2.1 音乐处理
    if (node.bgm !== undefined) { // 显式声明了 bgm 字段（包括 'STOP'）
      this.store.setBgm(node.bgm);
    }
    if (node.sfx) {
      const src = sfxMap[node.sfx]
      if (src) {
        this.audioStore.playSfx(src)
      }
    }
    // 2.2设置背景
    this.store.currentBackground = node.background
    // 2.3设置人物，先判断是不是有两个人物，不是就按普通的处理
    const chars = Array.isArray(node.characters) ? node.characters : null

    if (chars && chars.length > 0) {
      const main = chars[0]
      const sub = chars[1] || null

      this.store.currentCharacter = main.character || null
      this.store.currentExpression = main.expression || 'normal'
      this.store.mainAnim = main.anim || ''

      if (sub) {
        this.store.subCharacter = sub.character || ''
        this.store.subExpression = sub.expression || 'normal'
        this.store.subAnim = sub.anim || ''
      } else {
        // 没有副角色就清空
        this.store.subCharacter = ''
        this.store.subExpression = ''
        this.store.subAnim = ''
      }
    } else {
      // 老写法：单个 character / expression
      this.store.currentCharacter = node.character || null
      this.store.currentExpression = node.expression || 'normal'
      this.store.mainAnim = node.anim || ''
      // 老节点默认没有副角色
      this.store.subCharacter = ''
      this.store.subExpression = ''
      this.store.subAnim = ''
    }
    // 2.4设置文字
    this.store.currentText = node.text || ''
    this.store.addHistory(node)

    // 2.5暂停，等待玩家点击后再继续
    await new Promise(resolve => {
      this.store.onAdvance = resolve
    })
    //新增：处理线索
    if (node.clueId) {
      this.store.addClue(node.clueId)
    }
    // 进入下一个节点
    this.goNext(node)
  }
  // 3.处理选择节点
  async handleBranch(node) {
    // 3.1 音乐处理（和 dialog 一样，可以复用）
    console.log("chulixuanze");

    if (node.bgm !== undefined) { // 显式声明了 bgm 字段（包括 'STOP'）
      this.store.setBgm(node.bgm);
    }
    if (node.sfx) {
      const src = sfxMap[node.sfx]
      if (src) {
        this.audioStore.playSfx(src)
      }
    }

    // 3.2 背景
    if (node.background) {
      this.store.currentBackground = node.background
    }

    // 3.3 人物（通常是“旁白”）
    this.store.currentCharacter = node.character || null
    this.store.currentExpression = node.expression || 'normal'
    this.store.mainAnim = node.anim || ''
    this.store.subCharacter = ''
    this.store.subExpression = ''
    this.store.subAnim = ''

    // 3.4 文本 + 把当前分支节点丢进 store，让 UI 渲染选项
    this.store.currentText = node.text || ''
    this.store.currentBranchNode = node
    this.store.addHistory(node)

    // 3.5 等待玩家从 UI 里选一个选项
    const nextId = await new Promise(resolve => {
      this.store.onChoose = (targetNodeId) => {
        resolve(targetNodeId)
      }
    })

    // 3.6 清理分支状态
    this.store.currentBranchNode = null
    this.store.onChoose = null

    // 3.7 按玩家选择跳到对应节点
    this.goNext(node, nextId)
  }

}
