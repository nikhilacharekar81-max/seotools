import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { 
  Plus, 
  Sparkles, 
  Check, 
  Zap, 
  Cpu, 
  Layers, 
  Sliders, 
  Globe, 
  ArrowRight,
  ArrowLeft,
  Wrench,
  FileCode
} from 'lucide-react';
import { ToolModule } from '../../types';

export const ToolBuilder: React.FC = () => {
  const { createCustomTool, setActiveAdminTab } = usePlatform();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [toolData, setToolData] = useState<Partial<ToolModule>>({
    name: '',
    slug: '',
    description: '',
    category: 'Text Analysis',
    iconName: 'Wrench',
    processingMode: 'browser',
    workerName: '',
    sourcePath: '',
    tags: ['utility'],
    limits: {
      guest: { allowed: true, maxRunsPerDay: 10, maxPayloadSize: '10MB' },
      registered: { allowed: true, maxRunsPerDay: 50, maxPayloadSize: '25MB' },
      pro: { allowed: true, maxRunsPerDay: 1000, maxPayloadSize: '100MB' },
      business: { allowed: true, maxRunsPerDay: 10000, maxPayloadSize: '500MB' },
    },
    configSchema: [
      { id: 'param1', label: 'Default Threshold', type: 'number', defaultValue: 100, value: 100 }
    ]
  });

  const handleSlugify = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  };

  const handleComplete = () => {
    createCustomTool({
      ...toolData,
      slug: toolData.slug || handleSlugify(toolData.name || 'custom-tool'),
      workerName: toolData.workerName || `${handleSlugify(toolData.name || 'custom')}-worker.ts`,
      sourcePath: toolData.sourcePath || `src/tools/${handleSlugify(toolData.name || 'custom')}/Index.ts`,
    });
    setActiveAdminTab('tools');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Wizard Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            SmallSEOTools Modular Platform
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Register New SEO Tool</h1>
        <p className="text-xs text-slate-500">
          Register a new search engine optimization or content utility tool into the platform registry with custom execution rules.
        </p>

        {/* Step indicator */}
        <div className="flex items-center gap-3 pt-6 text-xs font-semibold">
          <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-[#142E20]' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono ${step >= 1 ? 'bg-[#1B3E2B] text-white' : 'bg-slate-100 text-slate-500'}`}>
              1
            </span>
            <span>Metadata & Identity</span>
          </div>
          <div className="w-8 h-0.5 bg-slate-200"></div>
          <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-[#142E20]' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono ${step >= 2 ? 'bg-[#1B3E2B] text-white' : 'bg-slate-100 text-slate-500'}`}>
              2
            </span>
            <span>Engine & Architecture</span>
          </div>
          <div className="w-8 h-0.5 bg-slate-200"></div>
          <div className={`flex items-center gap-1.5 ${step >= 3 ? 'text-[#142E20]' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono ${step >= 3 ? 'bg-[#1B3E2B] text-white' : 'bg-slate-100 text-slate-500'}`}>
              3
            </span>
            <span>Quotas & Deployment</span>
          </div>
        </div>
      </div>

      {/* Step Container */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        {step === 1 && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900">Step 1: Tool Identity & Categorization</h3>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 block">Tool Name</label>
              <input
                type="text"
                value={toolData.name}
                onChange={(e) => {
                  const val = e.target.value;
                  setToolData({
                    ...toolData,
                    name: val,
                    slug: handleSlugify(val),
                  });
                }}
                placeholder="e.g. JSON to CSV Converter"
                className="w-full p-2.5 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 block">URL Slug</label>
              <div className="flex items-center">
                <span className="bg-slate-100 border border-r-0 border-slate-300 text-slate-500 px-3 py-2.5 rounded-l-lg font-mono">
                  /tools/
                </span>
                <input
                  type="text"
                  value={toolData.slug}
                  onChange={(e) => setToolData({ ...toolData, slug: e.target.value })}
                  placeholder="json-to-csv-converter"
                  className="w-full p-2.5 border border-slate-300 rounded-r-lg font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 block">Category</label>
              <select
                value={toolData.category}
                onChange={(e) => setToolData({ ...toolData, category: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-lg bg-white"
              >
                <option value="Text Analysis">Text Analysis</option>
                <option value="SEO Tools">SEO Tools</option>
                <option value="Developer Utilities">Developer Utilities</option>
                <option value="Image Tools">Image Tools</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 block">Description & Purpose</label>
              <textarea
                value={toolData.description}
                onChange={(e) => setToolData({ ...toolData, description: e.target.value })}
                placeholder="Short summary of what this tool computes..."
                rows={3}
                className="w-full p-2.5 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button
                disabled={!toolData.name}
                onClick={() => setStep(2)}
                className="px-5 py-2 text-xs font-semibold text-white bg-[#1B3E2B] hover:bg-[#142E20] disabled:opacity-50 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 border border-[#E5A823]/40"
              >
                <span>Continue to Engine</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#E5A823]" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5 text-xs">
            <h3 className="text-sm font-bold text-[#142E20] font-serif">Step 2: Processing Engine & Architecture</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'browser', title: 'High-Speed Real-Time Engine', desc: 'Zero server latency. Instant real-time calculation pipeline.', icon: Zap },
                { id: 'server', title: 'High-Throughput Cloud Worker', desc: 'Distributed computing for large-scale operations.', icon: Cpu },
                { id: 'hybrid', title: 'Dynamic Hybrid Pipeline', desc: 'Real-time interactive with cloud assistance when needed.', icon: Layers },
              ].map(mode => (
                <div
                  key={mode.id}
                  onClick={() => setToolData({ ...toolData, processingMode: mode.id as any })}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    toolData.processingMode === mode.id 
                      ? 'border-[#1B3E2B] bg-[#EDF5F0] text-[#142E20]' 
                      : 'border-[#E6E1D8] hover:border-[#BEDBC7]'
                  }`}
                >
                  <mode.icon className={`w-5 h-5 mb-2 ${toolData.processingMode === mode.id ? 'text-[#1B3E2B]' : 'text-slate-400'}`} />
                  <p className="font-bold font-serif">{mode.title}</p>
                  <p className="text-[11px] text-[#52685B] mt-1 leading-normal">{mode.desc}</p>
                </div>
              ))}
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="font-semibold text-slate-700 block">Worker Pipeline Identifier</label>
              <input
                type="text"
                value={toolData.workerName || `${toolData.slug || 'custom'}-worker.ts`}
                onChange={(e) => setToolData({ ...toolData, workerName: e.target.value })}
                className="w-full p-2.5 border border-[#E6E1D8] rounded-lg font-mono text-xs"
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 text-xs font-medium text-[#52685B] hover:bg-[#FAF8F5] rounded-xl cursor-pointer flex items-center gap-1.5 border border-[#E6E1D8]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                onClick={() => setStep(3)}
                className="px-5 py-2 text-xs font-semibold text-white bg-[#1B3E2B] hover:bg-[#142E20] rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 border border-[#E5A823]/40"
              >
                <span>Continue to Quotas</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#E5A823]" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5 text-xs">
            <h3 className="text-sm font-bold text-[#142E20] font-serif">Step 3: Quotas & Final Verification</h3>

            <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#E6E1D8] space-y-3">
              <p className="font-semibold text-[#142E20] font-serif">Deployment Summary:</p>
              <div className="grid grid-cols-2 gap-2 text-[#52685B] font-mono text-[11px]">
                <div>Name: <strong className="text-[#142E20] font-serif">{toolData.name}</strong></div>
                <div>Slug: <strong className="text-[#142E20]">/tools/{toolData.slug}</strong></div>
                <div>Category: <strong className="text-[#142E20] font-serif">{toolData.category}</strong></div>
                <div>Mode: <strong className="text-[#1B3E2B] uppercase">{toolData.processingMode === 'browser' ? 'Real-Time Engine' : toolData.processingMode}</strong></div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-semibold text-[#142E20] font-serif">Initial Daily Quotas:</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-2.5 bg-white border border-[#E6E1D8] rounded text-center">
                  <span className="text-[10px] text-[#738B7D] block uppercase font-serif">Student Guest</span>
                  <span className="font-bold text-[#142E20] font-mono">10 runs/day</span>
                </div>
                <div className="p-2.5 bg-white border border-[#E6E1D8] rounded text-center">
                  <span className="text-[10px] text-[#738B7D] block uppercase font-serif">Registered</span>
                  <span className="font-bold text-[#142E20] font-mono">50 runs/day</span>
                </div>
                <div className="p-2.5 bg-white border border-[#E6E1D8] rounded text-center">
                  <span className="text-[10px] text-[#738B7D] block uppercase font-serif">Middle School Scholar</span>
                  <span className="font-bold text-[#142E20] font-mono">1,000 runs/day</span>
                </div>
                <div className="p-2.5 bg-white border border-[#E6E1D8] rounded text-center">
                  <span className="text-[10px] text-[#738B7D] block uppercase font-serif">Faculty & Admin</span>
                  <span className="font-bold text-[#1B3E2B] font-mono">Unlimited</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#E6E1D8]">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 text-xs font-medium text-[#52685B] hover:bg-[#FAF8F5] rounded-xl cursor-pointer flex items-center gap-1.5 border border-[#E6E1D8]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                onClick={handleComplete}
                className="px-6 py-2.5 text-xs font-semibold text-white bg-[#1B3E2B] hover:bg-[#142E20] rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2 border border-[#E5A823]/40"
              >
                <Check className="w-4 h-4 text-[#E5A823]" />
                <span>Publish Tool to Registry</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
