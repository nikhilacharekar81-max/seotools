import React, { useState, useEffect } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { 
  Zap, 
  Users, 
  DollarSign, 
  Activity, 
  ArrowUpRight, 
  Plus, 
  FileText, 
  Wrench, 
  Sparkles, 
  Layers, 
  Cpu, 
  Server, 
  Globe, 
  ShieldCheck, 
  Clock,
  ArrowRight
} from 'lucide-react';

interface TelemetryEvent {
  id: string;
  tool: string;
  mode: string;
  latencyMs: number;
  country: string;
  timestamp: string;
  status: 200 | 400 | 500;
}

export const AdminDashboard: React.FC = () => {
  const { 
    tools, 
    posts, 
    users, 
    setActiveAdminTab, 
    showDeveloperDetails, 
    setViewMode,
    settings 
  } = usePlatform();

  // Simulated live telemetry stream
  const [telemetry, setTelemetry] = useState<TelemetryEvent[]>([
    { id: 'ev_1', tool: 'Text Counter & Reading Level', mode: 'Real-Time Pipeline', latencyMs: 12, country: 'US', timestamp: '2s ago', status: 200 },
    { id: 'ev_2', tool: 'Word Counter', mode: 'Client Worker', latencyMs: 14, country: 'US', timestamp: '5s ago', status: 200 },
    { id: 'ev_3', tool: 'Vocabulary Analyzer', mode: 'Direct Engine', latencyMs: 4, country: 'US', timestamp: '8s ago', status: 200 },
    { id: 'ev_4', tool: 'Meta Tag Studio', mode: 'Direct Pipeline', latencyMs: 22, country: 'US', timestamp: '12s ago', status: 200 },
  ]);

  // Push new event periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const toolNames = ['Image Compressor', 'Word Counter', 'Hash Generator', 'Meta Tag Studio', 'Sitemap Validator'];
      const countries = ['US', 'GB', 'IN', 'FR', 'CA', 'BR', 'AU', 'SG'];
      const randomTool = toolNames[Math.floor(Math.random() * toolNames.length)];
      const randomCountry = countries[Math.floor(Math.random() * countries.length)];
      const randomLatency = Math.floor(Math.random() * 80) + 10;

      const newEvent: TelemetryEvent = {
        id: `ev_${Date.now()}`,
        tool: randomTool,
        mode: 'Client Worker',
        latencyMs: randomLatency,
        country: randomCountry,
        timestamp: 'Just now',
        status: 200,
      };

      setTelemetry(prev => [newEvent, ...prev.slice(0, 7)]);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
              SmallSEOTools Platform Status: Online
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">SEO Tools Operations Control</h1>
          <p className="text-xs text-slate-500">
            Real-time telemetry across search tools, keyword density engines, and webmaster utility modules.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setActiveAdminTab('tool_builder')}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-white" />
            <span>Deploy New Tool</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('cms')}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>New SEO Article</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-2xl border border-[#E6E1D8] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#52685B]">Active Installed Tools</span>
            <div className="w-8 h-8 rounded-lg bg-[#EDF5F0] border border-[#BEDBC7] text-[#1B3E2B] flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-[#142E20] font-mono">{tools.length}</span>
            <span className="text-xs text-[#1B3E2B] font-semibold flex items-center gap-0.5 font-serif">
              <span>Modular</span>
            </span>
          </div>
          <p className="text-[11px] text-[#738B7D]">
            {tools.length === 0 ? 'Zero tools installed' : `${tools.filter(t => t.status === 'published').length} active for students`}
          </p>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-2xl border border-[#E6E1D8] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#52685B]">Monthly Tool Runs</span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF3E8] border border-[#E6D8BC] text-[#E5A823] flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-[#142E20] font-mono">148.2k</span>
            <span className="text-xs text-[#1B3E2B] font-semibold flex items-center gap-0.5">
              +18.4%
            </span>
          </div>
          <p className="text-[11px] text-[#738B7D]">92% processed with instant zero-latency engine</p>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-2xl border border-[#E6E1D8] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#52685B]">Middle School Students</span>
            <div className="w-8 h-8 rounded-lg bg-[#EDF5F0] border border-[#BEDBC7] text-[#1B3E2B] flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-[#142E20] font-mono">428</span>
            <span className="text-xs text-[#1B3E2B] font-semibold flex items-center gap-0.5 font-serif">
              Grades 5-8
            </span>
          </div>
          <p className="text-[11px] text-[#738B7D]">Active across English & Math classes</p>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-2xl border border-[#E6E1D8] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#52685B]">System Uptime Ratio</span>
            <div className="w-8 h-8 rounded-lg bg-[#EDF5F0] border border-[#BEDBC7] text-[#1B3E2B] flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-[#142E20] font-mono">99.9%</span>
            <span className="text-xs text-[#1B3E2B] font-semibold flex items-center gap-0.5">
              P50: 14ms
            </span>
          </div>
          <p className="text-[11px] text-[#738B7D]">Instant private student workspace</p>
        </div>
      </div>

      {/* Telemetry Live Feed & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Execution Ticker */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></div>
              <h3 className="text-sm font-bold text-[#0c2340]">Live Tool Invocations Stream</h3>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Real-Time Ingestion</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-medium">
                  <th className="pb-2.5">Tool Target</th>
                  <th className="pb-2.5">Mode</th>
                  <th className="pb-2.5">Origin</th>
                  <th className="pb-2.5">Execution Latency</th>
                  <th className="pb-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {telemetry.map(ev => (
                  <tr key={ev.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 font-medium text-slate-800 font-sans">{ev.tool}</td>
                    <td className="py-2.5 text-slate-500">{ev.mode}</td>
                    <td className="py-2.5">
                      <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px]">
                        {ev.country}
                      </span>
                    </td>
                    <td className="py-2.5 text-emerald-700">{ev.latencyMs}ms</td>
                    <td className="py-2.5 text-right">
                      <span className="text-emerald-700 font-semibold">{ev.status} OK</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Infrastructure Health Status */}
        <div className="bg-white rounded-2xl border border-[#E6E1D8] p-6 shadow-xs space-y-5">
          <h3 className="text-sm font-bold text-[#142E20] font-serif">Platform & Engine Health</h3>

          <div className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <div className="flex justify-between text-[#52685B]">
                <span>Real-Time Engine Pipeline</span>
                <span className="font-semibold text-[#1B3E2B]">100% Operational</span>
              </div>
              <div className="w-full h-1.5 bg-[#FAF8F5] rounded-full overflow-hidden border border-[#E6E1D8]">
                <div className="w-full h-full bg-[#82B456] rounded-full"></div>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[#52685B]">
                <span>Cloud Platform Response</span>
                <span className="font-semibold text-[#142E20] font-mono">18ms</span>
              </div>
              <div className="w-full h-1.5 bg-[#FAF8F5] rounded-full overflow-hidden border border-[#E6E1D8]">
                <div className="w-[96%] h-full bg-[#82B456] rounded-full"></div>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[#52685B]">
                <span>Curriculum Services Pool</span>
                <span className="font-semibold text-[#142E20]">Active & Protected</span>
              </div>
              <div className="w-full h-1.5 bg-[#FAF8F5] rounded-full overflow-hidden border border-[#E6E1D8]">
                <div className="w-[100%] h-full bg-[#1B3E2B] rounded-full"></div>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[#52685B]">
                <span>Student Privacy & Firewall Shield</span>
                <span className="font-semibold text-[#1B3E2B]">Enforced</span>
              </div>
              <div className="w-full h-1.5 bg-[#FAF8F5] rounded-full overflow-hidden border border-[#E6E1D8]">
                <div className="w-[100%] h-full bg-[#82B456] rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E6E1D8]">
            <button
              onClick={() => setActiveAdminTab('health')}
              className="text-xs text-[#1B3E2B] hover:underline font-semibold flex items-center gap-1 cursor-pointer font-serif"
            >
              <span>View System Health Report</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#E5A823]" />
            </button>
          </div>
        </div>
      </div>

      {/* Progressive Disclosure: Developer Raw State (Visible when Developer Mode toggle is ON) */}
      {showDeveloperDetails && (
        <div className="bg-slate-900 text-slate-200 rounded-2xl p-6 border border-slate-800 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Developer Progressive Disclosure · Low-Level Telemetry
              </h4>
            </div>
            <span className="text-[10px] font-mono text-slate-400">NODE_ENV: production</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Worker Threads</span>
              <span className="text-slate-100 text-sm font-bold">4 Active Pools</span>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px]">WASM Memory Allocation</span>
              <span className="text-slate-100 text-sm font-bold">64MB Initial Page</span>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Origin Bypass Tokens</span>
              <span className="text-slate-100 text-sm font-bold">0 Active Strikes</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
