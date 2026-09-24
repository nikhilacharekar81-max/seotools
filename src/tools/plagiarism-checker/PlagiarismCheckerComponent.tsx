import React, { useState, useRef, useEffect, useMemo } from 'react';
import axios from 'axios';
import { usePlatform } from '../../context/PlatformContext';
import { ToolModule } from '../../types';
import { 
  ShieldCheck, 
  FileText, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  Check, 
  Upload, 
  Trash2, 
  RefreshCw, 
  Printer, 
  Download, 
  ChevronDown, 
  ChevronUp, 
  X,
  FileCheck,
  Zap,
  Sparkles,
  BarChart2,
  AlignLeft,
  Clock,
  Globe,
  HelpCircle,
  Info,
  Server,
  Link
} from 'lucide-react';
import { 
  countWords, 
  splitIntoSentences, 
  computeDetailedWordDiff,
  ScanSensitivity,
  PlagiarismReport, 
  SentenceAnalysis 
} from './engine';

const SAMPLE_TEXT = `Search engine optimization is the process of improving the quality and volume of website traffic from search engines to a website or web page. In modern digital marketing, high-quality content helps you connect directly with your audience. We write clear guides to help students, writers, and small business owners check their work for duplicate text before hitting publish.`;

const MAX_WORD_LIMIT = 1000;

export interface PlagiarismCheckerProps {
  tool?: ToolModule;
}

export interface SessionHistoryItem {
  id: string;
  timestamp: string;
  fullText: string;
  wordCount: number;
  matchingPercentage: number;
  sensitivity: ScanSensitivity;
}

