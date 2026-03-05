import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cpu, Database, HardDrive, Terminal, CheckCircle, 
  AlertTriangle, Info, Layers, Zap, FileCode, 
  Settings, Activity, MessageSquare, Shield, 
  ChevronRight, Command, Bell, User, Search,
  Menu, X, Maximize2, Minimize2, Power, Download,
  History, Trash2
} from 'lucide-react';
import { ModelConfig, calculateParams, calculateMemory } from './modelConfig';

interface PlaygroundHistoryItem {
  id: string;
  prompt: string;
  response: string;
  timestamp: number;
}

// --- Sub-Components ---

const TopNav = ({ systemStatus }: { systemStatus: string }) => (
  <nav className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-zinc-950/50 backdrop-blur-md z-50">
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-emerald-500 rounded flex items-center justify-center">
          <Cpu className="w-4 h-4 text-black" />
        </div>
        <span className="font-bold tracking-tighter text-lg">MicroLLM<span className="text-emerald-500">.OS</span></span>
      </div>
      <div className="h-4 w-px bg-white/10 mx-2" />
      <div className="flex items-center gap-2 px-2 py-1 bg-emerald-500/10 rounded border border-emerald-500/20">
        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{systemStatus}</span>
      </div>
    </div>

    <div className="flex items-center gap-6">
      <div className="flex items-center gap-4 text-zinc-500">
        <Search className="w-4 h-4 hover:text-white cursor-pointer transition-colors" />
        <Bell className="w-4 h-4 hover:text-white cursor-pointer transition-colors" />
        <Settings className="w-4 h-4 hover:text-white cursor-pointer transition-colors" />
      </div>
      <div className="h-8 w-px bg-white/10" />
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-[10px] font-bold text-white uppercase leading-none">Admin_User</div>
          <div className="text-[9px] text-zinc-500 uppercase">Level 4 Access</div>
        </div>
        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center overflow-hidden">
          <User className="w-4 h-4 text-zinc-400" />
        </div>
      </div>
    </div>
  </nav>
);

