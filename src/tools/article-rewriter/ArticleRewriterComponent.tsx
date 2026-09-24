import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ToolModule } from '../../types';
import { usePlatform } from '../../context/PlatformContext';
import { 
  RefreshCw, 
  Copy, 
  Check, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  SlidersHorizontal,
  Trash2,
  Download,
  Share2,
  FileText,
  Zap,
  BarChart3,
  BookOpen,
  Layers,
  HelpCircle,
  Hash,
  ChevronDown,
  CheckCircle2,
  Info
} from 'lucide-react';

interface ArticleRewriterProps {
  tool: ToolModule;
}

type RewriterMode = 'standard' | 'fluency' | 'academic' | 'shorten' | 'seo';

interface TokenItem {
  id: number;
  word: string;
  original: string;
  changed: boolean;
  synonyms: string[];
}

const EXPANDED_SYNONYMS: Record<string, { standard: string[]; fluency: string[]; academic: string[]; shorten: string[]; seo: string[] }> = {
  important: {
    standard: ['essential', 'crucial', 'key', 'main', 'notable'],
    fluency: ['vital', 'critical', 'valuable', 'meaningful'],
    academic: ['paramount', 'pivotal', 'momentous', 'consequential', 'substantive'],
    shorten: ['key', 'vital'],
    seo: ['high-priority', 'critical ranking factor', 'essential', 'fundamental']
  },
  process: {
    standard: ['procedure', 'system', 'workflow', 'method', 'technique'],
    fluency: ['steps', 'routine', 'practice', 'course of action'],
    academic: ['methodology', 'framework', 'operational mechanism', 'paradigm'],
    shorten: ['steps', 'method'],
    seo: ['optimization process', 'ranking framework', 'actionable methodology']
  },
  help: {
    standard: ['assist', 'support', 'aid', 'serve', 'enable'],
    fluency: ['make it easier for', 'guide', 'equip', 'facilitate'],
    academic: ['expedite', 'catalyze', 'bolster', 'reinforce'],
    shorten: ['aid', 'back'],
    seo: ['accelerate', 'power', 'strengthen organic reach for']
  },
  use: {
    standard: ['apply', 'employ', 'work with', 'utilize'],
    fluency: ['adopt', 'make use of', 'implement'],
    academic: ['deploy', 'operationalize', 'exercise', 'harness'],
    shorten: ['use', 'apply'],
    seo: ['implement', 'deploy for SEO', 'leverage effectively']
  },
  show: {
    standard: ['display', 'reveal', 'exhibit', 'present', 'indicate'],
    fluency: ['demonstrate', 'point out', 'highlight', 'clarify'],
    academic: ['exemplify', 'substantiate', 'manifest', 'elucidate'],
    shorten: ['show', 'prove'],
    seo: ['demonstrate SERP proof', 'reveal insights', 'signal']
  },
  create: {
    standard: ['generate', 'build', 'make', 'produce', 'craft'],
    fluency: ['put together', 'develop', 'shape', 'form'],
    academic: ['fabricate', 'formulate', 'instigate', 'synthesize'],
    shorten: ['make', 'build'],
    seo: ['publish ranking content', 'produce high-converting assets', 'craft']
  },
  good: {
    standard: ['strong', 'beneficial', 'effective', 'favorable', 'solid'],
    fluency: ['high-quality', 'reliable', 'helpful', 'sound'],
    academic: ['advantageous', 'meritorious', 'optimal', 'exemplary'],
    shorten: ['best', 'top'],
    seo: ['high-ranking', 'E-E-A-T compliant', 'authoritative']
  },
  find: {
    standard: ['discover', 'locate', 'identify', 'uncover', 'spot'],
    fluency: ['come across', 'pinpoint', 'track down'],
    academic: ['ascertain', 'detect', 'discern', 'isolate'],
    shorten: ['find', 'spot'],
    seo: ['uncover search volume', 'target intent', 'identify keywords']
  },
  increase: {
    standard: ['expand', 'boost', 'grow', 'raise', 'elevate'],
    fluency: ['scale up', 'step up', 'build up', 'maximize'],
    academic: ['augment', 'amplify', 'escalate', 'compound'],
    shorten: ['boost', 'grow'],
    seo: ['drive organic traffic', 'maximize CTR', 'scale impressions']
  },
  decrease: {
    standard: ['reduce', 'lower', 'cut', 'drop', 'lessen'],
    fluency: ['bring down', 'minimize', 'trim down'],
    academic: ['diminish', 'curtail', 'attenuate', 'mitigate'],
    shorten: ['cut', 'trim'],
    seo: ['reduce bounce rate', 'minimize crawl errors', 'lower churn']
  },
  content: {
    standard: ['articles', 'material', 'copy', 'information', 'assets'],
    fluency: ['written pieces', 'published work', 'posts'],
    academic: ['editorial discourse', 'substantive text', 'subject matter'],
    shorten: ['copy', 'text'],
    seo: ['high-quality SEO content', 'editorial assets', 'pillar content']
  },
  readers: {
    standard: ['audience', 'visitors', 'users', 'viewers', 'prospects'],
    fluency: ['website visitors', 'people reading', 'target audience'],
    academic: ['constituents', 'readership', 'interlocutors', 'stakeholders'],
    shorten: ['users', 'readers'],
    seo: ['engaged visitors', 'qualified organic traffic', 'target demographic']
  },
  traffic: {
    standard: ['visitors', 'audience inflow', 'site visits', 'reach'],
    fluency: ['web traffic', 'visitor numbers', 'online visits'],
    academic: ['inbound telemetry', 'aggregate user volume', 'distribution reach'],
    shorten: ['visits', 'traffic'],
    seo: ['organic search traffic', 'SERP clicks', 'targeted referral volume']
  },
  fast: {
    standard: ['quick', 'rapid', 'speedy', 'prompt', 'swift'],
    fluency: ['efficient', 'without delay', 'instantaneous'],
    academic: ['expeditious', 'accelerated', 'fleet-footed'],
    shorten: ['fast', 'quick'],
    seo: ['high-velocity', 'lightning-fast TTFB', 'rapid indexing']
  },
  easy: {
    standard: ['simple', 'straightforward', 'effortless', 'clear'],
    fluency: ['user-friendly', 'uncomplicated', 'manageable'],
    academic: ['facile', 'elementary', 'unencumbered'],
    shorten: ['simple', 'easy'],
    seo: ['frictionless conversion', 'seamlessly crawlable', 'intuitive']
  },
  best: {
    standard: ['top', 'finest', 'prime', 'leading', 'optimal'],
    fluency: ['most effective', 'first-rate', 'greatest'],
    academic: ['preeminent', 'unsurpassed', 'peerless'],
    shorten: ['top', 'best'],
    seo: ['highest-converting', '#1 ranking', 'industry-benchmark']
  },
  problem: {
    standard: ['issue', 'challenge', 'obstacle', 'trouble', 'difficulty'],
    fluency: ['bottleneck', 'complication', 'hitch'],
    academic: ['predicament', 'impediment', 'conundrum', 'pathology'],
    shorten: ['issue', 'snag'],
    seo: ['indexing roadblock', 'ranking impediment', 'technical defect']
  },
  improve: {
    standard: ['upgrade', 'enhance', 'refine', 'polish', 'boost'],
    fluency: ['make better', 'level up', 'sharpen'],
    academic: ['ameliorate', 'embellish', 'optimize', 'transmute'],
    shorten: ['hone', 'boost'],
    seo: ['optimize rankings', 'boost search authority', 'enhance CTR']
  },
  digital: {
    standard: ['online', 'web-based', 'electronic', 'virtual'],
    fluency: ['internet-based', 'modern', 'tech-enabled'],
    academic: ['computational', 'cybernetic', 'algorithmic'],
    shorten: ['online', 'web'],
    seo: ['search-optimized', 'omnichannel', 'web ecosystem']
  },
  effective: {
    standard: ['successful', 'productive', 'impactful', 'potent'],
    fluency: ['working well', 'proven', 'results-driven'],
    academic: ['efficacious', 'cogent', 'trenchant'],
    shorten: ['potent', 'proven'],
    seo: ['high-converting', 'SERP-dominant', 'top-performing']
  }
};

