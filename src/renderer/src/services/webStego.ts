// LSB Steganography using HTML Canvas API

const HEADER_PREFIX = [0x43, 0x33] // "C3"

export async function embed(
  imageBuffer: ArrayBuffer,
  dataBuffer: ArrayBuffer
): Promise<Uint8Array> {
  const blob = new Blob([imageBuffer])
  const bitmap = await createImageBitmap(blob)

  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  const ctx = canvas.getContext('2d', { willReadFrequently: true })

  if (!ctx) throw new Error('Could not get canvas context')

  ctx.drawImage(bitmap, 0, 0)
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const pixelData = imageData.data

  // Prepare payload
  const dataBytes = new Uint8Array(dataBuffer)
  const length = dataBytes.length

  if (length > 65535) {
    throw new Error('Data too large (max 64KB)')
  }

  // Header: C3 + HighLen + LowLen (4 bytes)
  const header = new Uint8Array([
    HEADER_PREFIX[0],
    HEADER_PREFIX[1],
    (length >> 8) & 0xff,
    length & 0xff
  ])

  // Combine header + data
  const totalPayload = new Uint8Array(header.length + dataBytes.length)
  totalPayload.set(header)
  totalPayload.set(dataBytes, header.length)

  // Convert to bits
  const payloadBits: number[] = []
  for (const byte of totalPayload) {
    for (let i = 7; i >= 0; i--) {
      payloadBits.push((byte >> i) & 1)
    }
  }

  // Check capacity
  // 3 channels (RGB) per pixel. Alpha is skipped.
  const maxBits = canvas.width * canvas.height * 3
  if (payloadBits.length > maxBits) {
    throw new Error('Image too small for this payload')
  }

  // Embed
  let bitIndex = 0
  for (let i = 0; i < pixelData.length; i++) {
    // Skip Alpha (Every 4th byte: 3, 7, 11...)
    if ((i + 1) % 4 === 0) continue

    if (bitIndex < payloadBits.length) {
      // Clear LSB and set
      pixelData[i] = (pixelData[i] & 0xfe) | payloadBits[bitIndex]
      bitIndex++
    } else {
      break
    }
  }

  // Put data back
  ctx.putImageData(imageData, 0, 0)

  // Export as PNG Buffer (Uint8Array)
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject('Failed to encode PNG')
      blob.arrayBuffer().then((buf) => resolve(new Uint8Array(buf)))
    }, 'image/png')
  })
}

export async function extract(imageBuffer: ArrayBuffer): Promise<Uint8Array> {
  const blob = new Blob([imageBuffer])
  const bitmap = await createImageBitmap(blob)

  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  const ctx = canvas.getContext('2d', { willReadFrequently: true })

  if (!ctx) throw new Error('Could not get canvas context')

  ctx.drawImage(bitmap, 0, 0)
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const pixelData = imageData.data

  // Extract header (32 bits)
  const headerBits: number[] = []
  let pixelIndex = 0

  while (headerBits.length < 32 && pixelIndex < pixelData.length) {
    if ((pixelIndex + 1) % 4 === 0) {
      pixelIndex++
      continue
    }
    headerBits.push(pixelData[pixelIndex] & 1)
    pixelIndex++
  }

  const headerBytes = bitsToBytes(headerBits)

  if (headerBytes[0] !== 0x43 || headerBytes[1] !== 0x33) {
    throw new Error('No valid Crypto3 data found')
  }

  const dataLength = (headerBytes[2] << 8) | headerBytes[3]
  const totalBitsNeeded = dataLength * 8

  // Extract payload
  const payloadBits: number[] = []
  while (payloadBits.length < totalBitsNeeded && pixelIndex < pixelData.length) {
    if ((pixelIndex + 1) % 4 === 0) {
      pixelIndex++
      continue
    }
    payloadBits.push(pixelData[pixelIndex] & 1)
    pixelIndex++
  }

  if (payloadBits.length < totalBitsNeeded) {
    throw new Error('Data corrupted or truncated')
  }

  return bitsToBytes(payloadBits)
}

function bitsToBytes(bits: number[]): Uint8Array {
  const bytes = new Uint8Array(Math.ceil(bits.length / 8))
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0
    for (let j = 0; j < 8; j++) {
      if (i + j < bits.length) {
        byte = (byte << 1) | bits[i + j]
      }
    }
    bytes[i / 8] = byte
  }
  return bytes
}
