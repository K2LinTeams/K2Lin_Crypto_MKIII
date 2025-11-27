import React, { useState, useEffect } from 'react';
import { Shield, Lock, Eye, EyeOff, Settings, Image, Send, Copy, Trash2, Plus, CheckCircle } from 'lucide-react';
// --- 类型定义 ---
type Tab = 'vault' | 'mimic' | 'settings';

// --- 模拟的加密函数 (在实际 Node.js/Electron 环境中应替换为 crypto 模块) ---
// 为了演示效果，这里使用了简单的 Base64 + 异或 模拟混淆，
// 真实项目中请使用 window.crypto.subtle 或 Node.js crypto.createCipheriv
const mockEncrypt = (text: string, key: string) => {
  if (!text) return '';
  const prefix = "Crypto3_ENC::"; // 模拟头部
  const base64 = btoa(unescape(encodeURIComponent(text)));
  return prefix + base64.split('').reverse().join(''); // 简单的倒序混淆
};

const mockDecrypt = (text: string, key: string) => {
  if (!text.startsWith("Crypto3_ENC::")) return "错误: 无效的密文格式";
  const content = text.replace("Crypto3_ENC::", "");
  try {
    const reversed = content.split('').reverse().join('');
    return decodeURIComponent(escape(atob(reversed)));
  } catch (e) {
    return "解密失败: 密钥错误或数据损坏";
  }
};

export default function App() {
  const [panicMode, setPanicMode] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('vault');
  
  // 加密状态
  const [inputData, setInputData] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [outputData, setOutputData] = useState('');
  const [isEncrypted, setIsEncrypted] = useState(false);

  // 伪装模式状态 (Todo List)
  const [todos, setTodos] = useState([
    { id: 1, text: "买牛奶", done: false },
    { id: 2, text: "回复老板邮件", done: true },
    { id: 3, text: "预约牙医", done: false },
  ]);

  // 处理加密/解密逻辑
  const handleProcess = () => {
    if (!secretKey) {
       // 实际应用中请使用 UI 提示而不是 alert
       return; 
    }
    
    if (isEncrypted) {
      // 执行解密
      const result = mockDecrypt(outputData, secretKey);
      setInputData(result);
      setIsEncrypted(false);
      setOutputData('');
    } else {
      // 执行加密
      const result = mockEncrypt(inputData, secretKey);
      setOutputData(result);
      setIsEncrypted(true);
      setInputData('');
    }
  };

  const copyToClipboard = (text: string) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  };

  // --- 伪装模式 UI (普通待办事项 App) ---
  if (panicMode) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-800 font-sans flex flex-col items-center pt-10 transition-all duration-300">
        <div className="w-full max-w-md bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
          <div className="bg-blue-500 p-4 flex justify-between items-center text-white">
            <h1 className="text-xl font-bold">每日清单</h1>
            <button onClick={() => setPanicMode(false)} className="opacity-50 hover:opacity-100 transition-opacity">
              <div className="w-2 h-2 bg-white rounded-full"></div> {/* 隐蔽的切换按钮 */}
            </button>
          </div>
          <div className="p-4">
            <div className="flex gap-2 mb-4">
              <input 
                type="text" 
                placeholder="添加新任务..." 
                className="flex-1 border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500"
              />
              <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                <Plus size={20} />
              </button>
            </div>
            <ul className="space-y-2">
              {todos.map(todo => (
                <li key={todo.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                  {todo.done ? <CheckCircle className="text-green-500" size={20}/> : <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>}
                  <span className={todo.done ? "line-through text-gray-400" : ""}>{todo.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-8 text-xs text-gray-400">
          SimpleNotes v1.0.2 &copy; 2024
        </div>
      </div>
    );
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
            <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">v0.1.0-alpha</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Node.js Secure Core: Active</span>
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
                    <Lock size={14} /> 会话密钥 (AES-256)
                  </h3>
                  <button className="text-xs text-cyan-400 hover:text-cyan-300 underline">生成随机密钥</button>
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
                  <label className="text-xs text-slate-500 font-bold uppercase">原始数据 (明文)</label>
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
                         <Send size={24} className={isEncrypted ? "rotate-180 transition-transform" : "transition-transform"} />
                      </button>
                   </div>
                </div>

                {/* 输出区 */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs text-slate-500 font-bold uppercase">加密载荷 (密文)</label>
                    <div className="flex gap-2">
                       <button onClick={() => copyToClipboard(outputData)} className="p-1 hover:text-cyan-400 text-slate-500" title="复制">
                         <Copy size={14} />
                       </button>
                       <button onClick={() => setOutputData('')} className="p-1 hover:text-red-400 text-slate-500" title="清空">
                         <Trash2 size={14} />
                       </button>
                    </div>
                  </div>
                  <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-4 relative group overflow-hidden">
                    {outputData ? (
                      <div className="text-xs text-green-400/80 break-all font-mono leading-relaxed">
                        {outputData}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-700 text-sm italic">
                        等待数据...
                      </div>
                    )}
                    {/* 扫描线特效 */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.5)] animate-[scan_3s_linear_infinite] pointer-events-none"></div>
                  </div>
                </div>
              </div>

              {/* 格式选择 */}
              <div className="flex gap-4 overflow-x-auto pb-2">
                 {['Base64', 'Hex', 'Emoji (Mimic)', 'Zero-Width'].map((fmt) => (
                   <button key={fmt} className="px-4 py-2 rounded-lg border border-slate-700 bg-slate-800/50 text-slate-400 text-xs hover:border-cyan-500/50 hover:text-cyan-400 transition-all whitespace-nowrap">
                     {fmt}
                   </button>
                 ))}
              </div>
            </div>
          )}

          {activeTab === 'mimic' && (
            <div className="max-w-3xl mx-auto text-center mt-20">
              <div className="inline-block p-6 rounded-full bg-slate-800/50 border border-slate-700 mb-6">
                <Image size={48} className="text-slate-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-300 mb-2">图像隐写实验室</h2>
              <p className="text-slate-500 max-w-md mx-auto mb-8">
                将加密数据注入到图像的 DCT 频域中。即使经过微信/WhatsApp 压缩，数据仍可被还原。
              </p>
              
              <div className="border-2 border-dashed border-slate-700 rounded-2xl p-12 hover:border-cyan-500/50 hover:bg-slate-900/50 transition-all cursor-pointer group">
                <div className="text-slate-600 group-hover:text-cyan-500 transition-colors">
                  点击或拖拽图片至此
                </div>
                <div className="text-xs text-slate-700 mt-2">支持 JPG, PNG, WebP</div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
             <div className="max-w-2xl mx-auto">
                <h2 className="text-xl font-bold text-slate-300 mb-6 border-b border-slate-800 pb-4">系统设置</h2>
                
                <div className="space-y-6">
                  <div className="flex justify-between items-center p-4 bg-slate-900/50 rounded-lg border border-slate-800">
                     <div>
                       <div className="text-slate-300 text-sm font-bold">自动剪贴板监听</div>
                       <div className="text-slate-500 text-xs mt-1">检测到 "Crypto3" 格式数据时自动弹窗解密</div>
                     </div>
                     <div className="w-12 h-6 bg-cyan-900 rounded-full relative cursor-pointer">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-cyan-400 rounded-full shadow-lg"></div>
                     </div>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-slate-900/50 rounded-lg border border-slate-800">
                     <div>
                       <div className="text-slate-300 text-sm font-bold">伪装模式入口密码</div>
                       <div className="text-slate-500 text-xs mt-1">设置后，需输入密码才能从伪装模式切回主界面</div>
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
  );
}