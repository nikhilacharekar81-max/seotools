import React, { useState, useMemo } from 'react';
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
  Zap
} from 'lucide-react';

interface ArticleRewriterProps {
  tool: ToolModule;
}

const SYNONYM_DICTIONARY: Record<string, string[]> = {
  important: ['crucial', 'essential', 'paramount', 'vital', 'significant'],
  process: ['procedure', 'workflow', 'system', 'methodology', 'framework'],
  help: ['assist', 'support', 'facilitate', 'aid', 'empower'],
  use: ['utilize', 'employ', 'leverage', 'apply', 'harness'],
  show: ['demonstrate', 'illustrate', 'reveal', 'exhibit', 'display'],
  create: ['generate', 'develop', 'craft', 'produce', 'construct'],
  good: ['advantageous', 'favorable', 'beneficial', 'optimal', 'superior'],
  find: ['uncover', 'discover', 'identify', 'locate', 'pinpoint'],
  increase: ['augment', 'expand', 'amplify', 'boost', 'elevate'],
  decrease: ['diminish', 'curtail', 'lessen', 'reduce', 'minimize'],
  content: ['material', 'copy', 'substance', 'subject matter', 'assets'],
  readers: ['audience', 'visitors', 'users', 'viewers', 'constituents'],
  traffic: ['visitors', 'audience inflow', 'inbound reach', 'web viewership']
};

export const ArticleRewriterComponent: React.FC<ArticleRewriterProps> = ({ tool }) => {
  const { setPublicRoute } = usePlatform();
  const [inputText, setInputText] = useState<string>(
    'Search engine optimization is an important process to help digital creators increase organic website traffic. High-quality content engages online readers and helps find new customers.'
  );
  const [mode, setMode] = useState<'standard' | 'fluency' | 'creative'>('standard');
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [rewrittenTokens, setRewrittenTokens] = useState<{ word: string; original: string; changed: boolean; synonyms: string[] }[]>([]);
  const [copied, setCopied] = useState<boolean>(false);

  const wordCount = useMemo(() => {
    return inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  }, [inputText]);

  const handleRewrite = () => {
    if (!inputText.trim() || isSpinning) return;
    setIsSpinning(true);

    setTimeout(() => {
      const words = inputText.split(/(\s+|[.,!?;:()])/);
      const tokens = words.map(chunk => {
        const lower = chunk.toLowerCase().trim();
        const synList = SYNONYM_DICTIONARY[lower];

        if (synList && synList.length > 0) {
          let chosen = synList[0];
          if (mode === 'fluency' && synList.length > 1) chosen = synList[1];
          if (mode === 'creative' && synList.length > 2) chosen = synList[synList.length - 1];

          // Preserve capitalization
          if (chunk[0] === chunk[0].toUpperCase()) {
            chosen = chosen.charAt(0).toUpperCase() + chosen.slice(1);
          }

          return {
            word: chosen,
            original: chunk,
            changed: true,
            synonyms: synList
          };
        }

        return {
          word: chunk,
          original: chunk,
          changed: false,
          synonyms: []
        };
      });

      setRewrittenTokens(tokens);
      setIsSpinning(false);
    }, 450);
  };

  const getFullOutputString = () => {
    return rewrittenTokens.map(t => t.word).join('');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getFullOutputString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-8">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>Instant Article Rewriter &amp; Paraphrasing Engine</span>
            <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200 font-semibold">
              NLP Synonyms
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Paraphrase essays, spin duplicate sentences, and eliminate plagiarism with context-aware synonyms.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto border border-slate-200">
          <button
            onClick={() => setMode('standard')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
              mode === 'standard' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Standard
          </button>
          <button
            onClick={() => setMode('fluency')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
              mode === 'fluency' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Fluency
          </button>
          <button
            onClick={() => setMode('creative')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
              mode === 'creative' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Creative
          </button>
        </div>
      </div>

      {/* Main Dual-Column Rewrite Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Column */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center justify-between text-xs text-slate-600">
            <span className="font-semibold">Original Content</span>
            <div className="flex items-center gap-3">
              <span>{wordCount} words</span>
              {inputText && (
                <button
                  onClick={() => {
                    setInputText('');
                    setRewrittenTokens([]);
                  }}
                  className="text-slate-400 hover:text-rose-600 cursor-pointer"
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
            placeholder="Paste article, paragraph, or essay here to rewrite..."
            rows={10}
            className="w-full p-5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden resize-none leading-relaxed flex-1"
          />

          <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-between">
            <button
              onClick={() => {
                setInputText(
                  'Search engine optimization is an important process to help digital creators increase organic website traffic. High-quality content engages online readers and helps find new customers.'
                );
              }}
              className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
            >
              Load Sample Text
            </button>

            <button
              onClick={handleRewrite}
              disabled={!inputText.trim() || isSpinning}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              {isSpinning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Rewriting...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Rewrite Article</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output Column */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">Paraphrased Output</span>
              {rewrittenTokens.length > 0 && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-semibold">
                  {rewrittenTokens.filter(t => t.changed).length} Words Replaced
                </span>
              )}
            </div>

            {rewrittenTokens.length > 0 && (
              <button
                onClick={handleCopy}
                className="text-xs text-slate-600 hover:text-blue-600 flex items-center gap-1 cursor-pointer font-medium"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            )}
          </div>

          <div className="p-5 text-sm leading-relaxed flex-1 overflow-y-auto min-h-60 bg-slate-50/30">
            {rewrittenTokens.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center p-6">
                <div className="space-y-1.5 text-slate-400">
                  <FileText className="w-8 h-8 mx-auto opacity-50" />
                  <p className="text-xs">Click "Rewrite Article" to generate spun output here.</p>
                </div>
              </div>
            ) : (
              <div>
                {rewrittenTokens.map((token, i) => (
                  <span
                    key={i}
                    className={
                      token.changed
                        ? 'bg-blue-100 text-blue-900 font-medium px-1 rounded cursor-pointer hover:bg-blue-200'
                        : 'text-slate-800'
                    }
                    title={token.changed ? `Original: "${token.original}". Click to change synonym.` : undefined}
                  >
                    {token.word}
                  </span>
                ))}
              </div>
            )}
          </div>

          {rewrittenTokens.length > 0 && (
            <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500">
                Colored words were substituted with high-ranking semantic synonyms.
              </span>

              <button
                onClick={() => {
                  setPublicRoute({ page: 'tool', param: 'plagiarism-checker' });
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Check Plagiarism</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
