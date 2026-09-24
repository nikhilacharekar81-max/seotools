import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ToolModule,
  BlogPost,
  StaticPage,
  User,
  AdUnit,
  SubscriptionPlan,
  AutomationRule,
  ApiKey,
  LogEntry,
  SiteSettings,
  Role,
} from '../types';
import { TEXT_COUNTER_MANIFEST } from '../tools/text-counter/manifest';

// Pre-defined modular tool catalog matching SmallSEOTools categories
export const TOOL_CATALOG: Omit<ToolModule, 'isInstalled' | 'installedAt'>[] = [
  TEXT_COUNTER_MANIFEST,
  {
    id: 'tool_plagiarism',
    slug: 'plagiarism-checker',
    name: 'Plagiarism Checker',
    description: 'Check text originality against millions of online sources with percentage similarity reports.',
    category: 'Text Analysis Tools',
    iconName: 'Shield',
    status: 'published',
    processingMode: 'hybrid',
    version: '2.1.0',
    tags: ['plagiarism', 'originality', 'content audit', 'seo content', 'duplicate content'],
    limits: {
      guest: { allowed: true, maxRunsPerDay: 5, maxPayloadSize: '1,000 words' },
      registered: { allowed: true, maxRunsPerDay: 20, maxPayloadSize: '2,500 words' },
      pro: { allowed: true, maxRunsPerDay: 500, maxPayloadSize: '10,000 words' },
      business: { allowed: true, maxRunsPerDay: 2000, maxPayloadSize: '25,000 words' },
    },
    seo: {
      title: 'Free Plagiarism Checker – Detect Duplicate Content Online',
      metaDescription: '100% Free online plagiarism detector. Scan essays, articles, and blog posts with accurate percentage match indicators.',
      canonicalUrl: 'https://smallseotools.com/tools/plagiarism-checker',
      indexInSearch: true,
      includeInSitemap: true,
      keywords: ['plagiarism checker', 'check plagiarism free', 'duplicate content detector', 'originality score'],
    },
    configSchema: [
      { id: 'maxWordScan', label: 'Max Words per Single Scan', type: 'number', defaultValue: 1000, value: 1000 },
      { id: 'strictness', label: 'Strictness Matching Sensitivity', type: 'select', defaultValue: 'high', value: 'high', options: [{ label: 'Normal', value: 'normal' }, { label: 'High', value: 'high' }] },
    ],
    pageSections: [
      { id: 'sec_hero', type: 'hero', title: 'Free Online Plagiarism Checker', enabled: true },
      { id: 'sec_tool', type: 'tool', title: 'Plagiarism Analysis Terminal', enabled: true },
      { id: 'sec_desc', type: 'description', title: 'How It Works', enabled: true, content: 'Scans your sentences against web indices to highlight verbatim matches and ensure search engine originality.' },
    ],
    versions: [{ version: '2.1.0', releaseDate: '2026-02-10', author: 'SEO Core Team', changelog: 'Enhanced indexing algorithm.', isCurrent: true }],
    activityLogs: [],
    metrics: { totalRuns: 42100, successRate: 99.8, avgLatencyMs: 320, uniqueUsers: 18400, errorCount: 12 },
  },
  {
    id: 'tool_rewriter',
    slug: 'article-rewriter',
    name: 'Article Rewriter & Paraphraser',
    description: 'Paraphrase and rewrite sentences while maintaining original context and semantic meaning.',
    category: 'Text Analysis Tools',
    iconName: 'RefreshCw',
    status: 'published',
    processingMode: 'hybrid',
    version: '1.4.0',
    tags: ['article rewriter', 'paraphrasing tool', 'content spinning', 'seo writing'],
    limits: {
      guest: { allowed: true, maxRunsPerDay: 10, maxPayloadSize: '1,500 words' },
      registered: { allowed: true, maxRunsPerDay: 50, maxPayloadSize: '5,000 words' },
      pro: { allowed: true, maxRunsPerDay: 1000, maxPayloadSize: '20,000 words' },
      business: { allowed: true, maxRunsPerDay: 5000, maxPayloadSize: '50,000 words' },
    },
    seo: {
      title: 'Free Article Rewriter – Paraphrase Content Online',
      metaDescription: 'Rewrite articles, blogs, and essays with intelligent synonyms while preserving SEO clarity.',
      canonicalUrl: 'https://smallseotools.com/tools/article-rewriter',
      indexInSearch: true,
      includeInSitemap: true,
      keywords: ['article rewriter', 'paraphrase tool', 'rewrite article online', 'sentence spinner'],
    },
    configSchema: [
      { id: 'synonymStrength', label: 'Synonym Diversity Level', type: 'range', defaultValue: 70, value: 70, min: 20, max: 100 },
    ],
    pageSections: [
      { id: 'sec_hero', type: 'hero', title: 'Instant Article Paraphraser', enabled: true },
      { id: 'sec_tool', type: 'tool', title: 'Rewrite Workspace', enabled: true },
    ],
    versions: [{ version: '1.4.0', releaseDate: '2026-01-15', author: 'Content NLP Lead', changelog: 'Contextual synonym replacement upgrade.', isCurrent: true }],
    activityLogs: [],
    metrics: { totalRuns: 28900, successRate: 99.5, avgLatencyMs: 280, uniqueUsers: 12400, errorCount: 22 },
  },
  {
    id: 'tool_keyword_density',
    slug: 'keyword-density-checker',
    name: 'Keyword Density Checker',
    description: 'Calculate frequency and percentage density of 1-word, 2-word, and 3-word search phrases.',
    category: 'Text Analysis Tools',
    iconName: 'BarChart2',
    status: 'published',
    processingMode: 'browser',
    version: '1.0.0',
    tags: ['keyword density', 'seo keywords', 'over optimization', 'search terms'],
    limits: {
      guest: { allowed: true, maxRunsPerDay: 100, maxPayloadSize: '50,000 words' },
      registered: { allowed: true, maxRunsPerDay: 500, maxPayloadSize: '100,000 words' },
      pro: { allowed: true, maxRunsPerDay: 10000, maxPayloadSize: '500,000 words' },
      business: { allowed: true, maxRunsPerDay: 50000, maxPayloadSize: '1,000,000 words' },
    },
    seo: {
      title: 'Free Keyword Density Checker – SEO Analysis Tool',
      metaDescription: 'Analyze your page or text keyword density to prevent Google search penalty and maximize ranking potential.',
      canonicalUrl: 'https://smallseotools.com/tools/keyword-density-checker',
      indexInSearch: true,
      includeInSitemap: true,
      keywords: ['keyword density checker', 'keyword frequency analyzer', 'seo keyword ratio'],
    },
    configSchema: [
      { id: 'minWordLength', label: 'Minimum Word Length to Analyze', type: 'number', defaultValue: 3, value: 3 },
    ],
    pageSections: [
      { id: 'sec_hero', type: 'hero', title: 'Analyze Keyword Density in Real-Time', enabled: true },
      { id: 'sec_tool', type: 'tool', title: 'Keyword Cloud & Density Matrix', enabled: true },
    ],
    versions: [{ version: '1.0.0', releaseDate: '2026-03-01', author: 'SEO Core Team', changelog: 'Initial client-side density calculator.', isCurrent: true }],
    activityLogs: [],
    metrics: { totalRuns: 19500, successRate: 100, avgLatencyMs: 12, uniqueUsers: 9100, errorCount: 0 },
  },
  {
    id: 'tool_meta_gen',
    slug: 'meta-tag-generator',
    name: 'SEO Meta Tag & OpenGraph Studio',
    description: 'Generate high-ranking meta titles, descriptions, OpenGraph, and Twitter Cards with real-time Google SERP preview.',
    category: 'Website Tracking & SEO',
    iconName: 'Globe',
    status: 'published',
    processingMode: 'browser',
    sourcePath: 'src/tools/meta-generator/MetaEngine.ts',
    version: '1.0.0',
    tags: ['seo', 'meta tags', 'opengraph', 'serp', 'social preview'],
    limits: {
      guest: { allowed: true, maxRunsPerDay: 20, maxPayloadSize: 'Standard' },
      registered: { allowed: true, maxRunsPerDay: 100, maxPayloadSize: 'Standard' },
      pro: { allowed: true, maxRunsPerDay: 2000, maxPayloadSize: 'Standard' },
      business: { allowed: true, maxRunsPerDay: 10000, maxPayloadSize: 'Standard' },
    },
    seo: {
      title: 'Free SEO Meta Tag Generator | Google & Social Preview Tool',
      metaDescription: 'Generate valid HTML meta tags with live Google snippet & social card previews.',
      canonicalUrl: 'https://smallseotools.com/tools/meta-tag-generator',
      indexInSearch: true,
      includeInSitemap: true,
      keywords: ['meta tag generator', 'seo title tags', 'opengraph generator', 'serp simulator'],
    },
    configSchema: [
      { id: 'maxTitleChars', label: 'Max Title Character Warning', type: 'number', defaultValue: 60, value: 60 },
      { id: 'maxDescChars', label: 'Max Description Character Warning', type: 'number', defaultValue: 160, value: 160 },
    ],
    pageSections: [
      { id: 'sec_hero', type: 'hero', title: 'Generate Valid Meta Tags Instantly', enabled: true },
      { id: 'sec_tool', type: 'tool', title: 'Interactive Meta Tag Studio', enabled: true },
    ],
    versions: [
      { version: '1.0.0', releaseDate: '2026-02-18', author: 'Alex Rivera', changelog: 'Initial release with Twitter card preview.', isCurrent: true },
    ],
    activityLogs: [],
    metrics: { totalRuns: 9540, successRate: 100, avgLatencyMs: 24, uniqueUsers: 4120, errorCount: 0 },
  },
  {
    id: 'tool_sitemap_gen',
    slug: 'xml-sitemap-generator',
    name: 'XML Sitemap Generator',
    description: 'Crawl and produce valid Google XML sitemaps to optimize search crawler indexation.',
    category: 'Website Tracking & SEO',
    iconName: 'FileCode',
    status: 'published',
    processingMode: 'hybrid',
    version: '1.2.0',
    tags: ['xml sitemap', 'google crawler', 'indexation', 'seo audit'],
    limits: {
      guest: { allowed: true, maxRunsPerDay: 5, maxPayloadSize: '500 URLs' },
      registered: { allowed: true, maxRunsPerDay: 20, maxPayloadSize: '2,000 URLs' },
      pro: { allowed: true, maxRunsPerDay: 500, maxPayloadSize: '50,000 URLs' },
      business: { allowed: true, maxRunsPerDay: 2000, maxPayloadSize: '250,000 URLs' },
    },
    seo: {
      title: 'Free XML Sitemap Generator – Create Sitemap for Google',
      metaDescription: 'Generate compliant XML sitemaps instantly for Google, Bing, and Yahoo search engines.',
      canonicalUrl: 'https://smallseotools.com/tools/xml-sitemap-generator',
      indexInSearch: true,
      includeInSitemap: true,
      keywords: ['xml sitemap generator', 'create sitemap online', 'google sitemap creator'],
    },
    configSchema: [
      { id: 'changeFreq', label: 'Default Change Frequency', type: 'select', defaultValue: 'weekly', value: 'weekly', options: [{ label: 'Daily', value: 'daily' }, { label: 'Weekly', value: 'weekly' }, { label: 'Monthly', value: 'monthly' }] },
    ],
    pageSections: [
      { id: 'sec_hero', type: 'hero', title: 'Create XML Sitemaps in Minutes', enabled: true },
      { id: 'sec_tool', type: 'tool', title: 'Sitemap Configuration Engine', enabled: true },
    ],
    versions: [{ version: '1.2.0', releaseDate: '2026-02-01', author: 'Crawler Team', changelog: 'Added image sitemap support.', isCurrent: true }],
    activityLogs: [],
    metrics: { totalRuns: 16200, successRate: 99.7, avgLatencyMs: 450, uniqueUsers: 7800, errorCount: 15 },
  },
  {
    id: 'tool_robots_gen',
    slug: 'robots-txt-generator',
    name: 'Robots.txt Generator & Validator',
    description: 'Construct compliant robots.txt files with custom user-agent directives, crawler delays, and disallow rules.',
    category: 'Website Tracking & SEO',
    iconName: 'Bot',
    status: 'published',
    processingMode: 'browser',
    version: '1.0.0',
    tags: ['robots txt', 'crawler directives', 'googlebot', 'technical seo'],
    limits: {
      guest: { allowed: true, maxRunsPerDay: 50, maxPayloadSize: 'Standard' },
      registered: { allowed: true, maxRunsPerDay: 200, maxPayloadSize: 'Standard' },
      pro: { allowed: true, maxRunsPerDay: 5000, maxPayloadSize: 'Standard' },
      business: { allowed: true, maxRunsPerDay: 20000, maxPayloadSize: 'Standard' },
    },
    seo: {
      title: 'Free Robots.txt Generator – Guide Search Engine Crawlers',
      metaDescription: 'Generate and validate your robots.txt file to guide Googlebot, Bingbot, and other web crawlers.',
      canonicalUrl: 'https://smallseotools.com/tools/robots-txt-generator',
      indexInSearch: true,
      includeInSitemap: true,
      keywords: ['robots.txt generator', 'robots txt creator', 'disallow googlebot'],
    },
    configSchema: [],
    pageSections: [
      { id: 'sec_hero', type: 'hero', title: 'Generate Compliant Robots.txt', enabled: true },
      { id: 'sec_tool', type: 'tool', title: 'Interactive Rule Builder', enabled: true },
    ],
    versions: [{ version: '1.0.0', releaseDate: '2026-02-12', author: 'Technical SEO Team', changelog: 'Initial release.', isCurrent: true }],
    activityLogs: [],
    metrics: { totalRuns: 11400, successRate: 100, avgLatencyMs: 15, uniqueUsers: 5900, errorCount: 0 },
  },
  {
    id: 'tool_backlink_check',
    slug: 'backlink-checker',
    name: 'Backlink Checker & Link Explorer',
    description: 'Discover inbound links, referring domains, anchor text distribution, and dofollow vs nofollow ratios.',
    category: 'Backlink Tools',
    iconName: 'Link',
    status: 'published',
    processingMode: 'hybrid',
    version: '2.0.0',
    tags: ['backlinks', 'link building', 'inbound links', 'referring domains', 'off page seo'],
    limits: {
      guest: { allowed: true, maxRunsPerDay: 5, maxPayloadSize: '1 Domain' },
      registered: { allowed: true, maxRunsPerDay: 25, maxPayloadSize: '5 Domains' },
      pro: { allowed: true, maxRunsPerDay: 500, maxPayloadSize: '50 Domains' },
      business: { allowed: true, maxRunsPerDay: 2500, maxPayloadSize: '250 Domains' },
    },
    seo: {
      title: 'Free Backlink Checker – In-Depth Inbound Link Analysis',
      metaDescription: 'Analyze any URL or domain backlinks for free. Check anchor text, referring domains, and spam score.',
      canonicalUrl: 'https://smallseotools.com/tools/backlink-checker',
      indexInSearch: true,
      includeInSitemap: true,
      keywords: ['backlink checker', 'free backlink tool', 'check incoming links', 'link profile audit'],
    },
    configSchema: [],
    pageSections: [
      { id: 'sec_hero', type: 'hero', title: 'Free Domain Backlink Checker', enabled: true },
      { id: 'sec_tool', type: 'tool', title: 'Domain Inbound Link Explorer', enabled: true },
    ],
    versions: [{ version: '2.0.0', releaseDate: '2026-02-25', author: 'Data Indexing Team', changelog: 'Expanded link database.', isCurrent: true }],
    activityLogs: [],
    metrics: { totalRuns: 37800, successRate: 99.2, avgLatencyMs: 410, uniqueUsers: 19200, errorCount: 31 },
  },
  {
    id: 'tool_domain_authority',
    slug: 'domain-authority-checker',
    name: 'Domain Authority & Page Authority Checker',
    description: 'Evaluate domain ranking potential (0-100 DA score) and spam score metrics across multiple URLs.',
    category: 'Backlink Tools',
    iconName: 'Award',
    status: 'published',
    processingMode: 'hybrid',
    version: '1.1.0',
    tags: ['domain authority', 'da checker', 'page authority', 'seo ranking potential'],
    limits: {
      guest: { allowed: true, maxRunsPerDay: 10, maxPayloadSize: '5 URLs' },
      registered: { allowed: true, maxRunsPerDay: 50, maxPayloadSize: '20 URLs' },
      pro: { allowed: true, maxRunsPerDay: 1000, maxPayloadSize: '100 URLs' },
      business: { allowed: true, maxRunsPerDay: 5000, maxPayloadSize: '500 URLs' },
    },
    seo: {
      title: 'Free Domain Authority Checker – Check Bulk DA & PA',
      metaDescription: 'Check Moz DA (Domain Authority) and PA (Page Authority) for any website for free.',
      canonicalUrl: 'https://smallseotools.com/tools/domain-authority-checker',
      indexInSearch: true,
      includeInSitemap: true,
      keywords: ['domain authority checker', 'da pa checker', 'bulk da checker', 'website rank score'],
    },
    configSchema: [],
    pageSections: [
      { id: 'sec_hero', type: 'hero', title: 'Check Domain Authority Instantly', enabled: true },
      { id: 'sec_tool', type: 'tool', title: 'Bulk DA/PA Lookup', enabled: true },
    ],
    versions: [{ version: '1.1.0', releaseDate: '2026-01-28', author: 'SEO Metrics Team', changelog: 'Batch URL support.', isCurrent: true }],
    activityLogs: [],
    metrics: { totalRuns: 31200, successRate: 99.6, avgLatencyMs: 350, uniqueUsers: 16100, errorCount: 14 },
  },
  {
    id: 'tool_keyword_rank',
    slug: 'keyword-rank-tracker',
    name: 'Keyword Rank & Position Tracker',
    description: 'Track search engine ranking positions on Google SERP across desktop and mobile devices.',
    category: 'Keyword Tools',
    iconName: 'Search',
    status: 'published',
    processingMode: 'hybrid',
    version: '1.0.0',
    tags: ['keyword rank', 'serp rank tracker', 'google position checker', 'keyword monitoring'],
    limits: {
      guest: { allowed: true, maxRunsPerDay: 5, maxPayloadSize: '10 Keywords' },
      registered: { allowed: true, maxRunsPerDay: 25, maxPayloadSize: '50 Keywords' },
      pro: { allowed: true, maxRunsPerDay: 500, maxPayloadSize: '500 Keywords' },
      business: { allowed: true, maxRunsPerDay: 2500, maxPayloadSize: '2,500 Keywords' },
    },
    seo: {
      title: 'Free Keyword Rank Tracker – Check Google SERP Position',
      metaDescription: 'Track your keyword ranking on Google for your target domain across global and local search locations.',
      canonicalUrl: 'https://smallseotools.com/tools/keyword-rank-tracker',
      indexInSearch: true,
      includeInSitemap: true,
      keywords: ['keyword rank tracker', 'google ranking checker', 'check keyword position'],
    },
    configSchema: [],
    pageSections: [
      { id: 'sec_hero', type: 'hero', title: 'Track Keyword Rankings on Google', enabled: true },
      { id: 'sec_tool', type: 'tool', title: 'Position Tracker Terminal', enabled: true },
    ],
    versions: [{ version: '1.0.0', releaseDate: '2026-02-14', author: 'SERP Data Team', changelog: 'Initial position checker.', isCurrent: true }],
    activityLogs: [],
    metrics: { totalRuns: 22100, successRate: 99.4, avgLatencyMs: 380, uniqueUsers: 11200, errorCount: 18 },
  },
  {
    id: 'tool_whois',
    slug: 'whois-lookup',
    name: 'Whois Domain Lookup & DNS Records',
    description: 'Retrieve domain registration dates, registrar details, expiry status, and DNS nameservers.',
    category: 'Domains & IP Tools',
    iconName: 'Server',
    status: 'published',
    processingMode: 'hybrid',
    version: '1.0.0',
    tags: ['whois', 'domain lookup', 'dns records', 'nameservers', 'registrar'],
    limits: {
      guest: { allowed: true, maxRunsPerDay: 50, maxPayloadSize: 'Standard' },
      registered: { allowed: true, maxRunsPerDay: 200, maxPayloadSize: 'Standard' },
      pro: { allowed: true, maxRunsPerDay: 5000, maxPayloadSize: 'Standard' },
      business: { allowed: true, maxRunsPerDay: 25000, maxPayloadSize: 'Standard' },
    },
    seo: {
      title: 'Free Whois Lookup – Domain Information & Expiry Tool',
      metaDescription: 'Inspect domain name ownership, registrar info, creation and expiration dates.',
      canonicalUrl: 'https://smallseotools.com/tools/whois-lookup',
      indexInSearch: true,
      includeInSitemap: true,
      keywords: ['whois lookup', 'domain age checker', 'check whois online'],
    },
    configSchema: [],
    pageSections: [
      { id: 'sec_hero', type: 'hero', title: 'Lookup Domain Whois Information', enabled: true },
      { id: 'sec_tool', type: 'tool', title: 'Whois Intelligence Terminal', enabled: true },
    ],
    versions: [{ version: '1.0.0', releaseDate: '2026-01-10', author: 'Infrastructure Team', changelog: 'Initial whois client.', isCurrent: true }],
    activityLogs: [],
    metrics: { totalRuns: 18700, successRate: 100, avgLatencyMs: 95, uniqueUsers: 9500, errorCount: 0 },
  },
  {
    id: 'tool_img_comp',
    slug: 'image-compressor',
    name: 'Smart Image Compressor',
    description: 'Lossless & high-ratio WebP, PNG, JPEG compression with instant processing.',
    category: 'Image & Media Tools',
    iconName: 'ImageDown',
    status: 'published',
    processingMode: 'browser',
    workerName: 'image-compression-worker.ts',
    sourcePath: 'src/tools/image-compressor/Worker.ts',
    version: '1.2.0',
    tags: ['image', 'webp', 'compression', 'speed', 'optimization'],
    limits: {
      guest: { allowed: true, maxRunsPerDay: 5, maxPayloadSize: '10MB' },
      registered: { allowed: true, maxRunsPerDay: 25, maxPayloadSize: '25MB' },
      pro: { allowed: true, maxRunsPerDay: 500, maxPayloadSize: '100MB' },
      business: { allowed: true, maxRunsPerDay: 5000, maxPayloadSize: '250MB' },
    },
    seo: {
      title: 'Free Online Image Compressor | Compress PNG, JPG, WebP Online',
      metaDescription: 'Reduce image file size without losing quality. Fast online image compression tool.',
      canonicalUrl: 'https://smallseotools.com/tools/image-compressor',
      indexInSearch: true,
      includeInSitemap: true,
      keywords: ['image compressor', 'compress jpg', 'reduce png size', 'webp converter'],
    },
    configSchema: [
      { id: 'maxQuality', label: 'Default Compression Quality', type: 'range', defaultValue: 80, value: 80, min: 10, max: 100, unit: '%' },
      { id: 'preserveExif', label: 'Preserve Camera EXIF Metadata', type: 'boolean', defaultValue: false, value: false },
      { id: 'autoWebp', label: 'Auto-convert to WebP format', type: 'boolean', defaultValue: true, value: true },
      { id: 'maxConcurrent', label: 'Concurrent Worker Threads', type: 'number', defaultValue: 4, value: 4, min: 1, max: 8 },
    ],
    pageSections: [
      { id: 'sec_hero', type: 'hero', title: 'Compress Images in Seconds', enabled: true },
      { id: 'sec_tool', type: 'tool', title: 'Interactive Compressor Workspace', enabled: true },
      { id: 'sec_ads', type: 'ads', title: 'AdSense Banner', enabled: true },
      { id: 'sec_desc', type: 'description', title: 'How It Works', enabled: true, content: 'Images are processed using modern high-fidelity compression algorithms, guaranteeing complete privacy and zero latency.' },
    ],
    versions: [
      { version: '1.2.0', releaseDate: '2026-03-15', author: 'Alex Rivera (Dev Lead)', changelog: 'Added WebP lossy compression support.', isCurrent: true },
    ],
    activityLogs: [],
    metrics: { totalRuns: 14820, successRate: 99.4, avgLatencyMs: 140, uniqueUsers: 6420, errorCount: 88 },
  },
  {
    id: 'tool_hash_gen',
    slug: 'hash-generator',
    name: 'Cryptographic Hash Generator',
    description: 'Instant MD5, SHA-1, SHA-256, and SHA-512 checksum calculator with high-speed hashing algorithms.',
    category: 'Domains & IP Tools',
    iconName: 'Hash',
    status: 'published',
    processingMode: 'browser',
    sourcePath: 'src/tools/hash-generator/Hasher.ts',
    version: '1.0.2',
    tags: ['hash', 'md5', 'sha256', 'cryptography', 'security'],
    limits: {
      guest: { allowed: true, maxRunsPerDay: 100, maxPayloadSize: '5MB' },
      registered: { allowed: true, maxRunsPerDay: 500, maxPayloadSize: '25MB' },
      pro: { allowed: true, maxRunsPerDay: 50000, maxPayloadSize: '500MB' },
      business: { allowed: true, maxRunsPerDay: 200000, maxPayloadSize: '1GB' },
    },
    seo: {
      title: 'Online Hash Generator | MD5, SHA-256, SHA-512 Checksum Tool',
      metaDescription: 'Compute secure cryptographic hashes instantly with zero latency.',
      canonicalUrl: 'https://smallseotools.com/tools/hash-generator',
      indexInSearch: true,
      includeInSitemap: true,
      keywords: ['sha256 generator', 'md5 hash', 'checksum online', 'web crypto'],
    },
    configSchema: [
      { id: 'uppercaseOutput', label: 'Output Hex in Uppercase', type: 'boolean', defaultValue: false, value: false },
    ],
    pageSections: [
      { id: 'sec_hero', type: 'hero', title: 'Cryptographic Hash Calculator', enabled: true },
      { id: 'sec_tool', type: 'tool', title: 'Live Hash Terminal', enabled: true },
    ],
    versions: [
      { version: '1.0.2', releaseDate: '2026-01-20', author: 'Alex Rivera', changelog: 'Added SHA-512 support.', isCurrent: true },
    ],
    activityLogs: [],
    metrics: { totalRuns: 18450, successRate: 100, avgLatencyMs: 6, uniqueUsers: 8900, errorCount: 0 },
  }
];

