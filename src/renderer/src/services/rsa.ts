const ALGORITHM = {
  name: 'RSA-OAEP',
  modulusLength: 2048,
  publicExponent: new Uint8Array([1, 0, 1]),
  hash: 'SHA-256'
}

export interface KeyPair {
  publicKey: CryptoKey
  privateKey: CryptoKey
}

// Generate RSA Key Pair
export async function generateKeyPair(): Promise<KeyPair> {
  return (await window.crypto.subtle.generateKey(ALGORITHM, true, [
    'encrypt',
    'decrypt'
  ])) as KeyPair
}

// Export Key to PEM format
export async function exportKey(key: CryptoKey): Promise<string> {
  const format = key.type === 'public' ? 'spki' : 'pkcs8'
  const exported = await window.crypto.subtle.exportKey(format, key)
  const exportedAsBase64 = window.btoa(String.fromCharCode(...new Uint8Array(exported)))
  const pemExported = `-----BEGIN ${key.type.toUpperCase()} KEY-----\n${exportedAsBase64}\n-----END ${key.type.toUpperCase()} KEY-----`
  return pemExported
}

// Import Key from PEM format
export async function importKey(pem: string, type: 'public' | 'private'): Promise<CryptoKey> {
  const pemHeader = `-----BEGIN ${type.toUpperCase()} KEY-----`
  const pemFooter = `-----END ${type.toUpperCase()} KEY-----`

  // Remove headers and newlines
  const pemContents = pem
    .replace(pemHeader, '')
    .replace(pemFooter, '')
    .replace(/\s/g, '')

  const binaryString = window.atob(pemContents)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }

  const format = type === 'public' ? 'spki' : 'pkcs8'
  const usage: KeyUsage[] = type === 'public' ? ['encrypt'] : ['decrypt']

  return await window.crypto.subtle.importKey(format, bytes.buffer, ALGORITHM, true, usage)
}

// Encrypt data with Public Key
export async function encryptAsymmetric(plaintext: string, publicKey: CryptoKey): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(plaintext)
  const encrypted = await window.crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    publicKey,
    data
  )

  // Return Base64
  const bytes = new Uint8Array(encrypted)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return window.btoa(binary)
}

// Decrypt data with Private Key
export async function decryptAsymmetric(ciphertextBase64: string, privateKey: CryptoKey): Promise<string> {
  const binaryString = window.atob(ciphertextBase64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }

  const decrypted = await window.crypto.subtle.decrypt(
    { name: 'RSA-OAEP' },
    privateKey,
    bytes
  )

  const decoder = new TextDecoder()
  return decoder.decode(decrypted)
}
