// A simple corpus of "corporate speak" and "spam" words
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

// To ensure reversibility without a complex shared model, we use a deterministic mapping.
// Each byte (0-255) maps to a specific word in the list (or combination).
// But for "Markov-like" natural flow, we'd need a complex probability model which is hard to reverse perfectly without sending the seed.
// FOR MVP/Finalize: We will use a Base-N encoding where N is the size of our dictionary.
// This is effectively "Base-Corpus".

// We have 128 words above. 128 = 2^7.
// So each word can represent exactly 7 bits of data.
// We can strip the list to exactly 128 words to make it easy.

const DICTIONARY = CORPUS.slice(0, 128)

/**
 * Encodes a buffer into "Natural Text" (Spam) using Base128 encoding with the dictionary.
 */
export function encode(buffer: Buffer): string {
  // Convert buffer to bits
  let bits = ''
  for (const byte of buffer) {
    bits += byte.toString(2).padStart(8, '0')
  }

  // Pad bits to be divisible by 7
  const paddingLength = (7 - (bits.length % 7)) % 7
  bits += '0'.repeat(paddingLength)

  // Encode length and padding info?
  // Simpler approach: Just encode.
  // Ideally we should prepend length.
  // For this version: We'll output a string.

  const words: string[] = []

  for (let i = 0; i < bits.length; i += 7) {
    const chunk = bits.substring(i, i + 7)
    const index = parseInt(chunk, 2)
    words.push(DICTIONARY[index])
  }

  // Construct sentences to look slightly more real.
  // Random capitalization and punctuation logic *must be deterministic* or ignored during decode.
  // We will ignore case and punctuation during decode.

  return formatAsSentences(words)
}

/**
 * Decodes "Natural Text" back to buffer.
 */
export function decode(text: string): Buffer {
  // Clean the text: remove punctuation, extra spaces, lowercase
  const cleanText = text
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '')
    .replace(/\s{2,}/g, ' ')
    .toLowerCase()
  const words = cleanText.trim().split(' ')

  let bits = ''

  for (const word of words) {
    const index = DICTIONARY.indexOf(word)
    if (index === -1) {
      // Skip words not in dictionary (allows for extra fluff if we wanted to add it)
      continue
    }
    bits += index.toString(2).padStart(7, '0')
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

// Helper to make it look like sentences
function formatAsSentences(words: string[]): string {
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
    // Note: Since we need this to be purely cosmetic (ignored on decode), we can do whatever.
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
