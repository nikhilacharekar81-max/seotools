import React, { useState, useMemo } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { ToolModule, ToolPageSection } from '../../types';
import { TextCounterComponent } from '../../tools/text-counter/TextCounterComponent';
import { PlagiarismCheckerComponent } from '../../tools/plagiarism-checker/PlagiarismCheckerComponent';
import { ArticleRewriterComponent } from '../../tools/article-rewriter/ArticleRewriterComponent';
import { BacklinkCheckerComponent } from '../../tools/backlink-checker/BacklinkCheckerComponent';
import { SerpPreviewComponent } from '../../tools/serp-preview/SerpPreviewComponent';
import { KeywordDensityComponent } from '../../tools/keyword-density/KeywordDensityComponent';
import { CaseConverterComponent } from '../../tools/case-converter/CaseConverterComponent';
import { HashGeneratorComponent } from '../../tools/hash-generator/HashGeneratorComponent';
import { DomainAuthorityComponent } from '../../tools/domain-authority/DomainAuthorityComponent';
import { KeywordRankTrackerComponent } from '../../tools/keyword-rank/KeywordRankTrackerComponent';
import { XmlSitemapGeneratorComponent } from '../../tools/xml-sitemap/XmlSitemapGeneratorComponent';
import { ToolGuideRenderer } from './ToolGuideRenderer';
import { 
  Search, 
  Sparkles, 
  ArrowRight, 
  ExternalLink, 
  SlidersHorizontal,
  Zap, 
  Shield, 
  Clock, 
  Layers, 
  CheckCircle2, 
  Share2, 
  BookOpen, 
  Power, 
  FileText, 
  Globe, 
  Hash, 
  ImageDown, 
  Wrench,
  Link as LinkIcon,
  BarChart2,
  Copy,
  Check,
  Code,
  Tag,
  Eye,
  RefreshCw,
  Award,
  FileCode,
  Bot,
  Server
} from 'lucide-react';
import { getToolGuide } from '../../data/toolGuides';

