import React, { useState, useEffect, useRef, useMemo } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { ToolModule } from '../../types';
import { useTextCounterWorker } from './useTextCounterWorker';
import { 
  Copy, 
  Trash2, 
  Upload, 
  FileText, 
  Clock, 
  Mic, 
  ShieldCheck, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Zap,
  Sparkles,
  BarChart2,
  Type,
  AlignLeft,
  FileCode,
  Download
} from 'lucide-react';

interface TextCounterComponentProps {
  tool: ToolModule;
}

export const TextCounterComponent: React.FC<TextCounterComponentProps> = ({ tool }) => {
  const { addLog } = usePlatform();
  const [text, setText] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'density'>('editor');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Read admin-configured schema settings
  const configMap = (tool.configSchema || []).reduce((acc, curr) => {
    acc[curr.id] = curr.value !== undefined ? curr.value : curr.defaultValue;
    return acc;
  }, {} as Record<string, any>);

  const readingSpeedWpm = Number(configMap['readingSpeedWpm']) || 200;
  const speakingSpeedWpm = Number(configMap['speakingSpeedWpm']) || 130;

  const showWords = configMap['showWords'] !== false;
  const showChars = configMap['showChars'] !== false;
  const showCharsNoSpaces = configMap['showCharsNoSpaces'] !== false;
  const showSentences = configMap['showSentences'] !== false;
  const showParagraphs = configMap['showParagraphs'] !== false;
  const showReadingTime = configMap['showReadingTime'] !== false;
  const showSpeakingTime = configMap['showSpeakingTime'] !== false;

  // Execute in background Web Worker
  const { stats, isProcessing } = useTextCounterWorker(text, {
    readingSpeedWpm,
    speakingSpeedWpm,
  });

  // Track aggregate telemetry events
  const hasTriggeredStart = useRef(false);
  useEffect(() => {
    addLog('application', 'info', `Public tool view: "${tool.name}" (${tool.slug})`);
  }, [tool.id]);

  useEffect(() => {
    if (text.length > 0 && !hasTriggeredStart.current) {
      hasTriggeredStart.current = true;
      addLog('application', 'info', `Tool started: "${tool.slug}" (First input detected)`);
    }
  }, [text, tool.slug]);

  // Real-time Keyword Density Engine for SEO (Signature SmallSEOTools feature!)
  const keywordDensity = useMemo(() => {
    if (!text.trim()) return { singleWords: [], doubleWords: [] };
    const cleanTokens = text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2);

    const totalWords = cleanTokens.length;
    if (totalWords === 0) return { singleWords: [], doubleWords: [] };

    // 1-Word counts
    const singleMap: Record<string, number> = {};
    for (const w of cleanTokens) {
      singleMap[w] = (singleMap[w] || 0) + 1;
    }

    const singleWords = Object.entries(singleMap)
      .map(([word, count]) => ({
        word,
        count,
        density: Number(((count / totalWords) * 100).toFixed(1)),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 2-Word counts
    const doubleMap: Record<string, number> = {};
    for (let i = 0; i < cleanTokens.length - 1; i++) {
      const phrase = `${cleanTokens[i]} ${cleanTokens[i + 1]}`;
      doubleMap[phrase] = (doubleMap[phrase] || 0) + 1;
    }

    const doubleWords = Object.entries(doubleMap)
      .filter(([_, count]) => count > 1)
      .map(([word, count]) => ({
        word,
        count,
        density: Number(((count / (totalWords - 1)) * 100).toFixed(1)),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    return { singleWords, doubleWords };
  }, [text]);

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setText('');
    hasTriggeredStart.current = false;
  };

  const handleSampleText = () => {
    const sample = `Search Engine Optimization (SEO) is the process of improving the quality and quantity of website traffic from search engines. High-ranking content prioritizes user search intent, comprehensive topic coverage, and optimal keyword density.

When drafting SEO blog posts or landing pages, webmasters typically target an average content length between 1,500 and 2,500 words to answer user queries thoroughly. Simultaneously, keeping key search phrases between 1% and 2.5% density prevents keyword stuffing penalties from Google algorithms.

SmallSEOTools provides instantaneous, client-side linguistic analysis. By verifying sentence structures, character limits for meta titles (under 60 chars) and meta descriptions (under 160 chars), digital marketers can optimize on-page performance before publishing!`;
    setText(sample);
  };

  const handleCaseChange = (mode: 'upper' | 'lower' | 'title' | 'sentence' | 'clean_spaces') => {
    if (!text) return;
    if (mode === 'upper') {
      setText(text.toUpperCase());
    } else if (mode === 'lower') {
      setText(text.toLowerCase());
    } else if (mode === 'title') {
      setText(
        text.replace(
          /\w\S*/g,
          txt => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
        )
      );
    } else if (mode === 'sentence') {
      setText(
        text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase())
      );
    } else if (mode === 'clean_spaces') {
      setText(text.replace(/[ \t]+/g, ' ').replace(/\n\s*\n/g, '\n\n').trim());
    }
  };

  const handleExportTxt = () => {
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seo-content-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (typeof content === 'string') {
        setText(content);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // SEO Grade estimate based on sentence length and syllables
  const seoReadingGrade = useMemo(() => {
    if (stats.words === 0 || stats.sentences === 0) return 'Ready';
    const wordsPerSentence = stats.words / stats.sentences;
    if (wordsPerSentence <= 14) return 'Good (Easy to Read)';
    if (wordsPerSentence <= 20) return 'Standard (Recommended)';
    if (wordsPerSentence <= 28) return 'Fairly Difficult';
    return 'Very Complex (Shorten Sentences)';
  }, [stats.words, stats.sentences]);

  return (
    <div className="space-y-6">
      {/* SmallSEOTools Privacy & Security Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-emerald-900">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <strong className="font-semibold block text-emerald-950">100% Free & Confidential SEO Text Analysis</strong>
            <span className="text-emerald-800 text-[11px]">
              Processed instantaneously on your machine with zero server upload. Your draft content is never stored, tracked, or cached.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] text-emerald-800 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Speed: {isProcessing ? 'Calculating...' : `${stats.processingTimeMs} ms`}</span>
        </div>
      </div>

      {/* Primary SmallSEOTools Counter Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {showWords && (
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-500 transition-colors">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Words</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-blue-600 font-mono block mt-1">
              {stats.words.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block">Live Count</span>
          </div>
        )}

        {showChars && (
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-500 transition-colors">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Characters</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono block mt-1">
              {stats.characters.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block">With spaces</span>
          </div>
        )}

        {showCharsNoSpaces && (
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-500 transition-colors">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Characters</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono block mt-1">
              {stats.charactersNoSpaces.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block">No spaces</span>
          </div>
        )}

        {showSentences && (
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-500 transition-colors">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Sentences</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono block mt-1">
              {stats.sentences.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block">Avg {stats.sentences > 0 ? (stats.words / stats.sentences).toFixed(1) : 0} w/sent</span>
          </div>
        )}

        {showParagraphs && (
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-500 transition-colors">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Paragraphs</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono block mt-1">
              {stats.paragraphs.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block">Blocks</span>
          </div>
        )}

        {showReadingTime && (
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-500 transition-colors">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>Reading</span>
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono block mt-1">
              {stats.readingTimeFormatted}
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block">@ {readingSpeedWpm} WPM</span>
          </div>
        )}

        {showSpeakingTime && (
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-500 transition-colors">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
              <Mic className="w-3 h-3 text-slate-400" />
              <span>Speaking</span>
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono block mt-1">
              {stats.speakingTimeFormatted}
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block">@ {speakingSpeedWpm} WPM</span>
          </div>
        )}
      </div>

      {/* Workspace Tabs: Editor / Keyword Density */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab('editor')}
            className={`pb-2 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border-b-2 ${
              activeTab === 'editor'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <AlignLeft className="w-3.5 h-3.5" />
            <span>Text Editor &amp; Formatter</span>
          </button>
          <button
            onClick={() => setActiveTab('density')}
            className={`pb-2 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border-b-2 ${
              activeTab === 'density'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>SEO Keyword Density ({keywordDensity.singleWords.length})</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 hidden sm:flex items-center gap-2">
          <span>Readability:</span>
          <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            {seoReadingGrade}
          </span>
        </div>
      </div>

      {activeTab === 'editor' ? (
        /* Main Text Area & Toolbar Container */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          {/* Action Toolbar */}
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={handleSampleText}
                className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg font-medium cursor-pointer transition-colors flex items-center gap-1 shadow-2xs"
                title="Insert Sample SEO Text"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Sample SEO Text</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg font-medium cursor-pointer transition-colors flex items-center gap-1 shadow-2xs"
                title="Upload Text File"
              >
                <Upload className="w-3.5 h-3.5 text-slate-600" />
                <span>Upload File</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.rtf,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div className="h-4 w-px bg-slate-300 mx-1 hidden sm:block"></div>

              {/* Case Modifiers (SmallSEOTools signature) */}
              <button
                onClick={() => handleCaseChange('upper')}
                className="px-2 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg font-medium cursor-pointer transition-colors text-[11px]"
                title="Convert all to UPPERCASE"
              >
                UPPER
              </button>
              <button
                onClick={() => handleCaseChange('lower')}
                className="px-2 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg font-medium cursor-pointer transition-colors text-[11px]"
                title="Convert all to lowercase"
              >
                lower
              </button>
              <button
                onClick={() => handleCaseChange('title')}
                className="px-2 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg font-medium cursor-pointer transition-colors text-[11px]"
                title="Convert to Title Case"
              >
                Title Case
              </button>
              <button
                onClick={() => handleCaseChange('clean_spaces')}
                className="px-2 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg font-medium cursor-pointer transition-colors text-[11px]"
                title="Remove redundant spaces"
              >
                Clean Spaces
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCopy}
                disabled={!text}
                className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 text-slate-700 rounded-lg font-medium cursor-pointer transition-colors flex items-center gap-1 shadow-2xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>

              <button
                onClick={handleExportTxt}
                disabled={!text}
                className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 text-slate-700 rounded-lg font-medium cursor-pointer transition-colors flex items-center gap-1 shadow-2xs"
                title="Download as .txt"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export TXT</span>
              </button>

              <button
                onClick={handleClear}
                disabled={!text}
                className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 disabled:opacity-40 text-red-600 rounded-lg font-medium cursor-pointer transition-colors flex items-center gap-1"
                title="Clear all text"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {/* Text Input Area */}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste your content here to begin instant word count, character count, sentence parsing, reading time, and keyword density check..."
            rows={12}
            className="w-full p-4 sm:p-6 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 border-none focus:outline-hidden leading-relaxed resize-y font-sans bg-white"
          />

          {/* Editor Footer Status Bar */}
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-[11px] text-slate-600 font-mono">
            <div className="flex items-center gap-4">
              <span>Avg Word Length: <strong className="text-slate-900">{stats.avgWordLength} chars</strong></span>
              <span>Encoding: <strong className="text-slate-900">UTF-16 Unicode</strong></span>
            </div>
            <div>
              <span>Engine: <strong className="text-blue-600">Zero-Latency Client-Side Worker</strong></span>
            </div>
          </div>
        </div>
      ) : (
        /* SEO Keyword Density Table (SmallSEOTools hallmark feature!) */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Keyword Density Analysis</h3>
              <p className="text-xs text-slate-500">
                Search engines analyze repeated phrases. Keep primary target keywords between 1.0% and 2.5% density to avoid keyword stuffing.
              </p>
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
              Total Counted Words: {stats.words}
            </span>
          </div>

          {keywordDensity.singleWords.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              Enter or paste text in the editor to see your keyword density breakdown.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Single Word Density */}
              <div>
                <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2.5">
                  Top Single Keywords
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                      <tr>
                        <th className="py-2 px-3">Keyword</th>
                        <th className="py-2 px-3 text-center">Repeats</th>
                        <th className="py-2 px-3 text-right">Density</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {keywordDensity.singleWords.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-sans font-medium text-slate-800">{item.word}</td>
                          <td className="py-2 px-3 text-center text-slate-600">{item.count}</td>
                          <td className="py-2 px-3 text-right">
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                              item.density > 3.0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-50 text-emerald-700'
                            }`}>
                              {item.density}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Two-Word Phrases Density */}
              <div>
                <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2.5">
                  Top 2-Word Keyphrases
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                      <tr>
                        <th className="py-2 px-3">Phrase</th>
                        <th className="py-2 px-3 text-center">Repeats</th>
                        <th className="py-2 px-3 text-right">Density</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {keywordDensity.doubleWords.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="py-4 text-center text-slate-400 font-sans text-xs">
                            No repeating 2-word keyphrases detected yet.
                          </td>
                        </tr>
                      ) : (
                        keywordDensity.doubleWords.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-sans font-medium text-slate-800">{item.word}</td>
                            <td className="py-2 px-3 text-center text-slate-600">{item.count}</td>
                            <td className="py-2 px-3 text-right">
                              <span className="inline-block px-1.5 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700">
                                {item.density}%
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Counting Rules Drawer */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden text-xs">
        <button
          onClick={() => setShowRules(!showRules)}
          className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2 text-slate-800 font-semibold">
            <Zap className="w-4 h-4 text-blue-600" />
            <span>Deterministic Word &amp; Character Counting Standards</span>
          </div>
          {showRules ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {showRules && (
          <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-3 text-slate-600 font-sans leading-relaxed">
            <p>
              SmallSEOTools uses deterministic parsing algorithms to deliver reliable metrics for webmasters, SEO copywriters, and developers:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 font-mono text-[11px]">
              <li><strong className="text-slate-900 font-sans">Words:</strong> Counted by tokenizing across whitespace boundaries (<code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">\s+</code>). CJK characters (Chinese, Japanese, Korean) are counted individually according to international SEO norms.</li>
              <li><strong className="text-slate-900 font-sans">Characters:</strong> Total code point string length. Emojis, UTF-16 surrogate pairs, and special symbols are measured correctly.</li>
              <li><strong className="text-slate-900 font-sans">Sentences:</strong> Segmented using sentence-terminating punctuation (<code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">. ! ? 。 ！？</code>). Decimal numbers (e.g., 3.14) and abbreviations do not falsely split sentences.</li>
              <li><strong className="text-slate-900 font-sans">Paragraphs:</strong> Discrete non-empty content blocks separated by double line breaks (<code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">\n\n</code>).</li>
              <li><strong className="text-slate-900 font-sans">Reading &amp; Speaking Times:</strong> Evaluated using the standard reading baseline ({readingSpeedWpm} WPM silent reading, {speakingSpeedWpm} WPM speaking).</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
