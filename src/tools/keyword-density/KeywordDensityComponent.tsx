import React, { useState, useMemo } from 'react';
import { ToolModule } from '../../types';
import { 
  BarChart2, 
  Search, 
  Copy, 
  Check, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles,
  FileText
} from 'lucide-react';

interface KeywordDensityProps {
  tool: ToolModule;
}

export const KeywordDensityComponent: React.FC<KeywordDensityProps> = ({ tool }) => {
  const [text, setText] = useState<string>(
    'Search engine optimization is the art of optimizing web pages. Good search engine optimization increases visibility. Search engines reward relevant content and quality links.'
  );
  const [copied, setCopied] = useState<boolean>(false);

  const stats = useMemo(() => {
    if (!text.trim()) return { totalWords: 0, oneGrams: [], twoGrams: [], threeGrams: [] };

    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(w => w.length > 1);

    const totalWords = words.length;
    if (totalWords === 0) return { totalWords: 0, oneGrams: [], twoGrams: [], threeGrams: [] };

    // 1-Grams (Single Words)
    const singleCounts: Record<string, number> = {};
    const stopWords = new Set(['the', 'and', 'a', 'to', 'of', 'in', 'is', 'it', 'that', 'for', 'on', 'with', 'as', 'this', 'by', 'at', 'from']);
    
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
      .slice(0, 8);

    // 2-Grams (2 Words)
    const twoCounts: Record<string, number> = {};
    for (let i = 0; i < words.length - 1; i++) {
      const phrase = `${words[i]} ${words[i + 1]}`;
      twoCounts[phrase] = (twoCounts[phrase] || 0) + 1;
    }

    const twoGrams = Object.entries(twoCounts)
      .map(([phrase, count]) => ({
        phrase,
        count,
        density: Number(((count / totalWords) * 100).toFixed(1))
      }))
      .filter(g => g.count >= 1)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

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
      .slice(0, 6);

    return { totalWords, oneGrams, twoGrams, threeGrams };
  }, [text]);

  const handleCopy = () => {
    const report = `Keyword Density Analysis (${stats.totalWords} words):\n` +
      stats.oneGrams.map(g => `${g.phrase}: ${g.count} times (${g.density}%)`).join('\n');
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-8">
      {/* Top Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-blue-600" />
            <span>Keyword Density &amp; N-Gram Frequency Analyzer</span>
          </h2>
          <p className="text-xs text-slate-500">
            Audit single-word and multi-word keyphrase density to avoid search engine keyword stuffing.
          </p>
        </div>

        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg border border-blue-200 font-mono text-xs font-semibold self-start sm:self-auto">
          Optimal: 1% – 2.5%
        </span>
      </div>

      {/* Editor Box */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center justify-between text-xs text-slate-600">
          <span className="font-semibold">Article / Blog Copy</span>
          <div className="flex items-center gap-3">
            <span>{stats.totalWords} Total Words</span>
            {text && (
              <button
                onClick={() => setText('')}
                className="text-slate-400 hover:text-rose-600 cursor-pointer"
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
          placeholder="Paste or write your article text here to extract keyword density..."
          rows={7}
          className="w-full p-5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden resize-none leading-relaxed"
        />
      </div>

      {/* Density Analysis Tables */}
      {stats.totalWords > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 1-Word Keywords */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="bg-slate-50 p-4 border-b border-slate-200 font-bold text-xs text-slate-800 flex items-center justify-between">
              <span>Single Word (1-Gram)</span>
              <span className="text-slate-400 font-normal">Freq / %</span>
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              {stats.oneGrams.map((item, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between hover:bg-slate-50">
                  <span className="font-semibold text-slate-900">{item.phrase}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">{item.count}x</span>
                    <span className={`px-2 py-0.5 rounded font-mono font-bold ${
                      item.density > 3.5 
                        ? 'bg-rose-100 text-rose-800' 
                        : item.density >= 1.0 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-slate-100 text-slate-700'
                    }`}>
                      {item.density}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2-Word Keywords */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="bg-slate-50 p-4 border-b border-slate-200 font-bold text-xs text-slate-800 flex items-center justify-between">
              <span>Two Words (2-Gram)</span>
              <span className="text-slate-400 font-normal">Freq / %</span>
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              {stats.twoGrams.map((item, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between hover:bg-slate-50">
                  <span className="font-semibold text-slate-900 truncate max-w-[140px]">{item.phrase}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">{item.count}x</span>
                    <span className="px-2 py-0.5 rounded font-mono font-bold bg-blue-50 text-blue-700">
                      {item.density}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3-Word Keywords */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="bg-slate-50 p-4 border-b border-slate-200 font-bold text-xs text-slate-800 flex items-center justify-between">
              <span>Three Words (3-Gram)</span>
              <span className="text-slate-400 font-normal">Freq / %</span>
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              {stats.threeGrams.map((item, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between hover:bg-slate-50">
                  <span className="font-semibold text-slate-900 truncate max-w-[140px]">{item.phrase}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">{item.count}x</span>
                    <span className="px-2 py-0.5 rounded font-mono font-bold bg-indigo-50 text-indigo-700">
                      {item.density}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
