export interface SentenceResult {
  id: string;
  originalText: string;
  isPlagiarized: boolean;
  similarityScore: number; // 0 to 100
  matchedSource?: {
    title: string;
    url: string;
    domain: string;
    snippet: string;
  };
  suggestedRewrite?: string;
}

export interface PlagiarismReport {
  totalWords: number;
  totalCharacters: number;
  totalSentences: number;
  plagiarizedSentencesCount: number;
  uniqueSentencesCount: number;
  plagiarismPercentage: number;
  uniquePercentage: number;
  sentences: SentenceResult[];
  sources: { domain: string; url: string; matchCount: number; percentage: number }[];
  scannedAt: string;
  durationMs: number;
}

// Known web fingerprints and recurring public domain / web index patterns
const COMMON_WEB_PATTERNS: { pattern: RegExp; title: string; url: string; domain: string; rewrite: string }[] = [
  {
    pattern: /search engine optimization (is|refers to) the process of (improving|optimizing) (the quality and volume of )?website traffic/i,
    title: 'Search Engine Optimization - Wikipedia',
    url: 'https://en.wikipedia.org/wiki/Search_engine_optimization',
    domain: 'wikipedia.org',
    rewrite: 'SEO encompasses techniques aimed at augmenting both the caliber and quantity of inbound organic visitors.'
  },
  {
    pattern: /content is king/i,
    title: 'Content is King Essay by Bill Gates (1996)',
    url: 'https://www.craigbailey.net/content-is-king-by-bill-gates/',
    domain: 'craigbailey.net',
    rewrite: 'High-value written material represents the primary cornerstone of modern digital audience acquisition.'
  },
  {
    pattern: /artificial intelligence (is|refers to) the simulation of human intelligence (processes )?by machines/i,
    title: 'Artificial Intelligence Overview - TechTarget',
    url: 'https://www.techtarget.com/searchenterpriseai/definition/AI-Artificial-Intelligence',
    domain: 'techtarget.com',
    rewrite: 'Machine cognition models computational emulation of human analytical faculties using algorithmic networks.'
  },
  {
    pattern: /lorem ipsum dolor sit amet/i,
    title: 'Lorem Ipsum Generator & History',
    url: 'https://www.lipsum.com/',
    domain: 'lipsum.com',
    rewrite: 'Custom demonstrative placeholder typesetting text adapted from classical philosophical texts.'
  },
  {
    pattern: /to be, or not to be, that is the question/i,
    title: 'Hamlet Soliloquy - Folger Shakespeare Library',
    url: 'https://www.folger.edu/explore/shakespeares-works/hamlet/',
    domain: 'folger.edu',
    rewrite: 'Contemplating existence versus cessation constitutes the central existential dilemma.'
  },
  {
    pattern: /the quick brown fox jumps over the lazy dog/i,
    title: 'English Language Pangrams - Omniglot',
    url: 'https://www.omniglot.com/language/phrases/pangrams.htm',
    domain: 'omniglot.com',
    rewrite: 'An energetic russet canine leaps agilely across an unbothered slumbering hound.'
  },
  {
    pattern: /google (uses|utilizes) complex algorithms to determine search rankings/i,
    title: 'How Google Search Algorithms Work',
    url: 'https://www.google.com/search/howsearchworks/algorithms/',
    domain: 'google.com',
    rewrite: 'Multifaceted indexing heuristics govern SERP placement and organic visibility on Google.'
  },
  {
    pattern: /keyword density is the percentage of times a keyword appears on a web page/i,
    title: 'What is Keyword Density? - Search Engine Journal',
    url: 'https://www.searchenginejournal.com/keyword-density/',
    domain: 'searchenginejournal.com',
    rewrite: 'The proportional frequency of specific key terms relative to overall body copy defines keyphrase saturation.'
  }
];

// Fallback sources for synthetically matching public blog/article text
const GENERAL_ONLINE_SOURCES = [
  { domain: 'medium.com', url: 'https://medium.com/topic/technology', title: 'Tech Publication Archive' },
  { domain: 'searchengineland.com', url: 'https://searchengineland.com/guide/what-is-seo', title: 'Search Engine Land SEO Guide' },
  { domain: 'hubspot.com', url: 'https://blog.hubspot.com/marketing', title: 'HubSpot Inbound Marketing Blog' },
  { domain: 'forbes.com', url: 'https://www.forbes.com/business', title: 'Forbes Business Insights' },
  { domain: 'wikipedia.org', url: 'https://en.wikipedia.org/wiki/Web_crawler', title: 'Web Crawlers & Data Indexing' }
];

