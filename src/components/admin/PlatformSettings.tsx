import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { Settings, Check, ShieldCheck, Globe, Database, Terminal, RefreshCw } from 'lucide-react';

export const PlatformSettings: React.FC = () => {
  const { settings, updateSettings, addLog } = usePlatform();
  const [formData, setFormData] = useState(settings);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateSettings(formData);
    addLog('application', 'info', 'Global platform configuration updated.');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E6E1D8] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#1B3E2B] font-serif">
              Core Platform Parameters
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#142E20] font-serif">Platform Environment Settings</h1>
          <p className="text-xs text-[#52685B]">
            System-level parameters, campus network integration, and institutional privacy safeguards.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2 text-xs font-semibold text-white bg-[#1B3E2B] hover:bg-[#142E20] rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 border border-[#E5A823]/40"
        >
          <Check className="w-3.5 h-3.5 text-[#E5A823]" />
          <span>{saved ? 'Saved!' : 'Save Parameters'}</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#E6E1D8] shadow-xs p-6 space-y-6 text-xs">
        {/* General Site Config */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-[#142E20] font-serif">Platform Identity</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 block">Platform Name</label>
              <input
                type="text"
                value={formData.siteName}
                onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                className="w-full p-2.5 border border-[#E6E1D8] rounded-lg text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 block">Tagline</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full p-2.5 border border-[#E6E1D8] rounded-lg text-xs"
              />
            </div>
          </div>
        </div>

        {/* Global Security & Rate Limiting */}
        <div className="space-y-4 pt-4 border-t border-[#E6E1D8]">
          <h3 className="text-sm font-bold text-[#142E20] font-serif">Security & Campus Network Firewall</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.maintenanceMode}
                onChange={(e) => setFormData({ ...formData, maintenanceMode: e.target.checked })}
                className="rounded text-[#1B3E2B]"
              />
              <span className="font-medium text-[#142E20]">Enable Maintenance Mode (Restricts student access)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.registrationOpen}
                onChange={(e) => setFormData({ ...formData, registrationOpen: e.target.checked })}
                className="rounded text-[#1B3E2B]"
              />
              <span className="font-medium text-[#142E20]">Allow Student & Scholar Signups</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enableApiAccess ?? true}
                onChange={(e) => setFormData({ ...formData, enableApiAccess: e.target.checked })}
                className="rounded text-[#1B3E2B]"
              />
              <span className="font-medium text-[#142E20]">Enable Webmaster REST API Gateway</span>
            </label>
          </div>
        </div>

        {/* Edge CDN Cache Config */}
        <div className="space-y-4 pt-4 border-t border-[#E6E1D8]">
          <h3 className="text-sm font-bold text-[#142E20] font-serif">Platform Caching & Speed Policies</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E6E1D8] space-y-1">
              <span className="text-[11px] text-[#52685B] font-semibold block font-serif">Static Asset Cache-Control</span>
              <p className="font-mono text-xs text-[#142E20]">public, max-age=31536000, immutable</p>
            </div>
            <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E6E1D8] space-y-1">
              <span className="text-[11px] text-[#52685B] font-semibold block font-serif">Curriculum Response Cache</span>
              <p className="font-mono text-xs text-[#142E20]">s-maxage=60, stale-while-revalidate=300</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
