// A simple corpus of "corporate speak" and "spam" words
const CORPUS_EN = [
  'meeting',
  'synch',
  'leverage',
  'synergy',
  'paradigm',
  'shift',
  'cloud',
  'native',
  'quarterly',
  'report',
  'action',
  'item',
  'circle',
  'back',
  'touch',
  'base',
  'deep',
  'dive',
  'bandwidth',
  'pipeline',
  'scalable',
  'solution',
  'framework',
  'agile',
  'scrum',
  'deliverable',
  'milestone',
  'stakeholder',
  'alignment',
  'strategic',
  'initiative',
  'growth',
  'optimization',
  'efficiency',
  'workflow',
  'process',
  'integration',
  'user',
  'experience',
  'interface',
  'backend',
  'frontend',
  'stack',
  'database',
  'server',
  'client',
  'protocol',
  'network',
  'security',
  'compliance',
  'audit',
  'review',
  'feedback',
  'loop',
  'ecosystem',
  'platform',
  'service',
  'product',
  'roadmap',
  'timeline',
  'budget',
  'resource',
  'allocation',
  'target',
  'audience',
  'market',
  'segment',
  'vertical',
  'horizontal',
  'channel',
  'funnel',
  'conversion',
  'metric',
  'kpi',
  'roi',
  'dashboard',
  'analytics',
  'insight',
  'data',
  'driven',
  'smart',
  'connected',
  'iot',
  'ai',
  'ml',
  'blockchain',
  'crypto',
  'web3',
  'metaverse',
  'nft',
  'digital',
  'transformation',
  'innovation',
  'disruption',
  'startup',
  'unicorn',
  'venture',
  'capital',
  'seed',
  'round',
  'exit',
  'ipo',
  'please',
  'kindly',
  'regards',
  'thanks',
  'hope',
  'well',
  'attached',
  'file',
  'document',
  'spreadsheet',
  'presentation',
  'slide',
  'deck',
  'email',
  'chat',
  'urgent',
  'priority',
  'critical',
  'blocker',
  'bug',
  'fix',
  'patch',
  'update',
  'upgrade',
  'migration',
  'deployment',
  'release',
  'version',
  'beta',
  'alpha',
  'test',
  'staging',
  'production',
  'environment',
  'config',
  'setting',
  'preference',
  'option',
  'feature',
  'request',
  'ticket',
  'support',
  'help',
  'manual',
  'guide'
]

const CORPUS_ZH = [
  '抓手',
  '赋能',
  '心智',
  '闭环',
  '沉淀',
  '打通',
  '链路',
  '痛点',
  '复盘',
  '颗粒度',
  '对齐',
  '底层逻辑',
  '方法论',
  '组合拳',
  '引爆点',
  '护城河',
  '生态',
  '场景',
  '维度',
  '格局',
  '形态',
  '势能',
  '矩阵',
  '联动',
  '共建',
  '共创',
  '落地',
  '下沉',
  '裂变',
  '导流',
  '拉新',
  '留存',
  '促活',
  '转化',
  '迭代',
  '重构',
  '复用',
  '解耦',
  '封装',
  '抽象',
  '中台',
  '微服务',
  '分布式',
  '高并发',
  '高可用',
  '弹性',
  '扩展性',
  '鲁棒性',
  '敏捷',
  '精益',
  '看板',
  '站会',
  '冲刺',
  '里程碑',
  '交付物',
  '验收',
  '上线',
  '回滚',
  '灰度',
  '全量',
  '监控',
  '告警',
  '埋点',
  '画像',
  '千人千面',
  '长尾',
  '头部',
  '腰部',
  '垂直',
  '细分',
  '蓝海',
  '红海',
  '风口',
  '赛道',
  '独角兽',
  '去中心化',
  '元宇宙',
  'Web3',
  '区块链',
  '智能合约',
  '算力',
  '算法',
  '模型',
  '训练',
  '推理',
  '端侧',
  '云端',
  '边缘计算',
  '物联网',
  '大数据',
  '云计算',
  '人工智能',
  '机器学习',
  '深度学习',
  '神经网络',
  '自然语言处理',
  '计算机视觉',
  '知识图谱',
  '用户体验',
  '交互设计',
  '视觉设计',
  '品牌调性',
  '差异化',
  '同质化',
  '内卷',
  '躺平',
  '摸鱼',
  '划水',
  '甩锅',
  '背锅',
  '画饼',
  'PUA',
  '996',
  '007',
  '福报',
  '优化',
  '毕业',
  '输送人才',
  '降本增效',
  '开源节流',
  '战略定力',
  '长期主义',
  '价值创造',
  '客户第一',
  '拥抱变化',
  '结果导向',
  '顶层设计',
  '协同',
  '兼容',
  '架构'
]

