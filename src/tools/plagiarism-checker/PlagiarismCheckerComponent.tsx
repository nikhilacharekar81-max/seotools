import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  GraduationCap,
  PenTool,
  BookOpen,
  ArrowRight,
  Scale,
  FileQuestion,
  CheckCircle,
  HelpCircle,
  Info,
  SlidersHorizontal
} from 'lucide-react';
import { 
  runPlagiarismCheck, 
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
  const [showRules, setShowRules] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Session history state
  const [history, setHistory] = useState<SessionHistoryItem[]>([]);

  // Results state
  const [report, setReport] = useState<PlagiarismReport | null>(null);
  const [selectedSentence, setSelectedSentence] = useState<SentenceAnalysis | null>(null);
  const [sentenceFilter, setSentenceFilter] = useState<'all' | 'matching' | 'unique'>('all');
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasTriggeredStart = useRef(false);

  // Telemetry log on mount and first input
  useEffect(() => {
    if (tool) {
      addLog('application', 'info', `Public tool view: "${tool.name}" (${tool.slug})`);
    }
  }, [tool?.id]);

  useEffect(() => {
    if (inputText.length > 0 && !hasTriggeredStart.current && tool) {
      hasTriggeredStart.current = true;
      addLog('application', 'info', `Tool started: "${tool.slug}" (First input detected)`);
    }
  }, [inputText, tool?.slug]);

  // Load session history on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('plagiarism_checker_history');
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Save history helper
  const saveToHistory = (item: SessionHistoryItem) => {
    try {
      const updated = [item, ...history.filter(h => h.id !== item.id)].slice(0, 5);
      setHistory(updated);
      sessionStorage.setItem('plagiarism_checker_history', JSON.stringify(updated));
    } catch {
      // Ignore storage errors
    }
  };

  const clearHistory = () => {
    try {
      sessionStorage.removeItem('plagiarism_checker_history');
      setHistory([]);
    } catch {
      // Ignore storage errors
    }
  };

  // Computed counts
  const wordCount = useMemo(() => countWords(inputText), [inputText]);
  const charCount = inputText.length;
  const sentenceCount = useMemo(() => splitIntoSentences(inputText).length, [inputText]);
  const isOverWordLimit = wordCount > MAX_WORD_LIMIT;

  // Sync SEO Metadata and Structured Data
  useEffect(() => {
    const pageTitle = "Free Plagiarism Checker – Check Your Text for Free Online";
    const pageDesc = "Check your text for plagiarism for free. Scan essays, articles, and papers to find matching sentences, view original web sources, and check your citations.";
    const currentUrl = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : '';

    document.title = pageTitle;

    let metaDescEl = document.querySelector('meta[name="description"]');
    if (!metaDescEl) {
      metaDescEl = document.createElement('meta');
      metaDescEl.setAttribute('name', 'description');
      document.head.appendChild(metaDescEl);
    }
    metaDescEl.setAttribute('content', pageDesc);

    let canonicalEl = document.querySelector('link[rel="canonical"]');
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalEl);
    }
    if (currentUrl) {
      canonicalEl.setAttribute('href', currentUrl);
    }

    const setMeta = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', property);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('og:title', pageTitle);
    setMeta('og:description', pageDesc);
    setMeta('og:type', 'website');
    if (currentUrl) setMeta('og:url', currentUrl);

    const scriptId = 'plagiarism-checker-structured-data';
    let scriptEl = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = scriptId;
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }

    const structuredData = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebApplication",
          "name": "Free Online Plagiarism Checker",
          "description": pageDesc,
          "url": currentUrl,
          "applicationCategory": "UtilitiesApplication",
          "operatingSystem": "All",
          "browserRequirements": "Requires JavaScript. Requires HTML5.",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          }
        },
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": typeof window !== 'undefined' ? window.location.origin : ""
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Text Tools",
              "item": typeof window !== 'undefined' ? `${window.location.origin}/tools` : ""
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": "Plagiarism Checker",
              "item": currentUrl
            }
          ]
        },
        {
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "How does this plagiarism checker work?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "The tool breaks your text down into sentences and phrases, then compares those phrases against web pages and articles to find matching sentences."
              }
            },
            {
              "@type": "Question",
              "name": "Does this tool save or store my text?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "No. The scan runs entirely inside your web browser. Your essays, articles, and research are never saved to any database, sold, or shared."
              }
            },
            {
              "@type": "Question",
              "name": "What does my similarity percentage mean?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Your similarity score shows what portion of your text matches published pages online. It highlights word matches so you can check if you need to add quotes or citations."
              }
            },
            {
              "@type": "Question",
              "name": "Why was my original sentence highlighted?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Common everyday phrases (like 'according to recent research'), definitions, or technical terms often match existing websites. You can review each sentence to decide if you need to edit it."
              }
            },
            {
              "@type": "Question",
              "name": "How many words can I check at one time?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "You can check up to 1,000 words per scan for fast, accurate results."
              }
            }
          ]
        }
      ]
    };

    scriptEl.textContent = JSON.stringify(structuredData);

    return () => {
      const el = document.getElementById(scriptId);
      if (el) el.remove();
    };
  }, []);

  // Plagiarism Scan handler
  const handleRunCheck = () => {
    setErrorMessage(null);

    if (!inputText.trim()) {
      setErrorMessage('Please paste or type text into the box before checking.');
      return;
    }

    if (wordCount < 5) {
      setErrorMessage('Please provide at least 5 words to perform a meaningful text similarity scan.');
      return;
    }

    if (isOverWordLimit) {
      setErrorMessage(`Text exceeds the ${MAX_WORD_LIMIT} word limit. Please trim your text.`);
      return;
    }

    setIsChecking(true);

    setTimeout(() => {
      try {
        const result = runPlagiarismCheck(inputText, { excludedUrl: excludeUrl, sensitivity });
        setReport(result);
        setSelectedSentence(result.sentences.find(s => s.matchType !== 'none') || null);
        setIsChecking(false);
        setActiveTab('results');

        saveToHistory({
          id: result.id,
          timestamp: result.scannedAt,
          fullText: inputText,
          wordCount: result.totalWords,
          matchingPercentage: result.matchingPercentage,
          sensitivity
        });
      } catch {
        setErrorMessage('An unexpected error occurred during analysis. Please try again.');
        setIsChecking(false);
      }
    }, 380);
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
No Match Detected: ${report.noMatchPercentage}% (${report.noMatchSentencesCount} sentences)
Potentially Matching: ${report.matchingPercentage}% (${report.matchingSentencesCount} sentences)
Exact Matches: ${report.exactMatchesCount}
Partial Matches: ${report.partialMatchesCount}
Verified Reference Sources: ${report.sources.length}

DETAILED SENTENCE ANALYSIS
-----------------------------------------------------
${report.sentences.map((s, idx) => `[${idx + 1}] (${s.matchType.toUpperCase()}${s.similarityScore > 0 ? ` - ${s.similarityScore}%` : ''})
Passage: "${s.originalText}"
${s.matchedSource ? `Source: ${s.matchedSource.title} (${s.matchedSource.url})\nSnippet: "${s.matchedSource.matchedSnippet}"` : 'No reference overlap detected.'}
${s.suggestedAlternative ? `Suggested Alternative: "${s.suggestedAlternative}"` : ''}
`).join('\n')}

TECHNICAL DISCLAIMER
-----------------------------------------------------
This report represents lexical and shingling similarity metrics computed at the time of scanning. It does not constitute legal or academic confirmation of plagiarism.
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

  const handleSendToRewriter = (textToParaphrase: string) => {
    try {
      sessionStorage.setItem('article_rewriter_prefill', textToParaphrase);
    } catch {
      // Ignore storage errors
    }
    setPublicRoute({ page: 'tool', param: 'article-rewriter' });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 2 MB limit.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const fileName = file.name.toLowerCase();
    const isPlainText = fileName.endsWith('.txt') || fileName.endsWith('.md');
    if (!isPlainText) {
      setErrorMessage('Only plain text (.txt) and Markdown (.md) documents are currently supported.');
      if (fileInputRef.current) fileInputRef.current.value = '';
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
    reader.onerror = () => {
      setErrorMessage('Unable to read the selected file. Please try pasting the text directly.');
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
      {/* ========================================================================= */}
      {/* PART 5 — ABOVE-THE-FOLD HERO SECTION */}
      {/* ========================================================================= */}
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
                  Free Tool
                </span>
                <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  v2.1
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
                Check your text for matches against articles, essays, and websites across the web. 
                Just paste your writing below and click Check Plagiarism. It's free, runs in your browser, and never saves your work.
              </p>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end gap-2 text-xs font-mono text-slate-500 shrink-0">
            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 font-semibold">
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              <span>Instant Results</span>
            </span>
            <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>100% Private</span>
            </span>
          </div>
        </div>
      </div>

      {/* Privacy & Security Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-emerald-900">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <strong className="font-semibold block text-emerald-950">100% Free &amp; Private — We Don't Save Your Text</strong>
            <span className="text-emerald-800 text-[11px]">
              Your writing stays right inside your browser. We never store, sell, or share your essays, research, or articles.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] text-emerald-800 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Speed: {isChecking ? 'Checking...' : `${report ? report.durationMs : 0} ms`}</span>
        </div>
      </div>

      {/* Primary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* Words */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-500 transition-colors">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Words</span>
          <span className={`text-2xl sm:text-3xl font-extrabold font-mono block mt-1 ${isOverWordLimit ? 'text-rose-600' : 'text-blue-600'}`}>
            {wordCount.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">Max {MAX_WORD_LIMIT}</span>
        </div>

        {/* Characters */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-500 transition-colors">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Characters</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono block mt-1">
            {charCount.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">With spaces</span>
        </div>

        {/* Sentences */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-500 transition-colors">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Sentences</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono block mt-1">
            {sentenceCount.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">Total count</span>
        </div>

        {/* Original Content % */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-500 transition-colors">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span>Unique</span>
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono block mt-1">
            {report ? `${report.noMatchPercentage}%` : '---'}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">Original text</span>
        </div>

        {/* Matching Content % */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-500 transition-colors">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-rose-500" />
            <span>Matching</span>
          </span>
          <span className={`text-2xl sm:text-3xl font-extrabold font-mono block mt-1 ${report && report.matchingPercentage > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
            {report ? `${report.matchingPercentage}%` : '---'}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">Found online</span>
        </div>

        {/* Exact Matches */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-500 transition-colors">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Exact</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-rose-600 font-mono block mt-1">
            {report ? report.exactMatchesCount : '---'}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">Word-for-word</span>
        </div>

        {/* Verified Sources */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-500 transition-colors">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
            <Globe className="w-3 h-3 text-slate-400" />
            <span>Sources</span>
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono block mt-1">
            {report ? report.sources.length : '---'}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">Web pages</span>
        </div>
      </div>

      {/* Workspace Tabs: Editor / Results / Sentence Breakdown / Sources / History */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-4 overflow-x-auto py-1">
          <button
            onClick={() => setActiveTab('editor')}
            className={`pb-2 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
              activeTab === 'editor'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <AlignLeft className="w-3.5 h-3.5" />
            <span>Text Editor &amp; Scanner</span>
          </button>

          {report && (
            <>
              <button
                onClick={() => setActiveTab('results')}
                className={`pb-2 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
                  activeTab === 'results'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Interactive Results ({report.matchingPercentage}% Overlap)</span>
              </button>

              <button
                onClick={() => setActiveTab('sentences')}
                className={`pb-2 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
                  activeTab === 'sentences'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>Sentence Breakdown ({report.sentences.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('sources')}
                className={`pb-2 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
                  activeTab === 'sources'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Verified Sources ({report.sources.length})</span>
              </button>
            </>
          )}

          {history.length > 0 && (
            <button
              onClick={() => setActiveTab('history')}
              className={`pb-2 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
                activeTab === 'history'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Recent Scans ({history.length})</span>
            </button>
          )}
        </div>

        <div className="text-xs text-slate-500 hidden sm:flex items-center gap-2">
          <span>Scan Mode:</span>
          <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 capitalize">
            {sensitivity === 'standard' ? 'Balanced' : sensitivity === 'strict' ? 'Academic' : 'Lenient'}
          </span>
        </div>
      </div>

      {/* TAB 1: Main Text Area & Toolbar Container */}
      {activeTab === 'editor' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          {/* Action Toolbar */}
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setInputText(SAMPLE_TEXT);
                  setReport(null);
                  setErrorMessage(null);
                }}
                className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg font-medium cursor-pointer transition-colors flex items-center gap-1 shadow-2xs"
                title="Try with sample text"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Try Sample</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg font-medium cursor-pointer transition-colors flex items-center gap-1 shadow-2xs"
                title="Upload a text document (.txt or .md)"
              >
                <Upload className="w-3.5 h-3.5 text-slate-600" />
                <span>Upload File</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div className="h-4 w-px bg-slate-300 mx-1 hidden sm:block"></div>

              {/* Strictness Modifiers */}
              {(['standard', 'strict', 'lenient'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setSensitivity(mode)}
                  className={`px-2 py-1.5 border rounded-lg font-medium cursor-pointer transition-colors text-[11px] ${
                    sensitivity === mode
                      ? 'bg-blue-600 border-blue-600 text-white font-bold shadow-2xs'
                      : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                  title={
                    mode === 'strict'
                      ? 'Academic: Catches short matching phrases for essays and papers'
                      : mode === 'lenient'
                      ? 'Lenient: Only flags long, word-for-word matching sentences'
                      : 'Balanced: Recommended for general articles and web content'
                  }
                >
                  {mode === 'standard' ? 'Balanced' : mode === 'strict' ? 'Academic' : 'Lenient'}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setIsExcludeUrlOpen(!isExcludeUrlOpen)}
                className={`px-2.5 py-1.5 border rounded-lg font-medium cursor-pointer transition-colors text-[11px] flex items-center gap-1 ${
                  isExcludeUrlOpen || excludeUrl
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
                title="Ignore matches from your own published article or website"
              >
                <span>Ignore My URL</span>
                {isExcludeUrlOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              {report && (
                <button
                  type="button"
                  onClick={() => setActiveTab('results')}
                  className="px-2.5 py-1.5 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-800 rounded-lg font-medium cursor-pointer transition-colors flex items-center gap-1 shadow-2xs"
                >
                  <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>View Results →</span>
                </button>
              )}

              {inputText && (
                <button
                  type="button"
                  onClick={() => {
                    setInputText('');
                    setReport(null);
                    setErrorMessage(null);
                  }}
                  className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 disabled:opacity-40 text-red-600 rounded-lg font-medium cursor-pointer transition-colors flex items-center gap-1"
                  title="Clear text"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleRunCheck}
                disabled={isChecking || !inputText.trim() || isOverWordLimit}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg font-bold cursor-pointer transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                {isChecking ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Checking...</span>
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
                type="url"
                value={excludeUrl}
                onChange={(e) => setExcludeUrl(e.target.value)}
                placeholder="https://example.com/my-original-post"
                className="flex-1 max-w-md bg-white border border-blue-200 text-slate-800 text-xs px-3 py-1.5 rounded-lg focus:outline-blue-500"
              />
              <span className="text-[11px] text-blue-700">Matches from this specific link will be ignored so you don't flag your own published article.</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="m-3 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-700">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Textarea */}
          <textarea
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            placeholder="Paste your essay, article, assignment, or blog post here (up to 1,000 words) to check for duplicate sentences and find matching web sources..."
            rows={12}
            className="w-full p-4 sm:p-6 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 border-none focus:outline-hidden leading-relaxed resize-y font-sans bg-white"
          />

          {/* Editor Footer Status Bar */}
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-[11px] text-slate-600 font-mono">
            <div className="flex items-center gap-4">
              <span className={isOverWordLimit ? 'text-rose-600 font-bold' : ''}>
                Words: <strong className="text-slate-900">{wordCount}</strong> / {MAX_WORD_LIMIT}
              </span>
              <span>Characters: <strong className="text-slate-900">{charCount}</strong></span>
              <span>Sentences: <strong className="text-slate-900">{sentenceCount}</strong></span>
            </div>
            <div>
              <span>Engine: <strong className="text-blue-600">Fast In-Browser Comparison</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Interactive In-Document Results & Match Inspector */}
      {activeTab === 'results' && report && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Results Sub-Header */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 font-mono">
                <span className="font-bold text-slate-900">Report #{report.id}</span>
                <span className="text-slate-400">·</span>
                <span>{report.scannedAt}</span>
                <span className="text-slate-400">·</span>
                <span className="text-emerald-700 font-semibold">{report.durationMs}ms</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(true)}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg font-medium cursor-pointer transition-colors flex items-center gap-1 shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5 text-blue-600" />
                  <span>Print / PDF Report</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportTxt}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg font-medium cursor-pointer transition-colors flex items-center gap-1 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export TXT</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('editor')}
                  className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium cursor-pointer transition-colors flex items-center gap-1"
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                  <span>Back to Editor</span>
                </button>
              </div>
            </div>

            {/* Split Inspection View */}
            <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Document Highlighter (Left Column) */}
              <div className="lg:col-span-7 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 uppercase tracking-wider">
                    Interactive Document Text
                  </span>
                  <span className="text-slate-400">Click highlighted sentences to inspect</span>
                </div>

                <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl leading-relaxed text-sm text-slate-800 font-sans max-h-[460px] overflow-y-auto space-y-1.5">
                  {report.sentences.map((sentence) => {
                    const isSelected = selectedSentence?.id === sentence.id;
                    if (sentence.matchType === 'exact') {
                      return (
                        <mark
                          key={sentence.id}
                          onClick={() => setSelectedSentence(sentence)}
                          className={`cursor-pointer rounded px-1 py-0.5 transition-all inline ${
                            isSelected 
                              ? 'bg-rose-300 ring-2 ring-rose-500 font-medium' 
                              : 'bg-rose-100 hover:bg-rose-200 text-rose-950'
                          }`}
                          title="Exact Match Detected (Click to inspect)"
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
                            isSelected 
                              ? 'bg-amber-300 ring-2 ring-amber-500 font-medium' 
                              : 'bg-amber-100 hover:bg-amber-200 text-amber-950'
                          }`}
                          title="Partial Match Detected (Click to inspect)"
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

                {/* Highlighting Legend */}
                <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-rose-200 border border-rose-400"></span>
                    <span>Exact Match</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-amber-200 border border-amber-400"></span>
                    <span>Partial Overlap</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-slate-100 border border-slate-300"></span>
                    <span>No Match Found</span>
                  </span>
                </div>
              </div>

              {/* Side-by-Side Match Inspector (Right Column) */}
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
                {selectedSentence ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Match Inspector
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        selectedSentence.matchType === 'exact' 
                          ? 'bg-rose-100 text-rose-700' 
                          : selectedSentence.matchType === 'partial' 
                          ? 'bg-amber-100 text-amber-700' 
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {selectedSentence.matchType === 'exact' 
                          ? `${selectedSentence.similarityScore}% Exact Match` 
                          : selectedSentence.matchType === 'partial' 
                          ? `${selectedSentence.similarityScore}% Similarity` 
                          : 'No Match Detected'}
                      </span>
                    </div>

                    {/* Submitted Sentence */}
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                        Submitted Sentence:
                      </span>
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed font-mono">
                        {selectedSentence.originalText}
                      </div>
                    </div>

                    {/* Matched Source */}
                    {selectedSentence.matchedSource ? (
                      <div className="space-y-2">
                        <span className="text-[11px] font-bold text-slate-500 uppercase block">
                          Verified Reference Source:
                        </span>
                        <div className="p-3 rounded-lg bg-rose-50/50 border border-rose-200 text-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-rose-900 truncate">
                              {selectedSentence.matchedSource.title}
                            </span>
                            <a
                              href={selectedSentence.matchedSource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-rose-700 hover:text-rose-900 flex items-center gap-1 font-bold text-[11px] shrink-0"
                            >
                              <span>Visit</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>

                          <p className="text-slate-600 italic">
                            "{selectedSentence.matchedSource.matchedSnippet}"
                          </p>

                          {/* Word-level comparison diff */}
                          <div className="pt-2 border-t border-rose-200/60">
                            {(() => {
                              const diff = computeDetailedWordDiff(selectedSentence.originalText, selectedSentence.matchedSource.matchedSnippet);
                              return (
                                <div>
                                  <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-[11px] font-semibold text-slate-700">
                                      Word-Level Overlap Diff:
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-mono">
                                      {diff.exactOverlapCount} shared tokens
                                    </span>
                                  </div>
                                  <div className="p-2 bg-white rounded-lg border border-rose-200/60 flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                                    {diff.userTokens.map((item, idx) => (
                                      <span
                                        key={idx}
                                        className={`px-1 py-0.5 rounded text-[11px] font-mono ${
                                          item.status === 'exact-match'
                                            ? 'bg-rose-100 text-rose-950 font-bold border border-rose-200'
                                            : item.status === 'partial-match'
                                            ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                            : 'text-slate-600 bg-slate-50'
                                        }`}
                                      >
                                        {item.word}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>This sentence exhibits no matching patterns in our indexed reference corpus.</span>
                      </div>
                    )}

                    {/* Action to Article Rewriter */}
                    {selectedSentence.matchType !== 'none' && (
                      <button
                        type="button"
                        onClick={() => handleSendToRewriter(selectedSentence.originalText)}
                        className="w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        title="Open Article Rewriter with this flagged sentence"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Paraphrase in Article Rewriter →</span>
                      </button>
                    )}

                    {/* Suggested Alternative */}
                    {selectedSentence.suggestedAlternative && (
                      <div className="pt-2 border-t border-slate-100">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-bold text-slate-600 uppercase">
                            Suggested Alternative:
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(selectedSentence.suggestedAlternative!, 'phrasing')}
                            className="text-blue-600 hover:text-blue-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            {copySuccess === 'phrasing' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            <span>{copySuccess === 'phrasing' ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200 italic">
                          "{selectedSentence.suggestedAlternative}"
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                    <Search className="w-8 h-8 mb-2 stroke-1" />
                    <p className="text-xs">Click any sentence in the document view to inspect match details.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Sentence Breakdown Table */}
      {activeTab === 'sentences' && report && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Sentence-by-Sentence Audit</h3>
              <p className="text-xs text-slate-500">
                Detailed lexical scan of each sentence against the verified corpus.
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setSentenceFilter('all')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  sentenceFilter === 'all' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({report.sentences.length})
              </button>
              <button
                type="button"
                onClick={() => setSentenceFilter('matching')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  sentenceFilter === 'matching' ? 'bg-white shadow-xs text-rose-700' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Matching ({report.matchingSentencesCount})
              </button>
              <button
                type="button"
                onClick={() => setSentenceFilter('unique')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  sentenceFilter === 'unique' ? 'bg-white shadow-xs text-emerald-700' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                No Match ({report.noMatchSentencesCount})
              </button>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Sentence Content</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Reference Source</th>
                  <th className="py-2.5 px-3 text-right">Similarity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSentences.map((sent, idx) => (
                  <tr key={sent.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-2.5 px-3 text-slate-800 font-sans max-w-md">{sent.originalText}</td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                        sent.matchType === 'exact'
                          ? 'bg-rose-100 text-rose-800'
                          : sent.matchType === 'partial'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {sent.matchType === 'exact' ? 'Exact Match' : sent.matchType === 'partial' ? 'Partial' : 'No Match'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                      {sent.matchedSource ? (
                        <a
                          href={sent.matchedSource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1 font-medium"
                        >
                          <span>{sent.matchedSource.title}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-slate-400">---</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold">
                      <span className={sent.similarityScore > 0 ? 'text-rose-600' : 'text-slate-400'}>
                        {sent.similarityScore}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Verified Reference Sources Table */}
      {activeTab === 'sources' && report && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Verified Reference Sources</h3>
              <p className="text-xs text-slate-500">
                Sources from our reference index matching submitted phrases.
              </p>
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
              {report.sources.length} Sources Found
            </span>
          </div>

          {report.sources.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
              <p className="font-semibold text-slate-700">No matching sources detected.</p>
              <p className="text-slate-500 mt-1">Your content is free from documented corpus overlaps.</p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                  <tr>
                    <th className="py-2.5 px-3">Source Title</th>
                    <th className="py-2.5 px-3">Domain</th>
                    <th className="py-2.5 px-3 text-center">Matched Passages</th>
                    <th className="py-2.5 px-3 text-center">Highest Similarity</th>
                    <th className="py-2.5 px-3 text-right">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report.sources.map((src, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-medium text-slate-900">{src.title}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">{src.domain}</td>
                      <td className="py-2.5 px-3 text-center font-mono">{src.matchCount}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-rose-600">{src.highestSimilarity}%</td>
                      <td className="py-2.5 px-3 text-right">
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px]"
                        >
                          <span>Open Source</span>
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

      {/* TAB 5: Recent Scans History */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Scans in This Session</h3>
              <p className="text-xs text-slate-500">
                Stored temporarily in browser session memory. Cleared when you close the tab.
              </p>
            </div>
            {history.length > 0 && (
              <button
                type="button"
                onClick={clearHistory}
                className="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer underline"
              >
                Clear History
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              No recent scans found in this browser session.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {history.map((item) => (
                <div key={item.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between gap-2">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono font-bold text-slate-700">#{item.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.matchingPercentage > 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {item.matchingPercentage}% Match
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 italic">
                      "{item.fullText}"
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{item.wordCount} words · {item.sensitivity}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setInputText(item.fullText);
                        setSensitivity(item.sensitivity);
                        setActiveTab('editor');
                        setReport(null);
                      }}
                      className="text-blue-600 hover:text-blue-800 font-bold cursor-pointer"
                    >
                      Load into Editor →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}









      {/* Downloadable / Printable Report Modal */}
      {isReportModalOpen && report && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200 relative">
            <button
              type="button"
              onClick={() => setIsReportModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Printable Header */}
            <div className="text-center pb-6 border-b border-slate-200">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold mb-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>PLAGIARISM SCAN REPORT</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900">Text Similarity Summary</h3>
              <p className="text-xs text-slate-500 mt-1">Scanned: {report.scannedAt} · Report #{report.id}</p>
            </div>

            {/* Score Grid */}
            <div className="grid grid-cols-2 gap-4 py-6 border-b border-slate-100 text-center">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="block text-3xl font-black text-emerald-700">{report.noMatchPercentage}%</span>
                <span className="text-xs font-bold text-slate-700 uppercase">Original Text</span>
              </div>
              <div className="p-4 bg-rose-50 rounded-xl border border-rose-200">
                <span className="block text-3xl font-black text-rose-700">{report.matchingPercentage}%</span>
                <span className="text-xs font-bold text-slate-700 uppercase">Matching Text</span>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="py-4 space-y-2 text-xs border-b border-slate-100 text-slate-700">
              <div className="flex justify-between">
                <span>Total Words Checked:</span>
                <span className="font-bold">{report.totalWords}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Sentences Checked:</span>
                <span className="font-bold">{report.totalSentences}</span>
              </div>
              <div className="flex justify-between">
                <span>Exact Matches:</span>
                <span className="font-bold text-rose-600">{report.exactMatchesCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Partial Matches:</span>
                <span className="font-bold text-amber-600">{report.partialMatchesCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Sources Found:</span>
                <span className="font-bold">{report.sources.length}</span>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
              <strong>Notice:</strong> This report shows the text similarity found during your scan. It is provided as an editing tool to help you check citations and review your writing before submitting.
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportTxt}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Download plain text report"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span>Download .TXT</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportJson}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Export raw JSON audit data"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span>Export JSON</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
