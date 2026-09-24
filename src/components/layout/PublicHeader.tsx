import React from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { 
  Search, 
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
  Layers,
  ShieldCheck,
  Zap,
  Globe,
  BarChart2,
  FileText,
  Link as LinkIcon
} from 'lucide-react';

export const PublicHeader: React.FC = () => {
  const { 
    viewMode, 
    setViewMode, 
    publicRoute, 
    setPublicRoute, 
    tools,
    setIsCommandPaletteOpen,
    settings,
  } = usePlatform();

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 shadow-xs">
      {/* Top Utility Announcement Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 sm:px-8 py-2 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3 sm:gap-4 text-[11px]">
          <span className="font-semibold tracking-wide text-white flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>SmallSEOTools</span>
          </span>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="hidden sm:inline text-slate-300">
            Over 50+ Free Search Optimization &amp; Content Utilities
          </span>
          <span className="hidden lg:inline text-emerald-400 font-mono text-[10px] bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
            100% Client-Side Privacy · Zero Logs
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Language Switcher */}
          <div className="flex items-center gap-1 bg-slate-800 text-slate-200 px-2 py-0.5 rounded text-[11px] border border-slate-700">
            <Globe className="w-3 h-3 text-blue-400" />
            <select
              defaultValue="en"
              className="bg-transparent border-none text-slate-200 text-[11px] focus:outline-hidden cursor-pointer"
              aria-label="Select Language"
            >
              <option value="en" className="bg-slate-900 text-white">English (EN)</option>
              <option value="es" className="bg-slate-900 text-white">Español (ES)</option>
              <option value="fr" className="bg-slate-900 text-white">Français (FR)</option>
              <option value="de" className="bg-slate-900 text-white">Deutsch (DE)</option>
              <option value="pt" className="bg-slate-900 text-white">Português (PT)</option>
              <option value="it" className="bg-slate-900 text-white">Italiano (IT)</option>
              <option value="ja" className="bg-slate-900 text-white">日本語 (JA)</option>
            </select>
          </div>

          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded text-xs transition-colors cursor-pointer border border-slate-700 shadow-2xs"
            title="Press Cmd+K to search all SEO tools"
          >
            <Search className="w-3 h-3 text-blue-400" />
            <span className="hidden sm:inline">Search Tools</span>
            <kbd className="hidden sm:inline bg-slate-900 text-blue-300 text-[10px] px-1.5 py-0.5 rounded font-mono border border-slate-700">⌘K</kbd>
          </button>

          <span className="text-slate-700">|</span>

          {/* Quick toggle to Admin Console */}
          <button
            onClick={() => setViewMode('admin')}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md font-semibold text-xs transition-colors cursor-pointer shadow-xs"
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span className="hidden xs:inline">Admin Console</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Primary Brand & Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
        {/* SmallSEOTools Brand Logo */}
        <div 
          onClick={() => setPublicRoute({ page: 'home' })}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs group-hover:bg-blue-700 transition-colors relative">
            <Search className="w-5 h-5 text-white" />
            <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                SmallSEO<span className="text-blue-600">Tools</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                100% Free
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-normal leading-tight hidden xs:block">
              Free Online SEO &amp; Content Optimization Toolkit
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-600">
          <button
            onClick={() => setPublicRoute({ page: 'home' })}
            className={`transition-colors cursor-pointer hover:text-blue-600 py-1.5 ${
              publicRoute.page === 'home' 
                ? 'text-blue-600 font-bold border-b-2 border-blue-600' 
                : 'border-b-2 border-transparent'
            }`}
          >
            All SEO Tools
          </button>
          
          <button
            onClick={() => {
              setPublicRoute({ page: 'tool', param: 'plagiarism-checker' });
            }}
            className={`transition-colors cursor-pointer hover:text-blue-600 py-1.5 flex items-center gap-1.5 ${
              publicRoute.page === 'tool' && (publicRoute.param === 'plagiarism-checker' || publicRoute.param === 'tool_plagiarism')
                ? 'text-blue-600 font-bold border-b-2 border-blue-600'
                : 'border-b-2 border-transparent'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Plagiarism Checker</span>
          </button>

          <button
            onClick={() => {
              setPublicRoute({ page: 'tool', param: 'text-counter' });
            }}
            className={`transition-colors cursor-pointer hover:text-blue-600 py-1.5 flex items-center gap-1.5 ${
              publicRoute.page === 'tool' && (publicRoute.param === 'text-counter' || publicRoute.param === 'tool_text_counter')
                ? 'text-blue-600 font-bold border-b-2 border-blue-600'
                : 'border-b-2 border-transparent'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-blue-500" />
            <span>Word Counter</span>
          </button>

          <button
            onClick={() => setPublicRoute({ page: 'blog' })}
            className={`transition-colors cursor-pointer hover:text-blue-600 py-1.5 ${
              publicRoute.page === 'blog' || publicRoute.page === 'blog_post' 
                ? 'text-blue-600 font-bold border-b-2 border-blue-600' 
                : 'border-b-2 border-transparent'
            }`}
          >
            SEO Guides &amp; Blog
          </button>

          <button
            onClick={() => setPublicRoute({ page: 'pricing' })}
            className={`transition-colors cursor-pointer hover:text-blue-600 py-1.5 ${
              publicRoute.page === 'pricing' 
                ? 'text-blue-600 font-bold border-b-2 border-blue-600' 
                : 'border-b-2 border-transparent'
            }`}
          >
            Pro &amp; API
          </button>

          <button
            onClick={() => setPublicRoute({ page: 'custom_page', param: 'about' })}
            className={`transition-colors cursor-pointer hover:text-blue-600 py-1.5 ${
              publicRoute.page === 'custom_page' && publicRoute.param === 'about' 
                ? 'text-blue-600 font-bold border-b-2 border-blue-600' 
                : 'border-b-2 border-transparent'
            }`}
          >
            About Us
          </button>
        </nav>

        {/* Right Action Zone */}
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600 bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Tools Available:</span>
            <strong className="font-mono text-slate-900">{tools.length}</strong>
          </div>

          <button
            onClick={() => setViewMode('admin')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer border border-slate-200"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Manage Registry</span>
          </button>
        </div>
      </div>
    </header>
  );
};
