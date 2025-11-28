"use strict";
const electron = require("electron");
const preload = require("@electron-toolkit/preload");
const api = {
  crypto: {
    encrypt: (text, password) => electron.ipcRenderer.invoke("crypto:encrypt", text, password),
    decrypt: (ciphertext, iv, salt, tag, password) => electron.ipcRenderer.invoke("crypto:decrypt", ciphertext, iv, salt, tag, password)
  },
  stego: {
    embed: (imageBuffer, dataBuffer) => electron.ipcRenderer.invoke("stego:embed", imageBuffer, dataBuffer),
    extract: (imageBuffer) => electron.ipcRenderer.invoke("stego:extract", imageBuffer)
  },
  nlp: {
    encode: (dataBuffer) => electron.ipcRenderer.invoke("nlp:encode", dataBuffer),
    decode: (text) => electron.ipcRenderer.invoke("nlp:decode", text)
  },
  store: {
    get: (key) => electron.ipcRenderer.invoke("store:get", key),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    set: (key, value) => electron.ipcRenderer.invoke("store:set", key, value)
  }
};
if (process.contextIsolated) {
  try {
    electron.contextBridge.exposeInMainWorld("electron", preload.electronAPI);
    electron.contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = preload.electronAPI;
  window.api = api;
}