interface PlatformContextType {
  // Navigation & View
  viewMode: 'public' | 'admin';
  setViewMode: (mode: 'public' | 'admin') => void;
  activeAdminTab: string;
  setActiveAdminTab: (tab: string) => void;
  publicRoute: { page: 'home' | 'tool' | 'blog' | 'blog_post' | 'pricing' | 'custom_page'; param?: string };
  setPublicRoute: (route: { page: 'home' | 'tool' | 'blog' | 'blog_post' | 'pricing' | 'custom_page'; param?: string }) => void;
  
  // Developer Progressive Disclosure
  showDeveloperDetails: boolean;
  setShowDeveloperDetails: (val: boolean) => void;

  // Tools System (Masterplan: starts with 0 installed tools!)
  tools: ToolModule[];
  catalog: Omit<ToolModule, 'isInstalled' | 'installedAt'>[];
  installTool: (toolId: string) => void;
  uninstallTool: (toolId: string) => void;
  toggleToolStatus: (toolId: string, status?: ToolModule['status']) => void;
  updateTool: (tool: ToolModule) => void;
  createCustomTool: (newTool: Partial<ToolModule>) => void;
  deleteToolPermanently: (toolId: string) => void;
  duplicateTool: (toolId: string) => void;
  rollbackToolVersion: (toolId: string, targetVersion: string) => void;

