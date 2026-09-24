import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { 
  Code2, 
  Database, 
  Flame, 
  Key, 
  Zap, 
  Terminal, 
  FileText, 
  Play, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  RefreshCw, 
  ShieldAlert, 
  AlertTriangle,
  Folder,
  FileCode,
  Layers,
  Sparkles,
  Search,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { AutomationRule } from '../../types';

export const DeveloperSuite: React.FC = () => {
  const { 
    activeAdminTab, 
    apiKeys, 
    createApiKey, 
    revokeApiKey, 
    automationRules, 
    toggleAutomationRule, 
    logs, 
    addLog,
    tools,
    posts,
    users
  } = usePlatform();

  // Active sub-module matches activeAdminTab or internal switcher
  const [activeDevTab, setActiveDevTab] = useState<string>(activeAdminTab || 'developer_source');

  // Sync if parent tab changes
  React.useEffect(() => {
    if (activeAdminTab?.startsWith('developer_')) {
      setActiveDevTab(activeAdminTab);
    }
  }, [activeAdminTab]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E6E1D8] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#1B3E2B] font-serif">
              Engineering & Systems
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#142E20] font-serif">Developer Operations Center</h1>
          <p className="text-xs text-[#52685B]">
            Source code inspector, real-time data storage studio, API gateway, centralized logs, and automation engine.
          </p>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#FAF8F5] border border-[#E6E1D8] p-1 rounded-xl text-xs font-semibold">
          {[
            { id: 'developer_source', label: 'File Tree & Code', icon: Code2 },
            { id: 'developer_db', label: 'Data Storage Studio', icon: Database },
            { id: 'developer_firebase', label: 'Cloud Services', icon: Flame },
            { id: 'developer_api', label: 'API Gateway', icon: Key },
            { id: 'developer_automation', label: 'Automation Engine', icon: Zap },
            { id: 'developer_logs', label: 'Logs Stream', icon: Terminal },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveDevTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 font-serif ${
                activeDevTab === tab.id ? 'bg-[#1B3E2B] text-white shadow-xs' : 'text-[#52685B] hover:text-[#142E20]'
              }`}
            >
              <tab.icon className={`w-3.5 h-3.5 ${activeDevTab === tab.id ? 'text-[#E5A823]' : ''}`} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* SUB-VIEW 1: SOURCE CODE & FILE INSPECTOR (Section 28) */}
      {activeDevTab === 'developer_source' && <SourceCodeInspector />}

      {/* SUB-VIEW 2: FIRESTORE & DATABASE STUDIO (Section 29) */}
      {activeDevTab === 'developer_db' && <FirestoreStudio />}

      {/* SUB-VIEW 3: FIREBASE SERVICES CONSOLE (Section 30) */}
      {activeDevTab === 'developer_firebase' && <FirebaseConsole />}

      {/* SUB-VIEW 4: API GATEWAY & KEYS (Section 31) */}
      {activeDevTab === 'developer_api' && <ApiGateway />}

      {/* SUB-VIEW 5: NO-CODE AUTOMATION ENGINE (Section 36) */}
      {activeDevTab === 'developer_automation' && <AutomationEngine />}

      {/* SUB-VIEW 6: CENTRALIZED LOGS STREAM (Section 33) */}
      {activeDevTab === 'developer_logs' && <CentralizedLogs />}
    </div>
  );
};

// 1. SOURCE CODE INSPECTOR
const SourceCodeInspector: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<string>('src/workers/compressor.worker.ts');
  const [codeContent, setCodeContent] = useState<string>(`// Web Worker: Local-First Image Compression Runtime
self.onmessage = async (e: MessageEvent) => {
  const { file, quality, maxDimension } = e.data;
  const startTime = performance.now();
  
  try {
    const bitmap = await createImageBitmap(file);
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(bitmap, 0, 0);
    
    const blob = await canvas.convertToBlob({
      type: 'image/webp',
      quality: quality / 100
    });
    
    const latency = performance.now() - startTime;
    self.postMessage({ status: 'success', blob, latency });
  } catch (err: any) {
    self.postMessage({ status: 'error', message: err.message });
  }
};`);

  const fileTree = [
    { name: 'src/workers/compressor.worker.ts', size: '1.2 KB' },
    { name: 'src/workers/wordcounter.worker.ts', size: '0.8 KB' },
    { name: 'src/workers/hash.worker.ts', size: '0.6 KB' },
    { name: 'src/context/PlatformContext.tsx', size: '14.5 KB' },
    { name: 'src/types/index.ts', size: '6.4 KB' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-4 min-h-[500px]">
        {/* File Tree */}
        <div className="border-r border-slate-200 bg-slate-50 p-4 space-y-3">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Workspace Files</span>
          <div className="space-y-1">
            {fileTree.map(f => (
              <button
                key={f.name}
                onClick={() => setSelectedFile(f.name)}
                className={`w-full text-left p-2 rounded-lg text-xs font-mono truncate transition-colors cursor-pointer flex items-center justify-between ${
                  selectedFile === f.name ? 'bg-white shadow-xs font-bold text-[#0c2340]' : 'text-slate-600 hover:bg-slate-200/50'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <FileCode className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{f.name.split('/').pop()}</span>
                </div>
                <span className="text-[10px] text-slate-400">{f.size}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Code Editor */}
        <div className="md:col-span-3 flex flex-col bg-slate-950 text-slate-100">
          <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">{selectedFile}</span>
            <span className="text-emerald-400 text-[11px]">Read-Only Inspector</span>
          </div>

          <textarea
            value={codeContent}
            readOnly
            className="flex-1 w-full p-4 font-mono text-xs text-slate-300 bg-transparent focus:outline-hidden leading-relaxed resize-none"
            rows={18}
          />
        </div>
      </div>
    </div>
  );
};

// 2. FIRESTORE STUDIO
const FirestoreStudio: React.FC = () => {
  const { tools, posts, users, settings } = usePlatform();
  const [selectedCol, setSelectedCol] = useState<'tools' | 'posts' | 'users' | 'settings'>('tools');

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-4 min-h-[500px]">
        {/* Collections list */}
        <div className="border-r border-slate-200 bg-slate-50 p-4 space-y-3">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Collections</span>
          <div className="space-y-1">
            {[
              { id: 'tools', name: 'tools', count: tools.length },
              { id: 'posts', name: 'posts', count: posts.length },
              { id: 'users', name: 'users', count: users.length },
              { id: 'settings', name: 'site_settings', count: 1 },
            ].map(col => (
              <button
                key={col.id}
                onClick={() => setSelectedCol(col.id as any)}
                className={`w-full text-left p-2.5 rounded-lg text-xs font-mono flex items-center justify-between cursor-pointer ${
                  selectedCol === col.id ? 'bg-white shadow-xs font-bold text-[#0c2340]' : 'text-slate-600 hover:bg-slate-200/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Database className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{col.name}</span>
                </div>
                <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-mono">
                  {col.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Documents Viewer */}
        <div className="md:col-span-3 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-mono">collection: {selectedCol}</h3>
              <p className="text-xs text-slate-400">Deterministic documents stored in active state</p>
            </div>
          </div>

          <div className="p-4 bg-slate-900 text-slate-200 rounded-xl font-mono text-xs max-h-[420px] overflow-y-auto">
            <pre>
              {selectedCol === 'tools' && JSON.stringify(tools, null, 2)}
              {selectedCol === 'posts' && JSON.stringify(posts, null, 2)}
              {selectedCol === 'users' && JSON.stringify(users, null, 2)}
              {selectedCol === 'settings' && JSON.stringify(settings, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

// 3. FIREBASE SERVICES CONSOLE
const FirebaseConsole: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Firebase Services Matrix</h3>
            <p className="text-xs text-slate-500">Live GCP Project Status & Quotas</p>
          </div>
        </div>

        <div className="space-y-2.5 text-xs">
          {[
            { name: 'Cloud Storage & State Repository', status: 'Online', desc: 'us-central1 multi-region' },
            { name: 'Firebase Authentication', status: 'Online', desc: 'Email/Password + OAuth' },
            { name: 'Cloud Storage (Buckets)', status: 'Online', desc: 'Zero public tools bucket' },
            { name: 'Cloud Functions Gen2', status: 'Ready', desc: 'Node.js 20 ESM runtime' },
            { name: 'Firebase App Hosting', status: 'Active', desc: 'Vite SPA static target' },
          ].map((srv, idx) => (
            <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800 block">{srv.name}</span>
                <span className="text-slate-400 text-[11px] font-mono">{srv.desc}</span>
              </div>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-bold">
                {srv.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">Firestore Security Rules</h3>
        <p className="text-xs text-slate-500">Active server-enforced security rules:</p>

        <div className="p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto">
          <pre>{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read on published tools
    match /tools/{toolId} {
      allow read: if resource.data.status == 'published';
      allow write: if request.auth != null && 
        request.auth.token.role in ['owner', 'admin'];
    }
    // Public read on published posts
    match /posts/{postId} {
      allow read: if resource.data.status == 'published';
      allow write: if request.auth != null && 
        request.auth.token.role in ['owner', 'admin', 'editor'];
    }
  }
}`}</pre>
        </div>
      </div>
    </div>
  );
};

// 4. API GATEWAY & KEYS
const ApiGateway: React.FC = () => {
  const { apiKeys, createApiKey, revokeApiKey } = usePlatform();
  const [newKeyName, setNewKeyName] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCreate = () => {
    if (!newKeyName.trim()) return;
    createApiKey(newKeyName.trim(), 1000);
    setNewKeyName('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Developer API Keys & Scopes</h3>
            <p className="text-xs text-slate-500">Generate credentials for programmatic REST access to online tool runners.</p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="Key label (e.g. CI/CD Pipeline)"
              className="text-xs p-2 border border-[#E6E1D8] rounded-lg"
            />
            <button
              onClick={handleCreate}
              disabled={!newKeyName.trim()}
              className="px-3 py-2 text-xs font-semibold text-white bg-[#1B3E2B] hover:bg-[#142E20] disabled:opacity-50 rounded-lg cursor-pointer border border-[#E5A823]/40"
            >
              Generate Key
            </button>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          {apiKeys.map(k => (
            <div key={k.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <strong className="text-slate-900 font-semibold">{k.name}</strong>
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${k.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                    {k.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono text-slate-500 text-[11px]">
                  <span>{k.keyMasked}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(k.keyMasked);
                      setCopiedKey(k.id);
                      setTimeout(() => setCopiedKey(null), 2000);
                    }}
                    className="text-emerald-700 hover:underline cursor-pointer"
                  >
                    {copiedKey === k.id ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 text-slate-500 font-mono text-[11px]">
                <span>Rate limit: <strong>{k.rateLimitPerMin} req/min</strong></span>
                {k.status === 'active' && (
                  <button
                    onClick={() => revokeApiKey(k.id)}
                    className="text-red-600 hover:underline cursor-pointer font-sans text-xs"
                  >
                    Revoke
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 5. NO-CODE AUTOMATION ENGINE
const AutomationEngine: React.FC = () => {
  const { automationRules, toggleAutomationRule } = usePlatform();

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
      <div className="space-y-1">
        <h3 className="text-base font-bold text-slate-900">Event-Driven Automation Pipelines</h3>
        <p className="text-xs text-slate-500">Visual WHEN → CONDITION → ACTION reactive orchestration.</p>
      </div>

      <div className="space-y-3">
        {automationRules.map((rule: AutomationRule) => (
          <div key={rule.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="space-y-2">
              <strong className="text-slate-900 font-bold block">{rule.name}</strong>
              <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-semibold">
                  WHEN: {rule.trigger}
                </span>
                <span>→</span>
                <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-semibold">
                  IF: {rule.condition}
                </span>
                <span>→</span>
                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">
                  DO: {rule.action}
                </span>
              </div>
            </div>

            <button
              onClick={() => toggleAutomationRule(rule.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                rule.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
              }`}
            >
              {rule.enabled ? 'Pipeline Active' : 'Pipeline Paused'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// 6. CENTRALIZED LOGS
const CentralizedLogs: React.FC = () => {
  const { logs } = usePlatform();
  const [filterLevel, setFilterLevel] = useState<string>('all');

  const filteredLogs = logs.filter(l => filterLevel === 'all' || l.level === filterLevel);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          {['all', 'info', 'warn', 'error'].map(lvl => (
            <button
              key={lvl}
              onClick={() => setFilterLevel(lvl)}
              className={`px-2.5 py-1 rounded-lg capitalize font-medium cursor-pointer ${
                filterLevel === lvl ? 'bg-[#1B3E2B] text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
        <span className="text-slate-400 font-mono text-[11px]">{filteredLogs.length} events</span>
      </div>

      <div className="p-4 bg-slate-950 text-slate-200 font-mono text-xs max-h-[500px] overflow-y-auto space-y-2">
        {filteredLogs.map(log => (
          <div key={log.id} className="flex items-start gap-3 border-b border-slate-900 pb-2">
            <span className="text-slate-500 text-[10px] shrink-0 pt-0.5">{log.timestamp.split('T')[1]?.split('.')[0] || log.timestamp}</span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-bold shrink-0 ${
              log.level === 'error' ? 'bg-red-950 text-red-400 border border-red-800' :
              log.level === 'warn' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
              'bg-blue-950 text-blue-400 border border-blue-800'
            }`}>
              {log.level}
            </span>
            <span className="text-slate-400 font-semibold shrink-0">[{log.service}]</span>
            <span className="text-slate-200 break-all">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
