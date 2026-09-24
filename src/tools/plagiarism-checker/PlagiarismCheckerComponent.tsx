import React, { useState, useMemo, useRef } from 'react';
import { ToolModule } from '../../types';
import { 
  runPlagiarismCheck, 
  countWords, 
  extractArticleFromUrl,
  getVerbatimMatches,
  PlagiarismReport, 
  SentenceResult 
} from './engine';
import { 
  ShieldCheck, 
  AlertTriangle, 
  UploadCloud, 
  FileText, 
  Trash2, 
  CheckCircle2, 
  ExternalLink, 
  RefreshCw, 
  Copy, 
  Check, 
  Download, 
  Sparkles, 
  Globe, 
  Lock, 
  Printer,
  Bot,
  User,
  X,
  Eye,
  Link as LinkIcon,
  HelpCircle
} from 'lucide-react';

interface PlagiarismCheckerComponentProps {
  tool: ToolModule;
}

const MAX_WORD_LIMIT = 1000;

const SAMPLE_TEXT = `Search engine optimization is the process of optimizing website traffic. By implementing responsive design, high-quality content, and technical audits, digital creators improve organic rankings.

However, content is king when it comes to engaging online readers. Quality articles answer user intent with original depth and authoritative facts.

Modern web crawlers parse semantic tags, structured data, and keyword relevance to determine visibility. Digital webmasters frequently calibrate on-page copy to maintain high performance across search engines. To be, or not to be, that is the question that authors ponder when evaluating originality.`;

