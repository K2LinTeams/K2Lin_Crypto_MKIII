"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
const electron = require("electron");
const path = require("path");
const utils = require("@electron-toolkit/utils");
const crypto = require("crypto");
const util = require("util");
const sharp = require("sharp");
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
const OBFUSCATION_KEY = Buffer.from([122, 33, 159, 77]);
function applyMask(data) {
  const masked = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i++) {
    masked[i] = data[i] ^ OBFUSCATION_KEY[i % OBFUSCATION_KEY.length];
  }
  return masked;
}
async function embed(imageBuffer, dataBuffer) {
  const length = dataBuffer.length;
  if (length > 65535) {
    throw new Error("Data too large for this implementation (max 64KB)");
  }
  const header = Buffer.concat([HEADER_PREFIX, Buffer.from([length >> 8 & 255, length & 255])]);
  const rawPayload = Buffer.concat([header, dataBuffer]);
  const payload = applyMask(rawPayload);
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
  const rawHeaderBuffer = bitsToBuffer(headerBits);
  const headerBuffer = applyMask(rawHeaderBuffer);
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
  const payloadBuffer = bitsToBuffer(payloadBits);
  const fullEncryptedBuffer = Buffer.concat([rawHeaderBuffer, payloadBuffer]);
  const fullDecryptedBuffer = applyMask(fullEncryptedBuffer);
  return fullDecryptedBuffer.subarray(4);
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
const CORPUS_EN = [
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
const CORPUS_ZH = [
  "抓手",
  "赋能",
  "心智",
  "闭环",
  "沉淀",
  "打通",
  "链路",
  "痛点",
  "复盘",
  "颗粒度",
  "对齐",
  "底层逻辑",
  "方法论",
  "组合拳",
  "引爆点",
  "护城河",
  "生态",
  "场景",
  "维度",
  "格局",
  "形态",
  "势能",
  "矩阵",
  "联动",
  "共建",
  "共创",
  "落地",
  "下沉",
  "裂变",
  "导流",
  "拉新",
  "留存",
  "促活",
  "转化",
  "迭代",
  "重构",
  "复用",
  "解耦",
  "封装",
  "抽象",
  "中台",
  "微服务",
  "分布式",
  "高并发",
  "高可用",
  "弹性",
  "扩展性",
  "鲁棒性",
  "敏捷",
  "精益",
  "看板",
  "站会",
  "冲刺",
  "里程碑",
  "交付物",
  "验收",
  "上线",
  "回滚",
  "灰度",
  "全量",
  "监控",
  "告警",
  "埋点",
  "画像",
  "千人千面",
  "长尾",
  "头部",
  "腰部",
  "垂直",
  "细分",
  "蓝海",
  "红海",
  "风口",
  "赛道",
  "独角兽",
  "去中心化",
  "元宇宙",
  "Web3",
  "区块链",
  "智能合约",
  "算力",
  "算法",
  "模型",
  "训练",
  "推理",
  "端侧",
  "云端",
  "边缘计算",
  "物联网",
  "大数据",
  "云计算",
  "人工智能",
  "机器学习",
  "深度学习",
  "神经网络",
  "自然语言处理",
  "计算机视觉",
  "知识图谱",
  "用户体验",
  "交互设计",
  "视觉设计",
  "品牌调性",
  "差异化",
  "同质化",
  "内卷",
  "躺平",
  "摸鱼",
  "划水",
  "甩锅",
  "背锅",
  "画饼",
  "PUA",
  "996",
  "007",
  "福报",
  "优化",
  "毕业",
  "输送人才",
  "降本增效",
  "开源节流",
  "战略定力",
  "长期主义",
  "价值创造",
  "客户第一",
  "拥抱变化",
  "结果导向",
  "顶层设计",
  "协同",
  "兼容",
  "架构"
];
const DICTIONARY_EN = CORPUS_EN.slice(0, 128);
const DICTIONARY_ZH = CORPUS_ZH.slice(0, 128);
function encode(buffer, lang = "en") {
  const dictionary = lang.startsWith("zh") ? DICTIONARY_ZH : DICTIONARY_EN;
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
    words.push(dictionary[index]);
  }
  return formatAsSentences(words, lang);
}
function decode(text, lang = "en") {
  const dictionary = lang.startsWith("zh") ? DICTIONARY_ZH : DICTIONARY_EN;
  let cleanText = text;
  if (lang.startsWith("zh")) {
    cleanText = text.replace(/[.,/#!$%^&*;:{}=\-_`~()，。、；：？！“”‘’（）【】《》]/g, "").replace(/\s+/g, "");
  } else {
    cleanText = text.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").replace(/\s{2,}/g, " ").toLowerCase();
  }
  let bits = "";
  if (lang.startsWith("zh")) {
    let remaining = cleanText;
    while (remaining.length > 0) {
      let found = false;
      for (let len = 4; len >= 1; len--) {
        if (remaining.length < len) continue;
        const sub = remaining.substring(0, len);
        const index = dictionary.indexOf(sub);
        if (index !== -1) {
          bits += index.toString(2).padStart(7, "0");
          remaining = remaining.substring(len);
          found = true;
          break;
        }
      }
      if (!found) {
        remaining = remaining.substring(1);
      }
    }
  } else {
    const words = cleanText.trim().split(" ");
    for (const word of words) {
      const index = dictionary.indexOf(word);
      if (index === -1) {
        continue;
      }
      bits += index.toString(2).padStart(7, "0");
    }
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
function formatAsSentences(words, lang = "en") {
  if (lang.startsWith("zh")) {
    let result2 = "";
    let sentenceLength2 = 0;
    const connectives = ["我们", "需要", "进行", "实现", "以", "来", "从而", "进而", "完成", "打造"];
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      if (Math.random() > 0.7 && sentenceLength2 > 0) {
        result2 += connectives[Math.floor(Math.random() * connectives.length)];
      }
      result2 += word;
      sentenceLength2++;
      if (sentenceLength2 > 4 && (Math.random() > 0.7 || sentenceLength2 > 10)) {
        result2 += "，";
        sentenceLength2 = 0;
        if (Math.random() > 0.6) {
          result2 = result2.slice(0, -1) + "。";
        }
      }
    }
    if (!result2.endsWith("。")) result2 += "。";
    return result2;
  }
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
let store;
async function getStore() {
  if (store) return store;
  const { default: Store } = await import("electron-store");
  store = new Store({ schema });
  return store;
}
async function getStoreValue(key) {
  const s = await getStore();
  return s.get(key);
}
async function setStoreValue(key, value) {
  const s = await getStore();
  s.set(key, value);
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
  electron.ipcMain.handle("nlp:encode", async (_, dataBuffer, lang) => {
    return encode(Buffer.from(dataBuffer), lang);
  });
  electron.ipcMain.handle("nlp:decode", async (_, text, lang) => {
    const res = decode(text, lang);
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