const DICTIONARY_EN = CORPUS_EN.slice(0, 128)
const DICTIONARY_ZH = CORPUS_ZH.slice(0, 128)

/**
 * Encodes a buffer into "Natural Text" (Spam) using Base128 encoding with the dictionary.
 */
export function encode(buffer: Buffer, lang: string = 'en'): string {
  const dictionary = lang.startsWith('zh') ? DICTIONARY_ZH : DICTIONARY_EN

  // Convert buffer to bits
  let bits = ''
  for (const byte of buffer) {
    bits += byte.toString(2).padStart(8, '0')
  }

  // Pad bits to be divisible by 7
  const paddingLength = (7 - (bits.length % 7)) % 7
  bits += '0'.repeat(paddingLength)

  const words: string[] = []

  for (let i = 0; i < bits.length; i += 7) {
    const chunk = bits.substring(i, i + 7)
    const index = parseInt(chunk, 2)
    words.push(dictionary[index])
  }

  return formatAsSentences(words, lang)
}

/**
 * Decodes "Natural Text" back to buffer.
 */
export function decode(text: string, lang: string = 'en'): Buffer {
  const dictionary = lang.startsWith('zh') ? DICTIONARY_ZH : DICTIONARY_EN

  // Clean the text based on language
  let cleanText = text
  if (lang.startsWith('zh')) {
    // For Chinese, remove standard punctuation including Chinese punctuation
    cleanText = text
      .replace(/[.,/#!$%^&*;:{}=\-_`~()，。、；：？！“”‘’（）【】《》]/g, '')
      .replace(/\s+/g, '') // Chinese usually doesn't need spaces for segmentation if we match by dictionary
  } else {
    cleanText = text
      .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '')
      .replace(/\s{2,}/g, ' ')
      .toLowerCase()
  }

  let bits = ''

  if (lang.startsWith('zh')) {
    // Greedy matching for Chinese
    let remaining = cleanText
    while (remaining.length > 0) {
      let found = false
      // Try to find the longest matching word from dictionary
      // Since our dictionary words are mostly 2-4 chars
      for (let len = 4; len >= 1; len--) {
        if (remaining.length < len) continue
        const sub = remaining.substring(0, len)
        const index = dictionary.indexOf(sub)
        if (index !== -1) {
          bits += index.toString(2).padStart(7, '0')
          remaining = remaining.substring(len)
          found = true
          break
        }
      }
      if (!found) {
        // Skip character if not found (garbage/formatting)
        remaining = remaining.substring(1)
      }
    }
  } else {
    const words = cleanText.trim().split(' ')
    for (const word of words) {
      const index = dictionary.indexOf(word)
      if (index === -1) {
        continue
      }
      bits += index.toString(2).padStart(7, '0')
    }
  }

  // Convert bits back to buffer
  const bytes: number[] = []
  for (let i = 0; i < bits.length; i += 8) {
    if (i + 8 <= bits.length) {
      const byte = parseInt(bits.substring(i, i + 8), 2)
      bytes.push(byte)
    }
  }

  return Buffer.from(bytes)
}

function formatAsSentences(words: string[], lang: string = 'en'): string {
  if (lang.startsWith('zh')) {
    let result = ''
    let sentenceLength = 0

    // Connectives to make it sound more "smooth"
    const connectives = ['我们', '需要', '进行', '实现', '以', '来', '从而', '进而', '完成', '打造']

    for (let i = 0; i < words.length; i++) {
      const word = words[i]

      // Randomly insert a connective/filler occasionally
      if (Math.random() > 0.7 && sentenceLength > 0) {
        result += connectives[Math.floor(Math.random() * connectives.length)]
      }

      result += word
      sentenceLength++

      if (sentenceLength > 4 && (Math.random() > 0.7 || sentenceLength > 10)) {
        result += '，' // Chinese comma
        sentenceLength = 0
        if (Math.random() > 0.6) {
          result = result.slice(0, -1) + '。' // Period
        }
      }
    }

    if (!result.endsWith('。')) result += '。'
    return result
  }

  // English formatting
  let result = ''
  let sentenceLength = 0

  for (let i = 0; i < words.length; i++) {
    let word = words[i]

    // Capitalize start of sentence
    if (sentenceLength === 0) {
      word = word.charAt(0).toUpperCase() + word.slice(1)
    }

    result += word
    sentenceLength++

    // End sentence randomly or at target
    if (sentenceLength > 5 && (Math.random() > 0.8 || sentenceLength > 15)) {
      result += '. '
      sentenceLength = 0
    } else {
      result += ' '
    }
  }

  if (result.endsWith(' ')) result = result.slice(0, -1)
  if (!result.endsWith('.')) result += '.'

  return result
}
