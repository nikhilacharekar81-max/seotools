import { ToolModule } from '../../types';

export const PLAGIARISM_CHECKER_MANIFEST: Omit<ToolModule, 'isInstalled' | 'installedAt'> = {
  id: 'tool_plagiarism',
  slug: 'plagiarism-checker',
  name: 'Plagiarism Checker',
  description: 'Check your text for plagiarism for free. Scan your writing to find matching sentences, see original sources, and fix citations.',
  category: 'Text Analysis Tools',
  iconName: 'Shield',
  status: 'published',
  processingMode: 'hybrid',
  sourcePath: 'src/tools/plagiarism-checker/index.ts',
  version: '2.1.0',
  tags: ['plagiarism checker', 'check plagiarism', 'free plagiarism checker', 'originality score', 'similarity score', 'essay checker', 'duplicate content', 'how to cite sources'],
  limits: {
    guest: { allowed: true, maxRunsPerDay: 10, maxPayloadSize: '1,000 words' },
    registered: { allowed: true, maxRunsPerDay: 50, maxPayloadSize: '2,500 words' },
    pro: { allowed: true, maxRunsPerDay: 1000, maxPayloadSize: '10,000 words' },
    business: { allowed: true, maxRunsPerDay: 5000, maxPayloadSize: '25,000 words' },
  },
  seo: {
    title: 'Free Plagiarism Checker – Check Your Text for Free Online',
    metaDescription: 'Check your text for plagiarism for free. Scan essays, articles, and papers to find matching sentences, view original web sources, and check your citations.',
    canonicalUrl: 'https://seotools.com/tools/plagiarism-checker',
    indexInSearch: true,
    includeInSitemap: true,
    keywords: [
      'plagiarism checker',
      'check plagiarism',
      'free plagiarism checker',
      'plagiarism detector',
      'duplicate content checker',
      'similarity score',
      'check my essay',
      'originality checker'
    ],
  },
  configSchema: [
    { id: 'maxWordScan', label: 'Max Words per Single Scan', type: 'number', defaultValue: 1000, value: 1000 },
    { 
      id: 'defaultSensitivity', 
      label: 'Default Scan Sensitivity', 
      type: 'select', 
      defaultValue: 'standard', 
      value: 'standard', 
      options: [
        { label: 'Academic (58% Strict)', value: 'strict' },
        { label: 'Balanced (68% Standard)', value: 'standard' },
        { label: 'Lenient (78% Loose)', value: 'lenient' }
      ] 
    },
    { id: 'enableExcludeUrl', label: 'Enable Exclude Own URL Option', type: 'boolean', defaultValue: true, value: true },
  ],
  pageSections: [
    { 
      id: 'sec_tool', 
      type: 'tool', 
      title: 'Free Online Plagiarism Checker', 
      enabled: true 
    }
  ],
  versions: [
    { 
      version: '2.1.0', 
      releaseDate: '2026-03-24', 
      author: 'SEO & Linguistic Core Team', 
      changelog: 'Full search-intent driven content layer, side-by-side inspection diff, and deterministic token matching.', 
      isCurrent: true 
    }
  ],
  activityLogs: [
    { 
      id: 'act_init', 
      user: 'Administrator', 
      action: 'Module updated to search-intent architecture', 
      date: '2026-03-24 00:00', 
      newValue: 'v2.1.0 Published' 
    }
  ],
  metrics: { 
    totalRuns: 48900, 
    successRate: 99.9, 
    avgLatencyMs: 320, 
    uniqueUsers: 24500, 
    errorCount: 4 
  }
};