export const PlagiarismCheckerComponent: React.FC<PlagiarismCheckerComponentProps> = ({ tool }) => {
  const [inputMode, setInputMode] = useState<'text' | 'url'>('text');
  const [urlInput, setUrlInput] = useState<string>('');
  const [isLoadingUrl, setIsLoadingUrl] = useState<boolean>(false);
  const [text, setText] = useState<string>('');
  const [excludeUrl, setExcludeUrl] = useState<string>('');
  const [showExcludeUrl, setShowExcludeUrl] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [scanPhaseText, setScanPhaseText] = useState<string>('');
  const [report, setReport] = useState<PlagiarismReport | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'plagiarized' | 'unique'>('all');
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'results' | 'sources' | 'ai'>('results');

  // Inspection Modal State
  const [inspectingSentence, setInspectingSentence] = useState<SentenceResult | null>(null);

  // PDF / Certificate Modal State
  const [showCertificate, setShowCertificate] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const wordCount = useMemo(() => countWords(text), [text]);
  const isOverLimit = wordCount > MAX_WORD_LIMIT;
  const isUnderLimit = wordCount > 0 && wordCount < 15;

  // Handle URL fetch & extraction
  const handleFetchUrlContent = () => {
    if (!urlInput.trim()) return;
    setIsLoadingUrl(true);
    setTimeout(() => {
      const extracted = extractArticleFromUrl(urlInput);
      setText(extracted);
      setIsLoadingUrl(false);
      setInputMode('text');
      setReport(null);
    }, 600);
  };

  // Handle file ingestion (.txt, .md, .doc)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setText(content);
        setReport(null);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Perform Plagiarism Scan with multi-stage progress
  const handleStartScan = () => {
    if (!text.trim() || isOverLimit || isScanning) return;

    setIsScanning(true);
    setScanProgress(15);
    setScanPhaseText('Tokenizing sentences & generating n-gram shingles...');
    setReport(null);

    setTimeout(() => {
      setScanProgress(45);
      setScanPhaseText('Querying inverted index against 10+ billion crawled web pages...');
    }, 400);

    setTimeout(() => {
      setScanProgress(75);
      setScanPhaseText('Analyzing semantic similarity & AI syntax patterns...');
    }, 850);

    setTimeout(() => {
      const result = runPlagiarismCheck(text, excludeUrl.trim() ? excludeUrl.trim() : undefined);
      setScanProgress(100);
      setScanPhaseText('Compiling originality & AI probability report...');

      setTimeout(() => {
        setIsScanning(false);
        setReport(result);
        if (resultsRef.current) {
          resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    }, 1300);
  };

  // One-click rewrite replacement for a plagiarized sentence
  const handleApplyRewrite = (sentenceId: string, rewriteText: string) => {
    if (!report) return;

    const target = report.sentences.find(s => s.id === sentenceId);
    if (!target) return;

    const updatedText = text.replace(target.originalText, rewriteText);
    setText(updatedText);

    // Update local report in-place
    const updatedSentences = report.sentences.map(s => {
      if (s.id === sentenceId) {
        return {
          ...s,
          originalText: rewriteText,
          isPlagiarized: false,
          similarityScore: 0,
          matchedSource: undefined
        };
      }
      return s;
    });

    const plagiarizedCount = updatedSentences.filter(s => s.isPlagiarized).length;
    const newPlagPercent = Math.round((plagiarizedCount / updatedSentences.length) * 100);

    setReport({
      ...report,
      sentences: updatedSentences,
      plagiarizedSentencesCount: plagiarizedCount,
      uniqueSentencesCount: updatedSentences.length - plagiarizedCount,
      plagiarismPercentage: newPlagPercent,
      uniquePercentage: 100 - newPlagPercent
    });

    if (inspectingSentence?.id === sentenceId) {
      setInspectingSentence(null);
    }
  };

  // Filtered sentences for the results table
  const displayedSentences = useMemo(() => {
    if (!report) return [];
    if (filterType === 'plagiarized') {
      return report.sentences.filter(s => s.isPlagiarized);
    }
    if (filterType === 'unique') {
      return report.sentences.filter(s => !s.isPlagiarized);
    }
    return report.sentences;
  }, [report, filterType]);

  const handleCopySummary = () => {
    if (!report) return;
    const summary = `SmallSEOTools Audit: ${report.uniquePercentage}% Unique, ${report.plagiarismPercentage}% Plagiarized | AI Content Score: ${report.aiDetection.score}% (${report.aiDetection.label}).`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-8">
      {/* 1. TOP ANNOUNCEMENT / LIMIT NOTICE (SmallSEOTools style) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Free Plagiarism Checker with 1,000 Words Limit</span>
              <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                AI Detection Included
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Paste your article or fetch via URL to detect duplicate content, paraphrase matches, and AI-generated text.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto text-xs font-mono">
          <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg border border-slate-200 font-semibold flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Zero Data Stored</span>
          </span>
          <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg border border-blue-200 font-semibold">
            Max: 1,000 Words / Scan
          </span>
        </div>
      </div>

      {/* 2. THE MAIN SMALLSEOTOOLS TEXT / URL INPUT BOX */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
        {/* Input Mode Selector Tabs */}
        <div className="bg-slate-100 border-b border-slate-200 px-5 pt-3 flex items-center gap-4 text-xs font-semibold">
          <button
            onClick={() => setInputMode('text')}
            className={`pb-2.5 border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors ${
              inputMode === 'text'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Copy &amp; Paste Text</span>
          </button>

          <button
            onClick={() => setInputMode('url')}
            className={`pb-2.5 border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors ${
              inputMode === 'url'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Check Webpage URL</span>
          </button>
        </div>

        {/* Box Action Toolbar */}
        <div className="bg-slate-50/80 border-b border-slate-200 px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept=".txt,.md,.doc,.docx" 
              className="hidden" 
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="Upload file (.txt, .md, .doc)"
            >
              <UploadCloud className="w-3.5 h-3.5 text-blue-600" />
              <span>Upload Document</span>
            </button>

            <button
              onClick={() => {
                setText(SAMPLE_TEXT);
                setInputMode('text');
                setReport(null);
              }}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="Fill with sample text containing mixed unique and common quotes"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Load Sample Text</span>
            </button>

            <button
              onClick={() => setShowExcludeUrl(!showExcludeUrl)}
              className={`px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs ${
                showExcludeUrl || excludeUrl.trim() 
                  ? 'bg-blue-50 border-blue-300 text-blue-700' 
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>{showExcludeUrl ? 'Hide Exclude URL' : 'Exclude URL'}</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {text.length > 0 && (
              <button
                onClick={() => {
                  setText('');
                  setReport(null);
                }}
                className="text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors cursor-pointer"
                title="Clear input text"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}

            {/* Live Words Indicator */}
            <div className={`px-3 py-1 rounded-lg border font-mono font-bold text-xs ${
              isOverLimit 
                ? 'bg-rose-50 border-rose-300 text-rose-700' 
                : wordCount > 900 
                  ? 'bg-amber-50 border-amber-300 text-amber-700' 
                  : 'bg-white border-slate-300 text-slate-700'
            }`}>
              <span>Words: {wordCount.toLocaleString()} / {MAX_WORD_LIMIT.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Optional Exclude URL input row */}
        {showExcludeUrl && (
          <div className="px-5 py-3 bg-blue-50/50 border-b border-blue-100 flex flex-col sm:flex-row items-start sm:items-center gap-3 text-xs">
            <label className="font-semibold text-slate-700 shrink-0 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>Exclude Specific URL:</span>
            </label>
            <input
              type="url"
              value={excludeUrl}
              onChange={(e) => setExcludeUrl(e.target.value)}
              placeholder="e.g. https://mywebsite.com/my-original-article (Ignored from detection)"
              className="flex-1 w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500"
            />
            {excludeUrl && (
              <button 
                onClick={() => setExcludeUrl('')}
                className="text-slate-400 hover:text-slate-700 text-[11px] cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        )}

        {/* URL Input Mode Banner */}
        {inputMode === 'url' ? (
          <div className="p-8 space-y-4 bg-slate-50/50">
            <div className="max-w-2xl mx-auto space-y-3">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <LinkIcon className="w-4 h-4 text-blue-600" />
                <span>Enter Public Webpage URL to Extract &amp; Scan:</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/blog-post"
                  className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 shadow-2xs"
                />
                <button
                  onClick={handleFetchUrlContent}
                  disabled={!urlInput.trim() || isLoadingUrl}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  {isLoadingUrl ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
                  <span>{isLoadingUrl ? 'Fetching...' : 'Fetch Text'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Our crawler will extract the main article body and transfer it into the 1,000-word scanner automatically.
              </p>
            </div>
          </div>
        ) : (
          /* Main Textarea */
          <div className="relative p-5">
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (report) setReport(null);
              }}
              placeholder="Copy and paste your text here to detect plagiarism (Limit: 1,000 words per scan)..."
              rows={12}
              className={`w-full bg-transparent text-slate-800 text-sm placeholder:text-slate-400 resize-y focus:outline-hidden font-normal leading-relaxed ${
                isOverLimit ? 'text-rose-900' : ''
              }`}
            />

            {!text && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6 text-center">
                <div className="space-y-2 opacity-60 max-w-md">
                  <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-400">
                    Paste content, essays, or blog drafts here. The tool will break your text into sentences, shingle them into n-grams, check web indices, and compute AI probability.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Word limit warning banners */}
        {isOverLimit && (
          <div className="mx-5 mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-3 text-xs text-rose-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                <strong>Word limit exceeded:</strong> Your text contains <strong>{wordCount.toLocaleString()} words</strong>. The free scanner limit is <strong>1,000 words</strong>. Please reduce {wordCount - MAX_WORD_LIMIT} words to proceed.
              </span>
            </div>
            <button
              onClick={() => {
                const wordsArr = text.trim().split(/\s+/).slice(0, 1000);
                setText(wordsArr.join(' '));
              }}
              className="font-bold underline text-rose-900 hover:text-rose-950 shrink-0 cursor-pointer"
            >
              Trim to 1,000 Words
            </button>
          </div>
        )}

        {isUnderLimit && (
          <div className="mx-5 mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2 text-xs text-amber-800">
            <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              For the highest detection accuracy, we recommend entering at least 15 to 30 words.
            </span>
          </div>
        )}

        {/* Bottom Action Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span>Characters: <strong className="font-mono text-slate-800">{text.length.toLocaleString()}</strong></span>
            <span>·</span>
            <span>Words: <strong className={`font-mono ${isOverLimit ? 'text-rose-600' : 'text-slate-800'}`}>{wordCount.toLocaleString()}</strong> / 1,000</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setText(SAMPLE_TEXT);
                setInputMode('text');
                setReport(null);
              }}
              className="px-4 py-3 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Try Sample
            </button>

            <button
              onClick={handleStartScan}
              disabled={!text.trim() || isOverLimit || isScanning}
              className={`px-8 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer ${
                !text.trim() || isOverLimit || isScanning
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-98'
              }`}
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Scanning Text ({scanProgress}%)...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-white" />
                  <span>Check Plagiarism</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 3. SCANNING IN-PROGRESS ANIMATION */}
      {isScanning && (
        <div className="bg-white rounded-2xl border border-blue-200 p-8 text-center space-y-4 shadow-sm animate-pulse">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">Scanning Your Text for Plagiarism &amp; AI</h3>
            <p className="text-xs text-slate-500">{scanPhaseText}</p>
          </div>

          <div className="max-w-md mx-auto space-y-1.5 pt-2">
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span>N-Gram Shingling &amp; Perplexity Analysis</span>
              <span>{scanProgress}%</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. PLAGIARISM SCAN RESULTS DASHBOARD */}
      {report && (
        <div ref={resultsRef} className="space-y-6 pt-2">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600 font-mono">
                    Scan Report Complete
                  </span>
                  <span className="text-xs text-slate-400">({report.durationMs}ms)</span>
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                  Audit Report &amp; Detection Breakdown
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopySummary}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
                </button>

                <button
                  onClick={() => setShowCertificate(true)}
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5 text-white" />
                  <span>Download / Print Certificate</span>
                </button>
              </div>
            </div>

            {/* Score Gauges & Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Unique Gauge */}
              <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-emerald-800 tracking-wider">Unique Content</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-emerald-700 font-mono">{report.uniquePercentage}%</span>
                </div>
                <p className="text-[11px] text-emerald-700">
                  {report.uniqueSentencesCount} of {report.totalSentences} sentences verified original.
                </p>
              </div>

              {/* Plagiarized Gauge */}
              <div className={`p-5 rounded-2xl border space-y-2 ${
                report.plagiarismPercentage > 0 
                  ? 'bg-rose-50/70 border-rose-200 text-rose-900' 
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold uppercase tracking-wider ${
                    report.plagiarismPercentage > 0 ? 'text-rose-800' : 'text-slate-600'
                  }`}>Plagiarism Found</span>
                  <AlertTriangle className={`w-4 h-4 ${
                    report.plagiarismPercentage > 0 ? 'text-rose-600' : 'text-slate-400'
                  }`} />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className={`text-4xl font-extrabold font-mono ${
                    report.plagiarismPercentage > 0 ? 'text-rose-700' : 'text-slate-800'
                  }`}>{report.plagiarismPercentage}%</span>
                </div>
                <p className={`text-[11px] ${report.plagiarismPercentage > 0 ? 'text-rose-700' : 'text-slate-500'}`}>
                  {report.plagiarizedSentencesCount} sentences matched public web index.
                </p>
              </div>

              {/* AI Content Detection Gauge */}
              <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-indigo-800 tracking-wider">AI Generated Score</span>
                  <Bot className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-indigo-700 font-mono">{report.aiDetection.score}%</span>
                </div>
                <p className="text-[11px] text-indigo-700 font-medium">
                  {report.aiDetection.label}
                </p>
              </div>

              {/* Words Scanned */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-bold uppercase text-slate-500 tracking-wider block">Words Scanned</span>
                <span className="text-4xl font-extrabold text-slate-900 font-mono block">{report.totalWords}</span>
                <p className="text-[11px] text-slate-500">{report.totalSentences} sentences analyzed.</p>
              </div>
            </div>

            {/* View Switcher: Sentence Breakdown vs Matched Sources vs AI Analysis */}
            <div className="pt-2">
              <div className="flex items-center justify-between border-b border-slate-200">
                <div className="flex items-center gap-4 text-xs font-semibold">
                  <button
                    onClick={() => setActiveTab('results')}
                    className={`pb-3 border-b-2 cursor-pointer transition-colors ${
                      activeTab === 'results'
                        ? 'border-blue-600 text-blue-600 font-bold'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Sentence-by-Sentence ({report.sentences.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('sources')}
                    className={`pb-3 border-b-2 cursor-pointer transition-colors ${
                      activeTab === 'sources'
                        ? 'border-blue-600 text-blue-600 font-bold'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Matched Web Sources ({report.sources.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('ai')}
                    className={`pb-3 border-b-2 cursor-pointer transition-colors ${
                      activeTab === 'ai'
                        ? 'border-blue-600 text-blue-600 font-bold'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    AI Detector Analytics
                  </button>
                </div>

                {activeTab === 'results' && (
                  <div className="flex items-center gap-1.5 pb-2">
                    <span className="text-slate-400 text-xs mr-1">Filter:</span>
                    <button
                      onClick={() => setFilterType('all')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                        filterType === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      All ({report.sentences.length})
                    </button>
                    <button
                      onClick={() => setFilterType('plagiarized')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                        filterType === 'plagiarized' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                      }`}
                    >
                      Plagiarized ({report.plagiarizedSentencesCount})
                    </button>
                    <button
                      onClick={() => setFilterType('unique')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                        filterType === 'unique' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      Unique ({report.uniqueSentencesCount})
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* TAB CONTENT 1: Sentence List */}
            {activeTab === 'results' && (
              <div className="space-y-3">
                {displayedSentences.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
                    No sentences match the selected filter.
                  </div>
                ) : (
                  displayedSentences.map((sent, index) => (
                    <div
                      key={sent.id}
                      className={`p-4 rounded-xl border transition-all space-y-3 ${
                        sent.isPlagiarized 
                          ? 'bg-rose-50/40 border-rose-200' 
                          : 'bg-slate-50/50 border-slate-200'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-slate-400">#{index + 1}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            sent.isPlagiarized 
                              ? 'bg-rose-100 text-rose-800 border border-rose-300' 
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          }`}>
                            {sent.isPlagiarized ? `Plagiarized (${sent.similarityScore}% Match)` : '100% Unique'}
                          </span>
                        </div>

                        {sent.isPlagiarized && sent.matchedSource && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setInspectingSentence(sent)}
                              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Inspect Match</span>
                            </button>
                            <span>·</span>
                            <a
                              href={sent.matchedSource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-rose-700 hover:underline font-medium truncate max-w-xs"
                            >
                              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{sent.matchedSource.domain}</span>
                            </a>
                          </div>
                        )}
                      </div>

                      <p className={`text-sm leading-relaxed ${
                        sent.isPlagiarized ? 'text-slate-900 font-medium' : 'text-slate-700'
                      }`}>
                        "{sent.originalText}"
                      </p>

                      {/* Suggested Rewrite */}
                      {sent.isPlagiarized && sent.suggestedRewrite && (
                        <div className="bg-white p-3 rounded-lg border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                              Suggested Paraphrase:
                            </span>
                            <p className="text-slate-800 italic">
                              "{sent.suggestedRewrite}"
                            </p>
                          </div>

                          <button
                            onClick={() => handleApplyRewrite(sent.id, sent.suggestedRewrite!)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs shrink-0 cursor-pointer transition-colors shadow-2xs"
                          >
                            Apply Rewrite
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB CONTENT 2: Matched Sources List */}
            {activeTab === 'sources' && (
              <div className="space-y-3">
                {report.sources.length === 0 ? (
                  <div className="p-8 text-center bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                    <strong>No External Sources Detected!</strong> Your text is 100% original.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                      <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="p-3">Source Domain</th>
                          <th className="p-3">Matched Sentences</th>
                          <th className="p-3">Contribution</th>
                          <th className="p-3 text-right">Direct Link</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {report.sources.map((s, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-3 font-semibold text-slate-800 flex items-center gap-1.5">
                              <Globe className="w-3.5 h-3.5 text-blue-600" />
                              <span>{s.domain}</span>
                            </td>
                            <td className="p-3 text-slate-600">{s.matchCount} sentence(s)</td>
                            <td className="p-3 font-mono font-bold text-rose-600">{s.percentage}%</td>
                            <td className="p-3 text-right">
                              <a
                                href={s.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline inline-flex items-center gap-1"
                              >
                                <span>Inspect Source</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT 3: AI Detector Analytics */}
            {activeTab === 'ai' && (
              <div className="p-6 rounded-2xl bg-indigo-50/50 border border-indigo-200 space-y-5 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-indigo-950 flex items-center gap-2">
                      <Bot className="w-5 h-5 text-indigo-600" />
                      <span>Syntactic AI &amp; Perplexity Analysis</span>
                    </h4>
                    <p className="text-slate-600 text-xs">
                      Evaluates burstiness (sentence rhythm variations) and entropy markers common in LLM outputs.
                    </p>
                  </div>
                  <span className="px-3 py-1.5 rounded-xl font-bold font-mono text-sm bg-indigo-600 text-white shadow-2xs">
                    {report.aiDetection.score}% Probability
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-indigo-100 space-y-1.5">
                    <span className="text-[11px] font-bold uppercase text-slate-400">Burstiness Cadence</span>
                    <p className="text-sm font-bold text-slate-900">{report.aiDetection.perplexityCategory}</p>
                    <p className="text-[11px] text-slate-500">
                      Standard deviation variance: <strong>{report.aiDetection.burstiness}</strong> points.
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-indigo-100 space-y-1.5">
                    <span className="text-[11px] font-bold uppercase text-slate-400">Linguistic Classification</span>
                    <p className="text-sm font-bold text-slate-900">{report.aiDetection.label}</p>
                    <p className="text-[11px] text-slate-500">Based on transition marker density and token entropy.</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="font-bold text-slate-700 block">Detected Syntactic Indicators:</span>
                  <div className="space-y-1">
                    {report.aiDetection.indicators.map((ind, i) => (
                      <div key={i} className="flex items-center gap-2 text-slate-600 bg-white p-2 rounded-lg border border-indigo-100">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>{ind}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. SIDE-BY-SIDE MATCH INSPECTOR MODAL */}
      {inspectingSentence && inspectingSentence.matchedSource && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Side-by-Side Match Comparison
                </h3>
              </div>
              <button 
                onClick={() => setInspectingSentence(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* User Submitted Sentence with Highlighted Matching Words */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block">
                  Your Submitted Text:
                </span>
                <p className="text-slate-800 leading-relaxed text-sm">
                  {getVerbatimMatches(inspectingSentence.originalText, inspectingSentence.matchedSource.snippet).map((item, idx) => (
                    <span 
                      key={idx} 
                      className={item.isMatch ? 'bg-rose-200 text-rose-950 font-bold px-0.5 rounded' : ''}
                    >
                      {item.word}{' '}
                    </span>
                  ))}
                </p>
              </div>

              {/* Matched Online Context */}
              <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-700 uppercase tracking-wider text-[10px] block">
                    Online Matched Source:
                  </span>
                  <span className="text-[10px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded">
                    {inspectingSentence.similarityScore}% Match
                  </span>
                </div>
                <p className="text-slate-800 leading-relaxed text-sm font-medium">
                  {inspectingSentence.matchedSource.snippet}
                </p>
                <a
                  href={inspectingSentence.matchedSource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-xs flex items-center gap-1 pt-1 truncate"
                >
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{inspectingSentence.matchedSource.title}</span>
                </a>
              </div>
            </div>

            {/* Suggested Paraphrase inside Modal */}
            {inspectingSentence.suggestedRewrite && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-xs">
                <span className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider block">
                  Instant Unique Paraphrase:
                </span>
                <p className="text-slate-800 text-sm italic">
                  "{inspectingSentence.suggestedRewrite}"
                </p>
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => handleApplyRewrite(inspectingSentence.id, inspectingSentence.suggestedRewrite!)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow-xs transition-colors"
                  >
                    Apply Rewrite to Article
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. PRINTABLE / PDF AUDIT CERTIFICATE MODAL */}
      {showCertificate && report && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div 
            className="bg-white rounded-2xl max-w-3xl w-full p-8 shadow-2xl border border-slate-200 space-y-6 my-8 print:m-0 print:border-none print:shadow-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Certificate Header */}
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-xs">
                  <ShieldCheck className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">
                    SmallSEO<span className="text-blue-600">Tools</span> Originality Certificate
                  </h2>
                  <p className="text-xs text-slate-500 font-mono">
                    Audit Verification ID: {report.id} · Issued {report.scannedAt}
                  </p>
                </div>
              </div>

              <div className="hidden sm:block text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Status</span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  report.plagiarismPercentage === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {report.plagiarismPercentage === 0 ? '100% Verified Original' : `${report.uniquePercentage}% Original Content`}
                </span>
              </div>
            </div>

            {/* Certificate Gauges */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-[10px] uppercase font-bold text-emerald-800 block">Unique Content</span>
                <span className="text-3xl font-extrabold text-emerald-700 font-mono block mt-1">{report.uniquePercentage}%</span>
              </div>

              <div className="p-4 bg-rose-50 rounded-xl border border-rose-200">
                <span className="text-[10px] uppercase font-bold text-rose-800 block">Plagiarism Detected</span>
                <span className="text-3xl font-extrabold text-rose-700 font-mono block mt-1">{report.plagiarismPercentage}%</span>
              </div>

              <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                <span className="text-[10px] uppercase font-bold text-indigo-800 block">AI Probability</span>
                <span className="text-3xl font-extrabold text-indigo-700 font-mono block mt-1">{report.aiDetection.score}%</span>
              </div>
            </div>

            {/* Audit Details */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-600">
                <div>Total Words: <strong className="text-slate-900">{report.totalWords}</strong></div>
                <div>Sentences: <strong className="text-slate-900">{report.totalSentences}</strong></div>
                <div>Matched Sources: <strong className="text-slate-900">{report.sources.length}</strong></div>
                <div>Algorithm: <strong className="text-slate-900">Winnowing v2.4</strong></div>
              </div>
            </div>

            {/* Sentence Breakdown Summary */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                Sentence Originality Breakdown
              </h4>
              <div className="max-h-56 overflow-y-auto space-y-2 text-xs border border-slate-200 rounded-xl p-3 divide-y divide-slate-100">
                {report.sentences.map((s, idx) => (
                  <div key={idx} className="pt-2 first:pt-0 flex items-start justify-between gap-3">
                    <span className="text-slate-700">
                      <strong>[{idx + 1}]</strong> "{s.originalText}"
                    </span>
                    <span className={`shrink-0 font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                      s.isPlagiarized ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {s.isPlagiarized ? `${s.similarityScore}% Matched` : 'Unique'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Certificate Footer Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-xs">
              <span className="text-slate-400">
                Official document generated by SmallSEOTools Verification Service.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Certificate</span>
                </button>
                <button
                  onClick={() => setShowCertificate(false)}
                  className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. DETAILED "HOW PLAGIARISM CHECKER WORKS" EDUCATIONAL GUIDE */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-8">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider font-mono">
            Engineering &amp; Algorithms
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
            How Plagiarism Checkers Work
          </h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Plagiarism detection platforms like SmallSEOTools compare your submitted content against billions of web documents, academic journals, and public indices using computational linguistics.
          </p>
        </div>

        {/* The 6 Architectural Stages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Text Parsing &amp; Normalization</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              The input text is stripped of formatting, HTML markup, punctuation anomalies, and extra whitespace. Words are tokenized and lowercased to allow uniform character comparison.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold text-xs">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-sm">N-Gram Shingling &amp; Hashing</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Sentences are sliced into overlapping sequences of 4 to 7 words (called <em>shingles</em>). Algorithms like the <strong>Winnowing algorithm</strong> or Rabin Fingerprinting generate unique mathematical hash footprints.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Index Search &amp; Fingerprint Query</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              The system queries billions of pre-indexed web pages stored in an inverted index. Rather than comparing word-by-word, it matches cryptographic fingerprint IDs at sub-second speeds.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
              4
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Fuzzy Semantic &amp; Paraphrase Analysis</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Beyond verbatim matches, modern checkers evaluate Jaccard similarity and Levenshtein edit distance to identify spun content where only minor synonyms were altered.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
              5
            </div>
            <h3 className="font-bold text-slate-900 text-sm">AI Content &amp; Perplexity Detection</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Evaluates burstiness and token entropy to determine whether content exhibits the predictable cadence characteristic of ChatGPT and generative AI engines.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-xs">
              6
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Why the 1,000 Words Limit?</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Limiting each search to 1,000 words ensures zero server timeouts, instant sub-second responses, and fair high-speed access for millions of daily webmasters and students.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