export const PlagiarismCheckerComponent: React.FC<PlagiarismCheckerProps> = ({ tool }) => {
  const { addLog, setPublicRoute } = usePlatform();

  // Mode Selection: 'text' or 'url' (Phase 12 & 19)
  const [inputType, setInputType] = useState<'text' | 'url'>('text');
  const [urlInput, setUrlInput] = useState<string>('');

  // Input states
  const [inputText, setInputText] = useState<string>('');
  const [excludeUrl, setExcludeUrl] = useState<string>('');
  const [sensitivity, setSensitivity] = useState<ScanSensitivity>('standard');
  const [isExcludeUrlOpen, setIsExcludeUrlOpen] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  // Active workspace tab
  const [activeTab, setActiveTab] = useState<'editor' | 'results' | 'sentences' | 'sources' | 'history'>('editor');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Session history state
  const [history, setHistory] = useState<SessionHistoryItem[]>([]);

  // Results state
  const [report, setReport] = useState<PlagiarismReport | null>(null);
  const [selectedSentence, setSelectedSentence] = useState<SentenceAnalysis | null>(null);
  const [sentenceFilter, setSentenceFilter] = useState<'all' | 'matching' | 'unique'>('all');
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Telemetry logs
  useEffect(() => {
    if (tool) {
      addLog('application', 'info', `Public tool view: "${tool.name}" (${tool.slug})`);
    }
  }, [tool?.id]);

  // Load session history on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('plagiarism_checker_history');
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch {}
  }, []);

  // Save history helper
  const saveToHistory = (item: SessionHistoryItem) => {
    try {
      const updated = [item, ...history.filter(h => h.id !== item.id)].slice(0, 5);
      setHistory(updated);
      sessionStorage.setItem('plagiarism_checker_history', JSON.stringify(updated));
    } catch {}
  };

  const clearHistory = () => {
    try {
      sessionStorage.removeItem('plagiarism_checker_history');
      setHistory([]);
    } catch {}
  };

  // Computed counts
  const wordCount = useMemo(() => countWords(inputText), [inputText]);
  const charCount = inputText.length;
  const sentenceCount = useMemo(() => splitIntoSentences(inputText).length, [inputText]);
  const isOverWordLimit = wordCount > MAX_WORD_LIMIT;

  // Real Backend Plagiarism Scan Handlers (Phase 11, 12, 19, 30)
  const handleRunCheck = async () => {
    setErrorMessage(null);

    if (inputType === 'text') {
      if (!inputText.trim()) {
        setErrorMessage('Please paste or type text into the box before checking.');
        return;
      }
      if (wordCount < 5) {
        setErrorMessage('Please provide at least 5 words to perform a meaningful scan.');
        return;
      }
      if (isOverWordLimit) {
        setErrorMessage(`Text exceeds the ${MAX_WORD_LIMIT} word limit. Please trim your text.`);
        return;
      }
    } else {
      if (!urlInput.trim() || !urlInput.startsWith('http')) {
        setErrorMessage('Please enter a valid webpage URL starting with http:// or https://');
        return;
      }
    }

    setIsChecking(true);

    try {
      let resultReport: PlagiarismReport;

      if (inputType === 'text') {
        const response = await axios.post('/api/plagiarism/scan', {
          text: inputText,
          excludedUrl: excludeUrl,
          sensitivity
        });
        resultReport = response.data;
      } else {
        const response = await axios.post('/api/plagiarism/scan-url', {
          url: urlInput,
          excludedUrl: excludeUrl,
          sensitivity
        });
        // Retrieve internal scan report nested inside the payload
        resultReport = response.data.report;
        setInputText(response.data.report.sentences.map((s: any) => s.originalText).join(' '));
      }

      setReport(resultReport);
      setSelectedSentence(resultReport.sentences.find(s => s.matchType !== 'none') || null);
      setIsChecking(false);
      setActiveTab('results');

      saveToHistory({
        id: resultReport.id,
        timestamp: resultReport.scannedAt,
        fullText: inputType === 'text' ? inputText : urlInput,
        wordCount: resultReport.totalWords,
        matchingPercentage: resultReport.matchingPercentage,
        sensitivity
      });

    } catch (err: any) {
      console.error('Scan API call failed:', err);
      const serverMessage = err.response?.data?.error || err.response?.data?.details;
      setErrorMessage(
        serverMessage || 'Unable to complete web-source verification at this time. Please check your internet connection or search provider keys.'
      );
      setIsChecking(false);
    }
  };

  const handleExportTxt = () => {
    if (!report) return;
    const content = `=====================================================
PLAGIARISM CHECK REPORT
=====================================================
Report ID: ${report.id}
Scanned Date: ${report.scannedAt}
Sensitivity Mode: ${sensitivity.toUpperCase()}

METRICS SUMMARY
-----------------------------------------------------
Total Words: ${report.totalWords}
Total Sentences: ${report.totalSentences}
Unique Text: ${report.noMatchPercentage}% (${report.noMatchSentencesCount} sentences)
Similarity Overlap: ${report.matchingPercentage}% (${report.matchingSentencesCount} sentences)
Exact Matches: ${report.exactMatchesCount}
Partial Matches: ${report.partialMatchesCount}
Verified Reference Sources: ${report.sources.length}

DETAILED SENTENCE ANALYSIS
-----------------------------------------------------
${report.sentences.map((s, idx) => `[${idx + 1}] (${s.matchType.toUpperCase()}${s.similarityScore > 0 ? ` - ${s.similarityScore}%` : ''})
Passage: "${s.originalText}"
${s.matchedSource ? `Source: ${s.matchedSource.title} (${s.matchedSource.url})\nMatched Snippet: "${s.matchedSource.matchedSnippet}"` : 'No reference overlap detected.'}
`).join('\n')}
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plagiarism-report-${report.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJson = () => {
    if (!report) return;
    const data = JSON.stringify({ ...report, scanSensitivity: sensitivity }, null, 2);
    const blob = new Blob([data], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plagiarism-report-${report.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 2 MB limit.');
      return;
    }

    const fileName = file.name.toLowerCase();
    const isPlainText = fileName.endsWith('.txt') || fileName.endsWith('.md');
    if (!isPlainText) {
      setErrorMessage('Only plain text (.txt) and Markdown (.md) documents are currently supported.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setInputText(content);
        setReport(null);
        setActiveTab('editor');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(label);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  const filteredSentences = report ? report.sentences.filter(s => {
    if (sentenceFilter === 'matching') return s.matchType !== 'none';
    if (sentenceFilter === 'unique') return s.matchType === 'none';
    return true;
  }) : [];

  return (
    <div className="space-y-8">
      {/* Hero Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Free Online Plagiarism Checker
                </h1>
                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                  Genuine Web Scan
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
                Scan your writing to detect matching sentences, identify real reference web sources, and verify your citations with complete privacy.
              </p>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end gap-2 text-xs font-mono text-slate-500 shrink-0">
            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 font-semibold">
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              <span>Real-Time Check</span>
            </span>
          </div>
        </div>
      </div>

      {/* Input Type Selector Toggles (Phase 12, 19) */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200 max-w-sm">
        <button
          type="button"
          onClick={() => { setInputType('text'); setErrorMessage(null); }}
          className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
            inputType === 'text' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Scan Document Text</span>
        </button>
        <button
          type="button"
          onClick={() => { setInputType('url'); setErrorMessage(null); }}
          className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
            inputType === 'url' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Link className="w-3.5 h-3.5" />
          <span>Scan Webpage URL</span>
        </button>
      </div>

      {/* Primary KPI Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Words Counted</span>
          <span className="text-2xl font-extrabold text-blue-600 font-mono block mt-1">
            {report ? report.totalWords : wordCount}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Max {MAX_WORD_LIMIT}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Unique Score</span>
          <span className="text-2xl font-extrabold text-emerald-600 font-mono block mt-1">
            {report ? `${report.noMatchPercentage}%` : '---'}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Original content</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Similarity Overlap</span>
          <span className={`text-2xl font-extrabold font-mono block mt-1 ${report && report.matchingPercentage > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
            {report ? `${report.matchingPercentage}%` : '---'}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Matches found</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Exact matches</span>
          <span className="text-2xl font-extrabold text-rose-600 font-mono block mt-1">
            {report ? report.exactMatchesCount : '---'}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Word-for-word</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Verified Sources</span>
          <span className="text-2xl font-extrabold text-slate-800 font-mono block mt-1">
            {report ? report.sources.length : '---'}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Verifiable URLs</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-4 overflow-x-auto py-1">
          <button
            type="button"
            onClick={() => setActiveTab('editor')}
            className={`pb-2 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
              activeTab === 'editor' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <AlignLeft className="w-3.5 h-3.5" />
            <span>Editor &amp; Parameters</span>
          </button>

          {report && (
            <>
              <button
                type="button"
                onClick={() => setActiveTab('results')}
                className={`pb-2 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
                  activeTab === 'results' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Interactive Highlighting ({report.matchingPercentage}% Match)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('sentences')}
                className={`pb-2 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
                  activeTab === 'sentences' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>Sentence Breakdown ({report.sentences.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('sources')}
                className={`pb-2 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
                  activeTab === 'sources' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Verified Sources ({report.sources.length})</span>
              </button>
            </>
          )}

          {history.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`pb-2 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
                activeTab === 'history' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Recent Scans ({history.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Editor & Parameter Panel */}
      {activeTab === 'editor' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Editor Action Toolbar */}
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              {inputType === 'text' && (
                <>
                  <button
                    type="button"
                    onClick={() => { setInputText(SAMPLE_TEXT); setReport(null); setErrorMessage(null); }}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg font-medium cursor-pointer transition-colors flex items-center gap-1 shadow-2xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Try Sample Copy</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg font-medium cursor-pointer transition-colors flex items-center gap-1 shadow-2xs"
                  >
                    <Upload className="w-3.5 h-3.5 text-slate-600" />
                    <span>Upload Text file</span>
                  </button>
                  <input ref={fileInputRef} type="file" accept=".txt,.md" onChange={handleFileUpload} className="hidden" />
                </>
              )}

              {/* Strictness Selection */}
              {(['standard', 'strict', 'lenient'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setSensitivity(mode)}
                  className={`px-2 py-1.5 border rounded-lg font-medium cursor-pointer transition-colors text-[11px] ${
                    sensitivity === mode ? 'bg-blue-600 border-blue-600 text-white font-bold shadow-2xs' : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {mode === 'standard' ? 'Balanced' : mode === 'strict' ? 'Academic' : 'Lenient'}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setIsExcludeUrlOpen(!isExcludeUrlOpen)}
                className={`px-2.5 py-1.5 border rounded-lg font-medium cursor-pointer transition-colors text-[11px] flex items-center gap-1 ${
                  isExcludeUrlOpen || excludeUrl ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <span>Exclude My Domain</span>
                {isExcludeUrlOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              {inputText && inputType === 'text' && (
                <button
                  type="button"
                  onClick={() => { setInputText(''); setReport(null); setErrorMessage(null); }}
                  className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={handleRunCheck}
                disabled={isChecking || (inputType === 'text' ? (!inputText.trim() || isOverWordLimit) : !urlInput.trim())}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg font-bold cursor-pointer transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                {isChecking ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Scraping &amp; Checking Web...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    <span>Check Plagiarism</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Exclude URL Sub-Drawer */}
          {isExcludeUrlOpen && (
            <div className="p-3 bg-blue-50/60 border-b border-blue-100 flex flex-wrap items-center gap-3 text-xs">
              <span className="font-semibold text-blue-900">Ignore Matches From:</span>
              <input
                type="text"
                value={excludeUrl}
                onChange={(e) => setExcludeUrl(e.target.value)}
                placeholder="e.g. myportfolio.com"
                className="flex-1 max-w-md bg-white border border-blue-200 text-slate-800 text-xs px-3 py-1.5 rounded-lg focus:outline-blue-500"
              />
              <span className="text-[11px] text-blue-700">Skips references matching this domain during candidate scans.</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="m-3 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-700">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form Areas */}
          {inputType === 'text' ? (
            <textarea
              value={inputText}
              onChange={(e) => { setInputText(e.target.value); if (errorMessage) setErrorMessage(null); }}
              placeholder="Paste or write your original article or essay copy here to scan (up to 1,000 words)..."
              rows={10}
              className="w-full p-5 text-sm text-slate-900 placeholder:text-slate-400 border-none focus:outline-hidden leading-relaxed resize-y font-sans bg-white"
            />
          ) : (
            <div className="p-8 space-y-3 max-w-2xl">
              <label htmlFor="urlScannerInput" className="text-xs font-bold text-slate-700 block">Enter Webpage URL to fetch &amp; scan:</label>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-slate-400" />
                <input
                  id="urlScannerInput"
                  type="url"
                  value={urlInput}
                  onChange={(e) => { setUrlInput(e.target.value); if (errorMessage) setErrorMessage(null); }}
                  placeholder="https://en.wikipedia.org/wiki/GitHub"
                  className="flex-1 p-2.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Retrieves body content safely, resolves loopback subnets, sanitizes markup elements, and executes real comparison logic.
              </p>
            </div>
          )}

          {/* Editor Footer Status Bar */}
          {inputType === 'text' && (
            <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-[11px] text-slate-600 font-mono">
              <div className="flex items-center gap-4">
                <span className={isOverWordLimit ? 'text-rose-600 font-bold' : ''}>
                  Words: <strong className="text-slate-900">{wordCount}</strong> / {MAX_WORD_LIMIT}
                </span>
                <span>Characters: <strong className="text-slate-900">{charCount}</strong></span>
                <span>Sentences: <strong className="text-slate-900">{sentenceCount}</strong></span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Highlighting Inspector Panel */}
      {activeTab === 'results' && report && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-5 space-y-4">
          {report.searchStatus === 'SEARCH_ERROR' && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-900 text-xs font-medium space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Unable to complete web-source verification</span>
              </div>
              <p>The search indexing service failed to return candidate URLs. Results shown are limited to internal comparison checks.</p>
            </div>
          )}

          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">High-Contrast Highlight Scanner</h3>
            <button
              type="button"
              onClick={handleExportTxt}
              className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export TXT Report</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Highlighter Doc Panel */}
            <div className="lg:col-span-7 space-y-3">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl leading-relaxed text-sm text-slate-800 font-sans max-h-96 overflow-y-auto space-y-1">
                {report.sentences.map((sentence) => {
                  const isSelected = selectedSentence?.id === sentence.id;
                  if (sentence.matchType === 'exact') {
                    return (
                      <mark
                        key={sentence.id}
                        onClick={() => setSelectedSentence(sentence)}
                        className={`cursor-pointer rounded px-1 py-0.5 transition-all inline ${
                          isSelected ? 'bg-rose-300 ring-2 ring-rose-500 font-medium' : 'bg-rose-100 hover:bg-rose-200 text-rose-950'
                        }`}
                      >
                        {sentence.originalText}{' '}
                      </mark>
                    );
                  } else if (sentence.matchType === 'partial') {
                    return (
                      <mark
                        key={sentence.id}
                        onClick={() => setSelectedSentence(sentence)}
                        className={`cursor-pointer rounded px-1 py-0.5 transition-all inline ${
                          isSelected ? 'bg-amber-300 ring-2 ring-amber-500 font-medium' : 'bg-amber-100 hover:bg-amber-200 text-amber-950'
                        }`}
                      >
                        {sentence.originalText}{' '}
                      </mark>
                    );
                  } else {
                    return (
                      <span
                        key={sentence.id}
                        onClick={() => setSelectedSentence(sentence)}
                        className={`cursor-pointer rounded px-0.5 transition-all inline ${
                          isSelected ? 'bg-emerald-100 ring-1 ring-emerald-400' : 'hover:bg-slate-200/60'
                        }`}
                      >
                        {sentence.originalText}{' '}
                      </span>
                    );
                  }
                })}
              </div>

              {/* Legends */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-rose-200 border border-rose-300 block" /><span>Exact Match</span></span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-200 border border-amber-300 block" /><span>Near Match</span></span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-slate-100 border border-slate-300 block" /><span>Unique Sentence</span></span>
              </div>
            </div>

            {/* Match inspector panel */}
            <div className="lg:col-span-5 border border-slate-200 rounded-xl p-4 space-y-4 bg-slate-50/50 flex flex-col justify-between">
              {selectedSentence ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
                    <span className="font-bold text-slate-700">Sentence Inspector</span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      selectedSentence.matchType === 'exact' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {selectedSentence.similarityScore}% Similarity
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Your Sentence:</span>
                    <p className="text-xs font-medium text-slate-900 leading-relaxed p-2 bg-white rounded-lg border border-slate-200">
                      "{selectedSentence.originalText}"
                    </p>
                  </div>

                  {selectedSentence.matchedSource && (
                    <div className="space-y-2">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Source Web Text:</span>
                        <p className="text-xs text-slate-700 bg-white p-2 rounded-lg border border-slate-200 italic leading-relaxed">
                          "{selectedSentence.matchedSource.matchedSnippet}"
                        </p>
                      </div>

                      <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 block">Verified Matching Link:</span>
                        <a
                          href={selectedSentence.matchedSource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 break-all"
                        >
                          <span className="truncate">{selectedSentence.matchedSource.title || selectedSentence.matchedSource.url}</span>
                          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 text-xs">
                  Click any highlighted sentence to view its source comparison and similarity evidence.
                </div>
              )}

              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer text-center mt-3"
              >
                Back to editor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sentence Breakdown Tab */}
      {activeTab === 'sentences' && report && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Document Sentence Ledger</h3>
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setSentenceFilter('all')}
                className={`px-2.5 py-1 rounded-md ${sentenceFilter === 'all' ? 'bg-slate-200 text-slate-900' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                All ({report.sentences.length})
              </button>
              <button
                type="button"
                onClick={() => setSentenceFilter('matching')}
                className={`px-2.5 py-1 rounded-md ${sentenceFilter === 'matching' ? 'bg-rose-100 text-rose-800' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                Flagged ({report.matchingSentencesCount})
              </button>
              <button
                type="button"
                onClick={() => setSentenceFilter('unique')}
                className={`px-2.5 py-1 rounded-md ${sentenceFilter === 'unique' ? 'bg-emerald-100 text-emerald-800' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                Unique ({report.noMatchSentencesCount})
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto space-y-3">
            {filteredSentences.map((s, idx) => (
              <div key={s.id} className="py-3 flex flex-col sm:flex-row sm:items-start justify-between gap-4 text-xs">
                <div className="space-y-1 max-w-3xl">
                  <span className="font-mono text-slate-400 font-bold block">Sentence #{idx + 1}</span>
                  <p className="text-slate-800 font-medium leading-relaxed">"{s.originalText}"</p>
                  {s.matchedSource && (
                    <div className="flex items-center gap-1.5 pt-1 text-[11px] text-slate-500">
                      <span>Matches:</span>
                      <a href={s.matchedSource.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-0.5">
                        <span>{s.matchedSource.domain}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>

                <span className={`px-2.5 py-1 rounded-lg text-center font-bold font-mono self-start sm:self-auto ${
                  s.matchType === 'exact' ? 'bg-rose-50 text-rose-800 border border-rose-200' : s.matchType === 'partial' ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}>
                  {s.matchType === 'exact' ? 'Exact Match' : s.matchType === 'partial' ? 'Partial Match' : 'Unique'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verified Sources Tab */}
      {activeTab === 'sources' && report && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Verified Reference Sources</h3>
          {report.sources.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">No matching verified web references were discovered. Your text is 100% unique!</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.sources.map((src, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold font-mono uppercase tracking-wider block">Source #{idx + 1} ({src.domain})</span>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">{src.title}</h4>
                    <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 break-all">
                      <span>{src.url}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/50">
                    <span>Matched Sentences: <strong className="text-slate-800">{src.matchCount}</strong></span>
                    <span>Confidence: <strong className="text-indigo-600">{src.highestSimilarity}%</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Session History Tab */}
      {activeTab === 'history' && history.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Your Recent Scans</h3>
            <button
              type="button"
              onClick={clearHistory}
              className="px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
            >
              Clear Logs
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {history.map((h) => (
              <div key={h.id} className="py-3 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-800 block">Scan #{h.id}</span>
                  <span className="text-slate-500 text-[11px]">{h.timestamp}</span>
                </div>

                <div className="flex items-center gap-4">
                  <span>Words: <strong className="text-slate-800">{h.wordCount}</strong></span>
                  <span className={`px-2 py-0.5 rounded font-bold ${
                    h.matchingPercentage > 0 ? 'bg-rose-50 text-rose-800 border border-rose-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  }`}>
                    {h.matchingPercentage}% Match
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
