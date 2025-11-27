// Using node crypto directly for more control
import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto'
import { promisify } from 'util'

const scryptAsync = promisify(scrypt)

// Configuration
const ALGORITHM = 'aes-256-gcm'
const SALT_LENGTH = 16
const IV_LENGTH = 12 // 96 bits is standard for GCM
const KEY_LENGTH = 32 // 256 bits

export interface EncryptedResult {
  ciphertext: string // Base64
  iv: string // Base64
  salt: string // Base64
  tag: string // Base64
}

/**
 * Derives a key from a password and salt using scrypt
 */
async function deriveKey(password: string, salt: Buffer): Promise<Buffer> {
  // Scrypt is memory-hard, making it resistant to GPU/ASIC attacks
  return (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer
}

/**
 * Encrypts plaintext using AES-256-GCM
 */
export async function encrypt(plaintext: string, password: string): Promise<EncryptedResult> {
  const salt = randomBytes(SALT_LENGTH)
  const iv = randomBytes(IV_LENGTH)

  // Convert plaintext to Buffer
  const plaintextBuffer = Buffer.from(plaintext, 'utf8')

  // Derive key
  const key = await deriveKey(password, salt)

  // Create cipher
  const cipher = createCipheriv(ALGORITHM, key, iv)

  // Encrypt
  const encrypted = Buffer.concat([cipher.update(plaintextBuffer), cipher.final()])
  const tag = cipher.getAuthTag()

  // Zero out key immediately
  key.fill(0)

  return {
    ciphertext: encrypted.toString('base64'),
    iv: iv.toString('base64'),
    salt: salt.toString('base64'),
    tag: tag.toString('base64')
  }
}

/**
 * Decrypts data using AES-256-GCM
 */
export async function decrypt(
  ciphertext: string,
  iv: string,
  salt: string,
  tag: string,
  password: string
): Promise<string> {
  const saltBuffer = Buffer.from(salt, 'base64')
  const ivBuffer = Buffer.from(iv, 'base64')
  const tagBuffer = Buffer.from(tag, 'base64')
  const encryptedBuffer = Buffer.from(ciphertext, 'base64')

  // Derive key
  const key = await deriveKey(password, saltBuffer)

  // Create decipher
  const decipher = createDecipheriv(ALGORITHM, key, ivBuffer)
  decipher.setAuthTag(tagBuffer)

  try {
    // Decrypt
    const decrypted = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()])

    // Zero out key
    key.fill(0)

    return decrypted.toString('utf8')
  } catch {
    // Zero out key in case of error
    key.fill(0)
    throw new Error('Decryption failed: Invalid password or corrupted data')
  }
}
