import React, { useState, useMemo, useEffect } from 'react';
import { ToolModule } from '../../types';
import { usePlatform } from '../../context/PlatformContext';
import { 
  BarChart2, 
  Search, 
  Copy, 
  Check, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles,
  FileText,
  ShieldCheck,
  RefreshCw,
  Hash,
  Download,
  Info,
  HelpCircle
} from 'lucide-react';

interface KeywordDensityProps {
  tool: ToolModule;
}

export const KeywordDensityComponent: React.FC<KeywordDensityProps> = ({ tool }) => {
  const { setPublicRoute } = usePlatform();
  const [text, setText] = useState<string>(
    'Search engine optimization is an essential process for digital marketers seeking organic search traffic. High-ranking content attracts targeted website visitors, enhances keyword relevance, and builds search engine authority. By analyzing keyword density and search intent, webmasters optimize content without risking keyword stuffing penalties.'
  );

  useEffect(() => {
    try {
      const prefill = sessionStorage.getItem('keyword_density_prefill');
      if (prefill) {
        setText(prefill);
        sessionStorage.removeItem('keyword_density_prefill');
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const [copied, setCopied] = useState<boolean>(false);

  const stats = useMemo(() => {
    if (!text.trim()) return { totalWords: 0, totalChars: 0, oneGrams: [], twoGrams: [], threeGrams: [] };

    const totalChars = text.length;
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(w => w.length > 1);

    const totalWords = words.length;
    if (totalWords === 0) return { totalWords: 0, totalChars, oneGrams: [], twoGrams: [], threeGrams: [] };

    // 1-Grams (Single Words)
    const singleCounts: Record<string, number> = {};
    const stopWords = new Set(['the', 'and', 'a', 'to', 'of', 'in', 'is', 'it', 'that', 'for', 'on', 'with', 'as', 'this', 'by', 'at', 'from', 'an', 'be', 'or', 'are', 'was', 'were']);
    
    words.forEach(w => {
      if (!stopWords.has(w)) {
        singleCounts[w] = (singleCounts[w] || 0) + 1;
      }
    });

    const oneGrams = Object.entries(singleCounts)
      .map(([phrase, count]) => ({
        phrase,
        count,
        density: Number(((count / totalWords) * 100).toFixed(1))
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 2-Grams (2 Words)
    const twoCounts: Record<string, number> = {};
    for (let i = 0; i < words.length - 1; i++) {
      if (!stopWords.has(words[i]) || !stopWords.has(words[i + 1])) {
        const phrase = `${words[i]} ${words[i + 1]}`;
        twoCounts[phrase] = (twoCounts[phrase] || 0) + 1;
      }
    }

    const twoGrams = Object.entries(twoCounts)
      .map(([phrase, count]) => ({
        phrase,
        count,
        density: Number(((count / totalWords) * 100).toFixed(1))
      }))
      .filter(g => g.count >= 1)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // 3-Grams (3 Words)
    const threeCounts: Record<string, number> = {};
    for (let i = 0; i < words.length - 2; i++) {
      const phrase = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
      threeCounts[phrase] = (threeCounts[phrase] || 0) + 1;
    }

    const threeGrams = Object.entries(threeCounts)
      .map(([phrase, count]) => ({
        phrase,
        count,
        density: Number(((count / totalWords) * 100).toFixed(1))
      }))
      .filter(g => g.count >= 1)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    return { totalWords, totalChars, oneGrams, twoGrams, threeGrams };
  }, [text]);

  const handleCopy = () => {
    const report = `SeoTools Keyword Density Report (${stats.totalWords} words):\n\n` +
      `--- 1-Word Keywords ---\n` +
      stats.oneGrams.map(g => `${g.phrase}: ${g.count}x (${g.density}%)`).join('\n') +
      `\n\n--- 2-Word Keyphrases ---\n` +
      stats.twoGrams.map(g => `${g.phrase}: ${g.count}x (${g.density}%)`).join('\n');
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendToRewriter = () => {
    try {
      sessionStorage.setItem('article_rewriter_prefill', text);
    } catch {
      // storage fallback
    }
    setPublicRoute({ page: 'tool', param: 'article-rewriter' });
  };

  const handleSendToPlagiarism = () => {
    try {
      sessionStorage.setItem('plagiarism_prefill', text);
    } catch {
      // storage fallback
    }
    setPublicRoute({ page: 'tool', param: 'plagiarism-checker' });
  };

  return (
    <div className="w-full space-y-10">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-[11px] font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              N-Gram Frequency Analyzer
            </span>
            <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Density Engine
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Keyword Density &amp; TF-IDF Content Analyzer
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Audit single-word, 2-word, and 3-word phrase frequency in real time. Balance target term repetition with natural semantic depth.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start lg:self-auto">
          <span className="bg-blue-50 text-blue-700 px-3.5 py-2 rounded-xl border border-blue-200 font-mono text-xs font-bold shadow-2xs">
            Optimal Range: 1.0% – 2.5%
          </span>
        </div>
      </div>

      {/* Editor Box */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-500" />
            <span className="font-bold text-slate-800">Article or Webpage Copy</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
              {stats.totalWords} Words · {stats.totalChars} Characters
            </span>
            {text && (
              <button
                onClick={() => setText('')}
                className="text-slate-400 hover:text-rose-600 cursor-pointer p-1 transition-colors"
                title="Clear text"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or write your article, blog post, or product description here to extract keyword frequency..."
          rows={8}
          className="w-full p-5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden resize-none leading-relaxed font-normal"
        />

        <div className="bg-slate-50 border-t border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            onClick={() => {
              setText(
                'Search engine optimization is an essential process for digital marketers seeking organic search traffic. High-ranking content attracts targeted website visitors, enhances keyword relevance, and builds search engine authority. By analyzing keyword density and search intent, webmasters optimize content without risking keyword stuffing penalties.'
              );
            }}
            className="text-xs text-slate-600 hover:text-blue-600 font-medium underline cursor-pointer"
          >
            Load Sample SEO Article
          </button>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopy}
              disabled={stats.totalWords === 0}
              className="px-3.5 py-2 bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Report Copied!' : 'Copy Report'}</span>
            </button>
            <button
              onClick={handleSendToRewriter}
              disabled={stats.totalWords === 0}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Paraphrase Excess Words</span>
            </button>
          </div>
        </div>
      </div>

      {/* Density Analysis Tables */}
      {stats.totalWords > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 1-Word Keywords */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
            <div className="bg-slate-50 p-4 border-b border-slate-200 font-bold text-xs text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-blue-600" />
                <span>Single Word (1-Gram)</span>
              </span>
              <span className="text-slate-400 font-normal">Freq / %</span>
            </div>
            <div className="divide-y divide-slate-100 text-xs flex-1">
              {stats.oneGrams.length === 0 ? (
                <p className="p-4 text-slate-400 text-center">No significant keywords found.</p>
              ) : (
                stats.oneGrams.map((item, idx) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <span className="font-semibold text-slate-900">{item.phrase}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">{item.count}x</span>
                      <span className={`px-2 py-0.5 rounded-full font-mono font-bold text-[11px] ${
                        item.density > 3.5 
                          ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                          : item.density >= 1.0 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                            : 'bg-slate-100 text-slate-700'
                      }`}>
                        {item.density}%
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 2-Word Keywords */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
            <div className="bg-slate-50 p-4 border-b border-slate-200 font-bold text-xs text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-indigo-600" />
                <span>Two Words (2-Gram)</span>
              </span>
              <span className="text-slate-400 font-normal">Freq / %</span>
            </div>
            <div className="divide-y divide-slate-100 text-xs flex-1">
              {stats.twoGrams.length === 0 ? (
                <p className="p-4 text-slate-400 text-center">No two-word phrases found.</p>
              ) : (
                stats.twoGrams.map((item, idx) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <span className="font-semibold text-slate-900 truncate max-w-[150px]">{item.phrase}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">{item.count}x</span>
                      <span className="px-2 py-0.5 rounded-full font-mono font-bold text-[11px] bg-blue-50 text-blue-700 border border-blue-200">
                        {item.density}%
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 3-Word Keywords */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
            <div className="bg-slate-50 p-4 border-b border-slate-200 font-bold text-xs text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-purple-600" />
                <span>Three Words (3-Gram)</span>
              </span>
              <span className="text-slate-400 font-normal">Freq / %</span>
            </div>
            <div className="divide-y divide-slate-100 text-xs flex-1">
              {stats.threeGrams.length === 0 ? (
                <p className="p-4 text-slate-400 text-center">No three-word phrases found.</p>
              ) : (
                stats.threeGrams.map((item, idx) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <span className="font-semibold text-slate-900 truncate max-w-[150px]">{item.phrase}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">{item.count}x</span>
                      <span className="px-2 py-0.5 rounded-full font-mono font-bold text-[11px] bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {item.density}%
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
