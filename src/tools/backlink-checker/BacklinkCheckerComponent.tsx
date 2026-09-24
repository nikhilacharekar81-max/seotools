import React, { useState } from 'react';
import { ToolModule } from '../../types';
import { 
  Link2, 
  Search, 
  Globe, 
  Shield, 
  TrendingUp, 
  CheckCircle2, 
  ExternalLink, 
  ArrowUpRight, 
  Layers, 
  RefreshCw,
  PieChart,
  BarChart3
} from 'lucide-react';

interface BacklinkCheckerProps {
  tool: ToolModule;
}

interface BacklinkItem {
  sourceDomain: string;
  sourceUrl: string;
  targetUrl: string;
  anchorText: string;
  da: number;
  type: 'dofollow' | 'nofollow';
  firstSeen: string;
}

export const BacklinkCheckerComponent: React.FC<BacklinkCheckerProps> = ({ tool }) => {
  const [domain, setDomain] = useState<string>('smallseotools.com');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [results, setResults] = useState<{
    target: string;
    da: number;
    pa: number;
    totalBacklinks: number;
    referringDomains: number;
    dofollowPercent: number;
    backlinks: BacklinkItem[];
  } | null>({
    target: 'smallseotools.com',
    da: 88,
    pa: 79,
    totalBacklinks: 4850000,
    referringDomains: 92400,
    dofollowPercent: 78,
    backlinks: [
      {
        sourceDomain: 'wikipedia.org',
        sourceUrl: 'https://en.wikipedia.org/wiki/Search_engine_optimization',
        targetUrl: 'https://smallseotools.com/plagiarism-checker/',
        anchorText: 'SmallSEOTools Plagiarism Checker',
        da: 98,
        type: 'dofollow',
        firstSeen: '2023-04-12'
      },
      {
        sourceDomain: 'forbes.com',
        sourceUrl: 'https://www.forbes.com/advisor/business/software/best-seo-tools/',
        targetUrl: 'https://smallseotools.com/',
        anchorText: 'free online seo toolkit',
        da: 94,
        type: 'dofollow',
        firstSeen: '2023-08-19'
      },
      {
        sourceDomain: 'hubspot.com',
        sourceUrl: 'https://blog.hubspot.com/marketing/free-seo-tools',
        targetUrl: 'https://smallseotools.com/keyword-density-checker/',
        anchorText: 'keyword density analyzer',
        da: 92,
        type: 'dofollow',
        firstSeen: '2024-01-10'
      },
      {
        sourceDomain: 'searchengineland.com',
        sourceUrl: 'https://searchengineland.com/seo-utilities-guide',
        targetUrl: 'https://smallseotools.com/article-rewriter/',
        anchorText: 'paraphrasing utility',
        da: 90,
        type: 'nofollow',
        firstSeen: '2024-06-02'
      },
      {
        sourceDomain: 'medium.com',
        sourceUrl: 'https://medium.com/@seocopy/top-10-free-tools',
        targetUrl: 'https://smallseotools.com/text-counter/',
        anchorText: 'word counter tool',
        da: 89,
        type: 'dofollow',
        firstSeen: '2025-02-14'
      }
    ]
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    setTimeout(() => {
      // Deterministic synthetic metrics based on input domain
      const clean = domain.toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
      const hash = clean.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const da = Math.min(96, Math.max(20, (hash % 70) + 25));
      const pa = Math.max(15, da - 8);
      const total = (hash * 4200) + 12000;
      const refDom = Math.round(total / 45);

      setResults({
        target: clean,
        da,
        pa,
        totalBacklinks: total,
        referringDomains: refDom,
        dofollowPercent: 65 + (hash % 25),
        backlinks: [
          {
            sourceDomain: 'techradar.com',
            sourceUrl: `https://www.techradar.com/reviews/${clean}`,
            targetUrl: `https://${clean}/`,
            anchorText: `${clean} official review`,
            da: 91,
            type: 'dofollow',
            firstSeen: '2024-03-10'
          },
          {
            sourceDomain: 'wikipedia.org',
            sourceUrl: `https://en.wikipedia.org/wiki/Portal:${clean}`,
            targetUrl: `https://${clean}/about`,
            anchorText: clean,
            da: 98,
            type: 'nofollow',
            firstSeen: '2023-11-20'
          },
          {
            sourceDomain: 'searchenginejournal.com',
            sourceUrl: `https://www.searchenginejournal.com/${clean}-guide`,
            targetUrl: `https://${clean}/tools`,
            anchorText: 'recommended platform',
            da: 89,
            type: 'dofollow',
            firstSeen: '2025-01-05'
          }
        ]
      });
      setIsAnalyzing(false);
    }, 700);
  };

  return (
    <div className="w-full space-y-8">
      {/* Top Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="space-y-1">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Link2 className="w-5 h-5 text-blue-600" />
            <span>Backlink Checker &amp; Domain Authority Explorer</span>
          </h2>
          <p className="text-xs text-slate-500">
            Audit inbound referring links, domain authority (DA), anchor texts, and dofollow ratios for any domain.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Globe className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="e.g. smallseotools.com, wikipedia.org, github.com"
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={!domain.trim() || isAnalyzing}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:bg-slate-300"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Auditing Links...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Check Backlinks</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Results Section */}
      {results && (
        <div className="space-y-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1.5">
              <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Domain Authority (DA)</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-blue-600 font-mono">{results.da}</span>
                <span className="text-xs text-slate-400">/ 100</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: `${results.da}%` }}></div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1.5">
              <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Page Authority (PA)</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-indigo-600 font-mono">{results.pa}</span>
                <span className="text-xs text-slate-400">/ 100</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${results.pa}%` }}></div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1.5">
              <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Total Backlinks</span>
              <span className="text-3xl font-extrabold text-slate-900 font-mono block">
                {results.totalBacklinks.toLocaleString()}
              </span>
              <p className="text-[11px] text-slate-500">Inbound hypertext references.</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1.5">
              <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Dofollow Ratio</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-emerald-600 font-mono">{results.dofollowPercent}%</span>
                <span className="text-xs text-slate-400">({100 - results.dofollowPercent}% nofollow)</span>
              </div>
              <p className="text-[11px] text-emerald-700 font-medium">Healthy organic link equity.</p>
            </div>
          </div>

          {/* Backlinks Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Top Inbound Referring Links for "{results.target}"
              </h3>
              <span className="text-xs font-mono text-slate-500">
                {results.referringDomains.toLocaleString()} unique referring domains
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-4">Referring Domain &amp; URL</th>
                    <th className="p-4">Target Landing Page</th>
                    <th className="p-4">Anchor Text</th>
                    <th className="p-4 text-center">DA</th>
                    <th className="p-4 text-center">Link Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {results.backlinks.map((link, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-4">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>{link.sourceDomain}</span>
                        </div>
                        <a
                          href={link.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-blue-600 truncate max-w-xs block text-[11px] mt-0.5"
                        >
                          {link.sourceUrl}
                        </a>
                      </td>

                      <td className="p-4 text-slate-600 font-mono text-[11px]">
                        {link.targetUrl}
                      </td>

                      <td className="p-4 text-slate-800 font-medium">
                        "{link.anchorText}"
                      </td>

                      <td className="p-4 text-center font-mono font-bold text-blue-600">
                        {link.da}
                      </td>

                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          link.type === 'dofollow'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {link.type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
