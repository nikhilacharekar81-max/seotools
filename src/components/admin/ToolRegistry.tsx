import React, { useState, useEffect } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { 
  Wrench, 
  Plus, 
  Download, 
  Trash2, 
  Power, 
  Settings, 
  Sliders, 
  Layers, 
  FileCode, 
  Globe, 
  Shield, 
  History, 
  Check, 
  AlertTriangle,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ChevronDown,
  Copy,
  Zap,
  Activity,
  Archive,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Hash,
  ImageDown
} from 'lucide-react';
import { ToolModule } from '../../types';

export const ToolRegistry: React.FC = () => {
  const { 
    tools, 
    catalog, 
    installTool, 
    uninstallTool, 
    toggleToolStatus, 
    updateTool, 
    deleteToolPermanently,
    setActiveAdminTab,
    showDeveloperDetails,
    setPublicRoute,
    setViewMode,
    addLog
  } = usePlatform();

  // Active view: 'installed' | 'catalog' | 'detail'
  const [activeView, setActiveView] = useState<'installed' | 'catalog' | 'detail'>('installed');
  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);

  // Active tab inside Tool Detail Control Center
  const [detailTab, setDetailTab] = useState<'overview' | 'config' | 'page' | 'seo' | 'access' | 'developer' | 'versions' | 'analytics' | 'activity'>('overview');

  // Bulk selection
  const [selectedToolIds, setSelectedToolIds] = useState<string[]>([]);

  const selectedTool = tools.find(t => t.id === selectedToolId);

  // Bulk actions
  const handleBulkToggle = (status: ToolModule['status']) => {
    selectedToolIds.forEach(id => toggleToolStatus(id, status));
    setSelectedToolIds([]);
  };

  const handleBulkUninstall = () => {
    selectedToolIds.forEach(id => uninstallTool(id));
    setSelectedToolIds([]);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              SeoTools Modular Platform
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">SEO Tool Registry</h1>
          <p className="text-xs text-slate-500">
            Enable, turn ON/OFF, configure metadata, and manage every search utility module independently.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 bg-[#FAF8F5] p-1 rounded-xl border border-[#E6E1D8]">
          <button
            onClick={() => { setActiveView('installed'); setSelectedToolId(null); }}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeView === 'installed' ? 'bg-white text-[#142E20] shadow-xs font-serif' : 'text-[#52685B] hover:text-[#142E20]'
            }`}
          >
            <span>Active Modules</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#EFECE3] font-mono text-[#142E20]">
              {tools.length}
            </span>
          </button>

          <button
            onClick={() => { setActiveView('catalog'); setSelectedToolId(null); }}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeView === 'catalog' ? 'bg-white text-[#142E20] shadow-xs font-serif' : 'text-[#52685B] hover:text-[#142E20]'
            }`}
          >
            <span>Module Catalog</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#EDF5F0] text-[#1B3E2B] font-mono">
              {catalog.length} Available
            </span>
          </button>

          <button
            onClick={() => setActiveAdminTab('tool_builder')}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#1B3E2B] hover:bg-[#142E20] rounded-lg transition-colors cursor-pointer flex items-center gap-1 border border-[#E5A823]/40"
          >
            <Plus className="w-3.5 h-3.5 text-[#E5A823]" />
            <span>New Tool</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: INSTALLED TOOLS LIST (Default starts with 0 tools per Master Plan!) */}
      {activeView === 'installed' && !selectedToolId && (
        <div className="space-y-4">
          {tools.length === 0 ? (
            /* EMPTY STATE WHEN 0 TOOLS ARE INSTALLED */
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center max-w-2xl mx-auto space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 mx-auto flex items-center justify-center">
                <Wrench className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">No Installed Tools (Registry Empty)</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  Per the Master Plan specifications, the platform core is ready and zero tools are pre-installed. 
                  You can now install tools one by one from the module catalog below, or deploy a new custom tool.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  onClick={() => setActiveView('catalog')}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#046a38] hover:bg-[#03592f] rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Browse Available Catalog ({catalog.length} Modules)</span>
                </button>
              </div>
            </div>
          ) : (
            /* LIST OF INSTALLED TOOLS WITH BULK ACTIONS */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              {/* Bulk Toolbar */}
              <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 font-medium">
                    {selectedToolIds.length > 0 
                      ? `${selectedToolIds.length} of ${tools.length} selected` 
                      : `Total ${tools.length} Installed Modules`}
                  </span>
                </div>

                {selectedToolIds.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleBulkToggle('published')}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-slate-700 font-medium cursor-pointer"
                    >
                      Turn ON
                    </button>
                    <button
                      onClick={() => handleBulkToggle('disabled')}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-slate-700 font-medium cursor-pointer"
                    >
                      Turn OFF
                    </button>
                    <button
                      onClick={handleBulkUninstall}
                      className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded font-medium cursor-pointer"
                    >
                      Uninstall Selected
                    </button>
                  </div>
                )}
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50/80 text-slate-400 font-medium border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-6 w-10">
                        <input
                          type="checkbox"
                          checked={selectedToolIds.length === tools.length && tools.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedToolIds(tools.map(t => t.id));
                            else setSelectedToolIds([]);
                          }}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                      </th>
                      <th className="py-3 px-4">Tool Name & Slug</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Processing Engine</th>
                      <th className="py-3 px-4">Version</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Usage (Runs)</th>
                      <th className="py-3 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tools.map((t) => {
                      const isSelected = selectedToolIds.includes(t.id);
                      return (
                        <tr key={t.id} className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-emerald-50/30' : ''}`}>
                          <td className="py-3.5 px-6">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedToolIds(prev => [...prev, t.id]);
                                else setSelectedToolIds(prev => prev.filter(id => id !== t.id));
                              }}
                              className="rounded text-emerald-600 focus:ring-emerald-500"
                            />
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-[#EDF5F0] border border-[#BEDBC7] text-[#1B3E2B] flex items-center justify-center shrink-0">
                                {renderIcon(t.iconName)}
                              </div>
                              <div>
                                <button
                                  onClick={() => {
                                    setSelectedToolId(t.id);
                                    setActiveView('detail');
                                  }}
                                  className="font-bold text-[#142E20] hover:text-[#1B3E2B] text-left block font-serif"
                                >
                                  {t.name}
                                </button>
                                <span className="text-[11px] font-mono text-[#738B7D]">/{t.slug}</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-[#3E5245]">{t.category}</td>

                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1 font-mono text-[11px] bg-[#FAF8F5] border border-[#E6E1D8] text-[#142E20] px-2 py-0.5 rounded">
                              <Zap className="w-3 h-3 text-[#E5A823]" />
                              {t.processingMode === 'browser' ? 'Real-Time Engine' : t.processingMode === 'server' ? 'Cloud Compute' : 'Hybrid Pipeline'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 font-mono text-[#738B7D]">v{t.version}</td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleToolStatus(t.id)}
                                type="button"
                                role="switch"
                                aria-checked={t.status === 'published'}
                                title={t.status === 'published' ? 'Click to turn tool OFF' : 'Click to turn tool ON'}
                                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                                  t.status === 'published' ? 'bg-[#1B3E2B]' : t.status === 'draft' ? 'bg-[#E5A823]' : 'bg-[#D5CFC3]'
                                }`}
                              >
                                <span
                                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                    t.status === 'published' ? 'translate-x-5' : 'translate-x-0'
                                  }`}
                                />
                              </button>
                              <span className={`text-[11px] font-bold ${
                                t.status === 'published' ? 'text-[#1B3E2B]' : t.status === 'draft' ? 'text-[#B38012]' : 'text-[#857B6C]'
                              }`}>
                                {t.status === 'published' ? 'ON' : t.status === 'draft' ? 'DRAFT' : 'OFF'}
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 font-mono font-medium text-[#142E20]">
                            {t.metrics.totalRuns.toLocaleString()}
                          </td>

                          <td className="py-3.5 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => toggleToolStatus(t.id)}
                                className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                                  t.status === 'published'
                                    ? 'text-[#1B3E2B] hover:bg-[#EDF5F0]'
                                    : 'text-[#857B6C] hover:text-[#142E20] hover:bg-[#FAF8F5]'
                                }`}
                                title={t.status === 'published' ? 'Turn Tool OFF' : 'Turn Tool ON'}
                              >
                                <Power className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedToolId(t.id);
                                  setActiveView('detail');
                                }}
                                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer"
                                title="Configure Tool"
                              >
                                <Sliders className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => {
                                  setPublicRoute({ page: 'tool', param: t.slug });
                                  setViewMode('public');
                                }}
                                className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                                title="View on Public Site"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => uninstallTool(t.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                                title="Uninstall Tool"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: MODULE CATALOG (Ready to be installed 1-by-1) */}
      {activeView === 'catalog' && (
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-xs text-emerald-900 flex items-center justify-between gap-4">
            <div>
              <p className="font-bold text-sm">Modular Catalog Repository</p>
              <p className="text-emerald-800 mt-0.5">
                Every tool here is an independent module. Click "Install Module" to deploy it into your active registry and public website.
              </p>
            </div>
            <span className="font-mono font-semibold px-2 py-1 bg-white rounded border border-emerald-300">
              {catalog.length} Modules Available
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {catalog.map(item => {
              const isAlreadyInstalled = tools.some(t => t.id === item.id);
              return (
                <div key={item.id} className="bg-white rounded-2xl border border-[#E6E1D8] p-6 flex flex-col justify-between shadow-xs space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded-xl bg-[#1B3E2B] text-[#E5A823] flex items-center justify-center border border-[#E5A823]/40">
                        {renderIcon(item.iconName)}
                      </div>
                      <span className="text-[11px] font-semibold text-[#52685B] bg-[#FAF8F5] border border-[#E6E1D8] px-2 py-0.5 rounded font-serif">
                        {item.category}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-[#142E20] font-serif">{item.name}</h3>
                      <p className="text-xs text-[#52685B] mt-1 leading-relaxed">{item.description}</p>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-[#738B7D] font-mono pt-1">
                      <span>Engine: <strong className="text-[#142E20]">{item.processingMode === 'browser' ? 'Real-Time Pipeline' : item.processingMode === 'server' ? 'Cloud Pipeline' : 'Hybrid Pipeline'}</strong></span>
                      <span>·</span>
                      <span>v{item.version}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#E6E1D8] flex items-center justify-between">
                    <span className="text-xs text-[#52685B]">
                      {isAlreadyInstalled ? 'Status: Active in Registry' : 'Ready to deploy'}
                    </span>

                    {isAlreadyInstalled ? (
                      <span className="text-xs font-semibold text-[#1B3E2B] bg-[#EDF5F0] px-3 py-1.5 rounded-lg border border-[#BEDBC7] flex items-center gap-1 font-serif">
                        <Check className="w-3.5 h-3.5" />
                        <span>Installed</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          installTool(item.id);
                          setActiveView('installed');
                        }}
                        className="px-4 py-2 text-xs font-semibold text-white bg-[#1B3E2B] hover:bg-[#142E20] rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 border border-[#E5A823]/40"
                      >
                        <Download className="w-3.5 h-3.5 text-[#E5A823]" />
                        <span>Install Module</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: DEDICATED TOOL CONTROL CENTER (Master Plan Section 6) */}
      {activeView === 'detail' && selectedTool && (
        <ToolControlCenter
          tool={selectedTool}
          activeTab={detailTab}
          setActiveTab={setDetailTab}
          onBack={() => setActiveView('installed')}
        />
      )}
    </div>
  );
};

// Helper: render icon
const renderIcon = (name: string) => {
  switch (name) {
    case 'FileText': return <FileText className="w-5 h-5" />;
    case 'Globe': return <Globe className="w-5 h-5" />;
    case 'Hash': return <Hash className="w-5 h-5" />;
    case 'ImageDown': return <ImageDown className="w-5 h-5" />;
    default: return <Wrench className="w-5 h-5" />;
  }
};

// COMPONENT: Dedicated Tool Control Center (The core of Section 6 of Master Plan)
const ToolControlCenter: React.FC<{
  tool: ToolModule;
  activeTab: 'overview' | 'config' | 'page' | 'seo' | 'access' | 'developer' | 'versions' | 'analytics' | 'activity';
  setActiveTab: (t: any) => void;
  onBack: () => void;
}> = ({ tool, activeTab, setActiveTab, onBack }) => {
  const { 
    updateTool, 
    toggleToolStatus, 
    uninstallTool, 
    duplicateTool, 
    rollbackToolVersion, 
    showDeveloperDetails, 
    setPublicRoute, 
    setViewMode, 
    currentUser, 
    addLog 
  } = usePlatform();
  const [formData, setFormData] = useState<ToolModule>(tool);
  const [savedNotice, setSavedNotice] = useState(false);
  const [newVersionTag, setNewVersionTag] = useState('');
  const [newVersionChangelog, setNewVersionChangelog] = useState('');
  const [analyticsRange, setAnalyticsRange] = useState<'today' | '7d' | '30d' | 'all'>('7d');

  useEffect(() => {
    setFormData(tool);
  }, [tool]);

  const handleSave = () => {
    updateTool(formData);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleDuplicate = () => {
    duplicateTool(tool.id);
    onBack();
  };

  const handleCreateVersion = () => {
    if (!newVersionTag.trim()) return;
    const tag = newVersionTag.trim().replace(/^v/, '');
    const newVer = {
      version: tag,
      releaseDate: new Date().toISOString().split('T')[0],
      author: currentUser.name,
      changelog: newVersionChangelog.trim() || 'Configuration and schema update.',
      isCurrent: true,
    };
    const updatedVersions = [
      newVer,
      ...formData.versions.map(v => ({ ...v, isCurrent: false }))
    ];
    const newActivity = {
      id: `act_${Date.now()}`,
      user: currentUser.name,
      action: `tool.version_created: v${tag}`,
      date: new Date().toISOString().slice(0, 16).replace('T', ' '),
      newValue: `v${tag}`,
    };
    const updated: ToolModule = {
      ...formData,
      version: tag,
      versions: updatedVersions,
      activityLogs: [newActivity, ...formData.activityLogs],
    };
    setFormData(updated);
    updateTool(updated);
    setNewVersionTag('');
    setNewVersionChangelog('');
    addLog('application', 'info', `Created new version v${tag} for tool "${formData.name}"`);
  };

  const moveSection = (idx: number, dir: 'up' | 'down') => {
    const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= formData.pageSections.length) return;
    const copy = [...formData.pageSections];
    const temp = copy[idx];
    copy[idx] = copy[targetIdx];
    copy[targetIdx] = temp;
    setFormData({ ...formData, pageSections: copy });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Top Banner Header */}
      <div className="p-6 border-b border-[#E6E1D8] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FAF8F5]">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#1B3E2B] text-[#E5A823] flex items-center justify-center shrink-0 border border-[#E5A823]/40">
            {renderIcon(tool.iconName)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#142E20] font-serif">{tool.name}</h2>
              <span className="text-xs font-mono text-[#738B7D]">v{tool.version}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-serif ${
                tool.status === 'published' ? 'bg-[#EDF5F0] text-[#1B3E2B] border border-[#BEDBC7]' : 'bg-[#EFECE3] text-[#52685B]'
              }`}>
                {tool.status === 'published' ? 'Active / ON' : tool.status === 'draft' ? 'Draft' : 'Paused / OFF'}
              </span>
            </div>
            <p className="text-xs text-[#52685B] font-mono">/tools/{tool.slug}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick ON / OFF Status Switch */}
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-[#E6E1D8] shadow-2xs">
            <span className="text-xs font-semibold text-[#142E20] font-serif">Tool Status:</span>
            <button
              onClick={() => {
                const nextStatus = formData.status === 'published' ? 'disabled' : 'published';
                toggleToolStatus(tool.id, nextStatus);
                setFormData(prev => ({ ...prev, status: nextStatus }));
              }}
              type="button"
              role="switch"
              aria-checked={formData.status === 'published'}
              title={formData.status === 'published' ? 'Click to turn tool OFF' : 'Click to turn tool ON'}
              className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                formData.status === 'published' ? 'bg-[#1B3E2B]' : formData.status === 'draft' ? 'bg-[#E5A823]' : 'bg-[#D5CFC3]'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  formData.status === 'published' ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-xs font-bold ${
              formData.status === 'published' ? 'text-[#1B3E2B]' : formData.status === 'draft' ? 'text-[#B38012]' : 'text-[#857B6C]'
            }`}>
              {formData.status === 'published' ? 'ACTIVE (ON)' : formData.status === 'draft' ? 'DRAFT' : 'OFFLINE (OFF)'}
            </span>
          </div>

          <button
            onClick={handleDuplicate}
            className="px-3 py-1.5 text-xs font-medium text-[#142E20] bg-white hover:bg-[#FAF8F5] border border-[#E6E1D8] rounded-lg cursor-pointer flex items-center gap-1.5 shadow-2xs"
            title="Duplicate this tool definition"
          >
            <Copy className="w-3.5 h-3.5 text-[#52685B]" />
            <span>Duplicate Tool</span>
          </button>

          <button
            onClick={() => {
              setPublicRoute({ page: 'tool', param: tool.slug });
              setViewMode('public');
            }}
            className="px-3 py-1.5 text-xs font-medium text-[#142E20] bg-white hover:bg-[#FAF8F5] border border-[#E6E1D8] rounded-lg cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#52685B]" />
            <span>Preview Tool</span>
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-[#1B3E2B] hover:bg-[#142E20] rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs border border-[#E5A823]/40"
          >
            <Check className="w-3.5 h-3.5 text-[#E5A823]" />
            <span>{savedNotice ? 'Saved!' : 'Save Changes'}</span>
          </button>

          <button
            onClick={onBack}
            className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            Back to Registry
          </button>
        </div>
      </div>

      {/* Tabs Bar (Master Plan Section 6) */}
      <div className="px-6 border-b border-slate-200 flex items-center gap-1 overflow-x-auto text-xs font-medium bg-white">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'config', label: 'Configuration' },
          { id: 'page', label: 'Page Builder' },
          { id: 'seo', label: 'SEO' },
          { id: 'access', label: 'Access Limits' },
          { id: 'developer', label: 'Developer & Worker' },
          { id: 'versions', label: 'Versions & Rollback' },
          { id: 'analytics', label: 'Analytics' },
          { id: 'activity', label: 'Activity Log' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-3 px-3.5 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === tab.id 
                ? 'border-[#0c2340] text-[#0c2340] font-bold' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="p-6">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 text-xs block">Lifetime Runs</span>
                <strong className="text-xl font-bold text-slate-900 font-mono">
                  {tool.metrics.totalRuns.toLocaleString()}
                </strong>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 text-xs block">Success Rate</span>
                <strong className="text-xl font-bold text-emerald-700 font-mono">
                  {tool.metrics.successRate}%
                </strong>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 text-xs block">Avg Processing Latency</span>
                <strong className="text-xl font-bold text-[#0c2340] font-mono">
                  {tool.metrics.avgLatencyMs}ms
                </strong>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2">
                <label className="font-semibold text-slate-700 block">Tool Display Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="space-y-2">
                <label className="font-semibold text-slate-700 block">Tool Slug (URL Path)</label>
                <div className="flex items-center">
                  <span className="bg-slate-100 border border-r-0 border-slate-300 px-3 py-2 text-xs text-slate-500 rounded-l-lg font-mono">/tools/</span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '-') })}
                    className="flex-1 p-2 border border-slate-300 rounded-r-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-semibold text-slate-700 block">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-white"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="font-semibold text-slate-700 block">Public Tool Availability & Lifecycle Status</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      toggleToolStatus(tool.id, 'published');
                      setFormData(prev => ({ ...prev, status: 'published' }));
                    }}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      formData.status === 'published'
                        ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-emerald-800 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>ON (Published)</span>
                      </span>
                      {formData.status === 'published' && <Check className="w-4 h-4 text-emerald-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Tool is live, active, and accessible to all public visitors at /tools/{formData.slug}.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      toggleToolStatus(tool.id, 'draft');
                      setFormData(prev => ({ ...prev, status: 'draft' }));
                    }}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      formData.status === 'draft'
                        ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-amber-800 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        <span>DRAFT (Preview)</span>
                      </span>
                      {formData.status === 'draft' && <Check className="w-4 h-4 text-amber-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Hidden from public tool directories; only accessible in admin preview mode.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      toggleToolStatus(tool.id, 'disabled');
                      setFormData(prev => ({ ...prev, status: 'disabled' }));
                    }}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      formData.status === 'disabled'
                        ? 'border-slate-800 bg-slate-100 ring-2 ring-slate-800/10'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                        <span>OFF (Disabled)</span>
                      </span>
                      {formData.status === 'disabled' && <Check className="w-4 h-4 text-slate-700" />}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Tool is turned OFF. Public visitors will see the institutional maintenance screen.
                    </p>
                  </button>
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="font-semibold text-slate-700 block">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  const next = formData.status === 'published' ? 'disabled' : 'published';
                  toggleToolStatus(tool.id, next);
                  setFormData(prev => ({ ...prev, status: next }));
                }}
                className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-colors ${
                  formData.status === 'published' 
                    ? 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-300' 
                    : 'bg-[#046a38] text-white hover:bg-[#03592f] shadow-xs'
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                <span>{formData.status === 'published' ? 'Turn Tool OFF (Maintenance Mode)' : 'Turn Tool ON (Publish Now)'}</span>
              </button>

              <button
                onClick={() => {
                  if (confirm(`Uninstall "${tool.name}" from active registry? Historical audit logs and analytics will be preserved.`)) {
                    uninstallTool(tool.id);
                    onBack();
                  }
                }}
                className="text-xs text-red-600 hover:underline cursor-pointer"
              >
                Uninstall Tool from Registry
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: SCHEMA-DRIVEN CONFIGURATION */}
        {activeTab === 'config' && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900">Schema-Driven Configuration Parameters</h3>
              <p className="text-xs text-slate-500">
                These settings are declared by the tool's runtime schema and can be tuned without modifying source code.
              </p>
            </div>

            {formData.configSchema.length === 0 ? (
              <p className="text-xs text-slate-400 italic">This tool has no custom configuration fields.</p>
            ) : (
              <div className="space-y-4 max-w-xl">
                {formData.configSchema.map((field, idx) => (
                  <div key={field.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-700">{field.label}</label>
                      <span className="text-[10px] font-mono text-slate-400">{field.type}</span>
                    </div>

                    {field.type === 'range' && (
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min={field.min || 0}
                          max={field.max || 100}
                          value={field.value}
                          onChange={(e) => {
                            const newSchema = [...formData.configSchema];
                            newSchema[idx].value = Number(e.target.value);
                            setFormData({ ...formData, configSchema: newSchema });
                          }}
                          className="flex-1"
                        />
                        <span className="font-mono text-xs font-bold text-slate-800">
                          {field.value}{field.unit}
                        </span>
                      </div>
                    )}

                    {field.type === 'number' && (
                      <input
                        type="number"
                        value={field.value}
                        onChange={(e) => {
                          const newSchema = [...formData.configSchema];
                          newSchema[idx].value = Number(e.target.value);
                          setFormData({ ...formData, configSchema: newSchema });
                        }}
                        className="w-full p-2 border border-slate-300 rounded text-xs bg-white"
                      />
                    )}

                    {field.type === 'boolean' && (
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600">
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={(e) => {
                            const newSchema = [...formData.configSchema];
                            newSchema[idx].value = e.target.checked;
                            setFormData({ ...formData, configSchema: newSchema });
                          }}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>Enable / Active</span>
                      </label>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PAGE BUILDER */}
        {activeTab === 'page' && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900">Tool Page Section Layout</h3>
              <p className="text-xs text-slate-500">
                Reorder, rename, and toggle sections displayed on the public tool landing page.
              </p>
            </div>

            <div className="space-y-2 max-w-xl">
              {formData.pageSections.map((sec, idx) => (
                <div key={sec.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-slate-200 font-mono text-[10px] flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={sec.title}
                      onChange={(e) => {
                        const newSections = [...formData.pageSections];
                        newSections[idx].title = e.target.value;
                        setFormData({ ...formData, pageSections: newSections });
                      }}
                      className="font-semibold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-emerald-500 px-1 py-0.5 outline-hidden"
                    />
                    <span className="text-[10px] text-slate-400 font-mono">({sec.type})</span>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveSection(idx, 'up')}
                        disabled={idx === 0}
                        className="px-2 py-0.5 text-[11px] bg-white border border-slate-200 rounded text-slate-600 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed hover:bg-slate-50"
                        title="Move Up"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveSection(idx, 'down')}
                        disabled={idx === formData.pageSections.length - 1}
                        className="px-2 py-0.5 text-[11px] bg-white border border-slate-200 rounded text-slate-600 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed hover:bg-slate-50"
                        title="Move Down"
                      >
                        ↓
                      </button>
                    </div>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sec.enabled}
                        onChange={(e) => {
                          const newSections = [...formData.pageSections];
                          newSections[idx].enabled = e.target.checked;
                          setFormData({ ...formData, pageSections: newSections });
                        }}
                        className="rounded text-emerald-600"
                      />
                      <span className="text-[11px] text-slate-500 font-medium">Visible</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: SEO */}
        {activeTab === 'seo' && (
          <div className="space-y-4 max-w-2xl text-xs">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900">Search Engine Optimization Metadata</h3>
              <p className="text-slate-500">Configure page titles, OpenGraph, canonical links, and crawler indexing rules.</p>
            </div>

            <div className="space-y-3">
              <label className="font-semibold text-slate-700 block">SEO Title Tag</label>
              <input
                type="text"
                value={formData.seo.title}
                onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, title: e.target.value } })}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="space-y-3">
              <label className="font-semibold text-slate-700 block">Meta Description</label>
              <textarea
                value={formData.seo.metaDescription}
                onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, metaDescription: e.target.value } })}
                rows={2}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.seo.indexInSearch}
                  onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, indexInSearch: e.target.checked } })}
                  className="rounded text-emerald-600"
                />
                <span>Allow Search Engines to Index (index)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.seo.includeInSitemap}
                  onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, includeInSitemap: e.target.checked } })}
                  className="rounded text-emerald-600"
                />
                <span>Include in XML Sitemap</span>
              </label>
            </div>
          </div>
        )}

        {/* TAB 5: ACCESS LIMITS & QUOTAS */}
        {activeTab === 'access' && (
          <div className="space-y-4 max-w-xl text-xs">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900">Tier Quotas & Daily Run Limits</h3>
              <p className="text-slate-500">Control rate limits and payload size per user tier.</p>
            </div>

            <div className="space-y-3">
              {Object.entries(formData.limits).map(([tier, limit]) => (
                <div key={tier} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 uppercase text-[11px] block">{tier} Tier</span>
                    <span className="text-[11px] text-slate-400">Max payload: {limit.maxPayloadSize}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Max runs/day:</span>
                    <input
                      type="number"
                      value={limit.maxRunsPerDay}
                      onChange={(e) => {
                        const newLimits = { ...formData.limits };
                        (newLimits as any)[tier].maxRunsPerDay = Number(e.target.value);
                        setFormData({ ...formData, limits: newLimits });
                      }}
                      className="w-24 p-1.5 border border-slate-300 rounded font-mono text-center bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: DEVELOPER & WORKER */}
        {activeTab === 'developer' && (
          <div className="space-y-4 text-xs font-mono">
            <div className="space-y-1 font-sans">
              <h3 className="text-sm font-bold text-slate-900">Developer Architecture & Execution Pipeline</h3>
              <p className="text-slate-500">Runtime worker scripts, source code references, and compute mode.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-900 text-slate-200 rounded-xl space-y-2">
                <span className="text-slate-400 text-[11px]">Processing Mode</span>
                <select
                  value={formData.processingMode}
                  onChange={(e) => setFormData({ ...formData, processingMode: e.target.value as any })}
                  className="w-full bg-slate-800 border border-slate-700 text-[#E5A823] p-2 rounded text-xs"
                >
                  <option value="browser">High-Speed Real-Time Engine (Instant / Zero-Latency)</option>
                  <option value="server">Cloud Compute Pipeline (Distributed Services)</option>
                  <option value="hybrid">Intelligent Hybrid Pipeline (Dynamic Routing)</option>
                </select>
              </div>

              <div className="p-4 bg-slate-900 text-slate-200 rounded-xl space-y-2">
                <span className="text-slate-400 text-[11px]">Worker Script Name</span>
                <input
                  type="text"
                  value={formData.workerName || ''}
                  onChange={(e) => setFormData({ ...formData, workerName: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 text-slate-200 p-2 rounded text-xs"
                />
              </div>

              <div className="p-4 bg-slate-900 text-slate-200 rounded-xl space-y-2 md:col-span-2">
                <span className="text-slate-400 text-[11px]">Source Code File Path</span>
                <p className="text-emerald-400">{formData.sourcePath}</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: VERSIONS & ROLLBACK */}
        {activeTab === 'versions' && (
          <div className="space-y-6 text-xs max-w-2xl">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900">Version Management & Instant Rollback</h3>
              <p className="text-slate-500">
                Track releases, create new version tags, and restore previous configuration states.
              </p>
            </div>

            {/* Create New Version Form */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <h4 className="font-bold text-slate-800 text-xs">Create New Tool Release Version</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">Version (SemVer)</label>
                  <input
                    type="text"
                    placeholder="e.g. 1.1.0"
                    value={newVersionTag}
                    onChange={(e) => setNewVersionTag(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-xs bg-white font-mono"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] text-slate-600 mb-1">Changelog Summary</label>
                  <input
                    type="text"
                    placeholder="Describe configuration or algorithmic updates..."
                    value={newVersionChangelog}
                    onChange={(e) => setNewVersionChangelog(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-xs bg-white"
                  />
                </div>
              </div>
              <button
                onClick={handleCreateVersion}
                disabled={!newVersionTag.trim()}
                className="px-3.5 py-1.5 bg-[#1B3E2B] text-white font-medium rounded-lg text-xs hover:bg-[#142E20] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed border border-[#E5A823]/40"
              >
                Publish New Version
              </button>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 text-xs">Release History</h4>
              {formData.versions.map(v => (
                <div key={v.version} className="p-4 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <strong className="font-mono text-slate-900">v{v.version}</strong>
                      {v.isCurrent && (
                        <span className="text-[10px] bg-[#EDF5F0] text-[#1B3E2B] border border-[#BEDBC7] font-bold px-2 py-0.5 rounded">
                          CURRENT ACTIVE
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 text-[11px]">{v.changelog}</p>
                    <span className="text-slate-400 text-[10px]">{v.releaseDate} by {v.author}</span>
                  </div>

                  {!v.isCurrent && (
                    <button
                      onClick={() => {
                        if (confirm(`Rollback "${tool.name}" to v${v.version}?`)) {
                          rollbackToolVersion(tool.id, v.version);
                        }
                      }}
                      className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded font-medium text-slate-700 cursor-pointer shadow-2xs"
                    >
                      Rollback
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: TOOL ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 text-xs max-w-3xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Aggregate Tool Performance & Usage Analytics</h3>
                <p className="text-slate-500">
                  Real client performance metrics. User input text is strictly private and never recorded.
                </p>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                {(['today', '7d', '30d', 'all'] as const).map(range => (
                  <button
                    key={range}
                    onClick={() => setAnalyticsRange(range)}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                      analyticsRange === range ? 'bg-white shadow-2xs text-[#142E20] font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {range === 'today' ? 'Today' : range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : 'All Time'}
                  </button>
                ))}
              </div>
            </div>

            {tool.metrics.totalRuns === 0 ? (
              <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl">
                <p className="text-slate-500 font-medium">No production data yet.</p>
                <p className="text-slate-400 text-[11px] mt-1">Analytics will stream in automatically as users analyze text in the interactive workspace.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 text-[11px] block">Total Executions</span>
                    <strong className="text-xl font-bold text-[#142E20] font-mono mt-1 block">
                      {tool.metrics.totalRuns.toLocaleString()}
                    </strong>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 text-[11px] block">Unique Visitors</span>
                    <strong className="text-xl font-bold text-[#142E20] font-mono mt-1 block">
                      {tool.metrics.uniqueUsers.toLocaleString()}
                    </strong>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 text-[11px] block">Engine Avg Latency</span>
                    <strong className="text-xl font-bold text-[#1B3E2B] font-mono mt-1 block">
                      {tool.metrics.avgLatencyMs}ms
                    </strong>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 text-[11px] block">Execution Success Rate</span>
                    <strong className="text-xl font-bold text-emerald-700 font-mono mt-1 block">
                      {tool.metrics.successRate}%
                    </strong>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl text-emerald-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <span>🛡️</span>
                    <span>Privacy-Preserving Telemetry</span>
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    Calculations run locally inside client Web Workers. Zero keystrokes, character strings, or user texts are ever sent to server logs, Firebase, or external APIs.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 9: ACTIVITY LOG */}
        {activeTab === 'activity' && (
          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900">Administrative Audit Trail</h3>
              <p className="text-slate-500">Immutable record of changes made to this tool module.</p>
            </div>

            <div className="space-y-2 max-w-xl">
              {formData.activityLogs.map(log => (
                <div key={log.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-800 block">{log.action}</span>
                    <span className="text-[10px] text-slate-400">{log.date} by {log.user}</span>
                  </div>
                  {log.newValue && (
                    <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {log.newValue}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
