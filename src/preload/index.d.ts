import { ElectronAPI } from '@electron-toolkit/preload'

export interface EncryptedResult {
  ciphertext: string
  iv: string
  salt: string
  tag: string
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      crypto: {
        encrypt: (text: string, password: string) => Promise<EncryptedResult>
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
        encode: (dataBuffer: ArrayBuffer) => Promise<string>
        decode: (text: string) => Promise<Uint8Array>
      }
      store: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        get: (key: string) => Promise<any>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        set: (key: string, value: any) => Promise<void>
      }
    }
  }
}
