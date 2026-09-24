import React, { useState, useMemo } from 'react';
import { ToolModule } from '../../types';
import { 
  TrendingUp, 
  Search, 
  Download, 
  Copy, 
  Check, 
  RotateCcw, 
  Globe, 
  Smartphone, 
  Monitor, 
  ExternalLink, 
  BarChart2, 
  Filter, 
  Sparkles, 
  Info, 
  X, 
  Eye, 
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Zap,
  HelpCircle
} from 'lucide-react';

interface KeywordRankTrackerComponentProps {
  tool?: ToolModule;
}

export interface KeywordRankResult {
  id: string;
  keyword: string;
  position: number; // 1 to 100
  previousPosition: number;
  change: number; // +ve gain, -ve drop, 0 stable, 999 new
  rankingUrl: string;
  searchVolume: number;
  difficulty: number; // 1-100%
  intent: 'Informational' | 'Transactional' | 'Navigational' | 'Commercial';
  serpFeatures: string[]; // e.g. ['Featured Snippet', 'People Also Ask', 'Sitelinks']
  competitorsTop3: { rank: number; title: string; domain: string; url: string }[];
}

const COUNTRIES = [
  { code: 'US', name: 'United States (google.com)' },
  { code: 'UK', name: 'United Kingdom (google.co.uk)' },
  { code: 'CA', name: 'Canada (google.ca)' },
  { code: 'AU', name: 'Australia (google.com.au)' },
  { code: 'IN', name: 'India (google.co.in)' },
  { code: 'DE', name: 'Germany (google.de)' },
  { code: 'FR', name: 'France (google.fr)' }
];

const DEFAULT_KEYWORDS = `version control platform
open source code repository
git repository hosting
code collaboration tool
github desktop download`;

const QUICK_SAMPLES = [
  { domain: 'github.com', keywords: 'version control platform\nopen source repository\ngit code hosting\npull request workflow' },
  { domain: 'wikipedia.org', keywords: 'online encyclopedia\nworld history facts\nscientific definitions\nbiography reference' },
  { domain: 'nytimes.com', keywords: 'breaking news today\nworld news headlines\nopinion editorials\ndaily crossword puzzle' }
];

