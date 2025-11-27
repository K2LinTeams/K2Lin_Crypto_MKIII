import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  crypto: {
    encrypt: (text: string, password: string) =>
      ipcRenderer.invoke('crypto:encrypt', text, password),
    decrypt: (ciphertext: string, iv: string, salt: string, tag: string, password: string) =>
      ipcRenderer.invoke('crypto:decrypt', ciphertext, iv, salt, tag, password)
  },
  stego: {
    embed: (imageBuffer: ArrayBuffer, dataBuffer: ArrayBuffer) =>
      ipcRenderer.invoke('stego:embed', imageBuffer, dataBuffer),
    extract: (imageBuffer: ArrayBuffer) => ipcRenderer.invoke('stego:extract', imageBuffer)
  },
  nlp: {
    encode: (dataBuffer: ArrayBuffer) => ipcRenderer.invoke('nlp:encode', dataBuffer),
    decode: (text: string) => ipcRenderer.invoke('nlp:decode', text)
  },
  store: {
    get: (key: string) => ipcRenderer.invoke('store:get', key),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    set: (key: string, value: any) => ipcRenderer.invoke('store:set', key, value)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
