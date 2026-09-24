import React from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { Shield, Cpu, Terminal, ArrowUpRight, CheckCircle2, Search, Zap, ExternalLink } from 'lucide-react';

export const PublicFooter: React.FC = () => {
  const { setPublicRoute, setViewMode, tools } = usePlatform();

  return (
    <footer className="w-full bg-slate-900 text-slate-300 border-t border-slate-800">
      {/* Top Banner Feature Bar */}
      <div className="border-b border-slate-800 bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-lg bg-blue-900/50 border border-blue-700/60 flex items-center justify-center shrink-0 shadow-xs">
              <Zap className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="font-semibold text-white tracking-wide text-xs">Instant Client-Side Computation</p>
              <p className="text-slate-400 text-[11px]">Sub-millisecond text processing with zero server delays.</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-900/50 border border-emerald-700/60 flex items-center justify-center shrink-0 shadow-xs">
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="font-semibold text-white tracking-wide text-xs">100% Confidentiality &amp; Zero Logs</p>
              <p className="text-slate-400 text-[11px]">Your text, files, and keywords are never stored or inspected.</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-lg bg-indigo-900/50 border border-indigo-700/60 flex items-center justify-center shrink-0 shadow-xs">
              <Terminal className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <p className="font-semibold text-white tracking-wide text-xs">Webmaster Developer REST APIs</p>
              <p className="text-slate-400 text-[11px]">Programmatic automation with high-throughput endpoints.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {/* Brand & Purpose */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
              <Search className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-base font-extrabold text-white tracking-tight block">
                Seo<span className="text-blue-400">Tools</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-semibold block">
                100% Free SEO Toolkit
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            The web's leading collection of free search engine optimization tools, keyword density analyzers, backlink checkers, and content utilities for webmasters and digital marketers.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setViewMode('admin')}
              className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-semibold cursor-pointer transition-colors"
            >
              <span>Platform Admin Console</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Popular Tools */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Popular SEO Tools
          </h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li>
              <button 
                onClick={() => setPublicRoute({ page: 'tool', param: 'text-counter' })}
                className="hover:text-blue-400 transition-colors text-left flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Word Counter &amp; Analyzer</span>
              </button>
            </li>
            {tools.filter(t => t.id !== 'tool_text_counter').slice(0, 4).map(tool => (
              <li key={tool.id}>
                <button 
                  onClick={() => setPublicRoute({ page: 'tool', param: tool.slug })}
                  className="hover:text-blue-400 transition-colors text-left"
                >
                  {tool.name}
                </button>
              </li>
            ))}
            <li>
              <button 
                onClick={() => setPublicRoute({ page: 'home' })}
                className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1 pt-1"
              >
                <span>Browse All {tools.length} Tools →</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Guides & Resources */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            SEO Guides &amp; Resources
          </h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li>
              <button onClick={() => setPublicRoute({ page: 'blog' })} className="hover:text-blue-400 transition-colors">
                SEO Tutorials &amp; Technical Guides
              </button>
            </li>
            <li>
              <button onClick={() => setPublicRoute({ page: 'pricing' })} className="hover:text-blue-400 transition-colors">
                Pro Webmaster Plans &amp; API Keys
              </button>
            </li>
            <li>
              <button onClick={() => setPublicRoute({ page: 'custom_page', param: 'about' })} className="hover:text-blue-400 transition-colors">
                About SeoTools Mission
              </button>
            </li>
            <li>
              <span className="text-slate-500">Core Web Vitals Checklist 2026</span>
            </li>
          </ul>
        </div>

        {/* Policies & Privacy */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Trust &amp; Privacy
          </h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li>
              <button onClick={() => setPublicRoute({ page: 'custom_page', param: 'privacy' })} className="hover:text-blue-400 transition-colors">
                100% Privacy Guarantee
              </button>
            </li>
            <li>
              <button onClick={() => setPublicRoute({ page: 'custom_page', param: 'terms' })} className="hover:text-blue-400 transition-colors">
                Terms of Service &amp; Fair Use
              </button>
            </li>
            <li>
              <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px] pt-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>All Systems Operational (99.9% Uptime)</span>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-5 border-t border-slate-800 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>© 2026 SeoTools. Professional Free Search Engine Optimization &amp; Webmaster Utilities.</p>
        <p className="text-slate-400">Fast · 100% Free · Client-Side Execution</p>
      </div>
    </footer>
  );
};
