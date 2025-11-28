// Service Adapter to bridge Electron IPC and Web Services
import { encrypt, decrypt } from './services/webCrypto'
import { embed, extract } from './services/webStego'
import { encode, decode } from './services/nlp'
import { webStore } from './services/webStore'

// Define the interface that both implementations must match
export interface ApiService {
  crypto: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    encrypt: (text: string, password: string) => Promise<any>
    decrypt: (
      ciphertext: string,
      iv: string,
      salt: string,
      tag: string,
      password: string
    ) => Promise<string>
  }
  stego: {
    embed: (imageBuffer: ArrayBuffer, dataBuffer: ArrayBuffer) => Promise<Uint8Array>
    extract: (imageBuffer: ArrayBuffer) => Promise<Uint8Array>
  }
  nlp: {
    encode: (dataBuffer: ArrayBuffer, lang?: string) => Promise<string>
    decode: (text: string, lang?: string) => Promise<Uint8Array>
  }
  store: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get: (key: string) => Promise<any>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    set: (key: string, value: any) => Promise<void>
  }
}

// Check if we are in Electron
const isElectron = typeof window !== 'undefined' && window.electron !== undefined

export const api: ApiService = isElectron
  ? (window.api as ApiService)
  : {
      crypto: {
        encrypt,
        decrypt
      },
      stego: {
        embed,
        extract
      },
      nlp: {
        encode: async (buf, lang): Promise<string> => encode(buf, lang),
        decode: async (text, lang): Promise<Uint8Array> => decode(text, lang)
      },
      store: {
        get: (key) => webStore.get(key),
        set: (key, val) => webStore.set(key, val)
      }
    }

export const getEnvironmentName = (): string =>
  isElectron ? 'Electron Secure Core' : 'Web Assembly / Stateless'
