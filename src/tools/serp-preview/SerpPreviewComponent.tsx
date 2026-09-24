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
  Code,
  Share2,
  FileCode,
  CheckCircle2,
  Info
} from 'lucide-react';

interface SerpPreviewProps {
  tool: ToolModule;
}

export const SerpPreviewComponent: React.FC<SerpPreviewProps> = ({ tool }) => {
  const [title, setTitle] = useState<string>('Free Plagiarism Checker – Detect Duplicate Content Online | SeoTools');
  const [description, setDescription] = useState<string>(
    '100% Free online plagiarism detector with 1,000 words limit. Scan essays, articles, and blog posts with accurate percentage match indicators and AI detection.'
  );
  const [url, setUrl] = useState<string>('https://seotools.com/plagiarism-checker');
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
    <div className="w-full space-y-10">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-[11px] font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              SERP Snippet Simulator
            </span>
            <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Pixel-Perfect Precision
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Google SERP Preview &amp; Meta Tag Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Simulate how your webpage title, snippet description, and URL breadcrumb structure appear on Google search across desktop and mobile viewports.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl text-xs font-semibold self-start lg:self-auto border border-slate-200">
          <button
            onClick={() => setViewDevice('desktop')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all ${
              viewDevice === 'desktop' ? 'bg-white text-blue-600 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>
          <button
            onClick={() => setViewDevice('mobile')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all ${
              viewDevice === 'mobile' ? 'bg-white text-blue-600 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
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
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
            <span>Meta Content Settings</span>
            <span className="text-xs font-normal text-slate-400">Live Sync</span>
          </h2>

          {/* Title input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-700">SEO Page Title Tag</label>
              <span className={`font-mono font-bold ${isTitleOver ? 'text-rose-600' : 'text-emerald-700'}`}>
                {titleChars} / 60 characters
              </span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:border-blue-500 focus:bg-white"
            />
            {isTitleOver && (
              <p className="text-[11px] text-rose-600 flex items-center gap-1 font-medium">
                <AlertTriangle className="w-3 h-3 shrink-0" />
                <span>Title exceeds 60 characters and may be truncated by Google with an ellipsis (...).</span>
              </p>
            )}
          </div>

          {/* Description input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-700">Meta Description</label>
              <span className={`font-mono font-bold ${isDescOver ? 'text-rose-600' : 'text-emerald-700'}`}>
                {descChars} / 160 characters
              </span>
            </div>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:border-blue-500 focus:bg-white resize-none"
            />
            {isDescOver && (
              <p className="text-[11px] text-rose-600 flex items-center gap-1 font-medium">
                <AlertTriangle className="w-3 h-3 shrink-0" />
                <span>Description exceeds 160 characters and will likely be cut off in search snippets.</span>
              </p>
            )}
          </div>

          {/* URL input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Canonical Target URL</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:border-blue-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Live SERP Preview */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Google Search Result Preview ({viewDevice})
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Google Web Search Simulation</span>
            </div>

            {/* Google SERP Card */}
            <div className={`p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs space-y-1.5 ${
              viewDevice === 'mobile' ? 'max-w-sm mx-auto' : 'w-full'
            }`}>
              {/* URL Breadcrumb */}
              <div className="flex items-center gap-1.5 text-xs text-slate-700 truncate">
                <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-600 shrink-0">
                  <Globe className="w-3 h-3" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[12px] font-medium text-slate-800 leading-tight">SeoTools</span>
                  <span className="text-[10px] text-slate-500 truncate leading-tight">{url}</span>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-base sm:text-lg font-medium text-[#1a0dab] hover:underline cursor-pointer leading-snug break-words">
                {title.length > 60 ? `${title.substring(0, 58)}...` : title}
              </h3>

              {/* Snippet */}
              <p className="text-xs sm:text-sm text-[#4d5156] leading-relaxed break-words">
                {description.length > 160 ? `${description.substring(0, 157)}...` : description}
              </p>
            </div>
          </div>

          {/* Generated Code Section */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-blue-600" />
                <span>Production Meta Tag Bundle</span>
              </span>
              <button
                onClick={handleCopy}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'HTML Copied!' : 'Copy Tags'}</span>
              </button>
            </div>
            <pre className="bg-slate-900 text-slate-300 p-3 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800 max-h-36">
              {htmlTags}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
