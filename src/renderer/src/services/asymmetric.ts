// X25519 ECC Implementation for Crypto3

export interface AsymmetricKeyPair {
  publicKey: CryptoKey
  privateKey: CryptoKey
}

export interface EncryptedPackage {
  ephemPublicKey: string // Base64 export of ephemeral key
  ciphertext: string // Base64 ciphertext
  iv: string // Base64 IV
}

const ALGORITHM_KEY_GEN = {
  name: 'X25519'
}

const ALGORITHM_AES = 'AES-GCM'
const AES_LENGTH = 256

// Helper to convert ArrayBuffer to Base64
function ab2base64(buf: ArrayBuffer | Uint8Array): string {
  const binary = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  let str = ''
  for (let i = 0; i < binary.length; i++) {
    str += String.fromCharCode(binary[i])
  }
  return window.btoa(str)
}

// Helper to convert Base64 to ArrayBuffer
function base642ab(base64: string): ArrayBuffer {
  const binaryString = window.atob(base64)
  const len = binaryString.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes.buffer
}

// Generate X25519 Key Pair
export async function generateKeyPair(): Promise<AsymmetricKeyPair> {
  return (await window.crypto.subtle.generateKey(ALGORITHM_KEY_GEN, true, [
    'deriveKey',
    'deriveBits'
  ])) as AsymmetricKeyPair
}

// Export Key to Base64 (SPKI for public, PKCS8 for private)
export async function exportKey(key: CryptoKey): Promise<string> {
  const format = key.type === 'public' ? 'spki' : 'pkcs8'
  const exported = await window.crypto.subtle.exportKey(format, key)
  return ab2base64(exported)
}

// Import Key from Base64
export async function importKey(base64Key: string, type: 'public' | 'private'): Promise<CryptoKey> {
  const format = type === 'public' ? 'spki' : 'pkcs8'
  const keyData = base642ab(base64Key)

  // Clean input if it has headers (legacy compat or just safe handling)
  // X25519 exported as SPKI/PKCS8 is binary DER.
  // If user provides "PEM", we might need to strip.
  // But our exportKey returns pure Base64.
  // We'll assume the input is the Base64 string we produced.

  return await window.crypto.subtle.importKey(
    format,
    keyData,
    ALGORITHM_KEY_GEN,
    true,
    type === 'public' ? [] : ['deriveKey', 'deriveBits']
  )
}

// Encrypt (Hybrid: ECDH + AES-GCM)
export async function encryptAsymmetric(plaintext: string, recipientPublicKey: CryptoKey): Promise<string> {
  // 1. Generate Ephemeral Key Pair
  const ephemeralKeyPair = await generateKeyPair()

  // 2. Derive Shared Secret (AES Key)
  const sharedKey = await window.crypto.subtle.deriveKey(
    {
      name: 'X25519',
      public: recipientPublicKey
    },
    ephemeralKeyPair.privateKey,
    {
      name: ALGORITHM_AES,
      length: AES_LENGTH
    },
    false,
    ['encrypt']
  )

  // 3. Encrypt Message
  const iv = window.crypto.getRandomValues(new Uint8Array(12))
  const encoder = new TextEncoder()
  const encodedData = encoder.encode(plaintext)

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: ALGORITHM_AES,
      iv: iv
    },
    sharedKey,
    encodedData
  )

  // 4. Package: { ephemeralPublicKey, ciphertext, iv }
  // We export the ephemeral PUBLIC key so the recipient can derive the same secret.
  const ephemPubBase64 = await exportKey(ephemeralKeyPair.publicKey)

  const payload: EncryptedPackage = {
    ephemPublicKey: ephemPubBase64,
    ciphertext: ab2base64(encryptedBuffer),
    iv: ab2base64(iv)
  }

  // Return as Base64 of JSON (to fit into the existing string-based payload expectation if needed,
  // though VaultPanel usually wraps this in another JSON. We return the internal payload as a string or object.
  // To keep consistent with RSA which returned a Base64 string (ciphertext),
  // we will return a Base64 string representing this JSON object.
  return ab2base64(new TextEncoder().encode(JSON.stringify(payload)))
}

// Decrypt
export async function decryptAsymmetric(packageBase64: string, myPrivateKey: CryptoKey): Promise<string> {
  // 1. Decode Package
  let pkg: EncryptedPackage
  try {
    const jsonStr = new TextDecoder().decode(base642ab(packageBase64))
    pkg = JSON.parse(jsonStr)
  } catch (e) {
    throw new Error('Invalid ECC Package format')
  }

  if (!pkg.ephemPublicKey || !pkg.ciphertext || !pkg.iv) {
    throw new Error('Incomplete ECC Package')
  }

  // 2. Import Ephemeral Public Key
  const ephemPublicKey = await importKey(pkg.ephemPublicKey, 'public')

  // 3. Derive Shared Secret
  const sharedKey = await window.crypto.subtle.deriveKey(
    {
      name: 'X25519',
      public: ephemPublicKey
    },
    myPrivateKey,
    {
      name: ALGORITHM_AES,
      length: AES_LENGTH
    },
    false,
    ['decrypt']
  )

  // 4. Decrypt
  const iv = base642ab(pkg.iv)
  const ciphertext = base642ab(pkg.ciphertext)

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: ALGORITHM_AES,
      iv: iv
    },
    sharedKey,
    ciphertext
  )

  return new TextDecoder().decode(decryptedBuffer)
}
