import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { 
  Palette, 
  Layers, 
  Menu as MenuIcon, 
  FileText, 
  Check, 
  MoveUp, 
  MoveDown, 
  Eye, 
  Trash2, 
  Plus, 
  SlidersHorizontal,
  Sparkles
} from 'lucide-react';
import { StaticPage } from '../../types';

export const WebsiteBuilder: React.FC = () => {
  const { settings, updateSettings, pages, updatePage, setPublicRoute, setViewMode } = usePlatform();
  const [activeTab, setActiveTab] = useState<'theme' | 'sections' | 'menus' | 'pages'>('theme');
  const [savedNotice, setSavedNotice] = useState(false);

  // Editable theme settings
  const [localSettings, setLocalSettings] = useState(settings);

  // Homepage sections
  const [sections, setSections] = useState([
    { id: 'sec_hero', name: 'Hero Search & High-Impact Value Proposition', enabled: true },
    { id: 'sec_cat', name: 'Category Filter Bar (SeoTools Style)', enabled: true },
    { id: 'sec_grid', name: 'Modular Tool Grid Showcase', enabled: true },
    { id: 'sec_blog', name: 'Technical Articles & Guides Showcase', enabled: true },
    { id: 'sec_ad', name: 'Sponsored Leaderboard Ad Slot', enabled: true },
  ]);

  const moveSection = (idx: number, dir: 'up' | 'down') => {
    const newIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= sections.length) return;
    const copy = [...sections];
    const item = copy.splice(idx, 1)[0];
    copy.splice(newIdx, 0, item);
    setSections(copy);
  };

  const handleSaveTheme = () => {
    updateSettings(localSettings);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 font-mono">
              Visual Design &amp; Layout
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Website Customizer &amp; Pages</h1>
          <p className="text-xs text-slate-500">
            Brand settings, theme colors, homepage section organizer, and static pages.
          </p>
        </div>

        <button
          onClick={handleSaveTheme}
          className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <Check className="w-3.5 h-3.5" />
          <span>{savedNotice ? 'Saved!' : 'Save Branding'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 border-b border-slate-200 flex items-center gap-2 text-xs font-medium bg-slate-50/50">
          <button
            onClick={() => setActiveTab('theme')}
            className={`py-3.5 px-3 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'theme' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-slate-500'
            }`}
          >
            Theme &amp; Colors
          </button>
          <button
            onClick={() => setActiveTab('sections')}
            className={`py-3.5 px-3 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'sections' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-slate-500'
            }`}
          >
            Homepage Section Organizer
          </button>
          <button
            onClick={() => setActiveTab('pages')}
            className={`py-3.5 px-3 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'pages' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-slate-500'
            }`}
          >
            Static Pages (About, Terms, Privacy)
          </button>
        </div>

        <div className="p-6">
          {/* TAB 1: THEME & BRANDING */}
          {activeTab === 'theme' && (
            <div className="space-y-6 max-w-2xl text-xs">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Brand Identity</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 block">Website Brand Name</label>
                    <input
                      type="text"
                      value={localSettings.siteName}
                      onChange={(e) => setLocalSettings({ ...localSettings, siteName: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 block">Header Tagline</label>
                    <input
                      type="text"
                      value={localSettings.tagline}
                      onChange={(e) => setLocalSettings({ ...localSettings, tagline: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* SeoTools Color System */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Platform Color Palette</h3>
                <p className="text-slate-500 text-[11px]">
                  Configured with SeoTools modern tech palette (Royal Blue, Emerald Green, and Amber).
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">Primary Blue</span>
                      <div className="w-5 h-5 rounded-full border border-slate-300" style={{ backgroundColor: localSettings.primaryColor }} />
                    </div>
                    <input
                      type="text"
                      value={localSettings.primaryColor}
                      onChange={(e) => setLocalSettings({ ...localSettings, primaryColor: e.target.value })}
                      className="w-full p-1.5 border border-slate-300 rounded font-mono text-[11px] bg-white"
                    />
                    <span className="text-[10px] text-slate-400 block">Top bar, headers, buttons</span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">Accent Emerald</span>
                      <div className="w-5 h-5 rounded-full border border-slate-300" style={{ backgroundColor: localSettings.accentColor }} />
                    </div>
                    <input
                      type="text"
                      value={localSettings.accentColor}
                      onChange={(e) => setLocalSettings({ ...localSettings, accentColor: e.target.value })}
                      className="w-full p-1.5 border border-slate-300 rounded font-mono text-[11px] bg-white"
                    />
                    <span className="text-[10px] text-slate-400 block">Primary buttons & CTAs</span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">Honor Gold</span>
                      <div className="w-5 h-5 rounded-full border border-slate-300" style={{ backgroundColor: localSettings.goldColor }} />
                    </div>
                    <input
                      type="text"
                      value={localSettings.goldColor}
                      onChange={(e) => setLocalSettings({ ...localSettings, goldColor: e.target.value })}
                      className="w-full p-1.5 border border-slate-300 rounded font-mono text-[11px] bg-white"
                    />
                    <span className="text-[10px] text-slate-400 block">Pro badges & highlights</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HOMEPAGE SECTIONS */}
          {activeTab === 'sections' && (
            <div className="space-y-4 max-w-xl text-xs">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Drag & Reorder Homepage Sections</h3>
                <p className="text-slate-500">Enable or reposition content modules on the public homepage.</p>
              </div>

              <div className="space-y-2">
                {sections.map((sec, idx) => (
                  <div key={sec.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-mono text-[10px] font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-slate-800">{sec.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        disabled={idx === 0}
                        onClick={() => moveSection(idx, 'up')}
                        className="p-1 hover:bg-slate-200 rounded disabled:opacity-30 cursor-pointer"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        disabled={idx === sections.length - 1}
                        onClick={() => moveSection(idx, 'down')}
                        className="p-1 hover:bg-slate-200 rounded disabled:opacity-30 cursor-pointer"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: STATIC PAGES */}
          {activeTab === 'pages' && (
            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Standard Static Pages</h3>
                <p className="text-slate-500">Edit content for institutional and legal pages.</p>
              </div>

              <div className="space-y-3">
                {pages.map(page => (
                  <div key={page.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <strong className="text-slate-900 text-sm block">{page.title}</strong>
                        <span className="text-slate-400 font-mono text-[11px]">/{page.slug}</span>
                      </div>
                      <button
                        onClick={() => {
                          setPublicRoute({ page: 'custom_page', param: page.slug });
                          setViewMode('public');
                        }}
                        className="text-emerald-700 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        <span>Preview Page</span>
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <textarea
                      value={page.content}
                      onChange={(e) => updatePage({ ...page, content: e.target.value })}
                      rows={3}
                      className="w-full p-2.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