export const KeywordRankTrackerComponent: React.FC<KeywordRankTrackerComponentProps> = () => {
  const [targetDomain, setTargetDomain] = useState<string>('github.com');
  const [inputText, setInputText] = useState<string>(DEFAULT_KEYWORDS);
  const [country, setCountry] = useState<string>('US');
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [results, setResults] = useState<KeywordRankResult[] | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [filterQuery, setFilterQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'position' | 'searchVolume' | 'difficulty' | 'keyword'>('position');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedSerpKeyword, setSelectedSerpKeyword] = useState<KeywordRankResult | null>(null);

  // Parse keywords list
  const parsedKeywords = useMemo(() => {
    if (!inputText) return [];
    return inputText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .slice(0, 20); // Limit to 20 bulk keywords
  }, [inputText]);

  // Deterministic Hash
  const hashString = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  };

  // Rank Calculation Engine
  const analyzeRankings = (customDomain?: string, customKwList?: string[]) => {
    const domainToUse = customDomain || targetDomain;
    const keywordsToUse = customKwList || parsedKeywords;
    if (keywordsToUse.length === 0 || !domainToUse) return;

    setIsAnalyzing(true);

    setTimeout(() => {
      let cleanDomain = domainToUse.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0].toLowerCase();
      if (!cleanDomain) cleanDomain = 'example.com';

      const generatedResults: KeywordRankResult[] = keywordsToUse.map((kw, idx) => {
        const hash = hashString(`${cleanDomain}-${kw.toLowerCase()}-${device}-${country}`);

        // Position logic based on domain relevance & hash
        let position = 1 + (hash % 45);
        if (cleanDomain.includes('github') && (kw.includes('git') || kw.includes('code') || kw.includes('version') || kw.includes('repository'))) {
          position = 1 + (hash % 5);
        } else if (cleanDomain.includes('wikipedia') && (kw.includes('encyclopedia') || kw.includes('reference') || kw.includes('history') || kw.includes('definition'))) {
          position = 1 + (hash % 4);
        } else if (cleanDomain.includes('nytimes') && (kw.includes('news') || kw.includes('headline') || kw.includes('crossword'))) {
          position = 1 + (hash % 6);
        }

        const previousPosition = position > 3 ? position + ((hash % 7) - 3) : position;
        const change = previousPosition - position;

        // Search Volume & Difficulty
        const searchVolume = Math.round(Math.pow((hash % 85) + 10, 2.8) * 1.5 + (hash % 800));
        const difficulty = Math.min(99, Math.max(12, 25 + (hash % 70)));

        // Intent
        let intent: 'Informational' | 'Transactional' | 'Navigational' | 'Commercial' = 'Informational';
        if (kw.includes('buy') || kw.includes('pricing') || kw.includes('download') || kw.includes('service')) {
          intent = 'Transactional';
        } else if (kw.includes('best') || kw.includes('tool') || kw.includes('platform') || kw.includes('vs')) {
          intent = 'Commercial';
        } else if (kw.includes('login') || kw.includes('github') || kw.includes('wikipedia')) {
          intent = 'Navigational';
        }

        // SERP Features
        const serpFeatures: string[] = [];
        if (position === 1 && hash % 2 === 0) serpFeatures.push('Featured Snippet');
        if (hash % 3 === 0) serpFeatures.push('People Also Ask');
        if (position <= 3) serpFeatures.push('Sitelinks');
        if (intent === 'Transactional' && hash % 2 === 0) serpFeatures.push('Site Search Box');

        // Ranking landing page path
        let pagePath = '/';
        if (kw.includes('download')) pagePath = '/desktop';
        else if (kw.includes('hosting')) pagePath = '/features/hosting';
        else if (kw.includes('repository')) pagePath = '/topics/repositories';
        else if (kw.includes('tool')) pagePath = '/features/collaboration';

        const rankingUrl = `https://${cleanDomain}${pagePath}`;

        // Top Competitor SERP URLs
        const competitorsTop3 = [
          { rank: 1, title: `${kw.charAt(0).toUpperCase() + kw.slice(1)} - Official Platform`, domain: cleanDomain, url: rankingUrl },
          { rank: 2, title: `Top 10 Solutions for ${kw}`, domain: 'gitlab.com', url: `https://gitlab.com/solutions/${kw.replace(/\s+/g, '-')}` },
          { rank: 3, title: `Complete Guide to ${kw}`, domain: 'atlassian.com', url: `https://atlassian.com/guides/${kw.replace(/\s+/g, '-')}` }
        ];

        if (position > 1) {
          competitorsTop3[0] = { rank: 1, title: `Leading Provider for ${kw}`, domain: 'bitbucket.org', url: `https://bitbucket.org/product/${kw.replace(/\s+/g, '-')}` };
          competitorsTop3[position - 1] = { rank: position, title: `${cleanDomain} - ${kw}`, domain: cleanDomain, url: rankingUrl };
        }

        return {
          id: `rank-${idx}-${hash}`,
          keyword: kw,
          position,
          previousPosition,
          change,
          rankingUrl,
          searchVolume,
          difficulty,
          intent,
          serpFeatures,
          competitorsTop3
        };
      });

      setResults(generatedResults);
      setIsAnalyzing(false);
    }, 650);
  };

  const handleReset = () => {
    setInputText('');
    setResults(null);
  };

  const handleLoadSample = (sample: { domain: string; keywords: string }) => {
    setTargetDomain(sample.domain);
    setInputText(sample.keywords);
    analyzeRankings(sample.domain, sample.keywords.split('\n'));
  };

  // Filter & Sort Results
  const filteredAndSortedResults = useMemo(() => {
    if (!results) return [];

    let list = results.filter(item => 
      item.keyword.toLowerCase().includes(filterQuery.toLowerCase()) ||
      item.rankingUrl.toLowerCase().includes(filterQuery.toLowerCase())
    );

    list.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      if (sortOrder === 'asc') return valA > valB ? 1 : -1;
      return valA < valB ? 1 : -1;
    });

    return list;
  }, [results, filterQuery, sortBy, sortOrder]);

  // Executive KPI summary
  const summary = useMemo(() => {
    if (!results || results.length === 0) return null;
    const pageOneCount = results.filter(r => r.position <= 10).length;
    const topThreeCount = results.filter(r => r.position <= 3).length;
    const avgPosition = (results.reduce((acc, r) => acc + r.position, 0) / results.length).toFixed(1);
    const totalVolume = results.reduce((acc, r) => acc + r.searchVolume, 0);

    return {
      totalKeywords: results.length,
      pageOneCount,
      topThreeCount,
      avgPosition,
      totalVolume
    };
  }, [results]);

  // Export CSV
  const handleExportCsv = () => {
    if (!results || results.length === 0) return;
    const headers = ['Keyword', 'Organic Rank', 'Previous Rank', 'Change', 'Search Volume', 'Difficulty (%)', 'Search Intent', 'Ranking URL', 'SERP Features'];
    const rows = results.map(r => [
      `"${r.keyword}"`,
      `"#${r.position}"`,
      `"#${r.previousPosition}"`,
      r.change > 0 ? `+${r.change}` : r.change,
      r.searchVolume,
      `"${r.difficulty}%"`,
      `"${r.intent}"`,
      `"${r.rankingUrl}"`,
      `"${r.serpFeatures.join('; ')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `keyword_rankings_${targetDomain}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy table
  const handleCopyClipboard = () => {
    if (!results || results.length === 0) return;
    const lines = results.map(r => `${r.keyword}\tRank: #${r.position}\tChange: ${r.change > 0 ? '+' + r.change : r.change}\tVol: ${r.searchVolume.toLocaleString()}\tKD: ${r.difficulty}%\tURL: ${r.rankingUrl}`);
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSort = (field: 'position' | 'searchVolume' | 'difficulty' | 'keyword') => {
    if (sortBy === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="w-full space-y-8 text-slate-800">
      {/* WORKSPACE CONTAINER */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden p-5 sm:p-7 space-y-6">
        {/* Workspace Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-xs">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Keyword Rank & Position Tracker</h2>
              <p className="text-xs text-slate-500">Track organic Google SERP positions, search volume, keyword difficulty, and intent.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>

        {/* QUICK SAMPLES */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-slate-500 text-[11px] uppercase tracking-wider">Quick Sample Domains:</span>
          {QUICK_SAMPLES.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleLoadSample(s)}
              className="px-2.5 py-1 bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-900 rounded-lg text-xs font-medium border border-slate-200 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Zap className="w-3 h-3 text-blue-600" />
              <span>{s.domain}</span>
            </button>
          ))}
        </div>

        {/* INPUT FORM PANEL */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Target Domain Input */}
            <div className="space-y-1">
              <label htmlFor="targetDomain" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span>Target Website Domain:</span>
              </label>
              <input
                id="targetDomain"
                type="text"
                value={targetDomain}
                onChange={(e) => setTargetDomain(e.target.value)}
                placeholder="e.g. github.com"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none font-medium"
              />
            </div>

            {/* Country Selector */}
            <div className="space-y-1">
              <label htmlFor="countrySelect" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-600" />
                <span>Search Country / Region:</span>
              </label>
              <select
                id="countrySelect"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none font-medium"
              >
                {COUNTRIES.map(c => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Device Selector */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Device Target:</label>
              <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setDevice('desktop')}
                  className={`py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                    device === 'desktop' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Desktop</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDevice('mobile')}
                  className={`py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                    device === 'mobile' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile</span>
                </button>
              </div>
            </div>
          </div>

          {/* Keywords Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <label htmlFor="keywordsInput">Enter Target Keywords (One per line, max 20):</label>
              <span className="text-slate-400 font-mono text-[11px]">{parsedKeywords.length} / 20 Keywords</span>
            </div>

            <textarea
              id="keywordsInput"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`version control platform\nopen source repository\ngit code hosting`}
              rows={4}
              className="w-full p-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none resize-y leading-relaxed"
            />
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Simulates organic Google SERP positions, keyword difficulty, intent, and search volume.</span>
            </div>

            <button
              type="button"
              onClick={() => analyzeRankings()}
              disabled={isAnalyzing || parsedKeywords.length === 0 || !targetDomain}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-xs hover:shadow transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Checking Google SERP Positions...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Check Keyword Rankings</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* RESULTS DASHBOARD */}
        {results && summary && (
          <div className="space-y-6 pt-4 border-t border-slate-100 animate-fadeIn">
            {/* KPI Header */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-blue-50/60 border border-blue-200/80 p-4 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Keywords Tracked</span>
                <span className="text-2xl font-black text-blue-900 font-mono block">{summary.totalKeywords}</span>
                <span className="text-[11px] text-blue-800/80 block">Total Queries Audited</span>
              </div>

              <div className="bg-emerald-50/60 border border-emerald-200/80 p-4 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Page 1 Rankings</span>
                <span className="text-2xl font-black text-emerald-900 font-mono block">{summary.pageOneCount} <span className="text-xs font-bold text-emerald-600">/ {summary.totalKeywords}</span></span>
                <span className="text-[11px] text-emerald-800 block font-bold">Positions #1 – #10</span>
              </div>

              <div className="bg-indigo-50/60 border border-indigo-200/80 p-4 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">Top 3 Ranks</span>
                <span className="text-2xl font-black text-indigo-900 font-mono block">{summary.topThreeCount}</span>
                <span className="text-[11px] text-indigo-800/80 block">High Click-Through Positions</span>
              </div>

              <div className="bg-amber-50/60 border border-amber-200/80 p-4 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Average Rank</span>
                <span className="text-2xl font-black text-amber-900 font-mono block">#{summary.avgPosition}</span>
                <span className="text-[11px] text-amber-800/80 block">Total Search Volume: {summary.totalVolume.toLocaleString()}/mo</span>
              </div>
            </div>

            {/* Filter & Actions Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder="Filter keywords or URLs..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyClipboard}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{copied ? 'Copied!' : 'Copy Table'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* RESULTS TABLE */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-900 text-white font-bold select-none">
                  <tr>
                    <th className="p-3 pl-4 cursor-pointer hover:bg-slate-800" onClick={() => toggleSort('keyword')}>
                      Target Keyword
                    </th>
                    <th className="p-3 cursor-pointer hover:bg-slate-800" onClick={() => toggleSort('position')}>
                      <div className="flex items-center gap-1">
                        <span>Organic Rank</span>
                        <BarChart2 className="w-3 h-3 text-blue-400" />
                      </div>
                    </th>
                    <th className="p-3">Change</th>
                    <th className="p-3 cursor-pointer hover:bg-slate-800" onClick={() => toggleSort('searchVolume')}>
                      Search Volume
                    </th>
                    <th className="p-3 cursor-pointer hover:bg-slate-800" onClick={() => toggleSort('difficulty')}>
                      Difficulty (KD)
                    </th>
                    <th className="p-3">Search Intent</th>
                    <th className="p-3">Ranking Page URL</th>
                    <th className="p-3 pr-4 text-center">SERP Top 10</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredAndSortedResults.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500">
                        No keywords match your search query filter.
                      </td>
                    </tr>
                  ) : (
                    filteredAndSortedResults.map((item) => (
                      <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="p-3 pl-4 font-bold text-slate-900">
                          <span>{item.keyword}</span>
                          {item.serpFeatures.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1 mt-1">
                              {item.serpFeatures.map((sf, idx) => (
                                <span key={idx} className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 text-[9px] font-semibold border border-blue-200/80">
                                  {sf}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>

                        {/* Rank Position */}
                        <td className="p-3 font-mono">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black ${
                            item.position <= 3
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : item.position <= 10
                              ? 'bg-blue-100 text-blue-900 border border-blue-300'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            #{item.position}
                          </span>
                        </td>

                        {/* Rank Change Signal */}
                        <td className="p-3 font-mono text-xs">
                          {item.change > 0 ? (
                            <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                              <span>+{item.change}</span>
                            </span>
                          ) : item.change < 0 ? (
                            <span className="text-rose-600 font-bold flex items-center gap-0.5">
                              <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" />
                              <span>{item.change}</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 flex items-center gap-0.5">
                              <Minus className="w-3 h-3" />
                              <span>Stable</span>
                            </span>
                          )}
                        </td>

                        <td className="p-3 font-mono font-bold text-slate-800">
                          {item.searchVolume.toLocaleString()} /mo
                        </td>

                        {/* Keyword Difficulty */}
                        <td className="p-3 font-mono">
                          <div className="flex items-center gap-1.5">
                            <span className={`font-bold ${
                              item.difficulty >= 70 ? 'text-rose-700' : item.difficulty >= 40 ? 'text-amber-700' : 'text-emerald-700'
                            }`}>
                              {item.difficulty}%
                            </span>
                            <span className="text-[10px] text-slate-400">
                              ({item.difficulty >= 70 ? 'Hard' : item.difficulty >= 40 ? 'Medium' : 'Easy'})
                            </span>
                          </div>
                        </td>

                        {/* Intent */}
                        <td className="p-3 text-[11px]">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 font-semibold text-slate-700 border border-slate-200">
                            {item.intent}
                          </span>
                        </td>

                        {/* Ranking URL */}
                        <td className="p-3 font-mono text-slate-600 max-w-xs truncate">
                          <a
                            href={item.rankingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1 truncate"
                          >
                            <span className="truncate">{item.rankingUrl}</span>
                            <ExternalLink className="w-3 h-3 text-blue-400 shrink-0" />
                          </a>
                        </td>

                        <td className="p-3 pr-4 text-center">
                          <button
                            type="button"
                            onClick={() => setSelectedSerpKeyword(item)}
                            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                            title="Inspect SERP Top 10 Competitors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SERP PREVIEW MODAL */}
        {selectedSerpKeyword && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 relative">
              <button
                type="button"
                onClick={() => setSelectedSerpKeyword(null)}
                className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="p-2.5 bg-blue-600 text-white rounded-xl">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">"{selectedSerpKeyword.keyword}"</h3>
                  <p className="text-xs text-slate-500">Google SERP Competitor Top 3 Ranking Inspection</p>
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Top Organic Competitors:</span>
                {selectedSerpKeyword.competitorsTop3.map((comp) => (
                  <div key={comp.rank} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded font-mono text-xs font-bold ${
                        comp.rank === selectedSerpKeyword.position ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-800'
                      }`}>
                        #{comp.rank}
                      </span>
                      <strong className="text-xs text-slate-900 truncate">{comp.title}</strong>
                    </div>
                    <a href={comp.url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-mono truncate">
                      <span className="truncate">{comp.url}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedSerpKeyword(null)}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Close SERP Inspection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
