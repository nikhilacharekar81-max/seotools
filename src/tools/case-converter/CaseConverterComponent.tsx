import React, { useState } from 'react';
import { ToolModule } from '../../types';
import { 
  Type, 
  Copy, 
  Check, 
  Trash2, 
  ArrowRightLeft, 
  Download,
  Sparkles
} from 'lucide-react';

interface CaseConverterProps {
  tool: ToolModule;
}

export const CaseConverterComponent: React.FC<CaseConverterProps> = ({ tool }) => {
  const [text, setText] = useState<string>('Convert any text between sentence case, UPPERCASE, lowercase, and camelCase.');
  const [copied, setCopied] = useState<boolean>(false);

  const toSentenceCase = (str: string) => {
    return str.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase());
  };

  const toTitleCase = (str: string) => {
    return str.toLowerCase().replace(/\b(\w)/g, c => c.toUpperCase());
  };

  const toCamelCase = (str: string) => {
    return str
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .toLowerCase()
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
        index === 0 ? word.toLowerCase() : word.toUpperCase()
      )
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

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-8">
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Type className="w-4 h-4 text-blue-600" />
            <span>Online Text Case Converter</span>
          </h2>
          <p className="text-xs text-slate-500">
            Easily convert plain text into UPPERCASE, lowercase, Title Case, Sentence case, and programming casing formats.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {text && (
            <button
              onClick={handleCopy}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Text'}</span>
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
            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg text-xs font-semibold cursor-pointer shadow-2xs"
          >
            Sentence case
          </button>
          <button
            onClick={() => setText(text.toLowerCase())}
            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg text-xs font-semibold cursor-pointer shadow-2xs"
          >
            lower case
          </button>
          <button
            onClick={() => setText(text.toUpperCase())}
            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg text-xs font-semibold cursor-pointer shadow-2xs"
          >
            UPPER CASE
          </button>
          <button
            onClick={() => setText(toTitleCase(text))}
            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg text-xs font-semibold cursor-pointer shadow-2xs"
          >
            Title Case
          </button>
          <button
            onClick={() => setText(toCamelCase(text))}
            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg text-xs font-semibold cursor-pointer shadow-2xs"
          >
            camelCase
          </button>
          <button
            onClick={() => setText(toKebabCase(text))}
            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg text-xs font-semibold cursor-pointer shadow-2xs"
          >
            kebab-case
          </button>
          <button
            onClick={() => setText(toSnakeCase(text))}
            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg text-xs font-semibold cursor-pointer shadow-2xs"
          >
            snake_case
          </button>
        </div>

        {/* Text Area */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste your text here..."
          rows={8}
          className="w-full p-5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden resize-y leading-relaxed"
        />

        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-between text-xs text-slate-500">
          <span>Characters: <strong>{text.length}</strong> | Words: <strong>{text.trim() ? text.trim().split(/\s+/).length : 0}</strong></span>
          {text && (
            <button
              onClick={() => setText('')}
              className="text-slate-400 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
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
