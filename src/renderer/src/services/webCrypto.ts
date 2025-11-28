// Remove direct scrypt import to avoid main thread blocking
// import { scrypt } from 'scrypt-js'
import KeyDerivationWorker from './keyDerivation.worker?worker'

const ALGORITHM = 'AES-GCM'
const SALT_LENGTH = 16
const IV_LENGTH = 12
const KEY_LENGTH = 32 // 256 bits

export interface EncryptedResult {
  ciphertext: string
  iv: string
  salt: string
  tag: string
}

// Convert Helpers
function toBase64(buffer: ArrayBuffer): string {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  const len = bytes.byteLength
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return window.btoa(binary)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromBase64(base64: string): any {
  const binary_string = window.atob(base64)
  const len = binary_string.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i)
  }
  return bytes
}

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const passwordBuffer = new TextEncoder().encode(password)

  // Scrypt parameters must match Node.js defaults or specific settings
  // Node.js defaults: N=16384, r=8, p=1
  const N = 16384
  const r = 8
  const p = 1
  const dkLen = KEY_LENGTH

  // Offload to Worker
  const derivedKeyBytes = await new Promise<Uint8Array>((resolve, reject) => {
    const worker = new KeyDerivationWorker()

    worker.onmessage = (e) => {
      if (e.data.success) {
        resolve(e.data.key)
      } else {
        reject(new Error(e.data.error))
      }
      worker.terminate()
    }

    worker.onerror = (err) => {
      reject(err)
      worker.terminate()
    }

    worker.postMessage({
      password: passwordBuffer,
      salt,
      N,
      r,
      p,
      dkLen
    })
  })

  return await window.crypto.subtle.importKey(
    'raw',
    asBufferSource(derivedKeyBytes),
    { name: ALGORITHM },
    false,
    ['encrypt', 'decrypt']
  )
}

// Helper to convert to BufferSource (ArrayBuffer or ArrayBufferView) for Web Crypto
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const asBufferSource = (data: any): BufferSource => data as BufferSource

export async function encrypt(plaintext: string, password: string): Promise<EncryptedResult> {
  const salt = window.crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
  const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH))

  const key = await deriveKey(password, salt)
  const data = new TextEncoder().encode(plaintext)

  // Web Crypto AES-GCM appends tag to the end automatically
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: ALGORITHM,
      iv: iv
    },
    key,
    asBufferSource(data)
  )

  // Extract tag (last 16 bytes for standard GCM)?
  // Node.js separates tag. Web Crypto combines them.
  // To be compatible with our Node implementation:
  // Node: [ciphertext] ... [tag]
  // WebCrypto: [ciphertext + tag]
  // We need to split them.

  const totalLen = encryptedBuffer.byteLength
  const tagLen = 16 // AES-GCM standard tag length is 128 bits
  const ciphertextLen = totalLen - tagLen

  const ciphertextBuffer = encryptedBuffer.slice(0, ciphertextLen)
  const tagBuffer = encryptedBuffer.slice(ciphertextLen)

  return {
    ciphertext: toBase64(ciphertextBuffer),
    iv: toBase64(iv.buffer),
    salt: toBase64(salt.buffer),
    tag: toBase64(tagBuffer)
  }
}

export async function decrypt(
  ciphertext: string,
  iv: string,
  salt: string,
  tag: string,
  password: string
): Promise<string> {
  const saltBytes = fromBase64(salt)
  const ivBytes = fromBase64(iv)
  const tagBytes = fromBase64(tag)
  const ciphertextBytes = fromBase64(ciphertext)

  // Recombine ciphertext + tag for Web Crypto
  const combinedBuffer = new Uint8Array(ciphertextBytes.length + tagBytes.length)
  combinedBuffer.set(ciphertextBytes)
  combinedBuffer.set(tagBytes, ciphertextBytes.length)

  const key = await deriveKey(password, saltBytes)

  try {
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: ALGORITHM,
        iv: ivBytes
      },
      key,
      asBufferSource(combinedBuffer)
    )

    return new TextDecoder().decode(decryptedBuffer)
  } catch {
    throw new Error('Decryption failed: Invalid password or corrupted data')
  }
}
