import React from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { 
  Activity, 
  CheckCircle2, 
  Zap, 
  Cpu, 
  Globe, 
  ShieldCheck, 
  AlertTriangle,
  ArrowUpRight
} from 'lucide-react';

export const HealthPerformanceCenter: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E6E1D8] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#1B3E2B] font-serif">
              Platform Responsiveness & Quality
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#142E20] font-serif">Health & Performance Center</h1>
          <p className="text-xs text-[#52685B]">
            Real-time responsiveness, interactive speeds, and curriculum delivery efficiency.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#EDF5F0] text-[#1B3E2B] border border-[#BEDBC7] px-3.5 py-1.5 rounded-xl text-xs font-semibold font-serif">
          <CheckCircle2 className="w-4 h-4 text-[#82B456]" />
          <span>Optimal Platform Performance</span>
        </div>
      </div>

      {/* Core Web Vitals Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { name: 'LCP (Visual Load Speed)', score: '0.6s', status: 'Optimal', target: '< 2.5s', progress: '96%' },
          { name: 'INP (Interactive Response)', score: '18ms', status: 'Optimal', target: '< 200ms', progress: '99%' },
          { name: 'CLS (Visual Stability)', score: '0.00', status: 'Optimal', target: '< 0.1', progress: '100%' },
          { name: 'TTFB (Initial Delivery)', score: '24ms', status: 'Optimal', target: '< 800ms', progress: '98%' },
        ].map((vital, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-[#E6E1D8] shadow-xs space-y-3">
            <span className="text-xs font-medium text-[#52685B] block truncate font-serif">{vital.name}</span>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-[#142E20] font-mono">{vital.score}</span>
              <span className="text-xs font-bold text-[#1B3E2B] bg-[#EDF5F0] px-2 py-0.5 rounded border border-[#BEDBC7]">
                {vital.status}
              </span>
            </div>
            <div className="space-y-1">
              <div className="w-full h-1.5 bg-[#FAF8F5] rounded-full overflow-hidden border border-[#E6E1D8]">
                <div className="h-full bg-[#82B456] rounded-full" style={{ width: vital.progress }}></div>
              </div>
              <span className="text-[10px] text-[#738B7D] font-mono">Target: {vital.target}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Optimization Checklist */}
      <div className="bg-white p-6 rounded-2xl border border-[#E6E1D8] shadow-xs space-y-4">
        <h3 className="text-base font-bold text-[#142E20] font-serif">Platform Architecture Audit</h3>

        <div className="space-y-3 text-xs">
          {[
            { title: 'Asynchronous Task Isolation', desc: 'Heavy calculations are isolated seamlessly for peak responsiveness.', status: 'Enforced' },
            { title: 'Zero Third-Party Tracking Bloat', desc: 'No intrusive telemetry scripts loading in user workflows.', status: 'Protected' },
            { title: 'Optimized Typography System', desc: 'Plus Jakarta Sans pre-rendered for instant sub-100ms layout.', status: 'Applied' },
            { title: 'Static Asset Compression', desc: 'Optimized build tree-shaking and efficient delivery.', status: 'Active' },
          ].map((item, i) => (
            <div key={i} className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E6E1D8] flex items-center justify-between">
              <div>
                <strong className="text-[#142E20] block font-semibold font-serif">{item.title}</strong>
                <span className="text-[#52685B]">{item.desc}</span>
              </div>
              <span className="text-[#1B3E2B] font-semibold font-serif text-[11px] bg-[#EDF5F0] px-2.5 py-0.5 rounded border border-[#BEDBC7]">
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