export const PublicWebsite: React.FC = () => {
  const { 
    tools, 
    publicRoute, 
    setPublicRoute, 
    posts, 
    pages, 
    setViewMode, 
    setActiveAdminTab,
    toggleToolStatus,
    settings
  } = usePlatform();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    tools.forEach(t => {
      if (t.category) set.add(t.category);
    });
    return ['All', ...Array.from(set)];
  }, [tools]);

  // Filter tools by category and search
  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const matchesSearch = 
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCat = selectedCategory === 'All' || tool.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [tools, searchQuery, selectedCategory]);

  // Group tools by category for the classic SeoTools organized view
  const categorizedTools = useMemo(() => {
    const map = new Map<string, ToolModule[]>();
    filteredTools.forEach(t => {
      const list = map.get(t.category) || [];
      list.push(t);
      map.set(t.category, list);
    });
    return map;
  }, [filteredTools]);

  // Find active tool if on /tool/:slug
  const activeTool = useMemo(() => {
    if (publicRoute.page === 'tool' && publicRoute.param) {
      return tools.find(t => t.slug === publicRoute.param || t.id === publicRoute.param);
    }
    return null;
  }, [publicRoute, tools]);

  // Find active post if on /blog/:slug
  const activePost = useMemo(() => {
    if (publicRoute.page === 'blog_post' && publicRoute.param) {
      return posts.find(p => p.slug === publicRoute.param || p.id === publicRoute.param);
    }
    return null;
  }, [publicRoute, posts]);

  // Find active static page if on /page/:slug
  const activePage = useMemo(() => {
    if (publicRoute.page === 'custom_page' && publicRoute.param) {
      return pages.find(p => p.slug === publicRoute.param || p.id === publicRoute.param);
    }
    return null;
  }, [publicRoute, pages]);

  return (
    <div className="flex-1 flex flex-col bg-[#f8fafc]">
      {/* ROUTE 1: TOOL INTERACTIVE WORKSPACE */}
      {publicRoute.page === 'tool' && activeTool && (
        <ToolWorkspace tool={activeTool} />
      )}

      {/* ROUTE 2: BLOG LISTING */}
      {publicRoute.page === 'blog' && (
        <BlogListing />
      )}

      {/* ROUTE 3: SINGLE BLOG POST READER */}
      {publicRoute.page === 'blog_post' && activePost && (
        <BlogPostReader post={activePost} />
      )}

      {/* ROUTE 4: PRICING & PRO TIERS */}
      {publicRoute.page === 'pricing' && (
        <PricingView />
      )}

      {/* ROUTE 5: STATIC PAGES (ABOUT / PRIVACY / TERMS) */}
      {publicRoute.page === 'custom_page' && activePage && (
        <StaticPageView page={activePage} />
      )}

      {/* ROUTE 6: HOMEPAGE - SEOTOOLS PORTAL */}
      {publicRoute.page === 'home' && (
        <div className="flex-1 bg-[#f8fafc]">
          {/* SeoTools Signature Hero Section */}
          <section className="bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 text-white py-14 px-4 sm:px-8 border-b border-blue-900/50 shadow-md relative overflow-hidden">
            {/* Tech grid decoration */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0a_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

            <div className="max-w-4xl mx-auto text-center space-y-4 relative z-10">
              <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs px-3.5 py-1.5 rounded-full font-medium shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>100% Free SEO Tools &amp; Webmaster Utilities</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white max-w-3xl mx-auto leading-tight">
                Search Engine Optimization &amp; Content Tools
              </h1>

              <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
                Improve your organic search rankings, analyze keyword density, check word count, and optimize web assets with our suite of 50+ free online SEO utilities.
              </p>

              {/* Instant Search Bar */}
              <div className="pt-2 max-w-2xl mx-auto">
                <div className="relative flex items-center">
                  <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search any SEO tool (e.g. Word Counter, Plagiarism, Backlink, Meta Tags...)"
                    className="w-full bg-white text-slate-900 placeholder:text-slate-400 text-sm pl-12 pr-12 py-3.5 rounded-xl shadow-lg border-2 border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 focus:outline-hidden transition-all"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 text-xs text-slate-400 hover:text-slate-700 cursor-pointer font-medium"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Clickable Popular Tool Tags */}
              <div className="pt-2 flex items-center justify-center gap-2 text-xs text-slate-300 flex-wrap">
                <span className="text-slate-400 font-medium">Popular:</span>
                <button
                  onClick={() => setPublicRoute({ page: 'tool', param: 'text-counter' })}
                  className="bg-slate-800/80 hover:bg-blue-600 text-slate-200 hover:text-white px-2.5 py-1 rounded-md transition-colors cursor-pointer border border-slate-700"
                >
                  Word Counter
                </button>
                <button
                  onClick={() => setPublicRoute({ page: 'tool', param: 'plagiarism-checker' })}
                  className="bg-slate-800/80 hover:bg-emerald-600 text-slate-200 hover:text-white px-2.5 py-1 rounded-md transition-colors cursor-pointer border border-slate-700 font-semibold"
                >
                  Plagiarism Checker
                </button>
                <button
                  onClick={() => setPublicRoute({ page: 'tool', param: 'article-rewriter' })}
                  className="bg-slate-800/80 hover:bg-blue-600 text-slate-200 hover:text-white px-2.5 py-1 rounded-md transition-colors cursor-pointer border border-slate-700"
                >
                  Article Rewriter
                </button>
                <button
                  onClick={() => setPublicRoute({ page: 'tool', param: 'meta-tag-generator' })}
                  className="bg-slate-800/80 hover:bg-blue-600 text-slate-200 hover:text-white px-2.5 py-1 rounded-md transition-colors cursor-pointer border border-slate-700"
                >
                  SERP &amp; Meta Studio
                </button>
                <button
                  onClick={() => setPublicRoute({ page: 'tool', param: 'backlink-checker' })}
                  className="bg-slate-800/80 hover:bg-blue-600 text-slate-200 hover:text-white px-2.5 py-1 rounded-md transition-colors cursor-pointer border border-slate-700"
                >
                  Backlink Checker
                </button>
                <button
                  onClick={() => setSearchQuery('Image')}
                  className="bg-slate-800/80 hover:bg-blue-600 text-slate-200 hover:text-white px-2.5 py-1 rounded-md transition-colors cursor-pointer border border-slate-700"
                >
                  Image Compressor
                </button>
              </div>
            </div>
          </section>

          {/* SeoTools Value Pillars Ribbon */}
          <div className="bg-white border-b border-slate-200 py-3 px-4 sm:px-8">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded border border-blue-200">
                  SeoTools Standard
                </span>
                <span className="hidden sm:inline text-slate-500">
                  Trusted by 10M+ digital marketers &amp; webmasters worldwide:
                </span>
              </div>
              <div className="flex items-center gap-4 font-medium text-[11px] flex-wrap justify-center text-slate-600">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>100% Free Forever</span>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Sub-Millisecond Engine</span>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>No Registration Required</span>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Zero Data Storage</span>
                </span>
              </div>
            </div>
          </div>

          {/* Categories Navigation Bar */}
          <div className="bg-white border-b border-slate-200 sticky top-[95px] z-30 shadow-2xs">
            <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between gap-4 overflow-x-auto">
              <div className="flex items-center gap-2 shrink-0">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 ${
                      selectedCategory === cat
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
                <span>Tools Available:</span>
                <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{filteredTools.length}</span>
              </div>
            </div>
          </div>

          {/* Tools Grid Section */}
          <main className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-10">
            {filteredTools.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-xs space-y-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No tools found</h3>
                <p className="text-xs text-slate-500">
                  No matching tools for "{searchQuery}". Try searching for "counter", "meta", "backlink", or clear your filter.
                </p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                  className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : selectedCategory === 'All' && !searchQuery ? (
              /* CATEGORIZED SEOTOOLS DIRECTORY VIEW */
              <div className="space-y-12">
                {Array.from(categorizedTools.entries()).map(([catName, catTools]) => (
                  <div key={catName} className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                          {getCategoryIcon(catName)}
                        </div>
                        <div>
                          <h2 className="text-xl font-extrabold text-slate-900">
                            {catName}
                          </h2>
                          <p className="text-xs text-slate-500">
                            {catTools.length} tools in this section
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedCategory(catName)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                      >
                        <span>View category</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {catTools.map(tool => (
                        <ToolCard 
                          key={tool.id} 
                          tool={tool} 
                          onLaunch={() => setPublicRoute({ page: 'tool', param: tool.slug })}
                          onToggle={() => toggleToolStatus(tool.id)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* FILTERED GRID VIEW */
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900">
                    {selectedCategory === 'All' ? `Search Results (${filteredTools.length})` : selectedCategory}
                  </h2>
                  <span className="text-xs text-slate-500">{filteredTools.length} tools found</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredTools.map((tool) => (
                    <ToolCard 
                      key={tool.id} 
                      tool={tool} 
                      onLaunch={() => setPublicRoute({ page: 'tool', param: tool.slug })}
                      onToggle={() => toggleToolStatus(tool.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </main>

          {/* Featured SEO Insights & Blog Section */}
          <section className="bg-slate-100 border-t border-slate-200 py-14 px-4 sm:px-8 mt-12">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Latest from SeoTools Blog</h2>
                  <p className="text-xs text-slate-500 mt-1">Actionable search optimization guides, keyword density strategies, and technical SEO tutorials.</p>
                </div>
                <button
                  onClick={() => setPublicRoute({ page: 'blog' })}
                  className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>View All SEO Guides</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {posts.map((post) => (
                  <article
                    key={post.id}
                    onClick={() => setPublicRoute({ page: 'blog_post', param: post.slug })}
                    className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="font-semibold text-blue-600">{post.category}</span>
                        <span>·</span>
                        <span>{post.publishedAt}</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 hover:text-blue-600 transition-colors leading-snug">
                        {post.title}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span>By {post.author.name}</span>
                      <span className="font-semibold text-blue-600 flex items-center gap-1">
                        Read Guide <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

// COMPONENT: Tool Card in SeoTools style
const ToolCard: React.FC<{ 
  tool: ToolModule; 
  onLaunch: () => void;
  onToggle: () => void;
}> = ({ tool, onLaunch, onToggle }) => {
  const isTextCounter = tool.id === 'tool_text_counter' || tool.slug === 'text-counter';
  const isEnabled = tool.status === 'published';

  return (
    <div
      className={`bg-white rounded-xl border transition-all flex flex-col justify-between group p-5 shadow-2xs hover:shadow-md ${
        isEnabled ? 'border-slate-200 hover:border-blue-500' : 'border-slate-200 bg-slate-50/60 opacity-80'
      }`}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div 
            onClick={onLaunch}
            className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white transition-all cursor-pointer shadow-2xs"
          >
            {renderToolIcon(tool.iconName)}
          </div>

          <div className="flex items-center gap-2">
            {isTextCounter && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Live Flagship
              </span>
            )}
            
            {/* Quick Toggle Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
              title={isEnabled ? 'Click to turn tool OFF' : 'Click to turn tool ON'}
              className={`p-1.5 rounded-md border text-[10px] font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                isEnabled 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
              }`}
            >
              <Power className="w-3 h-3" />
              <span>{isEnabled ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>

        <div onClick={onLaunch} className="cursor-pointer">
          <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
            {tool.name}
          </h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {tool.description}
          </p>
        </div>
      </div>

      <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-[11px] font-medium text-slate-400">
          {tool.category}
        </span>

        <button
          onClick={onLaunch}
          className="font-bold text-blue-600 flex items-center gap-1 group-hover:text-blue-700 cursor-pointer"
        >
          <span>Use Tool</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

// Helper: category icon
const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Text Analysis': return <FileText className="w-4 h-4" />;
    case 'SEO & Meta': return <Globe className="w-4 h-4" />;
    case 'Backlinks & Authority': return <LinkIcon className="w-4 h-4" />;
    case 'Keywords & Research': return <BarChart2 className="w-4 h-4" />;
    case 'Image & Media': return <ImageDown className="w-4 h-4" />;
    default: return <Wrench className="w-4 h-4" />;
  }
};

// Helper: render icon
const renderToolIcon = (name: string) => {
  switch (name) {
    case 'FileText': return <FileText className="w-5 h-5" />;
    case 'Globe': return <Globe className="w-5 h-5" />;
    case 'Hash': return <Hash className="w-5 h-5" />;
    case 'ImageDown': return <ImageDown className="w-5 h-5" />;
    case 'Link': return <LinkIcon className="w-5 h-5" />;
    case 'Shield': return <Shield className="w-5 h-5" />;
    case 'BarChart2': return <BarChart2 className="w-5 h-5" />;
    case 'Award': return <Award className="w-5 h-5" />;
    case 'FileCode': return <FileCode className="w-5 h-5" />;
    case 'Bot': return <Bot className="w-5 h-5" />;
    case 'Server': return <Server className="w-5 h-5" />;
    default: return <Wrench className="w-5 h-5" />;
  }
};

// COMPONENT: Tool Interactive Workspace
const ToolWorkspace: React.FC<{ tool: ToolModule }> = ({ tool }) => {
  const { setPublicRoute, setViewMode, setActiveAdminTab, toggleToolStatus } = usePlatform();

  const isTextCounter = tool.id === 'tool_text_counter' || tool.slug === 'text-counter' || tool.sourcePath?.includes('text-counter');
  const isPlagiarismChecker = tool.id === 'tool_plagiarism' || tool.slug === 'plagiarism-checker';
  const isRewriter = tool.id === 'tool_rewriter' || tool.slug === 'article-rewriter';
  const isBacklinks = tool.id === 'tool_backlink' || tool.slug === 'backlink-checker';
  const isDomainAuthority = tool.id === 'tool_domain_authority' || tool.slug === 'domain-authority-checker' || tool.id === 'domain-authority-checker';
  const isRankTracker = tool.id === 'tool_keyword_rank' || tool.slug === 'keyword-rank-tracker' || tool.id === 'keyword-rank-tracker';
  const isSitemapGen = tool.id === 'tool_sitemap_gen' || tool.slug === 'xml-sitemap-generator' || tool.id === 'xml-sitemap-generator';
  const isSerpPreview = tool.id === 'tool_meta_gen' || tool.slug === 'meta-tag-generator';
  const isKeywordDensity = tool.id === 'tool_density' || tool.slug === 'keyword-density-checker' || tool.id === 'tool_keyword_density';
  const isCaseConverter = tool.id === 'tool_case' || tool.slug === 'case-converter' || tool.id === 'tool_case_converter';
  const isHashGen = tool.id === 'tool_md5' || tool.slug === 'hash-generator' || tool.id === 'tool_hash_gen';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 flex-1 w-full space-y-6">
      {/* Draft Notice if in draft status */}
      {tool.status === 'draft' && (
        <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl flex items-center justify-between text-xs text-amber-800">
          <div className="flex items-center gap-2">
            <span className="font-bold uppercase tracking-wider bg-amber-200 text-amber-900 px-2 py-0.5 rounded text-[10px]">
              Draft Preview
            </span>
            <span>This tool is currently in draft mode.</span>
          </div>
          <button
            onClick={() => toggleToolStatus(tool.id, 'published')}
            className="font-bold underline cursor-pointer text-amber-900 hover:text-amber-950"
          >
            Publish Live Now
          </button>
        </div>
      )}

      {/* Inactive / Turned OFF Notice */}
      {tool.status === 'disabled' && (
        <div className="bg-amber-50 border border-amber-200 p-8 rounded-2xl text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 mx-auto flex items-center justify-center">
            <Power className="w-6 h-6 text-amber-700" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-900">This Tool is Currently Turned OFF</h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              This interactive tool has been turned OFF in the platform settings. You can switch it back ON below or in the Webmaster Console.
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={() => toggleToolStatus(tool.id, 'published')}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Power className="w-3.5 h-3.5" />
              <span>Turn Tool Back ON</span>
            </button>
            <button
              onClick={() => setPublicRoute({ page: 'home' })}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl cursor-pointer"
            >
              Return to SEO Directory
            </button>
          </div>
        </div>
      )}

      {/* Top Breadcrumb & Webmaster Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <button onClick={() => setPublicRoute({ page: 'home' })} className="hover:underline text-blue-600 cursor-pointer font-medium">
            SeoTools
          </button>
          <span>/</span>
          <span className="text-slate-500">{tool.category}</span>
          <span>/</span>
          <span className="font-semibold text-slate-900">{tool.name}</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick ON / OFF Toggle directly on Tool Page */}
          <button
            onClick={() => toggleToolStatus(tool.id)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
              tool.status === 'published'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
            }`}
            title="Click to toggle tool ON or OFF"
          >
            <Power className="w-3.5 h-3.5" />
            <span>Tool Status: {tool.status === 'published' ? 'Active (ON)' : 'Disabled (OFF)'}</span>
          </button>

          <button 
            onClick={() => {
              setViewMode('admin');
              setActiveAdminTab('tools');
            }}
            className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1.5 font-medium cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Admin Settings</span>
          </button>
        </div>
      </div>

      {/* MAIN INTERACTIVE WORKSPACE */}
      <div className="w-full">
        {isTextCounter ? (
          <TextCounterComponent tool={tool} />
        ) : isPlagiarismChecker ? (
          <PlagiarismCheckerComponent tool={tool} />
        ) : isRewriter ? (
          <ArticleRewriterComponent tool={tool} />
        ) : isBacklinks ? (
          <BacklinkCheckerComponent tool={tool} />
        ) : isDomainAuthority ? (
          <DomainAuthorityComponent tool={tool} />
        ) : isRankTracker ? (
          <KeywordRankTrackerComponent tool={tool} />
        ) : isSitemapGen ? (
          <XmlSitemapGeneratorComponent tool={tool} />
        ) : isSerpPreview ? (
          <SerpPreviewComponent tool={tool} />
        ) : isKeywordDensity ? (
          <KeywordDensityComponent tool={tool} />
        ) : isCaseConverter ? (
          <CaseConverterComponent tool={tool} />
        ) : isHashGen ? (
          <HashGeneratorComponent tool={tool} />
        ) : (
          <TextCounterComponent tool={tool} />
        )}
      </div>

      {/* COMPREHENSIVE 20-LAYER EDUCATIONAL GUIDE */}
      <ToolGuideRenderer slugOrId={tool.slug || tool.id} setPublicRoute={setPublicRoute} />
    </div>
  );
};

// COMPONENT: Blog Listing
const BlogListing: React.FC = () => {
  const { posts, setPublicRoute } = usePlatform();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 flex-1 w-full bg-[#f8fafc]">
      <div className="max-w-2xl mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900">SeoTools Insights &amp; SEO Guides</h1>
        <p className="text-sm text-slate-500 mt-2">
          Technical SEO audits, keyword optimization frameworks, and Core Web Vitals breakdowns from search engineering experts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map(post => (
          <article
            key={post.id}
            onClick={() => setPublicRoute({ page: 'blog_post', param: post.slug })}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="h-44 w-full bg-slate-100 overflow-hidden">
                <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="p-6 space-y-3">
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">{post.category}</span>
                <h2 className="text-lg font-bold text-slate-900 leading-snug">{post.title}</h2>
                <p className="text-xs text-slate-500 line-clamp-3">{post.excerpt}</p>
              </div>
            </div>
            <div className="p-6 pt-0 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>{post.publishedAt}</span>
              <span className="font-semibold text-blue-600 flex items-center gap-1">Read Article →</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

// COMPONENT: Single Blog Post Reader (Demonstrating /tool embedded block)
const BlogPostReader: React.FC<{ post: any }> = ({ post }) => {
  const { setPublicRoute } = usePlatform();

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-8 py-12 flex-1 w-full bg-[#f8fafc]">
      <div className="text-xs text-slate-500 mb-6 flex items-center gap-2">
        <button onClick={() => setPublicRoute({ page: 'blog' })} className="hover:underline text-blue-600">SEO Guides</button>
        <span>/</span>
        <span className="text-slate-900 font-semibold">{post.category}</span>
      </div>

      <header className="space-y-4 mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">{post.title}</h1>
        <div className="flex items-center gap-4 text-xs text-slate-500 border-b border-slate-200 pb-4">
          <span>By <strong className="text-slate-900">{post.author.name}</strong></span>
          <span>·</span>
          <span>Published on {post.publishedAt}</span>
          <span>·</span>
          <span>SEO Score: <strong className="text-emerald-600 font-mono">{post.seo.score}/100</strong></span>
        </div>
      </header>

      <div className="prose max-w-none space-y-6 text-slate-700 leading-relaxed text-sm sm:text-base">
        {post.blocks.map((b: any) => {
          if (b.type === 'heading') {
            return <h2 key={b.id} className="text-2xl font-bold text-slate-900 pt-4">{b.content}</h2>;
          }
          if (b.type === 'quote') {
            return (
              <blockquote key={b.id} className="border-l-4 border-blue-600 pl-4 italic text-slate-700 bg-blue-50/50 p-4 rounded-r-xl">
                {b.content}
              </blockquote>
            );
          }
          if (b.type === 'tool') {
            return (
              <div key={b.id} className="my-8 p-6 bg-white rounded-2xl border border-blue-200 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Embedded SEO Utility (/tool Block)
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Live In-Post Tool</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-2">
                  <p className="text-sm font-bold text-slate-900">Interactive SEO Module</p>
                  <p className="text-xs text-slate-500">Any active tool from the SeoTools directory can be embedded directly into tutorials using the /tool command.</p>
                </div>
              </div>
            );
          }
          return <p key={b.id}>{b.content}</p>;
        })}
      </div>
    </article>
  );
};

// COMPONENT: Pricing View
const PricingView: React.FC = () => {
  const { plans } = usePlatform();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16 flex-1 w-full bg-[#f8fafc]">
      <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Transparent Plans for Webmasters &amp; Agencies</h1>
        <p className="text-sm text-slate-500">All SeoTools utilities remain 100% free for individual users. Upgraded Pro &amp; Agency tiers provide bulk API quotas, ad-free experience, and multi-user seats.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map(plan => (
          <div
            key={plan.id}
            className={`bg-white rounded-2xl border p-8 flex flex-col justify-between shadow-xs ${
              plan.popular ? 'border-blue-600 ring-2 ring-blue-600/30 relative' : 'border-slate-200'
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] uppercase font-bold tracking-widest px-3.5 py-1 rounded-full shadow-xs">
                Most Popular
              </span>
            )}

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{plan.description}</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-slate-900 font-mono">${plan.priceMonthly}</span>
                <span className="text-xs text-slate-400">/month</span>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-600 pt-4 border-t border-slate-100">
                {plan.features.map((feat, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-8">
              <button 
                onClick={() => alert(`Selected ${plan.name} plan.`)}
                className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  plan.popular 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                }`}
              >
                {plan.priceMonthly === 0 ? 'Current Free Tier' : 'Get Started with Pro'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// COMPONENT: Static Page View
const StaticPageView: React.FC<{ page: any }> = ({ page }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-16 flex-1 w-full bg-[#f8fafc]">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-4">{page.title}</h1>
      <div className="text-xs text-slate-400 mb-8 pb-4 border-b border-slate-200">
        SeoTools Legal &amp; Policies · Last updated: {page.updatedAt}
      </div>
      <div className="prose max-w-none text-slate-700 leading-relaxed text-sm space-y-4">
        <p>{page.content}</p>
      </div>
    </div>
  );
};
