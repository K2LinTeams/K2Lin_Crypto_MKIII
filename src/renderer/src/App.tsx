import React, { useState, useEffect, useRef } from 'react'
import {
  Shield,
  Lock,
  EyeOff,
  Settings,
  Image,
  Send,
  Copy,
  Trash2,
  Plus,
  CheckCircle,
  Download,
  FileWarning
} from 'lucide-react'
import { api, getEnvironmentName } from './apiAdapter'

// --- 类型定义 ---
type Tab = 'vault' | 'mimic' | 'settings'
type Format = 'Base64' | 'Hex' | 'Natural Text (Markov)'

export default function App(): React.ReactElement {
  const [panicMode, setPanicMode] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('vault')

  // 加密状态
  const [inputData, setInputData] = useState('')
  const [secretKey, setSecretKey] = useState('')
  const [outputData, setOutputData] = useState('')
  const [isEncrypted, setIsEncrypted] = useState(false)
  const [currentFormat, setCurrentFormat] = useState<Format>('Base64')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [encryptedPackage, setEncryptedPackage] = useState<any>(null) // Stores raw iv, salt, tag, ciphertext

  // 伪装模式状态 (Todo List)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [todos, setTodos] = useState<any[]>([])

  // 隐写状态
  const [stegoImage, setStegoImage] = useState<string | null>(null)
  const [stegoStatus, setStegoStatus] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load Panic Mode Todos
  useEffect(() => {
    async function loadTodos(): Promise<void> {
      const storedTodos = await api.store.get('todos')
      if (storedTodos) {
        setTodos(storedTodos)
      }
    }
    loadTodos()
  }, [])

  // Save Panic Mode Todos
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateTodos = (newTodos: any[]): void => {
    setTodos(newTodos)
    api.store.set('todos', newTodos)
  }

  const handleProcess = async (): Promise<void> => {
    if (!secretKey) return

    try {
      if (isEncrypted) {
        // Decrypt
        let encryptedObj = encryptedPackage

        // If we don't have the object in memory (e.g. pasted text), try to parse it
        if (!encryptedObj) {
          // This logic depends on the format.
          // For MVP, we assume the user is pasting "Base64" format or "Natural Text".
          // If Natural Text, we need to decode first.
          if (currentFormat === 'Natural Text (Markov)') {
            const decodedBytes = await api.nlp.decode(outputData)
            const jsonString = new TextDecoder().decode(decodedBytes)
            encryptedObj = JSON.parse(jsonString)
          } else {
            // Default Base64 JSON assumption
            try {
              encryptedObj = JSON.parse(atob(outputData))
            } catch {
              // Try raw text if it looks like JSON
              encryptedObj = JSON.parse(outputData)
            }
          }
        }

        const result = await api.crypto.decrypt(
          encryptedObj.ciphertext,
          encryptedObj.iv,
          encryptedObj.salt,
          encryptedObj.tag,
          secretKey
        )

        setInputData(result)
        setIsEncrypted(false)
        setOutputData('')
        setEncryptedPackage(null)
      } else {
        // Encrypt
        const result = await api.crypto.encrypt(inputData, secretKey)
        setEncryptedPackage(result)
        setIsEncrypted(true)
        setInputData('')

        // Format output
        formatOutput(result, currentFormat)
      }
    } catch (error) {
      console.error(error)
      alert('Operation failed: ' + (error as Error).message)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatOutput = async (data: any, format: Format): Promise<void> => {
    const jsonString = JSON.stringify(data)

    if (format === 'Base64') {
      setOutputData(btoa(jsonString))
    } else if (format === 'Hex') {
      // Buffer is Node only. Use a simple hex helper for cross-platform
      const buffer = new TextEncoder().encode(jsonString)
      const hex = Array.from(buffer)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
      setOutputData(hex)
    } else if (format === 'Natural Text (Markov)') {
      const buffer = new TextEncoder().encode(jsonString)
      // We need to convert Uint8Array to ArrayBuffer for IPC
      const text = await api.nlp.encode(buffer.buffer)
      setOutputData(text)
    }
  }

  // Watch for format changes to re-render output if we have the encrypted package
  useEffect(() => {
    if (isEncrypted && encryptedPackage) {
      formatOutput(encryptedPackage, currentFormat)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFormat])

  const copyToClipboard = (text: string): void => {
    navigator.clipboard.writeText(text)
  }

  // Steganography Handlers
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0]
    if (!file) return

    const arrayBuffer = await file.arrayBuffer()

    if (isEncrypted && encryptedPackage) {
      // Embedding mode
      setStegoStatus('Embedding data...')
      try {
        const payload = JSON.stringify(encryptedPackage)
        const payloadBuffer = new TextEncoder().encode(payload)

        const pngBuffer = await api.stego.embed(arrayBuffer, payloadBuffer.buffer)

        // Fix: Explicitly cast to any or check type to satisfy TS strictness about ArrayBufferView
        const blob = new Blob([pngBuffer as unknown as BlobPart], { type: 'image/png' })
        const url = URL.createObjectURL(blob)
        setStegoImage(url)
        setStegoStatus('Encryption complete. Please download the PNG.')
      } catch (err) {
        setStegoStatus('Error: ' + (err as Error).message)
      }
    } else {
      // Extraction mode
      setStegoStatus('Scanning for data...')
      try {
        const payloadBuffer = await api.stego.extract(arrayBuffer)
        const payloadStr = new TextDecoder().decode(payloadBuffer)
        const payload = JSON.parse(payloadStr)

        setEncryptedPackage(payload)
        setIsEncrypted(true)
        setOutputData(JSON.stringify(payload)) // Show raw JSON for now
        setStegoStatus('Data found! Switch to Vault to decrypt.')
        setActiveTab('vault')
      } catch {
        setStegoStatus('No valid data found or error reading image.')
      }
    }
  }

  // --- 伪装模式 UI (普通待办事项 App) ---
  if (panicMode) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-800 font-sans flex flex-col items-center pt-10 transition-all duration-300">
        <div className="w-full max-w-md bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
          <div className="bg-blue-500 p-4 flex justify-between items-center text-white">
            <h1 className="text-xl font-bold">每日清单</h1>
            <button
              onClick={() => setPanicMode(false)}
              className="opacity-50 hover:opacity-100 transition-opacity"
            >
              <div className="w-2 h-2 bg-white rounded-full"></div> {/* 隐蔽的切换按钮 */}
            </button>
          </div>
          <div className="p-4">
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="添加新任务..."
                className="flex-1 border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = (e.target as HTMLInputElement).value
                    if (val) {
                      updateTodos([...todos, { id: Date.now(), text: val, done: false }])
                      ;(e.target as HTMLInputElement).value = ''
                    }
                  }
                }}
              />
              <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                <Plus size={20} />
              </button>
            </div>
            <ul className="space-y-2">
              {todos.map((todo) => (
                <li
                  key={todo.id}
                  className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                  onClick={() => {
                    const newTodos = todos.map((t) =>
                      t.id === todo.id ? { ...t, done: !t.done } : t
                    )
                    updateTodos(newTodos)
                  }}
                >
                  {todo.done ? (
                    <CheckCircle className="text-green-500" size={20} />
                  ) : (
                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                  )}
                  <span className={todo.done ? 'line-through text-gray-400' : ''}>{todo.text}</span>
                  <button
                    className="ml-auto text-gray-300 hover:text-red-500"
                    onClick={(e) => {
                      e.stopPropagation()
                      updateTodos(todos.filter((t) => t.id !== todo.id))
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-8 text-xs text-gray-400">SimpleNotes v1.0.2 &copy; 2024</div>
      </div>
    )
  }

  // --- 正常模式 UI (Crypto3 加密终端) ---
  return (
    <div className="min-h-screen bg-slate-950 text-cyan-50 font-mono selection:bg-cyan-900 selection:text-cyan-50 flex overflow-hidden">
      {/* 侧边栏 */}
      <div className="w-20 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-6 gap-8 z-10">
        <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
          <Shield size={24} className="text-cyan-400" />
        </div>

        <nav className="flex-1 flex flex-col gap-6 w-full items-center">
          <button
            onClick={() => setActiveTab('vault')}
            className={`p-3 rounded-xl transition-all ${activeTab === 'vault' ? 'bg-cyan-500/20 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Lock size={22} />
          </button>
          <button
            onClick={() => setActiveTab('mimic')}
            className={`p-3 rounded-xl transition-all ${activeTab === 'mimic' ? 'bg-cyan-500/20 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Image size={22} />
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`p-3 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-cyan-500/20 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Settings size={22} />
          </button>
        </nav>

        <button
          onClick={() => setPanicMode(true)}
          className="p-3 text-red-500/70 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all mb-4"
          title="启用伪装模式 (Panic Mode)"
        >
          <EyeOff size={22} />
        </button>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col relative">
        {/* 背景装饰 */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-600/30 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-600/20 blur-[100px] rounded-full"></div>
        </div>

        {/* 顶部栏 */}
        <header className="h-16 border-b border-slate-800/50 flex items-center justify-between px-8 backdrop-blur-sm z-10">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Crypto3
            </h1>
            <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
              v0.1.0-beta
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>{getEnvironmentName()}</span>
            </div>
          </div>
        </header>

        {/* 内容 */}
        <main className="flex-1 p-8 overflow-y-auto z-10">
          {activeTab === 'vault' && (
            <div className="max-w-4xl mx-auto flex flex-col gap-6">
              {/* 密钥输入卡片 */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Lock size={14} /> 会话密钥 (Scrypt Key Derivation)
                  </h3>
                  <button className="text-xs text-cyan-400 hover:text-cyan-300 underline">
                    生成随机密钥
                  </button>
                </div>
                <input
                  type="password"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  placeholder="在此输入预共享密钥或密码..."
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-4 py-3 text-cyan-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[400px]">
                {/* 输入区 */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-slate-500 font-bold uppercase">
                    原始数据 (明文)
                  </label>
                  <textarea
                    value={inputData}
                    onChange={(e) => setInputData(e.target.value)}
                    disabled={isEncrypted}
                    placeholder="输入要加密的消息..."
                    className="flex-1 bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-slate-300 resize-none focus:outline-none focus:border-slate-600 transition-all font-mono text-sm"
                  ></textarea>
                </div>

                {/* 转换控制 */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:static md:translate-x-0 md:translate-y-0 md:flex md:flex-col md:justify-center md:items-center z-20 pointer-events-none md:pointer-events-auto">
                  <div className="hidden md:flex flex-col gap-4">
                    <button
                      onClick={handleProcess}
                      className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white p-4 rounded-full shadow-lg shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all group"
                    >
                      <Send
                        size={24}
                        className={
                          isEncrypted ? 'rotate-180 transition-transform' : 'transition-transform'
                        }
                      />
                    </button>
                  </div>
                </div>

                {/* 输出区 */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs text-slate-500 font-bold uppercase">
                      加密载荷 (密文)
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyToClipboard(outputData)}
                        className="p-1 hover:text-cyan-400 text-slate-500"
                        title="复制"
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        onClick={() => {
                          setOutputData('')
                          setEncryptedPackage(null)
                          setIsEncrypted(false)
                        }}
                        className="p-1 hover:text-red-400 text-slate-500"
                        title="清空"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-4 relative group overflow-hidden">
                    {outputData ? (
                      <div className="text-xs text-green-400/80 break-all font-mono leading-relaxed h-full overflow-y-auto">
                        {outputData}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-700 text-sm italic">
                        等待数据...
                      </div>
                    )}
                    {/* 扫描线特效 */}
                    {outputData && (
                      <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.5)] animate-[scan_3s_linear_infinite] pointer-events-none"></div>
                    )}
                  </div>
                </div>
              </div>

              {/* 格式选择 */}
              <div className="flex gap-4 overflow-x-auto pb-2">
                {(['Base64', 'Hex', 'Natural Text (Markov)'] as Format[]).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setCurrentFormat(fmt)}
                    className={`px-4 py-2 rounded-lg border text-xs whitespace-nowrap transition-all ${currentFormat === fmt ? 'border-cyan-500 bg-cyan-900/20 text-cyan-300' : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-cyan-500/50 hover:text-cyan-400'}`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'mimic' && (
            <div className="max-w-3xl mx-auto text-center mt-10">
              <div className="inline-block p-6 rounded-full bg-slate-800/50 border border-slate-700 mb-6">
                <Image size={48} className="text-slate-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-300 mb-2">LSB 隐写实验室</h2>
              <div className="bg-amber-900/20 border border-amber-900/50 p-4 rounded-lg mb-8 text-left max-w-xl mx-auto flex gap-3">
                <FileWarning className="text-amber-500 flex-shrink-0" />
                <div className="text-xs text-amber-200/80">
                  <strong>警告:</strong> 此模式使用 LSB (最低有效位) 隐写。
                  <ul className="list-disc ml-4 mt-2 space-y-1">
                    <li>
                      输出图像必须保存为 <strong>PNG</strong> 格式。
                    </li>
                    <li>
                      在微信/WhatsApp 发送时必须勾选 <strong>&quot;原图&quot;</strong>。
                    </li>
                    <li>任何云端压缩都会导致数据永久损坏。</li>
                  </ul>
                </div>
              </div>

              {!isEncrypted && !encryptedPackage ? (
                <div
                  className="border-2 border-dashed border-slate-700 rounded-2xl p-12 hover:border-cyan-500/50 hover:bg-slate-900/50 transition-all cursor-pointer group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="text-slate-600 group-hover:text-cyan-500 transition-colors">
                    点击上传图片进行 <strong>解密/提取</strong>
                  </div>
                  <div className="text-xs text-slate-700 mt-2">支持 JPG, PNG, WebP</div>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-cyan-700/50 bg-cyan-900/10 rounded-2xl p-12 hover:border-cyan-500 transition-all cursor-pointer group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="text-cyan-400 group-hover:text-cyan-300 transition-colors">
                    点击上传载体图片以 <strong>嵌入数据</strong>
                  </div>
                  <div className="text-xs text-cyan-600/70 mt-2">当前有加密数据待注入</div>
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />

              {stegoStatus && (
                <div className="mt-6 text-sm text-cyan-400 animate-pulse">{stegoStatus}</div>
              )}

              {stegoImage && (
                <div className="mt-8 flex flex-col items-center">
                  <h3 className="text-sm text-slate-400 mb-4">生成结果 (点击下载)</h3>
                  <a
                    href={stegoImage}
                    download="crypto3_stego_output.png"
                    className="group relative block overflow-hidden rounded-lg border border-cyan-500/30 hover:border-cyan-400 transition-all"
                  >
                    <img
                      src={stegoImage}
                      alt="Stego Output"
                      className="max-w-xs rounded-lg shadow-2xl"
                    />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Download size={32} className="text-white" />
                    </div>
                  </a>
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-2xl mx-auto">
              <h2 className="text-xl font-bold text-slate-300 mb-6 border-b border-slate-800 pb-4">
                系统设置
              </h2>

              <div className="space-y-6">
                <div className="flex justify-between items-center p-4 bg-slate-900/50 rounded-lg border border-slate-800">
                  <div>
                    <div className="text-slate-300 text-sm font-bold">自动剪贴板监听</div>
                    <div className="text-slate-500 text-xs mt-1">
                      检测到 &quot;Crypto3&quot; 格式数据时自动弹窗解密
                    </div>
                  </div>
                  <div className="w-12 h-6 bg-cyan-900 rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-cyan-400 rounded-full shadow-lg"></div>
                  </div>
                </div>

                <div className="flex justify-between items-center p-4 bg-slate-900/50 rounded-lg border border-slate-800">
                  <div>
                    <div className="text-slate-300 text-sm font-bold">伪装模式入口密码</div>
                    <div className="text-slate-500 text-xs mt-1">
                      设置后，需输入密码才能从伪装模式切回主界面
                    </div>
                  </div>
                  <button className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded text-slate-300 transition-colors">
                    配置
                  </button>
                </div>

                <div className="flex justify-between items-center p-4 bg-red-900/10 rounded-lg border border-red-900/30">
                  <div>
                    <div className="text-red-400 text-sm font-bold">紧急销毁</div>
                    <div className="text-red-500/60 text-xs mt-1">清除所有本地密钥和缓存数据</div>
                  </div>
                  <button className="text-xs bg-red-900/20 hover:bg-red-900/40 border border-red-900/50 text-red-400 px-3 py-1.5 rounded transition-colors">
                    执行
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  )
}
