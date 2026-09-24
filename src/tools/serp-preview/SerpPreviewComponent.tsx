import React, { useState } from 'react';
import { ToolModule } from '../../types';
import { 
  Globe, 
  Smartphone, 
  Monitor, 
  Copy, 
  Check, 
  AlertTriangle, 
  Search, 
  Sparkles,
  Code
} from 'lucide-react';

interface SerpPreviewProps {
  tool: ToolModule;
}

export const SerpPreviewComponent: React.FC<SerpPreviewProps> = ({ tool }) => {
  const [title, setTitle] = useState<string>('Free Plagiarism Checker – Detect Duplicate Content Online | SmallSEOTools');
  const [description, setDescription] = useState<string>(
    '100% Free online plagiarism detector with 1,000 words limit. Scan essays, articles, and blog posts with accurate percentage match indicators and AI detection.'
  );
  const [url, setUrl] = useState<string>('https://smallseotools.com/plagiarism-checker');
  const [viewDevice, setViewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [copied, setCopied] = useState<boolean>(false);

  const titleChars = title.length;
  const descChars = description.length;

  const isTitleOver = titleChars > 60;
  const isDescOver = descChars > 160;

  const htmlTags = `<!-- Primary Meta Tags -->
<title>${title}</title>
<meta name="title" content="${title}" />
<meta name="description" content="${description}" />
<link rel="canonical" href="${url}" />

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website" />
<meta property="og:url" content="${url}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image" />
<meta property="twitter:url" content="${url}" />
<meta property="twitter:title" content="${title}" />
<meta property="twitter:description" content="${description}" />`;

  const handleCopy = () => {
    navigator.clipboard.writeText(htmlTags);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-8">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Search className="w-4 h-4 text-blue-600" />
            <span>Google SERP Preview &amp; Meta Snippet Simulator</span>
          </h2>
          <p className="text-xs text-slate-500">
            Preview how your webpage title, description, and breadcrumbs appear in Google search results.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto border border-slate-200">
          <button
            onClick={() => setViewDevice('desktop')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors ${
              viewDevice === 'desktop' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>
          <button
            onClick={() => setViewDevice('mobile')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors ${
              viewDevice === 'mobile' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile</span>
          </button>
        </div>
      </div>

      {/* Editor & Preview Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor Inputs */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            Meta Content Settings
          </h3>

          {/* Title input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-700">SEO Page Title</label>
              <span className={`font-mono font-bold ${isTitleOver ? 'text-rose-600' : 'text-slate-500'}`}>
                {titleChars} / 60 characters
              </span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:border-blue-500"
            />
            {isTitleOver && (
              <p className="text-[11px] text-rose-600 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                <span>Title exceeds 60 characters and may be truncated by Google with an ellipsis (...).</span>
              </p>
            )}
          </div>

          {/* Description input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-700">Meta Description</label>
              <span className={`font-mono font-bold ${isDescOver ? 'text-rose-600' : 'text-slate-500'}`}>
                {descChars} / 160 characters
              </span>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:border-blue-500 resize-none leading-relaxed"
            />
            {isDescOver && (
              <p className="text-[11px] text-rose-600 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                <span>Description exceeds 160 characters and will likely be cut off in search snippets.</span>
              </p>
            )}
          </div>

          {/* Canonical URL input */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 text-xs block">Canonical URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:border-blue-500"
            />
          </div>
        </div>

        {/* Live Search Engine Simulator */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Google Search Result Snippet</span>
                <span className="text-[10px] uppercase font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                  {viewDevice}
                </span>
              </h3>
            </div>

            {/* Google SERP Simulated Card */}
            <div className={`p-4 bg-[#f8f9fa] rounded-xl border border-slate-200 font-sans ${
              viewDevice === 'mobile' ? 'max-w-sm mx-auto' : 'w-full'
            }`}>
              {/* URL / Breadcrumb */}
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] text-slate-600 font-bold">
                  G
                </div>
                <div className="text-xs leading-tight">
                  <span className="text-slate-800 font-semibold block truncate max-w-xs">
                    {url.replace(/^https?:\/\//, '').split('/')[0]}
                  </span>
                  <span className="text-slate-500 text-[11px] block truncate max-w-xs font-mono">
                    {url}
                  </span>
                </div>
              </div>

              {/* Title */}
              <h4 className="text-base sm:text-lg font-medium text-[#1a0dab] hover:underline cursor-pointer leading-snug line-clamp-2">
                {title || 'Untitled Page'}
              </h4>

              {/* Description */}
              <p className="text-xs text-[#4d5156] mt-1 leading-relaxed line-clamp-3">
                {description || 'No description provided. Search engines will automatically grab text from your page.'}
              </p>
            </div>
          </div>

          {/* HTML Code Output */}
          <div className="bg-slate-900 rounded-2xl p-5 text-slate-200 space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-blue-400">
                <Code className="w-4 h-4" />
                <span>Generated HTML &amp; OpenGraph Tags</span>
              </div>
              <button
                onClick={handleCopy}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>

            <pre className="text-xs font-mono overflow-x-auto text-slate-300 p-2 leading-relaxed">
              {htmlTags}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