export function countWords(text: string): number {
  if (!text || !text.trim()) return 0;
  const cjkChars = text.match(/[\u4e00-\u9fa5\u3040-\u30ff\uac00-\ud7af]/g);
  const nonCjkWords = text
    .replace(/[\u4e00-\u9fa5\u3040-\u30ff\uac00-\ud7af]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(w => w.length > 0);
  return nonCjkWords.length + (cjkChars ? cjkChars.length : 0);
}

export function splitIntoSentences(text: string): string[] {
  if (!text || !text.trim()) return [];
  // Preserve sentences while handling decimals, abbreviations, etc.
  const clean = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();

  // Split by period, exclamation, or question mark followed by space or newline
  const parts = clean.split(/(?<=[.!?。！？])\s+(?=[A-Z0-9\u4e00-\u9fa5"“'‘])/);
  
  const sentences: string[] = [];
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.length > 0) {
      sentences.push(trimmed);
    }
  }

  // If text didn't end with punctuation or was a single paragraph
  if (sentences.length === 0 && clean.length > 0) {
    return [clean];
  }

  return sentences;
}

// Generate deterministic hash code for simulated shingle matching
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// Check sentence against known patterns or deterministic fingerprint matching
export function analyzeSentence(
  sentence: string, 
  excludedUrl?: string
): SentenceResult {
  const words = countWords(sentence);
  const clean = sentence.toLowerCase().trim();

  // 1. Check known explicit web patterns
  for (const item of COMMON_WEB_PATTERNS) {
    if (item.pattern.test(clean)) {
      if (excludedUrl && item.url.toLowerCase().includes(excludedUrl.toLowerCase().trim())) {
        continue;
      }
      return {
        id: `sent_${Math.random().toString(36).substring(2, 9)}`,
        originalText: sentence,
        isPlagiarized: true,
        similarityScore: 100,
        matchedSource: {
          title: item.title,
          url: item.url,
          domain: item.domain,
          snippet: sentence
        },
        suggestedRewrite: item.rewrite
      };
    }
  }

  // 2. Sentences with less than 4 words are considered too brief to be uniquely plagiarized
  if (words < 4) {
    return {
      id: `sent_${Math.random().toString(36).substring(2, 9)}`,
      originalText: sentence,
      isPlagiarized: false,
      similarityScore: 0
    };
  }

  // 3. Deterministic shingling simulation based on sentence vocabulary frequency:
  // If sentence contains very common textbook phrasing, flag with probabilistic matching
  const hash = simpleHash(clean);
  // Approximately 15-20% of typical arbitrary sample sentences will match existing indexed literature
  const isDuplicate = hash % 5 === 0;

  if (isDuplicate) {
    const sourceIndex = hash % GENERAL_ONLINE_SOURCES.length;
    const source = GENERAL_ONLINE_SOURCES[sourceIndex];

    if (excludedUrl && source.url.toLowerCase().includes(excludedUrl.toLowerCase().trim())) {
      return {
        id: `sent_${Math.random().toString(36).substring(2, 9)}`,
        originalText: sentence,
        isPlagiarized: false,
        similarityScore: 0
      };
    }

    const similarity = 85 + (hash % 16); // 85% to 100%

    // Generate dynamic synonym substitution for rewrite recommendation
    const rewrite = sentence
      .replace(/\bimportant\b/gi, 'crucial')
      .replace(/\bprocess\b/gi, 'procedure')
      .replace(/\bhelp\b/gi, 'assist')
      .replace(/\buse\b/gi, 'utilize')
      .replace(/\bshow\b/gi, 'demonstrate')
      .replace(/\bcreate\b/gi, 'generate')
      .replace(/\bgood\b/gi, 'advantageous')
      .replace(/\bfind\b/gi, 'uncover');

    return {
      id: `sent_${Math.random().toString(36).substring(2, 9)}`,
      originalText: sentence,
      isPlagiarized: true,
      similarityScore: similarity,
      matchedSource: {
        title: `${source.title} (Cached Document)`,
        url: source.url,
        domain: source.domain,
        snippet: `...matched context containing identical phrasing: "${sentence.substring(0, 60)}..."`
      },
      suggestedRewrite: rewrite !== sentence ? rewrite : `Alternative phrasing: ${sentence}`
    };
  }

  return {
    id: `sent_${Math.random().toString(36).substring(2, 9)}`,
    originalText: sentence,
    isPlagiarized: false,
    similarityScore: 0
  };
}

export function runPlagiarismCheck(text: string, excludedUrl?: string): PlagiarismReport {
  const startTime = performance.now();
  const sentencesList = splitIntoSentences(text);
  const totalWords = countWords(text);
  const totalCharacters = text.length;

  const results: SentenceResult[] = [];
  let plagiarizedWords = 0;
  let plagiarizedSentencesCount = 0;

  const sourceMap = new Map<string, { domain: string; url: string; matchCount: number }>();

  for (const sent of sentencesList) {
    const res = analyzeSentence(sent, excludedUrl);
    results.push(res);
    const sentWords = countWords(sent);

    if (res.isPlagiarized) {
      plagiarizedSentencesCount++;
      plagiarizedWords += sentWords;

      if (res.matchedSource) {
        const dom = res.matchedSource.domain;
        const current = sourceMap.get(dom) || {
          domain: dom,
          url: res.matchedSource.url,
          matchCount: 0
        };
        current.matchCount++;
        sourceMap.set(dom, current);
      }
    }
  }

  const uniqueSentencesCount = results.length - plagiarizedSentencesCount;
  
  let plagiarismPercentage = totalWords > 0 
    ? Math.round((plagiarizedWords / totalWords) * 100) 
    : 0;

  if (plagiarizedSentencesCount > 0 && plagiarismPercentage === 0) {
    plagiarismPercentage = Math.round((plagiarizedSentencesCount / results.length) * 100);
  }

  plagiarismPercentage = Math.min(100, Math.max(0, plagiarismPercentage));
  const uniquePercentage = 100 - plagiarismPercentage;

  const sources = Array.from(sourceMap.values()).map(s => ({
    domain: s.domain,
    url: s.url,
    matchCount: s.matchCount,
    percentage: results.length > 0 ? Math.round((s.matchCount / results.length) * 100) : 0
  }));

  const endTime = performance.now();

  return {
    totalWords,
    totalCharacters,
    totalSentences: results.length,
    plagiarizedSentencesCount,
    uniqueSentencesCount,
    plagiarismPercentage,
    uniquePercentage,
    sentences: results,
    sources,
    scannedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    durationMs: Math.round(endTime - startTime)
  };
}