  // CMS Blog & Pages
  posts: BlogPost[];
  pages: StaticPage[];
  createPost: (post: Partial<BlogPost>) => void;
  updatePost: (post: BlogPost) => void;
  deletePost: (id: string) => void;
  updatePage: (page: StaticPage) => void;

  // Users & Roles
  currentUser: User;
  users: User[];
  updateUserRole: (userId: string, role: Role) => void;
  updateUserPlan: (userId: string, plan: User['plan']) => void;

  // Monetization
  adUnits: AdUnit[];
  toggleAdUnit: (id: string) => void;
  updateAdUnit: (ad: AdUnit) => void;
  plans: SubscriptionPlan[];

  // Settings
  settings: SiteSettings;
  updateSettings: (newSettings: Partial<SiteSettings>) => void;

  // Dev Suite
  apiKeys: ApiKey[];
  createApiKey: (name: string, rateLimit: number) => void;
  revokeApiKey: (id: string) => void;
  logs: LogEntry[];
  addLog: (service: LogEntry['service'], level: LogEntry['level'], message: string, meta?: any) => void;
  automationRules: AutomationRule[];
  toggleAutomationRule: (id: string) => void;

  // Command Palette
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
}

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

export const PlatformProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [viewMode, setViewMode] = useState<'public' | 'admin'>('public');
  const [activeAdminTab, setActiveAdminTab] = useState<string>('dashboard');
  
  // Parse initial route from browser URL
  const getInitialRoute = (): { page: 'home' | 'tool' | 'blog' | 'blog_post' | 'pricing' | 'custom_page'; param?: string } => {
    if (typeof window === 'undefined') return { page: 'home' };
    const path = window.location.pathname.replace(/^\/+|\/+$/g, '');
    if (!path) return { page: 'home' };

    if (path.startsWith('tools/')) {
      const slug = path.replace(/^tools\//, '');
      return { page: 'tool', param: slug };
    }
    if (path === 'blog') return { page: 'blog' };
    if (path.startsWith('blog/')) {
      return { page: 'blog_post', param: path.replace(/^blog\//, '') };
    }
    if (path === 'pricing') return { page: 'pricing' };

    // Direct slug matches
    const knownSlugs = ['plagiarism-checker', 'article-rewriter', 'backlink-checker', 'meta-tag-generator', 'text-counter', 'keyword-density-checker', 'case-converter', 'md5-generator'];
    if (knownSlugs.includes(path)) {
      return { page: 'tool', param: path };
    }

    return { page: 'home' };
  };

  const [publicRoute, setPublicRoute] = useState<{ page: 'home' | 'tool' | 'blog' | 'blog_post' | 'pricing' | 'custom_page'; param?: string }>(getInitialRoute);
  const [showDeveloperDetails, setShowDeveloperDetails] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);

  // Sync browser URL whenever publicRoute changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let targetPath = '/';
    if (publicRoute.page === 'tool' && publicRoute.param) {
      targetPath = `/tools/${publicRoute.param}`;
    } else if (publicRoute.page === 'blog') {
      targetPath = '/blog';
    } else if (publicRoute.page === 'blog_post' && publicRoute.param) {
      targetPath = `/blog/${publicRoute.param}`;
    } else if (publicRoute.page === 'pricing') {
      targetPath = '/pricing';
    } else if (publicRoute.page === 'custom_page' && publicRoute.param) {
      targetPath = `/${publicRoute.param}`;
    }

    if (window.location.pathname !== targetPath) {
      window.history.pushState({ route: publicRoute }, '', targetPath);
    }
  }, [publicRoute]);

  // Handle browser back / forward navigation
  useEffect(() => {
    const handlePopState = () => {
      setPublicRoute(getInitialRoute());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Tools: exactly ONE installed tool per User Requirement 1: Text Counter & Analyzer
  const [tools, setTools] = useState<ToolModule[]>(() => {
    const saved = localStorage.getItem('omni_tools_installed');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 3) {
          return parsed.map((t: ToolModule) => {
            if (t.id === TEXT_COUNTER_MANIFEST.id) {
              return {
                ...t,
                name: TEXT_COUNTER_MANIFEST.name,
                category: TEXT_COUNTER_MANIFEST.category,
                description: TEXT_COUNTER_MANIFEST.description,
                pageSections: TEXT_COUNTER_MANIFEST.pageSections,
                seo: TEXT_COUNTER_MANIFEST.seo,
              };
            }
            return t;
          });
        }
      } catch (e) { /* fallback */ }
    }
    // Default SmallSEOTools Suite
    return TOOL_CATALOG.map(tool => ({
      ...tool,
      isInstalled: true,
      installedAt: '2026-03-24',
      status: 'published' as const,
    }));
  });

  useEffect(() => {
    try {
      localStorage.setItem('omni_tools_installed', JSON.stringify(tools));
    } catch (e) {
      console.warn('Failed to persist tools to localStorage:', e);
    }
  }, [tools]);

  const [catalog] = useState(TOOL_CATALOG);

  // Settings: SmallSEOTools modern tech palette
  const [settings, setSettings] = useState<SiteSettings>(() => {
    const saved = localStorage.getItem('omni_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return {
      siteName: 'SmallSEOTools - 100% Free Online SEO & Webmaster Toolkit',
      tagline: 'Professional SEO Tools, Content Optimization, Backlink Analyzers & Web Utilities',
      primaryColor: '#1d4ed8', // Royal Blue
      accentColor: '#10b981',  // Emerald Green
      goldColor: '#f59e0b',    // Amber
      logoText: 'SmallSEOTools',
      footerText: '© 2026 SmallSEOTools. Professional Free Search Engine Optimization & Webmaster Utilities.',
      maintenanceMode: false,
      registrationOpen: true,
      cacheTtlSeconds: 86400,
      defaultProcessingMode: 'browser',
    };
  });

  // Current logged in user
  const [currentUser] = useState<User>({
    id: 'usr_super_1',
    name: 'David Reynolds',
    email: 'david@smallseotools.com',
    role: 'owner',
    plan: 'business',
    status: 'active',
    createdAt: '2026-01-10',
    lastLogin: 'Just now',
    usageCount: 1420,
  });

  // Users Directory
  const [users, setUsers] = useState<User[]>([
    {
      id: 'usr_super_1',
      name: 'David Reynolds',
      email: 'david@smallseotools.com',
      role: 'owner',
      plan: 'business',
      status: 'active',
      createdAt: '2026-01-10',
      lastLogin: 'Just now',
      usageCount: 1420,
    },
    {
      id: 'usr_dev_2',
      name: 'Elena Rostova',
      email: 'elena.rostova@cloudscale.dev',
      role: 'developer',
      plan: 'business',
      status: 'active',
      createdAt: '2026-02-01',
      lastLogin: '2 hours ago',
      usageCount: 1420,
    },
    {
      id: 'usr_seo_3',
      name: 'Marcus Vance',
      email: 'marcus@growthrank.org',
      role: 'seo_manager',
      plan: 'pro',
      status: 'active',
      createdAt: '2026-02-14',
      lastLogin: 'Yesterday',
      usageCount: 520,
    },
    {
      id: 'usr_client_4',
      name: 'Sarah Jenkins',
      email: 'sarah@contentstudio.io',
      role: 'manager',
      plan: 'pro',
      status: 'active',
      createdAt: '2026-03-01',
      lastLogin: '3 days ago',
      usageCount: 190,
    },
  ]);

  // Initial CMS Blog posts with /tool embedding demonstration
  const [posts, setPosts] = useState<BlogPost[]>([
    {
      id: 'post_1',
      title: 'Architecting Zero-Latency Web Applications with Real-Time Processing',
      slug: 'architecting-zero-latency-web-apps',
      status: 'published',
      author: { name: 'Dr. Arthur Sterling' },
      category: 'Engineering & Architecture',
      tags: ['performance', 'real-time', 'architecture', 'latency'],
      featuredImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80',
      excerpt: 'How modern asynchronous computation pipelines deliver sub-millisecond user feedback, enterprise scalability, and complete data privacy.',
      publishedAt: '2026-03-20',
      updatedAt: '2026-03-21',
      views: 3410,
      commentsCount: 14,
      seo: {
        targetKeyword: 'zero latency real time architecture',
        title: 'Zero-Latency Web Apps with Real-Time Processing',
        metaDescription: 'A technical deep-dive into high-performance zero-latency computing architectures.',
        canonicalUrl: 'https://omnitools.io/blog/architecting-zero-latency-web-apps',
        index: true,
        score: 96,
      },
      blocks: [
        { id: 'b1', type: 'paragraph', content: 'Modern web architecture has reached an inflection point. Contemporary web utilities must deliver instantaneous results while guaranteeing absolute user privacy and data security.' },
        { id: 'b2', type: 'heading', level: 2, content: 'The Real-Time Processing Revolution' },
        { id: 'b3', type: 'paragraph', content: 'By leveraging modern asynchronous computation pipelines and optimized algorithms, utility tasks like image compression, cryptographic hashing, and text parsing can execute in fractions of a second.' },
        { id: 'b4', type: 'quote', content: 'Instant processing and confidentiality are fundamental pillars of modern web design.' },
        { id: 'b5', type: 'paragraph', content: 'Our platform delivers instant real-time computation with enterprise-grade reliability and zero latency.' }
      ]
    },
    {
      id: 'post_2',
      title: 'The Complete 2026 Technical SEO Checklist for High-Authority Webmasters',
      slug: '2026-technical-seo-checklist',
      status: 'published',
      author: { name: 'Marcus Vance' },
      category: 'Search Engine Optimization',
      tags: ['seo', 'core-web-vitals', 'meta-tags', 'google-ranking'],
      featuredImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80',
      excerpt: 'Essential technical guidelines for Google Core Web Vitals, OpenGraph metadata, structured JSON-LD schemas, and crawler budget optimization.',
      publishedAt: '2026-03-12',
      updatedAt: '2026-03-15',
      views: 5820,
      commentsCount: 29,
      seo: {
        targetKeyword: 'technical seo checklist 2026',
        title: '2026 Technical SEO Master Checklist | OmniTools OS',
        metaDescription: 'Master Core Web Vitals, canonical links, and social metadata with this comprehensive technical guide.',
        canonicalUrl: 'https://omnitools.io/blog/2026-technical-seo-checklist',
        index: true,
        score: 92,
      },
      blocks: [
        { id: 'b2_1', type: 'paragraph', content: 'Search engine algorithms in 2026 prioritize genuine real-user experience metrics above superficial keyword repetition. Ensuring your website has sub-100ms Interaction to Next Paint (INP) and pristine metadata structures is no longer optional.' },
        { id: 'b2_2', type: 'heading', level: 2, content: '1. Structured Data and Social Cards' },
        { id: 'b2_3', type: 'paragraph', content: 'Ensure all pages feature valid JSON-LD schemas describing organizations, authors, and article types, accompanied by 1200x630 OpenGraph images.' },
      ]
    }
  ]);

  // Static Pages
  const [pages, setPages] = useState<StaticPage[]>([
    {
      id: 'page_about',
      title: 'About SmallSEOTools',
      slug: 'about',
      status: 'published',
      content: 'SmallSEOTools is a premier online search engine optimization and webmaster toolkit engineered to empower digital marketers, webmasters, SEO agencies, and content writers with fast, accurate, and 100% free digital utilities.',
      updatedAt: '2026-03-24',
      seoTitle: 'About SmallSEOTools | Free SEO & Webmaster Toolkit',
      seoDescription: 'Learn about SmallSEOTools, our high-speed free SEO utilities, and our mission to simplify search optimization.',
    },
    {
      id: 'page_privacy',
      title: 'Privacy & Confidentiality Guarantee',
      slug: 'privacy',
      status: 'published',
      content: '100% Confidentiality: All text, keywords, and files processed through SmallSEOTools run instantaneously via client-side workers or secure memory-only pipelines. We never store, log, sell, or inspect user content.',
      updatedAt: '2026-03-24',
      seoTitle: 'Privacy Policy | SmallSEOTools',
      seoDescription: 'Our commitment to zero data logging and complete confidentiality for your SEO content.',
    },
    {
      id: 'page_terms',
      title: 'Terms of Service',
      slug: 'terms',
      status: 'published',
      content: 'By accessing SmallSEOTools online utilities or developer APIs, you agree to fair use guidelines and rate-limiting policies designed to keep the platform free and accessible to all webmasters.',
      updatedAt: '2026-03-24',
      seoTitle: 'Terms of Service | SmallSEOTools',
      seoDescription: 'Terms of service, fair use guidelines, and API licensing terms.',
    },
  ]);

  // Monetization Ad Units
  const [adUnits, setAdUnits] = useState<AdUnit[]>([
    {
      id: 'ad_top_leaderboard',
      name: 'Header Top Leaderboard',
      location: 'header_leaderboard',
      enabled: true,
      codeSnippet: '<!-- Google AdSense 728x90 Header Placement -->\n<ins class="adsbygoogle" style="display:inline-block;width:728px;height:90px" data-ad-client="ca-pub-9842104821"></ins>',
      minTierToBypass: 'pro',
      impressions: 48920,
      clicks: 1240,
    },
    {
      id: 'ad_tool_result',
      name: 'In-Tool Result Placement',
      location: 'in_tool_result',
      enabled: true,
      codeSnippet: '<!-- Responsive In-Tool Result Ad Unit -->\n<ins class="adsbygoogle" style="display:block" data-ad-format="auto"></ins>',
      minTierToBypass: 'pro',
      impressions: 89400,
      clicks: 3410,
    },
    {
      id: 'ad_sidebar',
      name: 'Sticky Sidebar Skyscraper',
      location: 'sidebar_sticky',
      enabled: false,
      codeSnippet: '<!-- 300x600 Half Page Ad Unit -->\n<div class="ad-skyscraper-slot"></div>',
      minTierToBypass: 'pro',
      impressions: 12000,
      clicks: 290,
    },
    {
      id: 'ad_interstitial',
      name: 'Tool Execution Countdown Modal',
      location: 'interstitial_delay',
      enabled: true,
      codeSnippet: '<!-- 5s Skip Delay Interstitial -->',
      delaySeconds: 5,
      minTierToBypass: 'pro',
      impressions: 14200,
      clicks: 890,
    }
  ]);

  // Subscription Plans
  const [plans] = useState<SubscriptionPlan[]>([
    {
      id: 'plan_free',
      name: 'Community Free',
      priceMonthly: 0,
      priceYearly: 0,
      description: 'Ideal for occasional personal utilities and quick calculations.',
      features: [
        'Instant real-time processing',
        'Standard file size limits (10MB)',
        'Up to 25 tool runs per day',
        'Standard queue priority',
        'Supported by relevant ads'
      ],
      toolQuotaPerDay: 25,
      hasApiAccess: false,
      hasAdFree: false,
      maxFileSize: '10MB',
    },
    {
      id: 'plan_pro',
      name: 'Professional Webmaster',
      priceMonthly: 12,
      priceYearly: 120,
      popular: true,
      description: 'For content creators, SEO specialists, and frequent web utility users.',
      features: [
        '100% Ad-Free Experience',
        'Expanded file size limits (100MB)',
        'Up to 2,000 tool runs per day',
        'Batch multi-file processing',
        'Developer REST API access (500 req/min)',
        'Priority execution queue'
      ],
      toolQuotaPerDay: 2000,
      hasApiAccess: true,
      hasAdFree: true,
      maxFileSize: '100MB',
    },
    {
      id: 'plan_agency',
      name: 'Enterprise Agency',
      priceMonthly: 49,
      priceYearly: 490,
      description: 'High-throughput access for development agencies and high-volume operations.',
      features: [
        'Unlimited daily tool runs',
        'Max payload size up to 1GB',
        'High-speed dedicated API access (5,000 req/min)',
        'White-label reports & PDF exports',
        'Team access (up to 10 seats)',
        'SLA 99.9% uptime guarantee'
      ],
      toolQuotaPerDay: 50000,
      hasApiAccess: true,
      hasAdFree: true,
      maxFileSize: '1GB',
    }
  ]);

  // Developer API Keys
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: 'key_prod_1',
      name: 'Production Webhook Gateway',
      keyMasked: 'omni_live_9a8f...4e19',
      rateLimitPerMin: 1000,
      status: 'active',
      createdAt: '2026-02-10',
      lastUsedAt: '4 minutes ago',
      totalCalls: 184920,
    },
    {
      id: 'key_stage_2',
      name: 'CI/CD Automated Testing',
      keyMasked: 'omni_test_7c2b...9d04',
      rateLimitPerMin: 200,
      status: 'active',
      createdAt: '2026-03-01',
      lastUsedAt: 'Yesterday',
      totalCalls: 3410,
    }
  ]);

  // Centralized System Logs
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'log_1',
      timestamp: '2026-09-23 22:50:14',
      service: 'application',
      level: 'info',
      message: 'Cloudflare Edge Cache purge completed for path /tools/*',
      requestId: 'req_purge_849201',
    },
    {
      id: 'log_2',
      timestamp: '2026-09-23 22:48:30',
      service: 'database',
      level: 'info',
      message: 'Firestore collection index rebuilt for "posts.publishedAt_desc"',
      requestId: 'req_idx_19482',
    },
    {
      id: 'log_3',
      timestamp: '2026-09-23 22:45:11',
      service: 'api',
      level: 'info',
      message: 'POST /api/v1/auth/verify - 200 OK (14ms)',
      requestId: 'req_api_938102',
      user: 'elena.rostova@cloudscale.dev',
    },
    {
      id: 'log_4',
      timestamp: '2026-09-23 22:30:05',
      service: 'worker',
      level: 'info',
      message: 'WebAssembly SIMD capability verified on client runtime',
      requestId: 'req_wasm_0931',
    }
  ]);

  // No-code Automation Rules
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([
    {
      id: 'auto_1',
      name: 'Welcome Email on New Registration',
      enabled: true,
      trigger: 'user_registered',
      condition: 'User role == "free" OR "pro"',
      action: 'send_email',
      lastRun: '1 hour ago',
      runCount: 421,
    },
    {
      id: 'auto_2',
      name: 'Auto-Purge CDN Cache on Article Publish',
      enabled: true,
      trigger: 'article_published',
      condition: 'Post status changes to "published"',
      action: 'purge_cache',
      lastRun: '3 days ago',
      runCount: 28,
    },
    {
      id: 'auto_3',
      name: 'Security Alert on Rapid 429 Rate Limits',
      enabled: true,
      trigger: 'error_spike',
      condition: '429 Rate Limit count > 50 in 1 minute',
      action: 'notify_admin',
      lastRun: 'Never',
      runCount: 0,
    }
  ]);

  // Save installed tools state
  useEffect(() => {
    localStorage.setItem('omni_tools_installed', JSON.stringify(tools));
  }, [tools]);

  // Save settings
  useEffect(() => {
    localStorage.setItem('omni_settings', JSON.stringify(settings));
  }, [settings]);

  // Global Keyboard shortcut: Cmd + K / Ctrl + K for Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Tool Operations
  const installTool = (toolId: string) => {
    const item = catalog.find(t => t.id === toolId);
    if (!item) return;
    if (tools.some(t => t.id === toolId)) return;

    const installed: ToolModule = {
      ...item,
      isInstalled: true,
      installedAt: new Date().toISOString().split('T')[0],
      activityLogs: [
        {
          id: `act_${Date.now()}`,
          user: currentUser.name,
          action: 'Tool installed from module registry catalog',
          date: new Date().toISOString().slice(0, 16).replace('T', ' '),
          newValue: 'Installed & Published',
        },
        ...item.activityLogs,
      ]
    };
    setTools(prev => [...prev, installed]);
    addLog('application', 'info', `Tool "${item.name}" (${item.slug}) successfully installed into registry.`);
  };

  const uninstallTool = (toolId: string) => {
    const target = tools.find(t => t.id === toolId);
    setTools(prev => prev.filter(t => t.id !== toolId));
    if (target) {
      addLog('application', 'warn', `Tool "${target.name}" uninstalled from active registry.`);
    }
  };

  const toggleToolStatus = (toolId: string, status?: ToolModule['status']) => {
    setTools(prev => prev.map(t => {
      if (t.id === toolId) {
        const newStatus = status ? status : (t.status === 'published' ? 'disabled' : 'published');
        return {
          ...t,
          status: newStatus,
          activityLogs: [
            {
              id: `act_${Date.now()}`,
              user: currentUser.name,
              action: `Status toggled to ${newStatus.toUpperCase()}`,
              date: new Date().toISOString().slice(0, 16).replace('T', ' '),
              previousValue: t.status,
              newValue: newStatus,
            },
            ...t.activityLogs,
          ]
        };
      }
      return t;
    }));
  };

  const updateTool = (updated: ToolModule) => {
    setTools(prev => prev.map(t => t.id === updated.id ? updated : t));
    addLog('application', 'info', `Configuration updated for tool "${updated.name}"`);
  };

  const createCustomTool = (newTool: Partial<ToolModule>) => {
    const id = `tool_custom_${Date.now()}`;
    const fullTool: ToolModule = {
      id,
      slug: newTool.slug || `tool-${Date.now()}`,
      name: newTool.name || 'Untitled Custom Tool',
      description: newTool.description || 'Custom web tool generated via Admin Tool Builder.',
      category: newTool.category || 'General Utilities',
      iconName: newTool.iconName || 'Wrench',
      status: 'published',
      processingMode: newTool.processingMode || 'browser',
      workerName: newTool.workerName || 'custom-worker.ts',
      sourcePath: newTool.sourcePath || `src/tools/${newTool.slug || 'custom'}/Index.ts`,
      version: '1.0.0',
      tags: newTool.tags || ['custom', 'utility'],
      isInstalled: true,
      installedAt: new Date().toISOString().split('T')[0],
      limits: {
        guest: { allowed: true, maxRunsPerDay: 10, maxPayloadSize: '10MB' },
        registered: { allowed: true, maxRunsPerDay: 50, maxPayloadSize: '25MB' },
        pro: { allowed: true, maxRunsPerDay: 1000, maxPayloadSize: '100MB' },
        business: { allowed: true, maxRunsPerDay: 10000, maxPayloadSize: '500MB' },
      },
      seo: {
        title: `${newTool.name} | Free Online Tool`,
        metaDescription: newTool.description || 'Fast and secure online utility tool.',
        canonicalUrl: `https://omnitools.io/tools/${newTool.slug}`,
        indexInSearch: true,
        includeInSitemap: true,
        keywords: [newTool.name?.toLowerCase() || 'online tool'],
      },
      configSchema: newTool.configSchema || [],
      pageSections: [
        { id: 'sec_hero', type: 'hero', title: newTool.name || 'Custom Tool', enabled: true },
        { id: 'sec_tool', type: 'tool', title: 'Interactive Workspace', enabled: true },
        { id: 'sec_desc', type: 'description', title: 'Description', enabled: true, content: newTool.description },
      ],
      versions: [
        { version: '1.0.0', releaseDate: new Date().toISOString().split('T')[0], author: currentUser.name, changelog: 'Initial tool registration via wizard.', isCurrent: true },
      ],
      activityLogs: [
        { id: `act_${Date.now()}`, user: currentUser.name, action: 'Registered custom tool in registry', date: new Date().toISOString().slice(0, 16).replace('T', ' ') }
      ],
      metrics: { totalRuns: 0, successRate: 100, avgLatencyMs: 20, uniqueUsers: 0, errorCount: 0 }
    };

    setTools(prev => [...prev, fullTool]);
    addLog('application', 'info', `Custom tool "${fullTool.name}" created and registered.`);
  };

  const deleteToolPermanently = (toolId: string) => {
    setTools(prev => prev.filter(t => t.id !== toolId));
    addLog('application', 'warn', `Permanently deleted tool with ID: ${toolId}`);
  };

  const duplicateTool = (toolId: string) => {
    const source = tools.find(t => t.id === toolId);
    if (!source) return;
    const newId = `tool_custom_${Date.now()}`;
    const newSlug = `${source.slug}-copy`;
    const duplicated: ToolModule = {
      ...source,
      id: newId,
      name: `${source.name} Copy`,
      slug: newSlug,
      version: '1.0.0',
      status: 'draft',
      isInstalled: true,
      installedAt: new Date().toISOString().split('T')[0],
      versions: [
        {
          version: '1.0.0',
          releaseDate: new Date().toISOString().split('T')[0],
          author: currentUser.name,
          changelog: `Duplicated from ${source.name} (v${source.version})`,
          isCurrent: true,
        }
      ],
      activityLogs: [
        {
          id: `act_${Date.now()}`,
          user: currentUser.name,
          action: `tool.duplicated from ${source.name}`,
          date: new Date().toISOString().slice(0, 16).replace('T', ' '),
          newValue: `Created ${newSlug} (draft)`,
        }
      ],
      seo: {
        ...source.seo,
        title: `${source.seo.title} Copy`,
        canonicalUrl: `https://omnitools.io/tools/${newSlug}`,
      }
    };
    setTools(prev => [duplicated, ...prev]);
    addLog('application', 'info', `tool.duplicated: Tool "${source.name}" cloned into "${duplicated.name}" (${duplicated.slug})`);
  };

  const rollbackToolVersion = (toolId: string, targetVersion: string) => {
    setTools(prev => prev.map(t => {
      if (t.id === toolId) {
        const verObj = t.versions.find(v => v.version === targetVersion);
        if (!verObj) return t;
        const updatedVersions = t.versions.map(v => ({
          ...v,
          isCurrent: v.version === targetVersion,
        }));
        const newActivity = {
          id: `act_${Date.now()}`,
          user: currentUser.name,
          action: `tool.rollback to v${targetVersion}`,
          date: new Date().toISOString().slice(0, 16).replace('T', ' '),
          previousValue: `v${t.version}`,
          newValue: `v${targetVersion} (Restored)`,
        };
        addLog('application', 'warn', `tool.rollback: "${t.name}" restored from v${t.version} to v${targetVersion}`);
        return {
          ...t,
          version: targetVersion,
          versions: updatedVersions,
          activityLogs: [newActivity, ...t.activityLogs],
        };
      }
      return t;
    }));
  };

  // CMS Post Operations
  const createPost = (newPost: Partial<BlogPost>) => {
    const post: BlogPost = {
      id: `post_${Date.now()}`,
      title: newPost.title || 'Untitled Article',
      slug: newPost.slug || `post-${Date.now()}`,
      status: newPost.status || 'draft',
      author: { name: currentUser.name },
      category: newPost.category || 'General',
      tags: newPost.tags || ['tools', 'updates'],
      featuredImage: newPost.featuredImage || 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80',
      excerpt: newPost.excerpt || 'New article on OmniTools OS.',
      blocks: newPost.blocks || [
        { id: 'b_init', type: 'paragraph', content: 'Start typing your article here or use slash commands like /heading, /tool, /image...' }
      ],
      publishedAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      views: 0,
      commentsCount: 0,
      seo: {
        targetKeyword: newPost.seo?.targetKeyword || '',
        title: newPost.seo?.title || newPost.title || '',
        metaDescription: newPost.seo?.metaDescription || newPost.excerpt || '',
        canonicalUrl: `https://omnitools.io/blog/${newPost.slug || 'post'}`,
        index: true,
        score: 80,
      }
    };
    setPosts(prev => [post, ...prev]);
    addLog('application', 'info', `New blog article created: "${post.title}"`);
  };

  const updatePost = (updated: BlogPost) => {
    setPosts(prev => prev.map(p => p.id === updated.id ? { ...updated, updatedAt: new Date().toISOString().split('T')[0] } : p));
  };

  const deletePost = (id: string) => {
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  const updatePage = (updated: StaticPage) => {
    setPages(prev => prev.map(p => p.id === updated.id ? { ...updated, updatedAt: new Date().toISOString().split('T')[0] } : p));
  };

  // User Management
  const updateUserRole = (userId: string, role: Role) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
    addLog('auth', 'info', `User ${userId} role changed to ${role}`);
  };

  const updateUserPlan = (userId: string, plan: User['plan']) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, plan } : u));
    addLog('billing', 'info', `User ${userId} subscription plan set to ${plan}`);
  };

  // Ads
  const toggleAdUnit = (id: string) => {
    setAdUnits(prev => prev.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
  };

  const updateAdUnit = (updated: AdUnit) => {
    setAdUnits(prev => prev.map(a => a.id === updated.id ? updated : a));
  };

  // Settings
  const updateSettings = (newSettings: Partial<SiteSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    addLog('application', 'info', 'Global platform site settings updated.');
  };

  // Dev Suite
  const createApiKey = (name: string, rateLimit: number) => {
    const rawRandom = Math.random().toString(36).substring(2, 10);
    const newKey: ApiKey = {
      id: `key_${Date.now()}`,
      name,
      keyMasked: `omni_live_${rawRandom}...${Math.random().toString(36).substring(2, 6)}`,
      rateLimitPerMin: rateLimit,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      lastUsedAt: 'Never',
      totalCalls: 0,
    };
    setApiKeys(prev => [newKey, ...prev]);
    addLog('api', 'info', `New API key generated: "${name}" (${rateLimit} req/min)`);
  };

  const revokeApiKey = (id: string) => {
    setApiKeys(prev => prev.map(k => k.id === id ? { ...k, status: 'revoked' } : k));
    addLog('api', 'warn', `API key ${id} revoked.`);
  };

  const addLog = (service: LogEntry['service'], level: LogEntry['level'], message: string, meta?: any) => {
    const newLog: LogEntry = {
      id: `log_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      service,
      level,
      message,
      requestId: `req_${Math.random().toString(36).substring(2, 8)}`,
      user: currentUser.email,
      ...meta,
    };
    setLogs(prev => [newLog, ...prev.slice(0, 199)]);
  };

  const toggleAutomationRule = (id: string) => {
    setAutomationRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  return (
    <PlatformContext.Provider
      value={{
        viewMode,
        setViewMode,
        activeAdminTab,
        setActiveAdminTab,
        publicRoute,
        setPublicRoute,
        showDeveloperDetails,
        setShowDeveloperDetails,
        tools,
        catalog,
        installTool,
        uninstallTool,
        toggleToolStatus,
        updateTool,
        createCustomTool,
        deleteToolPermanently,
        duplicateTool,
        rollbackToolVersion,
        posts,
        pages,
        createPost,
        updatePost,
        deletePost,
        updatePage,
        currentUser,
        users,
        updateUserRole,
        updateUserPlan,
        adUnits,
        toggleAdUnit,
        updateAdUnit,
        plans,
        settings,
        updateSettings,
        apiKeys,
        createApiKey,
        revokeApiKey,
        logs,
        addLog,
        automationRules,
        toggleAutomationRule,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
      }}
    >
      {children}
    </PlatformContext.Provider>
  );
};

export const usePlatform = () => {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error('usePlatform must be used within a PlatformProvider');
  }
  return context;
};
