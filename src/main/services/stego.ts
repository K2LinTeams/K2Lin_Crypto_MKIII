import sharp from 'sharp'

// LSB Steganography Implementation

// Magic header to identify our data: "C3" (Crypto3) + 2 bytes length (max 65535 bytes)
// We will use 4 bytes for header: [0x43, 0x33, LEN_HIGH, LEN_LOW]
const HEADER_PREFIX = Buffer.from([0x43, 0x33]) // "C3"

/**
 * Embeds data into an image using LSB (Least Significant Bit).
 * Returns a PNG Buffer.
 */
export async function embed(imageBuffer: Buffer, dataBuffer: Buffer): Promise<Buffer> {
  // 1. Prepare data with header
  const length = dataBuffer.length
  if (length > 65535) {
    throw new Error('Data too large for this implementation (max 64KB)')
  }

  const header = Buffer.concat([HEADER_PREFIX, Buffer.from([(length >> 8) & 0xff, length & 0xff])])

  const payload = Buffer.concat([header, dataBuffer])
  const payloadBits = bufferToBits(payload)

  // 2. Load image and get raw pixel data
  // Ensure we output to png (lossless) and get raw buffer
  const image = sharp(imageBuffer)
  const metadata = await image.metadata()

  if (!metadata.width || !metadata.height) {
    throw new Error('Invalid image metadata')
  }

  // Convert to raw RGBA buffer
  const { data: pixelData, info } = await image
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  // Check capacity: width * height * 3 (using R, G, B channels, ignoring Alpha for safety)
  const maxBits = info.width * info.height * 3
  if (payloadBits.length > maxBits) {
    throw new Error(
      `Image too small. Needs to hold ${payloadBits.length} bits, but only has space for ${maxBits} bits.`
    )
  }

  // 3. Embed bits
  // We iterate over pixels. Each pixel has 4 bytes: R, G, B, A.
  // We embed into R, G, B.
  let bitIndex = 0
  for (let i = 0; i < pixelData.length; i++) {
    // Skip Alpha channel (every 4th byte: 3, 7, 11...)
    if ((i + 1) % 4 === 0) continue

    if (bitIndex < payloadBits.length) {
      // Clear LSB and set it to our bit
      pixelData[i] = (pixelData[i] & 0xfe) | payloadBits[bitIndex]
      bitIndex++
    } else {
      break
    }
  }

  // 4. Reconstruct image as PNG
  return await sharp(pixelData, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4
    }
  })
    .png()
    .toBuffer()
}

/**
 * Extracts data from an image using LSB.
 */
export async function extract(imageBuffer: Buffer): Promise<Buffer> {
  // 1. Get raw pixel data
  const { data: pixelData } = await sharp(imageBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  // 2. Extract bits until we have the header
  // Header is 4 bytes = 32 bits
  const headerBits: number[] = []
  let pixelIndex = 0

  // Extract first 32 bits for header
  while (headerBits.length < 32 && pixelIndex < pixelData.length) {
    // Skip Alpha
    if ((pixelIndex + 1) % 4 === 0) {
      pixelIndex++
      continue
    }

    headerBits.push(pixelData[pixelIndex] & 1)
    pixelIndex++
  }

  const headerBuffer = bitsToBuffer(headerBits)

  // Verify prefix "C3"
  if (headerBuffer[0] !== 0x43 || headerBuffer[1] !== 0x33) {
    throw new Error('No valid Crypto3 data found in image')
  }

  // Parse length
  const dataLength = (headerBuffer[2] << 8) | headerBuffer[3]
  const totalBitsNeeded = dataLength * 8

  // 3. Extract payload bits
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
    throw new Error('Image data corrupted or truncated')
  }

  return bitsToBuffer(payloadBits)
}

// Helpers
function bufferToBits(buffer: Buffer): number[] {
  const bits: number[] = []
  for (const byte of buffer) {
    for (let i = 7; i >= 0; i--) {
      bits.push((byte >> i) & 1)
    }
  }
  return bits
}

function bitsToBuffer(bits: number[]): Buffer {
  const bytes: number[] = []
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0
    for (let j = 0; j < 8; j++) {
      if (i + j < bits.length) {
        byte = (byte << 1) | bits[i + j]
      }
    }
    bytes.push(byte)
  }
  return Buffer.from(bytes)
}
