import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { 
  LayoutDashboard, 
  Wrench, 
  PlusCircle, 
  FileText, 
  Palette, 
  DollarSign, 
  Users, 
  Terminal, 
  Activity, 
  Settings, 
  ExternalLink, 
  ChevronRight, 
  Search, 
  RefreshCw, 
  Code2, 
  Database, 
  Flame, 
  Key, 
  Zap, 
  Menu, 
  X,
  Bell,
  HelpCircle,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { 
    viewMode, 
    setViewMode, 
    activeAdminTab, 
    setActiveAdminTab, 
    showDeveloperDetails, 
    setShowDeveloperDetails,
    setIsCommandPaletteOpen,
    tools,
    currentUser,
    settings,
    addLog
  } = usePlatform();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [cachePurging, setCachePurging] = useState(false);

  const handlePurgeCache = () => {
    setCachePurging(true);
    setTimeout(() => {
      setCachePurging(false);
      addLog('application', 'info', 'Cloudflare Edge Cache purged for all public endpoints.');
    }, 800);
  };

  const navItems = [
    { section: 'Operations', items: [
      { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
      { id: 'health', label: 'Health & Core Vitals', icon: Activity },
    ]},
    { section: 'Tool Infrastructure', items: [
      { id: 'tools', label: 'Tool Registry', icon: Wrench, badge: tools.length.toString() },
      { id: 'tool_builder', label: 'Tool Deployment Wizard', icon: PlusCircle },
    ]},
    { section: 'Content & CMS', items: [
      { id: 'cms', label: 'Blog & Articles', icon: FileText },
      { id: 'pages', label: 'Website Builder & Pages', icon: Palette },
    ]},
    { section: 'Monetization & Access', items: [
      { id: 'monetization', label: 'Ads & Subscriptions', icon: DollarSign },
      { id: 'users', label: 'Team & RBAC Matrix', icon: Users },
    ]},
    { section: 'Developer Suite', items: [
      { id: 'developer_source', label: 'Source & File Tree', icon: Code2 },
      { id: 'developer_db', label: 'Platform Data Storage', icon: Database },
      { id: 'developer_firebase', label: 'Cloud Services', icon: Flame },
      { id: 'developer_api', label: 'API Gateway & Keys', icon: Key },
      { id: 'developer_automation', label: 'No-Code Automation', icon: Zap },
      { id: 'developer_logs', label: 'Centralized Logs', icon: Terminal },
    ]},
    { section: 'System', items: [
      { id: 'settings', label: 'Platform Settings', icon: Settings },
    ]}
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex text-[#142E20]">
      {/* Sidebar Navigation */}
      <aside 
        className={`${isSidebarOpen ? 'w-64' : 'w-20'} shrink-0 bg-white border-r border-[#E6E1D8] flex flex-col justify-between transition-all duration-200 sticky top-0 h-screen z-30 select-none shadow-xs`}
      >
        <div>
          {/* Admin Header */}
          <div className="h-16 px-4 border-b border-[#E6E1D8] flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-xs">
                SEO
              </div>
              {isSidebarOpen && (
                <div className="leading-tight truncate">
                  <span className="font-bold text-sm text-slate-900 block truncate">
                    SmallSEOTools
                  </span>
                  <span className="text-[10px] text-blue-600 font-semibold block">
                    Webmaster Console
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 rounded-lg text-[#5A7366] hover:text-[#142E20] hover:bg-[#FAF8F5] cursor-pointer"
            >
              {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>

          {/* Quick Search Shortcut Button */}
          <div className="p-3">
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs bg-[#FAF8F5] hover:bg-[#F2EEE4] text-[#4F685A] rounded-lg border border-[#E6E1D8] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-[#5A7366]" />
                {isSidebarOpen && <span>Command Palette</span>}
              </div>
              {isSidebarOpen && (
                <kbd className="bg-white border border-[#E6E1D8] text-[10px] px-1.5 py-0.5 rounded font-mono text-[#5A7366]">
                  ⌘K
                </kbd>
              )}
            </button>
          </div>

          {/* Nav Links */}
          <nav className="px-2 py-2 space-y-4 max-h-[calc(100vh-190px)] overflow-y-auto">
            {navItems.map((group, idx) => (
              <div key={idx} className="space-y-1">
                {isSidebarOpen && (
                  <h5 className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#738B7D] font-serif">
                    {group.section}
                  </h5>
                )}
                {group.items.map(item => {
                  const Icon = item.icon;
                  const isActive = activeAdminTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveAdminTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        isActive 
                          ? 'bg-[#1B3E2B] text-white shadow-xs border-l-4 border-[#E5A823]' 
                          : 'text-[#3E5245] hover:bg-[#F2EEE4] hover:text-[#142E20]'
                      }`}
                      title={!isSidebarOpen ? item.label : undefined}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#E5A823]' : 'text-[#6A8174]'}`} />
                        {isSidebarOpen && <span className="truncate">{item.label}</span>}
                      </div>

                      {isSidebarOpen && item.badge && (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-semibold ${
                          isActive ? 'bg-[#E5A823] text-[#142E20]' : 'bg-[#EFECE3] text-[#465E50]'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer / User Info */}
        <div className="p-3 border-t border-[#E6E1D8] bg-[#FAF8F5]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              ST
            </div>
            {isSidebarOpen && (
              <div className="leading-tight truncate flex-1">
                <span className="text-xs font-bold text-slate-900 block truncate">{currentUser.name}</span>
                <span className="text-[10px] text-blue-600 font-semibold uppercase">{currentUser.role}</span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar Contract (Single-line, 3 zones) */}
        <header className="h-16 bg-white border-b border-[#E6E1D8] px-6 flex items-center justify-between gap-4 sticky top-0 z-20 shadow-2xs">
          {/* Breadcrumb Trail */}
          <div className="flex items-center gap-2 text-xs text-slate-500 truncate">
            <span className="text-slate-600">Admin Console</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-semibold text-slate-900 capitalize truncate">
              {activeAdminTab.replace('_', ' ')}
            </span>
          </div>

          {/* Action Center & Progressive Disclosure Controls */}
          <div className="flex items-center gap-3">
            {/* Progressive Disclosure Toggle: "Show Developer Details" */}
            <div className="flex items-center gap-2 bg-[#FAF8F5] px-3 py-1.5 rounded-lg border border-[#E6E1D8] text-xs">
              <span className="text-slate-600 font-medium">Developer View</span>
              <button
                type="button"
                onClick={() => setShowDeveloperDetails(!showDeveloperDetails)}
                className={`w-9 h-5 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                  showDeveloperDetails ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform ${
                    showDeveloperDetails ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Purge Cache Action */}
            <button
              onClick={handlePurgeCache}
              disabled={cachePurging}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Purge Edge Cache"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${cachePurging ? 'animate-spin text-blue-600' : ''}`} />
              <span>{cachePurging ? 'Refreshing...' : 'Clear Cache'}</span>
            </button>

            {/* View Live Public Site Button */}
            <button
              onClick={() => setViewMode('public')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <span>View Live Website</span>
              <ExternalLink className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