export const ArticleRewriterComponent: React.FC<ArticleRewriterProps> = ({ tool }) => {
  const { setPublicRoute } = usePlatform();
  const [inputText, setInputText] = useState<string>(
    'Search engine optimization is an important process to help digital creators increase organic website traffic. High-quality content engages online readers and helps find new customers.'
  );

  useEffect(() => {
    try {
      const prefill = sessionStorage.getItem('article_rewriter_prefill');
      if (prefill) {
        setInputText(prefill);
        sessionStorage.removeItem('article_rewriter_prefill');
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const [mode, setMode] = useState<RewriterMode>('standard');
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [rewrittenTokens, setRewrittenTokens] = useState<TokenItem[]>([]);
  const [copied, setCopied] = useState<boolean>(false);
  const [activePopoverIndex, setActivePopoverIndex] = useState<number | null>(null);

  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setActivePopoverIndex(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const wordCount = useMemo(() => {
    return inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  }, [inputText]);

  const outputWordCount = useMemo(() => {
    const full = rewrittenTokens.map(t => t.word).join('');
    return full.trim() ? full.trim().split(/\s+/).length : 0;
  }, [rewrittenTokens]);

  const changedWordsCount = useMemo(() => {
    return rewrittenTokens.filter(t => t.changed).length;
  }, [rewrittenTokens]);

  const modificationPercentage = useMemo(() => {
    if (!outputWordCount || outputWordCount === 0) return 0;
    return Math.min(100, Math.round((changedWordsCount / outputWordCount) * 100));
  }, [changedWordsCount, outputWordCount]);

  const handleRewrite = () => {
    if (!inputText.trim() || isSpinning) return;
    setIsSpinning(true);
    setActivePopoverIndex(null);

    setTimeout(() => {
      // Tokenize into words, spaces, punctuation
      const chunks = inputText.split(/(\s+|[.,!?;:()\[\]])/);
      let idCounter = 0;

      const tokens: TokenItem[] = chunks.map(chunk => {
        idCounter++;
        const cleanWord = chunk.replace(/^[^\w]+|[^\w]+$/g, '').toLowerCase();
        const synData = EXPANDED_SYNONYMS[cleanWord];

        if (synData) {
          const modeList = synData[mode] || synData.standard;
          const allOptions = Array.from(new Set([...modeList, ...synData.standard, ...synData.fluency, ...synData.academic]));
          
          let chosen = modeList[0] || synData.standard[0];
          if (mode === 'academic' && modeList.length > 1) chosen = modeList[0];
          if (mode === 'shorten' && modeList.length > 0) chosen = modeList[0];
          if (mode === 'seo' && modeList.length > 0) chosen = modeList[0];

          // Preserve exact punctuation wrap
          const leadingPunct = chunk.match(/^[^\w]+/)?.[0] || '';
          const trailingPunct = chunk.match(/[^\w]+$/)?.[0] || '';

          // Preserve casing
          let formattedWord = chosen;
          if (chunk.replace(/^[^\w]+/, '').startsWith(cleanWord.toUpperCase())) {
            formattedWord = chosen.toUpperCase();
          } else if (chunk.replace(/^[^\w]+/, '')[0] === chunk.replace(/^[^\w]+/, '')[0]?.toUpperCase()) {
            formattedWord = chosen.charAt(0).toUpperCase() + chosen.slice(1);
          }

          return {
            id: idCounter,
            word: `${leadingPunct}${formattedWord}${trailingPunct}`,
            original: chunk,
            changed: true,
            synonyms: allOptions
          };
        }

        return {
          id: idCounter,
          word: chunk,
          original: chunk,
          changed: false,
          synonyms: []
        };
      });

      setRewrittenTokens(tokens);
      setIsSpinning(false);
    }, 400);
  };

  const handleSelectAlternativeSynonym = (tokenId: number, newSynonym: string) => {
    setRewrittenTokens(prev => prev.map(t => {
      if (t.id === tokenId) {
        // Keep original punctuation intact
        const leadingPunct = t.original.match(/^[^\w]+/)?.[0] || '';
        const trailingPunct = t.original.match(/[^\w]+$/)?.[0] || '';
        let formatted = newSynonym;
        if (t.original.replace(/^[^\w]+/, '')[0] === t.original.replace(/^[^\w]+/, '')[0]?.toUpperCase()) {
          formatted = newSynonym.charAt(0).toUpperCase() + newSynonym.slice(1);
        }
        return {
          ...t,
          word: `${leadingPunct}${formatted}${trailingPunct}`
        };
      }
      return t;
    }));
    setActivePopoverIndex(null);
  };

  const getFullOutputString = () => {
    return rewrittenTokens.map(t => t.word).join('');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getFullOutputString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([getFullOutputString()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seotools-rewritten-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSendToPlagiarism = () => {
    try {
      sessionStorage.setItem('plagiarism_prefill', getFullOutputString());
    } catch {
      // storage fallback
    }
    setPublicRoute({ page: 'tool', param: 'plagiarism-checker' });
  };

  const handleSendToKeywordDensity = () => {
    try {
      sessionStorage.setItem('keyword_density_prefill', getFullOutputString());
    } catch {
      // storage fallback
    }
    setPublicRoute({ page: 'tool', param: 'keyword-density' });
  };

  return (
    <div className="w-full space-y-10">
      {/* Top Banner & Mode Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-[11px] font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Next-Gen Semantic Engine
            </span>
            <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Real-Time NLP Processing
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Free Article Rewriter &amp; Instant Content Paraphraser
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Rephrase complex paragraphs, eliminate duplicate content footprints, and polish raw drafts into engaging, context-preserved prose.
          </p>
        </div>

        {/* 5 Tone & Precision Modes */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1.5 rounded-xl text-xs font-semibold border border-slate-200/80 self-start lg:self-auto">
          {(
            [
              { id: 'standard', label: 'Standard' },
              { id: 'fluency', label: 'Fluency' },
              { id: 'academic', label: 'Academic' },
              { id: 'shorten', label: 'Condense' },
              { id: 'seo', label: 'SEO Booster' }
            ] as { id: RewriterMode; label: string }[]
          ).map(tab => (
            <button
              key={tab.id}
              onClick={() => setMode(tab.id)}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                mode === tab.id
                  ? 'bg-white text-blue-600 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Dual-Column Rewrite Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Column */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-500" />
              <span className="font-bold text-slate-800">Original Source Text</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                {wordCount} words
              </span>
              {inputText && (
                <button
                  onClick={() => {
                    setInputText('');
                    setRewrittenTokens([]);
                  }}
                  className="text-slate-400 hover:text-rose-600 cursor-pointer transition-colors p-1"
                  title="Clear text"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your article, blog post, essay, or draft here to paraphrase..."
            rows={12}
            className="w-full p-5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden resize-none leading-relaxed flex-1 font-normal"
          />

          <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-between gap-3">
            <button
              onClick={() => {
                setInputText(
                  'Search engine optimization is an important process to help digital creators increase organic website traffic. High-quality content engages online readers and helps find new customers.'
                );
              }}
              className="text-xs text-slate-600 hover:text-blue-600 font-medium underline cursor-pointer"
            >
              Load Sample Text
            </button>

            <button
              onClick={handleRewrite}
              disabled={!inputText.trim() || isSpinning}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs disabled:bg-slate-300 disabled:cursor-not-allowed active:scale-95"
            >
              {isSpinning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing NLP Synonyms...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Paraphrase Article</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output Column */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden relative">
          <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2 flex-wrap">
              <Zap className="w-4 h-4 text-blue-600" />
              <span className="font-bold text-slate-900">Paraphrased Output</span>
              {rewrittenTokens.length > 0 && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                  {changedWordsCount} replaced ({modificationPercentage}% altered)
                </span>
              )}
            </div>

            {rewrittenTokens.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  className="text-slate-500 hover:text-slate-900 p-1 rounded hover:bg-slate-200/60 cursor-pointer"
                  title="Download as TXT"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleCopy}
                  className="text-xs text-slate-700 hover:text-blue-600 flex items-center gap-1 cursor-pointer font-semibold bg-white px-2.5 py-1 rounded border border-slate-200 shadow-2xs hover:border-blue-300 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            )}
          </div>

          <div className="p-5 text-sm leading-relaxed flex-1 overflow-y-auto min-h-72 bg-slate-50/20 relative">
            {rewrittenTokens.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center p-8">
                <div className="space-y-2 text-slate-400">
                  <Sparkles className="w-10 h-10 mx-auto opacity-40 text-blue-500 animate-pulse" />
                  <p className="text-xs font-medium text-slate-500">
                    Click "Paraphrase Article" to produce human-grade rephrased prose with interactive synonym suggestions.
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative">
                {rewrittenTokens.map((token) => {
                  if (token.changed) {
                    return (
                      <span key={token.id} className="relative inline-block mx-0.5 group">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActivePopoverIndex(activePopoverIndex === token.id ? null : token.id);
                          }}
                          className="bg-blue-100/90 text-blue-900 font-semibold px-1 py-0.5 rounded cursor-pointer hover:bg-blue-200 transition-colors border border-blue-200"
                        >
                          {token.word}
                        </button>

                        {/* Interactive Synonym Popover */}
                        {activePopoverIndex === token.id && (
                          <div
                            ref={popoverRef}
                            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-50 text-left animate-in fade-in zoom-in-95 duration-150"
                          >
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 border-b border-slate-100 flex items-center justify-between">
                              <span>Alternatives</span>
                              <span className="text-slate-400 font-mono">Original: {token.original.trim()}</span>
                            </div>
                            <div className="py-1 max-h-36 overflow-y-auto space-y-0.5">
                              {token.synonyms.map((syn, sIdx) => (
                                <button
                                  key={sIdx}
                                  onClick={() => handleSelectAlternativeSynonym(token.id, syn)}
                                  className="w-full text-left px-2 py-1 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-md font-medium cursor-pointer transition-colors block truncate"
                                >
                                  {syn}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </span>
                    );
                  }
                  return <span key={token.id} className="text-slate-800">{token.word}</span>;
                })}
              </div>
            )}
          </div>

          {rewrittenTokens.length > 0 && (
            <div className="bg-slate-50 border-t border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>Click any highlighted blue word to replace it with contextual synonyms.</span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleSendToPlagiarism}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Check Plagiarism</span>
                </button>

                <button
                  onClick={handleSendToKeywordDensity}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Hash className="w-3.5 h-3.5" />
                  <span>Check Density</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5 Distinct Mode Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          {
            title: 'Standard',
            pct: '30% – 40% Change',
            desc: 'Balanced lexical substitution for everyday blog posts, web copy, and news summaries.',
            badge: 'Most Popular'
          },
          {
            title: 'Fluency',
            pct: '20% – 25% Change',
            desc: 'Polishes awkward syntax and grammatical friction while maintaining idiomatic flow.',
            badge: 'Clarity Focus'
          },
          {
            title: 'Academic',
            pct: '50% – 65% Change',
            desc: 'Formal terminology and nuanced clause restructuring for reports and whitepapers.',
            badge: 'High Depth'
          },
          {
            title: 'Condense',
            pct: '35% – 50% Change',
            desc: 'Prunes sentence filler, passive verbs, and redundancy for punchy social captions.',
            badge: 'Brevity'
          },
          {
            title: 'SEO Booster',
            pct: '30% – 45% Change',
            desc: 'Targeted LSI synonym mapping that protects vital search entities and intent signals.',
            badge: 'SERP Safe'
          }
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900">{item.title}</h3>
              <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {item.badge}
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-500">{item.pct}</p>
            <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
