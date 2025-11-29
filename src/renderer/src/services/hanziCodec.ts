import { HANZI_MAP } from '../data/hanziMap'

const CHUNK_SIZE = 12 // 12 bits per character
const MAP_SIZE = 4096 // 2^12

// Reverse map for decoding
const REVERSE_MAP: Record<string, number> = {}
// Ensure HANZI_MAP is ready (it's an array)
HANZI_MAP.forEach((char, i) => {
  REVERSE_MAP[char] = i
})

export const encode = (data: Uint8Array | string): string => {
  let bytes: Uint8Array
  if (typeof data === 'string') {
    bytes = new TextEncoder().encode(data)
  } else {
    bytes = data
  }

  // No compression, just raw bytes

  // 2. Convert to bit stream (accumulate bits)
  let output = ''
  let bitBuffer = 0
  let bitCount = 0

  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i]

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

  // Handle surrogate pairs by iterating code points or using for...of
  for (const char of text) {
    const val = REVERSE_MAP[char]
    if (val === undefined) {
      // Skip unknown characters (e.g. whitespace or invalid chars)
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

  // No decompression
  return new Uint8Array(bytes)
}

export const hanziCodec = {
  encode,
  decode
}
