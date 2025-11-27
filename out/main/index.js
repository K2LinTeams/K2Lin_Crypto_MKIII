"use strict";
const electron = require("electron");
const path = require("path");
const utils = require("@electron-toolkit/utils");
const crypto = require("crypto");
const util = require("util");
const sharp = require("sharp");
const Store = require("electron-store");
const icon = path.join(__dirname, "../../resources/icon.png");
const scryptAsync = util.promisify(crypto.scrypt);
const ALGORITHM = "aes-256-gcm";
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const KEY_LENGTH = 32;
async function deriveKey(password, salt) {
  return await scryptAsync(password, salt, KEY_LENGTH);
}
async function encrypt(plaintext, password) {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);
  const plaintextBuffer = Buffer.from(plaintext, "utf8");
  const key = await deriveKey(password, salt);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintextBuffer), cipher.final()]);
  const tag = cipher.getAuthTag();
  key.fill(0);
  return {
    ciphertext: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    salt: salt.toString("base64"),
    tag: tag.toString("base64")
  };
}
async function decrypt(ciphertext, iv, salt, tag, password) {
  const saltBuffer = Buffer.from(salt, "base64");
  const ivBuffer = Buffer.from(iv, "base64");
  const tagBuffer = Buffer.from(tag, "base64");
  const encryptedBuffer = Buffer.from(ciphertext, "base64");
  const key = await deriveKey(password, saltBuffer);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, ivBuffer);
  decipher.setAuthTag(tagBuffer);
  try {
    const decrypted = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
    key.fill(0);
    return decrypted.toString("utf8");
  } catch {
    key.fill(0);
    throw new Error("Decryption failed: Invalid password or corrupted data");
  }
}
const HEADER_PREFIX = Buffer.from([67, 51]);
async function embed(imageBuffer, dataBuffer) {
  const length = dataBuffer.length;
  if (length > 65535) {
    throw new Error("Data too large for this implementation (max 64KB)");
  }
  const header = Buffer.concat([HEADER_PREFIX, Buffer.from([length >> 8 & 255, length & 255])]);
  const payload = Buffer.concat([header, dataBuffer]);
  const payloadBits = bufferToBits(payload);
  const image = sharp(imageBuffer);
  const metadata = await image.metadata();
  if (!metadata.width || !metadata.height) {
    throw new Error("Invalid image metadata");
  }
  const { data: pixelData, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const maxBits = info.width * info.height * 3;
  if (payloadBits.length > maxBits) {
    throw new Error(
      `Image too small. Needs to hold ${payloadBits.length} bits, but only has space for ${maxBits} bits.`
    );
  }
  let bitIndex = 0;
  for (let i = 0; i < pixelData.length; i++) {
    if ((i + 1) % 4 === 0) continue;
    if (bitIndex < payloadBits.length) {
      pixelData[i] = pixelData[i] & 254 | payloadBits[bitIndex];
      bitIndex++;
    } else {
      break;
    }
  }
  return await sharp(pixelData, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4
    }
  }).png().toBuffer();
}
async function extract(imageBuffer) {
  const { data: pixelData } = await sharp(imageBuffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const headerBits = [];
  let pixelIndex = 0;
  while (headerBits.length < 32 && pixelIndex < pixelData.length) {
    if ((pixelIndex + 1) % 4 === 0) {
      pixelIndex++;
      continue;
    }
    headerBits.push(pixelData[pixelIndex] & 1);
    pixelIndex++;
  }
  const headerBuffer = bitsToBuffer(headerBits);
  if (headerBuffer[0] !== 67 || headerBuffer[1] !== 51) {
    throw new Error("No valid Crypto3 data found in image");
  }
  const dataLength = headerBuffer[2] << 8 | headerBuffer[3];
  const totalBitsNeeded = dataLength * 8;
  const payloadBits = [];
  while (payloadBits.length < totalBitsNeeded && pixelIndex < pixelData.length) {
    if ((pixelIndex + 1) % 4 === 0) {
      pixelIndex++;
      continue;
    }
    payloadBits.push(pixelData[pixelIndex] & 1);
    pixelIndex++;
  }
  if (payloadBits.length < totalBitsNeeded) {
    throw new Error("Image data corrupted or truncated");
  }
  return bitsToBuffer(payloadBits);
}
function bufferToBits(buffer) {
  const bits = [];
  for (const byte of buffer) {
    for (let i = 7; i >= 0; i--) {
      bits.push(byte >> i & 1);
    }
  }
  return bits;
}
function bitsToBuffer(bits) {
  const bytes = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) {
      if (i + j < bits.length) {
        byte = byte << 1 | bits[i + j];
      }
    }
    bytes.push(byte);
  }
  return Buffer.from(bytes);
}
const CORPUS = [
  "meeting",
  "synch",
  "leverage",
  "synergy",
  "paradigm",
  "shift",
  "cloud",
  "native",
  "quarterly",
  "report",
  "action",
  "item",
  "circle",
  "back",
  "touch",
  "base",
  "deep",
  "dive",
  "bandwidth",
  "pipeline",
  "scalable",
  "solution",
  "framework",
  "agile",
  "scrum",
  "deliverable",
  "milestone",
  "stakeholder",
  "alignment",
  "strategic",
  "initiative",
  "growth",
  "optimization",
  "efficiency",
  "workflow",
  "process",
  "integration",
  "user",
  "experience",
  "interface",
  "backend",
  "frontend",
  "stack",
  "database",
  "server",
  "client",
  "protocol",
  "network",
  "security",
  "compliance",
  "audit",
  "review",
  "feedback",
  "loop",
  "ecosystem",
  "platform",
  "service",
  "product",
  "roadmap",
  "timeline",
  "budget",
  "resource",
  "allocation",
  "target",
  "audience",
  "market",
  "segment",
  "vertical",
  "horizontal",
  "channel",
  "funnel",
  "conversion",
  "metric",
  "kpi",
  "roi",
  "dashboard",
  "analytics",
  "insight",
  "data",
  "driven",
  "smart",
  "connected",
  "iot",
  "ai",
  "ml",
  "blockchain",
  "crypto",
  "web3",
  "metaverse",
  "nft",
  "digital",
  "transformation",
  "innovation",
  "disruption",
  "startup",
  "unicorn",
  "venture",
  "capital",
  "seed",
  "round",
  "exit",
  "ipo",
  "please",
  "kindly",
  "regards",
  "thanks",
  "hope",
  "well",
  "attached",
  "file",
  "document",
  "spreadsheet",
  "presentation",
  "slide",
  "deck",
  "email",
  "chat",
  "urgent",
  "priority",
  "critical",
  "blocker",
  "bug",
  "fix",
  "patch",
  "update",
  "upgrade",
  "migration",
  "deployment",
  "release",
  "version",
  "beta",
  "alpha",
  "test",
  "staging",
  "production",
  "environment",
  "config",
  "setting",
  "preference",
  "option",
  "feature",
  "request",
  "ticket",
  "support",
  "help",
  "manual",
  "guide"
];
const DICTIONARY = CORPUS.slice(0, 128);
function encode(buffer) {
  let bits = "";
  for (const byte of buffer) {
    bits += byte.toString(2).padStart(8, "0");
  }
  const paddingLength = (7 - bits.length % 7) % 7;
  bits += "0".repeat(paddingLength);
  const words = [];
  for (let i = 0; i < bits.length; i += 7) {
    const chunk = bits.substring(i, i + 7);
    const index = parseInt(chunk, 2);
    words.push(DICTIONARY[index]);
  }
  return formatAsSentences(words);
}
function decode(text) {
  const cleanText = text.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").replace(/\s{2,}/g, " ").toLowerCase();
  const words = cleanText.trim().split(" ");
  let bits = "";
  for (const word of words) {
    const index = DICTIONARY.indexOf(word);
    if (index === -1) {
      continue;
    }
    bits += index.toString(2).padStart(7, "0");
  }
  const bytes = [];
  for (let i = 0; i < bits.length; i += 8) {
    if (i + 8 <= bits.length) {
      const byte = parseInt(bits.substring(i, i + 8), 2);
      bytes.push(byte);
    }
  }
  return Buffer.from(bytes);
}
function formatAsSentences(words) {
  let result = "";
  let sentenceLength = 0;
  for (let i = 0; i < words.length; i++) {
    let word = words[i];
    if (sentenceLength === 0) {
      word = word.charAt(0).toUpperCase() + word.slice(1);
    }
    result += word;
    sentenceLength++;
    if (sentenceLength > 5 && (Math.random() > 0.8 || sentenceLength > 15)) {
      result += ". ";
      sentenceLength = 0;
    } else {
      result += " ";
    }
  }
  if (result.endsWith(" ")) result = result.slice(0, -1);
  if (!result.endsWith(".")) result += ".";
  return result;
}
const schema = {
  todos: {
    type: "array",
    items: {
      type: "object",
      properties: {
        id: { type: "number" },
        text: { type: "string" },
        done: { type: "boolean" }
      }
    },
    default: [
      { id: 1, text: "Buy Milk", done: false },
      { id: 2, text: "Reply to boss", done: true },
      { id: 3, text: "Dentist appointment", done: false }
    ]
  },
  settings: {
    type: "object",
    properties: {
      autoClipboardListen: { type: "boolean" },
      panicModePassword: { type: "string" },
      theme: { type: "string", enum: ["dark", "light", "system"] }
    },
    default: {
      autoClipboardListen: false,
      theme: "dark"
    }
  }
};
const store = new Store({ schema });
function getStoreValue(key) {
  return store.get(key);
}
function setStoreValue(key, value) {
  store.set(key, value);
}
function createWindow() {
  const mainWindow = new electron.BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...process.platform === "linux" ? { icon } : {},
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      sandbox: false
    }
  });
  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });
  mainWindow.webContents.setWindowOpenHandler((details) => {
    electron.shell.openExternal(details.url);
    return { action: "deny" };
  });
  if (utils.is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
}
electron.app.whenReady().then(() => {
  utils.electronApp.setAppUserModelId("com.electron");
  electron.app.on("browser-window-created", (_, window) => {
    utils.optimizer.watchWindowShortcuts(window);
  });
  electron.ipcMain.handle("crypto:encrypt", async (_, text, password) => {
    return await encrypt(text, password);
  });
  electron.ipcMain.handle("crypto:decrypt", async (_, ciphertext, iv, salt, tag, password) => {
    return await decrypt(ciphertext, iv, salt, tag, password);
  });
  electron.ipcMain.handle("stego:embed", async (_, imageBuffer, dataBuffer) => {
    const res = await embed(Buffer.from(imageBuffer), Buffer.from(dataBuffer));
    return new Uint8Array(res);
  });
  electron.ipcMain.handle("stego:extract", async (_, imageBuffer) => {
    const res = await extract(Buffer.from(imageBuffer));
    return new Uint8Array(res);
  });
  electron.ipcMain.handle("nlp:encode", async (_, dataBuffer) => {
    return encode(Buffer.from(dataBuffer));
  });
  electron.ipcMain.handle("nlp:decode", async (_, text) => {
    const res = decode(text);
    return new Uint8Array(res);
  });
  electron.ipcMain.handle("store:get", async (_, key) => {
    return getStoreValue(key);
  });
  electron.ipcMain.handle("store:set", async (_, key, value) => {
    setStoreValue(key, value);
  });
  createWindow();
  electron.app.on("activate", function() {
    if (electron.BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
