// A simple corpus of "corporate speak" and "spam" words
// Shared implementation for Renderer (Web)
const CORPUS = [
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

const DICTIONARY = CORPUS.slice(0, 128)

// In Web, Buffer is not available by default. We use Uint8Array.
export function encode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)

  // Convert buffer to bits
  let bits = ''
  for (const byte of bytes) {
    bits += byte.toString(2).padStart(8, '0')
  }

  // Pad bits to be divisible by 7
  const paddingLength = (7 - (bits.length % 7)) % 7
  bits += '0'.repeat(paddingLength)

  const words: string[] = []

  for (let i = 0; i < bits.length; i += 7) {
    const chunk = bits.substring(i, i + 7)
    const index = parseInt(chunk, 2)
    words.push(DICTIONARY[index])
  }

  return formatAsSentences(words)
}

export function decode(text: string): Uint8Array {
  // Clean the text
  const cleanText = text
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '')
    .replace(/\s{2,}/g, ' ')
    .toLowerCase()
  const words = cleanText.trim().split(' ')

  let bits = ''

  for (const word of words) {
    const index = DICTIONARY.indexOf(word)
    if (index === -1) {
      continue
    }
    bits += index.toString(2).padStart(7, '0')
  }

  // Convert bits back to bytes
  const bytes: number[] = []
  for (let i = 0; i < bits.length; i += 8) {
    if (i + 8 <= bits.length) {
      const byte = parseInt(bits.substring(i, i + 8), 2)
      bytes.push(byte)
    }
  }

  return new Uint8Array(bytes)
}

function formatAsSentences(words: string[]): string {
  let result = ''
  let sentenceLength = 0

  for (let i = 0; i < words.length; i++) {
    let word = words[i]

    if (sentenceLength === 0) {
      word = word.charAt(0).toUpperCase() + word.slice(1)
    }

    result += word
    sentenceLength++

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
