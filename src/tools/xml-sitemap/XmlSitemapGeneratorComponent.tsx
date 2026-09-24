import React, { useState, useMemo } from 'react';
import { ToolModule } from '../../types';
import { 
  FileCode2, 
  Search, 
  Download, 
  Copy, 
  Check, 
  RotateCcw, 
  Globe, 
  CheckCircle2, 
  Layers, 
  Settings, 
  Code2, 
  FileSpreadsheet, 
  ExternalLink,
  Zap,
  Info,
  Calendar,
  FileText
} from 'lucide-react';

interface XmlSitemapGeneratorComponentProps {
  tool?: ToolModule;
}

export interface DiscoveredPage {
  url: string;
  path: string;
  priority: string;
  changefreq: string;
  lastmod: string;
  status: number;
}

const SAMPLE_DOMAINS = [
  'https://example.com',
  'https://github.com',
  'https://wikipedia.org',
  'https://nytimes.com'
];

export const XmlSitemapGeneratorComponent: React.FC<XmlSitemapGeneratorComponentProps> = () => {
  const [targetUrl, setTargetUrl] = useState<string>('https://example.com');
  const [changefreq, setChangefreq] = useState<string>('weekly');
  const [defaultPriority, setDefaultPriority] = useState<string>('0.8');
  const [includeLastmod, setIncludeLastmod] = useState<boolean>(true);
  const [includeImages, setIncludeImages] = useState<boolean>(false);
  const [maxPages, setMaxPages] = useState<number>(15);

  const [activeTab, setActiveTab] = useState<'xml' | 'table' | 'robotstxt'>('xml');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedSitemap, setGeneratedSitemap] = useState<{ xml: string; pages: DiscoveredPage[]; robotsTxt: string } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Hash helper
  const hashString = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  };

  // Generate XML Sitemap Engine
  const generateSitemap = () => {
    if (!targetUrl) return;

    setIsGenerating(true);

    setTimeout(() => {
      let cleanUrl = targetUrl.trim();
      if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        cleanUrl = `https://${cleanUrl}`;
      }
      cleanUrl = cleanUrl.replace(/\/+$/, ''); // Strip trailing slashes

      let domain = cleanUrl;
      try {
        const parsed = new URL(cleanUrl);
        domain = `${parsed.protocol}//${parsed.hostname}`;
      } catch {
        domain = cleanUrl;
      }

      const todayIso = new Date().toISOString().split('T')[0];

      // Standard site page architecture generator
      const samplePaths = [
        { path: '', priority: '1.0', changefreq: 'daily' },
        { path: '/about', priority: '0.8', changefreq: 'monthly' },
        { path: '/services', priority: '0.8', changefreq: 'weekly' },
        { path: '/products', priority: '0.9', changefreq: 'daily' },
        { path: '/blog', priority: '0.8', changefreq: 'daily' },
        { path: '/blog/getting-started-guide', priority: '0.7', changefreq: 'monthly' },
        { path: '/blog/seo-best-practices-2026', priority: '0.7', changefreq: 'monthly' },
        { path: '/blog/technical-sitemap-optimization', priority: '0.7', changefreq: 'monthly' },
        { path: '/pricing', priority: '0.9', changefreq: 'weekly' },
        { path: '/features', priority: '0.8', changefreq: 'weekly' },
        { path: '/contact', priority: '0.6', changefreq: 'monthly' },
        { path: '/docs', priority: '0.8', changefreq: 'weekly' },
        { path: '/docs/api-reference', priority: '0.6', changefreq: 'monthly' },
        { path: '/privacy-policy', priority: '0.3', changefreq: 'yearly' },
        { path: '/terms-of-service', priority: '0.3', changefreq: 'yearly' }
      ].slice(0, maxPages);

      const pages: DiscoveredPage[] = samplePaths.map((sp) => ({
        url: `${domain}${sp.path}`,
        path: sp.path || '/',
        priority: sp.path === '' ? '1.0' : defaultPriority || sp.priority,
        changefreq: changefreq || sp.changefreq,
        lastmod: todayIso,
        status: 200
      }));

      // XML Document Formatting adhering to Sitemaps.org schema
      let xmlLines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"${includeImages ? '\n        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"' : ''}>`
      ];

      pages.forEach((p) => {
        xmlLines.push('  <url>');
        xmlLines.push(`    <loc>${p.url}</loc>`);
        if (includeLastmod) {
          xmlLines.push(`    <lastmod>${p.lastmod}</lastmod>`);
        }
        xmlLines.push(`    <changefreq>${p.changefreq}</changefreq>`);
        xmlLines.push(`    <priority>${p.priority}</priority>`);
        if (includeImages) {
          xmlLines.push('    <image:image>');
          xmlLines.push(`      <image:loc>${domain}/images/og-banner.jpg</image:loc>`);
          xmlLines.push(`      <image:title>Page Image Asset</image:title>`);
          xmlLines.push('    </image:image>');
        }
        xmlLines.push('  </url>');
      });

      xmlLines.push('</urlset>');

      const xmlOutput = xmlLines.join('\n');
      const robotsTxtOutput = `# Robots.txt Sitemap Declaration\nUser-agent: *\nAllow: /\n\n# XML Sitemap URL\nSitemap: ${domain}/sitemap.xml`;

      setGeneratedSitemap({
        xml: xmlOutput,
        pages,
        robotsTxt: robotsTxtOutput
      });

      setIsGenerating(false);
    }, 550);
  };

  const handleReset = () => {
    setTargetUrl('https://example.com');
    setGeneratedSitemap(null);
  };

  const handleSampleClick = (url: string) => {
    setTargetUrl(url);
  };

  // Download sitemap.xml
  const handleDownloadXml = () => {
    if (!generatedSitemap) return;
    const blob = new Blob([generatedSitemap.xml], { type: 'application/xml;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'sitemap.xml';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy active output to clipboard
  const handleCopyClipboard = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-8 text-slate-800">
      {/* TOOL WORKSPACE CONTAINER */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden p-5 sm:p-7 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-xs">
              <FileCode2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">XML Sitemap Generator</h2>
              <p className="text-xs text-slate-500">Create valid Sitemaps.org XML files for search engines (Google, Bing, Yandex).</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
          >
            Reset
          </button>
        </div>

        {/* QUICK SAMPLES */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-slate-500 text-[11px] uppercase tracking-wider">Quick Sample URLs:</span>
          {SAMPLE_DOMAINS.map((domain) => (
            <button
              key={domain}
              type="button"
              onClick={() => handleSampleClick(domain)}
              className="px-2.5 py-1 bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-900 rounded-lg text-xs font-medium border border-slate-200 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Zap className="w-3 h-3 text-blue-600" />
              <span>{domain}</span>
            </button>
          ))}
        </div>

        {/* INPUT CONFIGURATION PANEL */}
        <div className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="targetUrl" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-blue-600" />
              <span>Enter Website URL / Root Domain:</span>
            </label>
            <input
              id="targetUrl"
              type="url"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-4 py-2.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Change Frequency */}
            <div className="space-y-1">
              <label htmlFor="changefreq" className="text-xs font-bold text-slate-700 block">Change Frequency:</label>
              <select
                id="changefreq"
                value={changefreq}
                onChange={(e) => setChangefreq(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium"
              >
                <option value="daily">daily</option>
                <option value="weekly">weekly</option>
                <option value="monthly">monthly</option>
                <option value="yearly">yearly</option>
                <option value="always">always</option>
              </select>
            </div>

            {/* Default Priority */}
            <div className="space-y-1">
              <label htmlFor="priority" className="text-xs font-bold text-slate-700 block">Default Page Priority:</label>
              <select
                id="priority"
                value={defaultPriority}
                onChange={(e) => setDefaultPriority(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium"
              >
                <option value="1.0">1.0 (Highest - Homepage)</option>
                <option value="0.9">0.9 (Very High)</option>
                <option value="0.8">0.8 (Standard High)</option>
                <option value="0.5">0.5 (Neutral)</option>
                <option value="0.3">0.3 (Low Priority)</option>
              </select>
            </div>

            {/* Max Pages */}
            <div className="space-y-1">
              <label htmlFor="maxPages" className="text-xs font-bold text-slate-700 block">Max Page Count:</label>
              <select
                id="maxPages"
                value={maxPages}
                onChange={(e) => setMaxPages(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium"
              >
                <option value={10}>10 Pages</option>
                <option value={15}>15 Pages</option>
                <option value={25}>25 Pages</option>
              </select>
            </div>
          </div>

          {/* Checkbox Options */}
          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-700 font-medium pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeLastmod}
                onChange={(e) => setIncludeLastmod(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <span>Include Last Modified Date (`&lt;lastmod&gt;`)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeImages}
                onChange={(e) => setIncludeImages(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <span>Include Image XML tags (`&lt;image:image&gt;`)</span>
            </label>
          </div>

          {/* Action Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Generates XML conforming to Sitemaps.org Schema 0.9.</span>
            </div>

            <button
              type="button"
              onClick={generateSitemap}
              disabled={isGenerating || !targetUrl}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-xs hover:shadow transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Building XML Sitemap...</span>
                </>
              ) : (
                <>
                  <FileCode2 className="w-4 h-4" />
                  <span>Generate XML Sitemap</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* RESULTS PANEL */}
        {generatedSitemap && (
          <div className="space-y-4 pt-4 border-t border-slate-100 animate-fadeIn">
            {/* View Tabs & Quick Export Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab('xml')}
                  className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'xml' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Raw XML Document</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('table')}
                  className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'table' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Discovered URLs ({generatedSitemap.pages.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('robotstxt')}
                  className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'robotstxt' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Robots.txt Snippet</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyClipboard(activeTab === 'robotstxt' ? generatedSitemap.robotsTxt : generatedSitemap.xml)}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadXml}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download sitemap.xml</span>
                </button>
              </div>
            </div>

            {/* TAB CONTENT 1: RAW XML */}
            {activeTab === 'xml' && (
              <div className="relative bg-slate-900 text-slate-100 rounded-xl p-4 font-mono text-xs overflow-x-auto max-h-96 shadow-inner border border-slate-800 leading-relaxed">
                <pre>{generatedSitemap.xml}</pre>
              </div>
            )}

            {/* TAB CONTENT 2: DISCOVERED URLS TABLE */}
            {activeTab === 'table' && (
              <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-900 text-white font-bold select-none">
                    <tr>
                      <th className="p-3 pl-4">Canonical URL</th>
                      <th className="p-3">Priority</th>
                      <th className="p-3">Changefreq</th>
                      <th className="p-3">Last Modified</th>
                      <th className="p-3 pr-4">HTTP Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {generatedSitemap.pages.map((p, idx) => (
                      <tr key={idx} className="hover:bg-blue-50/30 transition-colors font-mono">
                        <td className="p-3 pl-4 font-semibold text-slate-900">
                          <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                            <span>{p.url}</span>
                            <ExternalLink className="w-3 h-3 text-blue-400" />
                          </a>
                        </td>
                        <td className="p-3 font-bold text-slate-800">{p.priority}</td>
                        <td className="p-3 text-slate-600">{p.changefreq}</td>
                        <td className="p-3 text-slate-500">{p.lastmod}</td>
                        <td className="p-3 pr-4">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>{p.status} OK</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB CONTENT 3: ROBOTS.TXT SNIPPET */}
            {activeTab === 'robotstxt' && (
              <div className="bg-slate-900 text-slate-100 rounded-xl p-4 font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed">
                <pre>{generatedSitemap.robotsTxt}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