const Sidebar = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) => {
  const menuItems = [
    { id: 'dashboard', icon: Activity, label: 'Dashboard' },
    { id: 'playground', icon: Terminal, label: 'Playground' },
    { id: 'models', icon: Database, label: 'Models' },
    { id: 'config', icon: Settings, label: 'Configuration' },
    { id: 'filesystem', icon: Layers, label: 'Filesystem' },
    { id: 'security', icon: Shield, label: 'Security' },
  ];

  return (
    <aside className="w-64 border-r border-white/5 flex flex-col bg-zinc-950/30 backdrop-blur-sm">
      <div className="p-4 space-y-1">
        <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-4 px-2">Core Systems</div>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
              activeTab === item.id 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5 border border-transparent'
            }`}
          >
            <item.icon className={`w-4 h-4 ${activeTab === item.id ? 'text-emerald-400' : 'group-hover:text-zinc-200'}`} />
            <span className="text-xs font-medium">{item.label}</span>
            {activeTab === item.id && (
              <motion.div layoutId="active-pill" className="ml-auto w-1 h-4 bg-emerald-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      <div className="mt-auto p-4 border-t border-white/5">
        <div className="p-4 bg-zinc-900/50 rounded-xl border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-3 h-3 text-emerald-500" />
            <span className="text-[10px] font-bold uppercase text-zinc-400">Memory Load</span>
          </div>
          <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '42%' }}
              className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[9px] text-zinc-600 uppercase">42% Utilized</span>
            <span className="text-[9px] text-zinc-600 uppercase">1.7GB / 4GB</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

const StatusBar = ({ config }: { config: ModelConfig | null }) => (
  <footer className="h-8 border-t border-white/5 bg-zinc-950 flex items-center justify-between px-4 text-[10px] font-mono text-zinc-500 z-50">
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
        <span className="uppercase tracking-wider">Engine: MicroLlama-v1.2</span>
      </div>
      <div className="flex items-center gap-2">
        <Activity className="w-3 h-3" />
        <span>LATENCY: 12ms</span>
      </div>
      <div className="flex items-center gap-2">
        <Layers className="w-3 h-3" />
        <span>CTX: {config?.max_seq_len || 0}</span>
      </div>
    </div>
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2">
        <Command className="w-3 h-3" />
        <span>UTF-8</span>
      </div>
      <div className="flex items-center gap-2 text-emerald-500/70">
        <CheckCircle className="w-3 h-3" />
        <span>SYNCED</span>
      </div>
    </div>
  </footer>
);

// --- Main Application ---

const MicroLLMDashboard = () => {
  const [config, setConfig] = useState<ModelConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Playground state
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [history, setHistory] = useState<PlaygroundHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Model Management state
  const [activeModel, setActiveModel] = useState({
    name: 'MicroLlama-v1.2-Q4_K_M.gguf',
    version: '1.2.0',
    size: 0, // Will be set from memory.q4
    quant: 'Q4_K_M',
    id: 'default'
  });
  
  const [availableModels, setAvailableModels] = useState([
    { id: 'q8', name: 'MicroLlama-v1.2-Q8_0.gguf', version: '1.2.0', size: '394 MB', quant: 'Q8_0', desc: 'High precision, requires more RAM', status: 'available' },
    { id: 'q2', name: 'MicroLlama-v1.2-Q2_K.gguf', version: '1.2.0', size: '131 MB', quant: 'Q2_K', desc: 'Ultra-compressed, runs on 2GB devices', status: 'available' },
    { id: 'tiny', name: 'TinyLlama-1.1B-Chat-v1.0.gguf', version: '1.0.0', size: '680 MB', quant: 'Q4_K_M', desc: 'Alternative chat-tuned model', status: 'available' },
  ]);

  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Config Editing state
  const [editableConfig, setEditableConfig] = useState<ModelConfig | null>(null);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('./model_config.json');
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Configuration file not found. Please ensure "model_config.json" exists in the "public/" directory.');
          }
          throw new Error(`Failed to fetch config: ${response.statusText} (Status: ${response.status})`);
        }
        const data = await response.json();
        setConfig(data);
        setEditableConfig(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const params = useMemo(() => config ? calculateParams(config) : 0, [config]);
  const memory = useMemo(() => config ? calculateMemory(params, config) : { fp16: 0, q4: 0, kv_cache: 0 }, [params, config]);

  useEffect(() => {
    if (memory.q4 > 0 && activeModel.id === 'default') {
      setActiveModel(prev => ({ ...prev, size: Math.round(memory.q4) }));
    }
  }, [memory.q4]);

  const handlePromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setIsSubmitting(true);
    setResponse('');
    
    const currentPrompt = prompt;
    
    setTimeout(() => {
      const newResponse = `[MicroLLM_OS_v1.2_Output]\n\nProcessing complete. Architecture validated for ${config?.dim} dimensions. Memory footprint within limits (${Math.round(memory.q4 + memory.kv_cache)}MB). \n\nResponse: "The quick brown fox jumps over the lazy dog."`;
      setResponse(newResponse);
      
      const historyItem: PlaygroundHistoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        prompt: currentPrompt,
        response: newResponse,
        timestamp: Date.now(),
      };
      
      setHistory(prev => [historyItem, ...prev]);
      setIsSubmitting(false);
      setShowHistory(false);
    }, 1500);
  };

  const clearHistory = () => {
    setHistory([]);
    setShowHistory(false);
  };

  const startDownload = (id: string) => {
    setDownloadingId(id);
    setDownloadProgress(0);
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setDownloadingId(null);
          setAvailableModels(models => models.map(m => m.id === id ? { ...m, status: 'downloaded' } : m));
          return 100;
        }
        return prev + 5;
      });
    }, 150);
  };

  const switchModel = (model: any) => {
    setActiveModel({
      name: model.name,
      version: model.version,
      size: parseInt(model.size),
      quant: model.quant,
      id: model.id
    });
  };

  const handleConfigChange = (key: keyof ModelConfig, value: any) => {
    if (!editableConfig) return;
    setEditableConfig({
      ...editableConfig,
      [key]: value
    });
    setSaveSuccess(false);
  };

  const saveConfig = () => {
    if (!editableConfig) return;
    setIsSavingConfig(true);
    // Simulate API call to save config
    setTimeout(() => {
      setConfig(editableConfig);
      setIsSavingConfig(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1000);
  };

  if (loading) return (
    <div className="h-screen bg-[#020203] flex items-center justify-center cyber-grid">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="w-16 h-16 border-2 border-emerald-500/20 rounded-full" />
          <div className="absolute inset-0 w-16 h-16 border-t-2 border-emerald-500 rounded-full animate-spin" />
          <Cpu className="absolute inset-0 m-auto w-6 h-6 text-emerald-500 animate-pulse" />
        </div>
        <div className="text-center">
          <h2 className="text-emerald-500 font-bold tracking-widest uppercase text-xs mb-1">Booting MicroLLM.OS</h2>
          <div className="text-[10px] text-zinc-600 font-mono">Initializing Neural Core...</div>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="h-screen bg-[#020203] flex items-center justify-center p-8 cyber-grid">
      <div className="max-w-md w-full glass-panel p-8 rounded-3xl text-center neon-border-emerald">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">System Failure</h2>
        <p className="text-zinc-400 text-sm mb-6 font-mono">{error}</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors text-xs uppercase tracking-widest">Reboot System</button>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-[#020203] text-zinc-100 cyber-grid relative overflow-hidden">
      <div className="scanline" />
      
      <TopNav systemStatus="Online" />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 flex flex-col overflow-hidden relative">
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && (
                <motion.div 
                  key="dashboard"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                      { label: 'RAM Limit', value: '4 GB', icon: Cpu, color: 'text-blue-500' },
                      { label: 'Inference RAM', value: `${Math.round(memory.q4 + memory.kv_cache + 100)} MB`, icon: Zap, color: 'text-emerald-500' },
                      { label: 'Disk Space', value: '58 GB', icon: HardDrive, color: 'text-amber-500' },
                      { label: 'Model Size', value: `${Math.round(memory.q4)} MB`, icon: Database, color: 'text-purple-500' },
                    ].map((stat) => (
                      <div key={stat.label} className="glass-panel p-5 rounded-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                          <stat.icon className="w-12 h-12" />
                        </div>
                        <stat.icon className={`w-4 h-4 mb-3 ${stat.color}`} />
                        <div className="text-xl font-bold font-mono">{stat.value}</div>
                        <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="glass-panel p-8 rounded-3xl">
                      <div className="flex items-center justify-between mb-8">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                          <Settings className="w-5 h-5 text-emerald-500" />
                          Neural Architecture
                        </h2>
                        <div className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[9px] text-emerald-500 font-bold uppercase tracking-widest">
                          Verified
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                        {[
                          { label: 'Vocab Size', value: config?.vocab_size.toLocaleString() },
                          { label: 'Hidden Dim', value: config?.dim },
                          { label: 'Layers', value: config?.n_layers },
                          { label: 'Heads', value: config?.n_heads },
                          { label: 'Context', value: config?.max_seq_len },
                          { label: 'Params', value: `${(params / 1e6).toFixed(1)}M`, highlight: true },
                        ].map((item) => (
                          <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/5">
                            <span className="text-[10px] text-zinc-500 uppercase font-bold">{item.label}</span>
                            <span className={`font-mono text-xs ${item.highlight ? 'text-emerald-500' : 'text-zinc-300'}`}>{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="glass-panel p-8 rounded-3xl">
                      <h2 className="text-lg font-bold mb-8 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-500" />
                        Memory Telemetry
                      </h2>
                      <div className="space-y-6">
                        <div>
                          <div className="flex justify-between text-[10px] uppercase font-bold text-zinc-500 mb-2">
                            <span>Weights (Q4)</span>
                            <span className="text-zinc-300">{Math.round(memory.q4)} MB</span>
                          </div>
                          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500" style={{ width: '15%' }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-[10px] uppercase font-bold text-zinc-500 mb-2">
                            <span>KV Cache (FP16)</span>
                            <span className="text-zinc-300">{Math.round(memory.kv_cache)} MB</span>
                          </div>
                          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: '8%' }} />
                          </div>
                        </div>
                        <div className="pt-4 border-t border-white/5">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-[10px] uppercase font-bold text-zinc-500">Total Footprint</div>
                              <div className="text-2xl font-bold text-emerald-500 font-mono">{Math.round(memory.q4 + memory.kv_cache + 100)} MB</div>
                            </div>
                            <div className="text-right">
                              <div className="text-[10px] uppercase font-bold text-zinc-500">Status</div>
                              <div className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Optimal</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'playground' && (
                <motion.div 
                  key="playground"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="h-full flex flex-col gap-6"
                >
                  <div className="glass-panel p-8 rounded-3xl flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-bold flex items-center gap-2">
                        <Terminal className="w-5 h-5 text-emerald-500" />
                        Neural Console
                      </h2>
                      <div className="flex items-center gap-2">
                        {history.length > 0 && (
                          <button 
                            onClick={() => setShowHistory(!showHistory)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                              showHistory 
                                ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                                : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 border border-white/5'
                            }`}
                          >
                            <History className="w-3 h-3" />
                            {showHistory ? 'Close History' : `View History (${history.length})`}
                          </button>
                        )}
                        {showHistory && history.length > 0 && (
                          <button 
                            onClick={clearHistory}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
                          >
                            <Trash2 className="w-3 h-3" />
                            Clear
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-1 bg-black/40 rounded-2xl border border-white/5 p-6 font-mono text-sm overflow-y-auto mb-6 custom-scrollbar relative">
                      {showHistory ? (
                        <div className="space-y-8">
                          {history.map((item) => (
                            <div key={item.id} className="space-y-4 pb-8 border-b border-white/5 last:border-0">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                  <span className="text-[10px] text-zinc-500 uppercase font-bold">
                                    {new Date(item.timestamp).toLocaleTimeString()}
                                  </span>
                                </div>
                                <button 
                                  onClick={() => {
                                    setPrompt(item.prompt);
                                    setResponse(item.response);
                                    setShowHistory(false);
                                  }}
                                  className="text-[9px] text-emerald-500 hover:text-emerald-400 uppercase font-bold tracking-widest transition-colors"
                                >
                                  Restore Session
                                </button>
                              </div>
                              <div className="space-y-3">
                                <div className="flex gap-3">
                                  <div className="w-5 h-5 rounded bg-blue-500/20 flex items-center justify-center shrink-0">
                                    <User className="w-2.5 h-2.5 text-blue-500" />
                                  </div>
                                  <div className="text-zinc-400 text-xs leading-relaxed">
                                    {item.prompt}
                                  </div>
                                </div>
                                <div className="flex gap-3">
                                  <div className="w-5 h-5 rounded bg-emerald-500/20 flex items-center justify-center shrink-0">
                                    <Activity className="w-2.5 h-2.5 text-emerald-500" />
                                  </div>
                                  <div className="text-emerald-500/70 text-xs leading-relaxed whitespace-pre-wrap">
                                    {item.response}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : response ? (
                        <div className="space-y-4">
                          <div className="flex gap-3">
                            <div className="w-6 h-6 rounded bg-emerald-500/20 flex items-center justify-center shrink-0">
                              <Activity className="w-3 h-3 text-emerald-500" />
                            </div>
                            <div className="text-emerald-500/80 text-[10px] uppercase font-bold mt-1">System Output</div>
                          </div>
                          <div className="text-zinc-300 leading-relaxed whitespace-pre-wrap pl-9">
                            {response}
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center text-zinc-600 italic">
                          Waiting for neural input...
                        </div>
                      )}
                    </div>

                    <form onSubmit={handlePromptSubmit} className="relative group/form">
                      {/* Decorative Corner Accents */}
                      <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-emerald-500/40 rounded-tl-lg pointer-events-none group-focus-within/form:border-emerald-500 transition-colors" />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-emerald-500/40 rounded-br-lg pointer-events-none group-focus-within/form:border-emerald-500 transition-colors" />

                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Enter neural prompt sequence..."
                        className="w-full h-32 bg-black/60 border border-white/10 rounded-2xl p-4 text-sm font-mono text-zinc-200 placeholder:text-zinc-700 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all resize-none outline-none relative z-10"
                      />
                      
                      <div className="absolute bottom-4 right-4 flex items-center gap-3 z-20">
                        <div className="text-[9px] font-mono text-zinc-600 uppercase tracking-tighter hidden sm:block">
                          Shift + Enter to execute
                        </div>
                        <button
                          type="submit"
                          disabled={isSubmitting || !prompt.trim()}
                          className="px-6 py-2.5 bg-emerald-500 text-black rounded-xl font-bold text-xs hover:bg-emerald-400 hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed transition-all flex items-center gap-2 relative overflow-hidden group/btn"
                        >
                          {/* Button Shine Effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                          
                          {isSubmitting ? (
                            <div className="w-3 h-3 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                          ) : (
                            <Zap className="w-3 h-3 fill-current" />
                          )}
                          <span className="relative z-10">
                            {isSubmitting ? 'PROCESSING...' : 'EXECUTE SEQUENCE'}
                          </span>
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}

              {activeTab === 'config' && (
                <motion.div 
                  key="config"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="space-y-6"
                >
                  <div className="glass-panel p-8 rounded-3xl">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                          <Settings className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold">System Configuration</h2>
                          <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Neural Core Parameters</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {saveSuccess && (
                          <motion.div 
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-2 text-emerald-500 text-[10px] font-bold uppercase tracking-widest"
                          >
                            <CheckCircle className="w-3 h-3" />
                            Changes Applied
                          </motion.div>
                        )}
                        <button
                          onClick={saveConfig}
                          disabled={isSavingConfig || JSON.stringify(config) === JSON.stringify(editableConfig)}
                          className="px-6 py-2 bg-emerald-500 text-black rounded-xl font-bold text-xs hover:bg-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                        >
                          {isSavingConfig ? (
                            <div className="w-3 h-3 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                          ) : (
                            <Download className="w-3 h-3" />
                          )}
                          {isSavingConfig ? 'SAVING...' : 'SAVE CHANGES'}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest border-b border-white/5 pb-2">Architecture Settings</div>
                        
                        <div className="space-y-4">
                          {[
                            { key: 'vocab_size', label: 'Vocabulary Size', type: 'number', step: 1000 },
                            { key: 'dim', label: 'Hidden Dimension', type: 'number', step: 64 },
                            { key: 'n_layers', label: 'Number of Layers', type: 'number', step: 1 },
                            { key: 'n_heads', label: 'Attention Heads', type: 'number', step: 1 },
                            { key: 'max_seq_len', label: 'Context Window', type: 'number', step: 128 },
                          ].map((field) => (
                            <div key={field.key} className="flex flex-col gap-1.5">
                              <label className="text-[10px] text-zinc-500 uppercase font-bold px-1">{field.label}</label>
                              <input 
                                type={field.type}
                                step={field.step}
                                value={editableConfig?.[field.key as keyof ModelConfig] || ''}
                                onChange={(e) => handleConfigChange(field.key as keyof ModelConfig, Number(e.target.value))}
                                className="bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono text-zinc-200 focus:border-emerald-500/50 outline-none transition-all"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest border-b border-white/5 pb-2">Training Parameters</div>
                        
                        <div className="space-y-4">
                          {[
                            { key: 'batch_size', label: 'Batch Size', type: 'number', step: 1 },
                            { key: 'lr', label: 'Learning Rate', type: 'number', step: 0.0001 },
                            { key: 'hidden_dim_multiplier', label: 'FFN Multiplier', type: 'number', step: 0.01 },
                          ].map((field) => (
                            <div key={field.key} className="flex flex-col gap-1.5">
                              <label className="text-[10px] text-zinc-500 uppercase font-bold px-1">{field.label}</label>
                              <input 
                                type={field.type}
                                step={field.step}
                                value={editableConfig?.[field.key as keyof ModelConfig] || ''}
                                onChange={(e) => handleConfigChange(field.key as keyof ModelConfig, Number(e.target.value))}
                                className="bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono text-zinc-200 focus:border-emerald-500/50 outline-none transition-all"
                              />
                            </div>
                          ))}
                        </div>

                        <div className="mt-8 p-6 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                          <div className="flex items-center gap-2 mb-3 text-amber-500">
                            <Info className="w-3 h-3" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Configuration Warning</span>
                          </div>
                          <p className="text-[9px] text-zinc-500 leading-relaxed">
                            Modifying architecture parameters (Layers, Heads, Dim) requires a full model re-initialization and retraining. These changes will affect the memory footprint calculated in the dashboard.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="glass-panel p-8 rounded-3xl">
                    <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                      <FileCode className="w-5 h-5 text-blue-500" />
                      Config Preview (JSON)
                    </h2>
                    <div className="bg-black/60 rounded-2xl border border-white/10 p-6 font-mono text-xs text-zinc-400 overflow-x-auto">
                      <pre>{JSON.stringify(editableConfig, null, 2)}</pre>
                    </div>
                  </div>
                </motion.div>
              )}
              {activeTab === 'models' && (
                <motion.div 
                  key="models"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="glass-panel p-8 rounded-3xl">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-lg font-bold flex items-center gap-2">
                        <Database className="text-emerald-500 w-5 h-5" />
                        Active Model Configuration
                      </h2>
                      <div className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-[10px] text-emerald-500 font-bold uppercase tracking-widest">
                        System Default
                      </div>
                    </div>
                    
                    <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                          <Cpu className="w-6 h-6 text-emerald-500" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white font-mono">{activeModel.name}</div>
                          <div className="text-[10px] text-zinc-500 uppercase font-bold mt-1">
                            Version: {activeModel.version} • Size: {activeModel.size} MB • Quant: {activeModel.quant}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-[10px] font-mono text-emerald-500/70 uppercase font-bold">Loaded & Active</div>
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-6">
                      <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                        <div className="text-[9px] text-zinc-500 uppercase font-bold mb-1">Architecture</div>
                        <div className="text-xs font-mono text-zinc-200">Llama-Style Transformer</div>
                      </div>
                      <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                        <div className="text-[9px] text-zinc-500 uppercase font-bold mb-1">Precision</div>
                        <div className="text-xs font-mono text-zinc-200">4-bit Integer (K-Means)</div>
                      </div>
                      <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                        <div className="text-[9px] text-zinc-500 uppercase font-bold mb-1">Compute Requirement</div>
                        <div className="text-xs font-mono text-zinc-200">~2.4 TFLOPS (FP16)</div>
                      </div>
                    </div>
                  </div>

                  <div className="glass-panel p-8 rounded-3xl">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-lg font-bold flex items-center gap-2">
                        <Download className="text-blue-500 w-5 h-5" />
                        Neural Model Repository
                      </h2>
                      <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">
                        3 Updates Available
                      </div>
                    </div>
                    <div className="space-y-4">
                      {availableModels.map((model) => (
                        <div key={model.id} className="group p-5 bg-black/20 border border-white/5 rounded-2xl hover:border-blue-500/30 transition-all flex items-center justify-between relative overflow-hidden">
                          {downloadingId === model.id && (
                            <div className="absolute bottom-0 left-0 h-1 bg-blue-500 transition-all duration-300" style={{ width: `${downloadProgress}%` }} />
                          )}
                          
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center border border-white/5 group-hover:bg-blue-500/10 transition-colors">
                              <Database className="w-5 h-5 text-zinc-500 group-hover:text-blue-400" />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-zinc-200 group-hover:text-white transition-colors font-mono">{model.name}</div>
                              <div className="text-[10px] text-zinc-500 uppercase font-bold mt-1">v{model.version} • {model.size} • {model.quant}</div>
                              <div className="text-[10px] text-zinc-600 mt-0.5">{model.desc}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            {model.status === 'downloaded' ? (
                              <button 
                                onClick={() => switchModel(model)}
                                disabled={activeModel.id === model.id}
                                className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                                  activeModel.id === model.id
                                    ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 cursor-default'
                                    : 'bg-blue-500 text-black hover:bg-blue-400'
                                }`}
                              >
                                {activeModel.id === model.id ? 'Active' : 'Activate'}
                              </button>
                            ) : (
                              <button 
                                onClick={() => startDownload(model.id)}
                                disabled={downloadingId !== null}
                                className="p-2 bg-zinc-900 rounded-lg border border-white/5 hover:bg-blue-500 hover:text-black hover:border-blue-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
                              >
                                {downloadingId === model.id ? (
                                  <span className="text-[10px] font-bold px-2">{downloadProgress}%</span>
                                ) : (
                                  <Download className="w-4 h-4" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'filesystem' && (
                <motion.div 
                  key="filesystem"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="glass-panel p-8 rounded-3xl"
                >
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                      <Layers className="w-5 h-5 text-blue-500" />
                      System Filesystem
                    </h2>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                      <Database className="w-3 h-3" />
                      Storage: 58GB Available
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      { name: 'model.py', desc: 'Neural core architecture', size: '12 KB', type: 'python', status: 'verified' },
                      { name: 'train.py', desc: 'Optimization pipeline', size: '8 KB', type: 'python', status: 'verified' },
                      { name: 'inference.py', desc: 'Execution engine', size: '5 KB', type: 'python', status: 'active' },
                      { name: 'quantize.py', desc: 'Compression logic', size: '4 KB', type: 'python', status: 'ready' },
                      { name: 'model_config.json', desc: 'System parameters', size: '1 KB', type: 'json', status: 'synced' },
                    ].map((file) => (
                      <div key={file.name} className="group flex items-center gap-4 p-4 bg-black/40 border border-white/5 rounded-xl hover:border-emerald-500/30 hover:bg-emerald-500/[0.02] transition-all cursor-default relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        <div className="p-2.5 bg-zinc-900 rounded-lg group-hover:bg-emerald-500/10 transition-colors">
                          {file.type === 'python' ? <FileCode className="w-5 h-5 text-blue-400 group-hover:text-emerald-500" /> : <Settings className="w-5 h-5 text-amber-400 group-hover:text-emerald-500" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-mono text-sm font-bold text-zinc-200 group-hover:text-white transition-colors">{file.name}</span>
                            <span className="px-1.5 py-0.5 bg-zinc-800 text-[8px] font-bold text-zinc-500 uppercase rounded border border-white/5 group-hover:border-emerald-500/20 group-hover:text-emerald-500/70 transition-all">
                              {file.status}
                            </span>
                          </div>
                          <div className="text-[10px] text-zinc-500 group-hover:text-zinc-400 truncate transition-colors">{file.desc}</div>
                        </div>

                        <div className="text-right">
                          <div className="text-[10px] font-mono text-zinc-400 group-hover:text-emerald-500 transition-colors">{file.size}</div>
                          <div className="text-[8px] text-zinc-600 uppercase font-bold tracking-tighter">Read/Write</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        <aside className="w-80 border-l border-white/5 bg-zinc-950/30 backdrop-blur-sm p-6 overflow-y-auto custom-scrollbar">
          <div className="space-y-8">
            <div>
              <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-4">System Health</h3>
              <div className="space-y-4">
                {[
                  { label: 'CPU Load', value: '12%', color: 'bg-emerald-500' },
                  { label: 'Disk I/O', value: '0.4 MB/s', color: 'bg-blue-500' },
                  { label: 'Network', value: 'Stable', color: 'bg-emerald-500' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-400 font-medium">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-zinc-300">{item.value}</span>
                      <div className={`w-1.5 h-1.5 rounded-full ${item.color}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-4">Deployment Checklist</h3>
              <div className="space-y-3">
                {[
                  'Neural Core Init',
                  'Memory Math Valid',
                  'Tokenizer Sync',
                  'Training Pipeline',
                  'Inference Engine',
                  'Quantization'
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-[10px] text-zinc-400">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                      <CheckCircle className="w-2.5 h-2.5 text-emerald-500" />
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl">
              <div className="flex items-center gap-2 mb-3 text-red-500">
                <AlertTriangle className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Risk Assessment</span>
              </div>
              <p className="text-[9px] text-zinc-500 leading-relaxed">
                Training gradients may spike to 1.2GB. Ensure batch size remains ≤ {config?.batch_size || 4} to prevent OOM on 4GB hardware.
              </p>
            </div>
          </div>
        </aside>
      </div>

      <StatusBar config={config} />
    </div>
  );
};

export default function App() {
  return <MicroLLMDashboard />;
}
