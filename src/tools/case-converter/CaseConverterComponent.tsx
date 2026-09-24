import React, { useState } from 'react';
import { ToolModule } from '../../types';
import { 
  Type, 
  Copy, 
  Check, 
  Trash2, 
  ArrowRightLeft, 
  Download,
  Sparkles,
  Code,
  FileText
} from 'lucide-react';

interface CaseConverterProps {
  tool: ToolModule;
}

export const CaseConverterComponent: React.FC<CaseConverterProps> = ({ tool }) => {
  const [text, setText] = useState<string>('Convert any text between sentence case, UPPERCASE, lowercase, and camelCase for clean web publishing.');
  const [copied, setCopied] = useState<boolean>(false);

  const toSentenceCase = (str: string) => {
    return str.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase());
  };

  const toTitleCase = (str: string) => {
    const minorWords = new Set(['and', 'as', 'but', 'for', 'if', 'nor', 'or', 'so', 'yet', 'a', 'an', 'the', 'at', 'by', 'for', 'in', 'of', 'off', 'on', 'per', 'to', 'up', 'via']);
    return str
      .toLowerCase()
      .split(/\s+/)
      .map((word, index, arr) => {
        if (index === 0 || index === arr.length - 1 || !minorWords.has(word)) {
          return word.charAt(0).toUpperCase() + word.slice(1);
        }
        return word;
      })
      .join(' ');
  };

  const toCamelCase = (str: string) => {
    return str
      .replace(/[^a-zA-Z0-9 ]/g, ' ')
      .trim()
      .toLowerCase()
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
        index === 0 ? word.toLowerCase() : word.toUpperCase()
      )
      .replace(/\s+/g, '');
  };

  const toPascalCase = (str: string) => {
    return str
      .replace(/[^a-zA-Z0-9 ]/g, ' ')
      .trim()
      .toLowerCase()
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase())
      .replace(/\s+/g, '');
  };

  const toKebabCase = (str: string) => {
    return str
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  };

  const toSnakeCase = (str: string) => {
    return str
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .trim()
      .replace(/\s+/g, '_');
  };

  const toConstantCase = (str: string) => {
    return str
      .toUpperCase()
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .trim()
      .replace(/\s+/g, '_');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="w-full space-y-10">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-[11px] font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Typography &amp; Code Formatter
            </span>
            <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold">
              Instant Transformation
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Online Text Case Converter &amp; String Formatter
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Convert strings between UPPERCASE, lowercase, Title Case, Sentence case, camelCase, PascalCase, kebab-case, and CONSTANT_CASE.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start lg:self-auto">
          {text && (
            <button
              onClick={handleCopy}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Transformed Text'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Editor & Conversion Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Buttons Toolbar */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setText(toSentenceCase(text))}
            className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold cursor-pointer shadow-2xs transition-colors"
          >
            Sentence case
          </button>
          <button
            onClick={() => setText(text.toLowerCase())}
            className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold cursor-pointer shadow-2xs transition-colors"
          >
            lower case
          </button>
          <button
            onClick={() => setText(text.toUpperCase())}
            className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold cursor-pointer shadow-2xs transition-colors"
          >
            UPPER CASE
          </button>
          <button
            onClick={() => setText(toTitleCase(text))}
            className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold cursor-pointer shadow-2xs transition-colors"
          >
            Title Case (AP/Chicago)
          </button>
          <button
            onClick={() => setText(toCamelCase(text))}
            className="px-3 py-2 bg-white hover:bg-slate-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-mono font-bold cursor-pointer shadow-2xs transition-colors"
          >
            camelCase
          </button>
          <button
            onClick={() => setText(toPascalCase(text))}
            className="px-3 py-2 bg-white hover:bg-slate-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-mono font-bold cursor-pointer shadow-2xs transition-colors"
          >
            PascalCase
          </button>
          <button
            onClick={() => setText(toKebabCase(text))}
            className="px-3 py-2 bg-white hover:bg-slate-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-mono font-bold cursor-pointer shadow-2xs transition-colors"
          >
            kebab-case (URL Slugs)
          </button>
          <button
            onClick={() => setText(toSnakeCase(text))}
            className="px-3 py-2 bg-white hover:bg-slate-100 text-amber-700 border border-amber-200 rounded-xl text-xs font-mono font-bold cursor-pointer shadow-2xs transition-colors"
          >
            snake_case
          </button>
          <button
            onClick={() => setText(toConstantCase(text))}
            className="px-3 py-2 bg-white hover:bg-slate-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-mono font-bold cursor-pointer shadow-2xs transition-colors"
          >
            CONSTANT_CASE
          </button>
        </div>

        {/* Text Area */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste your text here..."
          rows={9}
          className="w-full p-5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden resize-none leading-relaxed font-normal"
        />

        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3.5 flex items-center justify-between text-xs text-slate-600">
          <span>Characters: <strong className="font-mono text-slate-900">{text.length}</strong> | Words: <strong className="font-mono text-slate-900">{wordCount}</strong></span>
          {text && (
            <button
              onClick={() => setText('')}
              className="text-slate-400 hover:text-rose-600 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
