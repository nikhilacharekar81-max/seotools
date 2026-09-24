import React, { useState, useEffect } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { 
  Search, 
  Wrench, 
  FileText, 
  Settings, 
  Code2, 
  Database, 
  Key, 
  Terminal, 
  ExternalLink,
  X,
  Plus
} from 'lucide-react';

export const CommandPalette: React.FC = () => {
  const { 
    isCommandPaletteOpen, 
    setIsCommandPaletteOpen, 
    setActiveAdminTab, 
    setViewMode, 
    tools, 
    catalog 
  } = usePlatform();

  const [query, setQuery] = useState('');

  // Keyboard shortcut listener: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setIsCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setIsCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const actions = [
    { label: 'Plagiarism Checker (1,000 Words Limit)', icon: Wrench, action: () => { setViewMode('public'); setIsCommandPaletteOpen(false); window.location.hash = 'tool-plagiarism-checker'; } },
    { label: 'Word Counter & Text Analyzer', icon: FileText, action: () => { setViewMode('public'); setIsCommandPaletteOpen(false); window.location.hash = 'tool-text-counter'; } },
    { label: 'View Public Website', icon: ExternalLink, action: () => { setViewMode('public'); setIsCommandPaletteOpen(false); } },
    { label: 'Open Tool Registry', icon: Wrench, action: () => { setViewMode('admin'); setActiveAdminTab('tools'); setIsCommandPaletteOpen(false); } },
    { label: 'Deploy New Custom Tool Wizard', icon: Plus, action: () => { setViewMode('admin'); setActiveAdminTab('tool_builder'); setIsCommandPaletteOpen(false); } },
    { label: 'Manage Blog Articles & CMS', icon: FileText, action: () => { setViewMode('admin'); setActiveAdminTab('cms'); setIsCommandPaletteOpen(false); } },
    { label: 'Website Customizer & Theme', icon: Settings, action: () => { setViewMode('admin'); setActiveAdminTab('pages'); setIsCommandPaletteOpen(false); } },
    { label: 'Developer Source & File Inspector', icon: Code2, action: () => { setViewMode('admin'); setActiveAdminTab('developer_source'); setIsCommandPaletteOpen(false); } },
    { label: 'Platform Data Storage Studio', icon: Database, action: () => { setViewMode('admin'); setActiveAdminTab('developer_db'); setIsCommandPaletteOpen(false); } },
    { label: 'API Gateway & Key Manager', icon: Key, action: () => { setViewMode('admin'); setActiveAdminTab('developer_api'); setIsCommandPaletteOpen(false); } },
    { label: 'Centralized Logs Stream', icon: Terminal, action: () => { setViewMode('admin'); setActiveAdminTab('developer_logs'); setIsCommandPaletteOpen(false); } },
  ];

  const filtered = actions.filter(a => a.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-20 p-4">
      <div 
        className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search destination..."
            className="w-full text-sm text-slate-900 placeholder:text-slate-400 border-none focus:outline-hidden"
          />
          <button
            onClick={() => setIsCommandPaletteOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Results */}
        <div className="p-2 max-h-80 overflow-y-auto space-y-1 text-xs">
          {filtered.length === 0 ? (
            <p className="p-4 text-center text-slate-400">No matching commands found.</p>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={item.action}
                  className="w-full text-left p-3 hover:bg-slate-100 rounded-xl flex items-center gap-3 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-slate-100 text-blue-600 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-sm">{item.label}</span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Use arrow keys to navigate, Esc to close</span>
          <kbd className="font-mono bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-500">ESC</kbd>
        </div>
      </div>
    </div>
  );
};
