export async function generateIdentityId(publicKeyPem: string): Promise<string> {
  // 1. Clean the PEM string to get just base64 (consistent with other usages)
  const cleanKey = publicKeyPem.replace(/-----BEGIN PUBLIC KEY-----|-----END PUBLIC KEY-----|\n|\r/g, '')

  // 2. Hash it (SHA-256)
  const encoder = new TextEncoder()
  const data = encoder.encode(cleanKey)
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data)

  // 3. Convert Hash to BigInt to derive a number
  const hashArray = new Uint8Array(hashBuffer)
  const hashHex = Array.from(hashArray)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  const bigIntVal = BigInt('0x' + hashHex)

  // 4. Modulo 10^12 to get a 12-digit number
  const idVal = bigIntVal % 1000000000000n // 10^12

  const idStr = idVal.toString().padStart(12, '0')

  // 5. Format: 0000 0000 0000
  return `${idStr.slice(0, 4)} ${idStr.slice(4, 8)} ${idStr.slice(8, 12)}`
}
