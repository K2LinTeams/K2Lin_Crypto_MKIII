import pako from 'pako'
import { HANZI_MAP } from '../data/hanziMap'

const CHUNK_SIZE = 12 // 12 bits per character
const MAP_SIZE = 4096 // 2^12

// Reverse map for decoding
const REVERSE_MAP: Record<string, number> = {}
for (let i = 0; i < HANZI_MAP.length; i++) {
  REVERSE_MAP[HANZI_MAP[i]] = i
}

export const encode = (data: Uint8Array | string): string => {
  let bytes: Uint8Array
  if (typeof data === 'string') {
    bytes = new TextEncoder().encode(data)
  } else {
    bytes = data
  }

  // 1. Compress
  const compressed = pako.deflate(bytes)

  // 2. Convert to bit stream (accumulate bits)
  let output = ''
  let bitBuffer = 0
  let bitCount = 0

  for (let i = 0; i < compressed.length; i++) {
    const byte = compressed[i]

    // Add 8 bits to buffer
    bitBuffer = (bitBuffer << 8) | byte
    bitCount += 8

    // Extract 12-bit chunks while possible
    while (bitCount >= CHUNK_SIZE) {
      const shift = bitCount - CHUNK_SIZE
      const chunk = (bitBuffer >> shift) & (MAP_SIZE - 1)
      output += HANZI_MAP[chunk]
      bitCount -= CHUNK_SIZE
    }
  }

  // Handle remaining bits (padding)
  if (bitCount > 0) {
    const shift = CHUNK_SIZE - bitCount
    const chunk = (bitBuffer << shift) & (MAP_SIZE - 1)
    output += HANZI_MAP[chunk]
  }

  return output
}

export const decode = (text: string): Uint8Array => {
  if (!text) return new Uint8Array(0)

  // 1. Convert chars to bit stream
  const bytes: number[] = []
  let bitBuffer = 0
  let bitCount = 0

  for (const char of text) {
    const val = REVERSE_MAP[char]
    if (val === undefined) {
      continue
    }

    bitBuffer = (bitBuffer << CHUNK_SIZE) | val
    bitCount += CHUNK_SIZE

    // Extract 8-bit bytes while possible
    while (bitCount >= 8) {
      const shift = bitCount - 8
      const byte = (bitBuffer >> shift) & 0xFF
      bytes.push(byte)
      bitCount -= 8
    }
  }

  const compressed = new Uint8Array(bytes)

  // 3. Decompress
  try {
    return pako.inflate(compressed)
  } catch (err) {
    console.error('Hanzi Code Decompression Error:', err)
    throw new Error('Invalid Hanzi Code or Corrupted Data')
  }
}

export const hanziCodec = {
  encode,
  decode
}
