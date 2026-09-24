import { ToolModule } from '../../types';

export const TEXT_COUNTER_MANIFEST: Omit<ToolModule, 'isInstalled' | 'installedAt'> = {
  id: 'tool_text_counter',
  slug: 'text-counter',
  name: 'Word Counter & Text Analyzer',
  description: 'Count words, characters, sentences, paragraphs, reading time, speaking duration, and analyze real-time keyword density for SEO content.',
  category: 'Text Analysis Tools',
  iconName: 'FileText',
  status: 'published',
  processingMode: 'browser',
  workerName: 'text-counter-worker.ts',
  sourcePath: 'src/tools/text-counter/index.ts',
  version: '1.0.0',
  tags: ['word counter', 'character count', 'seo content', 'reading time', 'keyword density', 'text analyzer'],
  limits: {
    guest: { allowed: true, maxRunsPerDay: 1000, maxPayloadSize: '10MB' },
    registered: { allowed: true, maxRunsPerDay: 5000, maxPayloadSize: '25MB' },
    pro: { allowed: true, maxRunsPerDay: 50000, maxPayloadSize: '100MB' },
    business: { allowed: true, maxRunsPerDay: 100000, maxPayloadSize: '250MB' },
  },
  seo: {
    title: 'Word Counter & Text Analyzer – 100% Free Online Character Counter',
    metaDescription: 'Free online word counter, character counter, and keyword density analyzer. Check word count, sentences, paragraphs, reading speed, and SEO readability.',
    canonicalUrl: 'https://smallseotools.com/text-counter',
    indexInSearch: true,
    includeInSitemap: true,
    keywords: ['word counter', 'character counter', 'count words online', 'keyword density checker', 'reading time calculator', 'seo text counter'],
  },
  configSchema: [
    { id: 'readingSpeedWpm', label: 'Assumed Reading Speed (Words Per Minute)', type: 'number', defaultValue: 200, value: 200, min: 50, max: 600, unit: 'WPM', description: 'Average silent reading speed for words-per-minute estimation.' },
    { id: 'speakingSpeedWpm', label: 'Assumed Speaking Speed (Words Per Minute)', type: 'number', defaultValue: 130, value: 130, min: 40, max: 400, unit: 'WPM', description: 'Average verbal presentation speaking speed.' },
    { id: 'showWords', label: 'Display Word Count Metric', type: 'boolean', defaultValue: true, value: true, description: 'Display total words card in public interface.' },
    { id: 'showChars', label: 'Display Total Characters Metric', type: 'boolean', defaultValue: true, value: true, description: 'Display total characters card.' },
    { id: 'showCharsNoSpaces', label: 'Display Characters Without Spaces', type: 'boolean', defaultValue: true, value: true, description: 'Display character count excluding whitespace.' },
    { id: 'showSentences', label: 'Display Sentence Count Metric', type: 'boolean', defaultValue: true, value: true, description: 'Display total sentences card.' },
    { id: 'showParagraphs', label: 'Display Paragraph Count Metric', type: 'boolean', defaultValue: true, value: true, description: 'Display total paragraphs card.' },
    { id: 'showLines', label: 'Display Line Count Metric', type: 'boolean', defaultValue: true, value: true, description: 'Display line break count card.' },
    { id: 'showReadingTime', label: 'Display Reading Time Estimation', type: 'boolean', defaultValue: true, value: true, description: 'Display estimated silent reading duration.' },
    { id: 'showSpeakingTime', label: 'Display Speaking Time Estimation', type: 'boolean', defaultValue: true, value: true, description: 'Display estimated speech presentation duration.' },
  ],
  pageSections: [
    { 
      id: 'sec_hero', 
      type: 'hero', 
      title: 'Real-Time Text Counter & Linguistic Statistics', 
      enabled: true,
      content: 'Instant, privacy-first text analysis. Calculate exact words, characters, sentences, paragraphs, reading speed, and speech duration with complete confidentiality and zero data retention.'
    },
    { 
      id: 'sec_tool', 
      type: 'tool', 
      title: 'Interactive Text Workspace', 
      enabled: true 
    },
    { 
      id: 'sec_features', 
      type: 'features', 
      title: 'Core Linguistic Capabilities', 
      enabled: true,
      items: [
        { title: '100% Privacy & Confidentiality', text: 'All text analysis is conducted with strict privacy. Your content is never stored, tracked, or shared.', icon: 'ShieldCheck' },
        { title: 'Deterministic Counting Rules', text: 'Accurately parses Unicode, emojis, CJK ideographs, decimal numbers, and varied line breaks.', icon: 'CheckCircle' },
        { title: 'Reading & Speech Timing', text: 'Configurable reading (200 WPM) and speaking (130 WPM) estimations tailored for presentations and essays.', icon: 'Clock' },
        { title: 'Ultra-Low Latency', text: 'Instant sub-millisecond updates on every keystroke or multi-megabyte clipboard paste.', icon: 'Zap' }
      ]
    },
    { 
      id: 'sec_desc', 
      type: 'description', 
      title: 'How The Counting Engine Operates', 
      enabled: true, 
      content: 'Our text counter analyzes your input using advanced asynchronous algorithms to keep your workflow responsive even with hundreds of pages of text. Word counts are computed by evaluating token boundaries across unicode spaces while preserving hyphenated words and handling Chinese/Japanese/Korean characters independently. Sentence detection filters out decimal points and abbreviation anomalies.' 
    },
    { 
      id: 'sec_faq', 
      type: 'faq', 
      title: 'Frequently Asked Questions', 
      enabled: true, 
      items: [
        { question: 'Is my text stored or saved?', answer: 'No. The text analyzer processes all content in real time. Your text is never permanently stored, recorded, or shared.' },
        { question: 'How is reading time calculated?', answer: 'Reading time uses the standard baseline of 200 words per minute (WPM), adjustable by the platform operator.' },
        { question: 'Does the tool support emojis and non-Latin alphabets?', answer: 'Yes, the counting engine supports full UTF-16 Unicode sequences, emojis, and East Asian CJK characters.' },
        { question: 'Can I upload a text file directly?', answer: 'Yes, you can click "Upload Text File" or drag and drop a .txt, .md, or .csv file directly into the editor.' }
      ]
    },
    { 
      id: 'sec_cta', 
      type: 'cta', 
      title: 'Need High-Volume Programmatic Batch Counting?', 
      enabled: true,
      content: 'Explore our Pro developer API for automated text processing pipelines and webhook integrations.'
    }
  ],
  versions: [
    { 
      version: '1.0.0', 
      releaseDate: '2026-03-24', 
      author: 'Platform Core Team', 
      changelog: 'Initial production release with Web Worker multithreading, Unicode support, and deterministic counting rules.', 
      isCurrent: true 
    }
  ],
  activityLogs: [
    { 
      id: 'act_init', 
      user: 'Administrator', 
      action: 'Module published to production', 
      date: '2026-03-24 00:00', 
      newValue: 'v1.0.0 Published' 
    }
  ],
  metrics: { 
    totalRuns: 0, 
    successRate: 100, 
    avgLatencyMs: 0.8, 
    uniqueUsers: 0, 
    errorCount: 0 
  }
};
