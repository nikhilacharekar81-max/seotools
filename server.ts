import express from 'express';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

// Import our genuine plagiarism scanning and crawling pipeline
import { runBackendPlagiarismScan } from './src/tools/plagiarism-checker/backendComparer';
import { fetchWithSsrfProtection, extractCleanArticleText } from './src/tools/plagiarism-checker/backendExtractor';
import { countWords } from './src/tools/plagiarism-checker/engine';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Centralized configurations with safe default fallbacks (Phase 18)
const PLAGIARISM_MAX_WORDS = Number(process.env.PLAGIARISM_MAX_WORDS) || 1000;
const PLAGIARISM_URL_MAX_WORDS = Number(process.env.PLAGIARISM_URL_MAX_WORDS) || 1000;

const RATE_LIMIT_LIMIT = Number(process.env.RATE_LIMIT_LIMIT) || 50; // default 50 scans per window
const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS) || 60 * 60 * 1000; // default 1 hour window

// Clean memory-based rate limiter map (Phase 5)
interface RateLimitEntry {
  count: number;
  resetTime: number;
}
const rateLimitMap = new Map<string, RateLimitEntry>();

/**
 * Backend IP-Based Rate Limiting Middleware running BEFORE expensive search operations (Phase 5)
 */
function apiRateLimiter(req: express.Request, res: express.Response, next: express.NextFunction) {
  const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown-ip');
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS
    });
    return next();
  }

  if (entry.count >= RATE_LIMIT_LIMIT) {
    return res.status(429).json({
      error: 'Rate Limit Exceeded: You have exceeded the permitted plagiarism scans for this period. Please try again later.'
    });
  }

  entry.count++;
  rateLimitMap.set(ip, entry);
  next();
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '12mb' }));

  /**
   * Genuine Web-Source Plagiarism Scan Endpoint (Phase 3-11, 14, 17)
   * Enforces server-side word count limit prior to executing expensive searches (Phase 4).
   */
  app.post('/api/plagiarism/scan', apiRateLimiter, async (req, res) => {
    const { text, excludedUrl, sensitivity } = req.body;
    
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Text input is required' });
    }

    // 1. Enforce strict server-side word limits (Phase 4)
    const wordCount = countWords(text);
    if (wordCount > PLAGIARISM_MAX_WORDS) {
      return res.status(400).json({
        error: `Input text exceeds the maximum permitted word count of ${PLAGIARISM_MAX_WORDS} words.`
      });
    }

    try {
      console.log(`[Plagiarism scan started] Word count: ${wordCount}`);
      
      const report = await runBackendPlagiarismScan(text, excludedUrl, sensitivity);
      
      console.log(`[Plagiarism scan completed] Unique: ${report.noMatchPercentage}%, Matches: ${report.matchingPercentage}%`);
      return res.json(report);
    } catch (error: any) {
      console.error('[Plagiarism scan error]:', error.message);
      return res.status(500).json({ 
        error: 'Unable to complete web-source verification.', 
        details: error.message 
      });
    }
  });

  /**
   * Genuine Webpage URL Plagiarism Scan Endpoint (Phase 12, 19)
   * Fetches URL content, extracts main text content, enforces URL word limits, and checks for plagiarism.
   */
  app.post('/api/plagiarism/scan-url', apiRateLimiter, async (req, res) => {
    const { url, excludedUrl, sensitivity } = req.body;

    if (!url || !url.trim()) {
      return res.status(400).json({ error: 'Target URL is required' });
    }

    try {
      console.log(`[URL scan requested]: ${url}`);
      
      // 1. Validate and retrieve remote HTML safely (Phase 6 - redirect safe)
      const html = await fetchWithSsrfProtection(url);
      
      // 2. Extract clean body copy text using layered extraction rules (Phase 7)
      const extractedText = extractCleanArticleText(html);
      const wordCount = countWords(extractedText);

      if (wordCount < 10) {
        return res.status(422).json({ 
          error: 'Webpage contains insufficient readable body copy text to perform a reliable plagiarism scan.' 
        });
      }

      // 3. Enforce server-side URL word limits on the extracted text body (Phase 4)
      if (wordCount > PLAGIARISM_URL_MAX_WORDS) {
        return res.status(400).json({
          error: 'Webpage content exceeds the maximum allowed word limit.'
        });
      }

      console.log(`[URL scan content extracted] Word count: ${wordCount}`);

      // 4. Run same comparison pipeline on extracted text
      const report = await runBackendPlagiarismScan(extractedText, excludedUrl || url, sensitivity);

      return res.json({
        url,
        wordCount,
        report
      });
    } catch (error: any) {
      console.error('[URL scan error]:', error.message);
      return res.status(500).json({ 
        error: 'Webpage retrieval or extraction failed.', 
        details: error.message 
      });
    }
  });

  /**
   * Diagnostic Test Runner Endpoint (Phase 15 & 35)
   * Restricted strictly to non-production environments to avoid API quota consumption (Phase 13)
   */
  app.get('/api/plagiarism/test', async (req, res) => {
    // Prevent unrestricted diagnostic endpoint access in production (Phase 13)
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        error: 'Forbidden: Diagnostic tests cannot be executed in production environments.'
      });
    }

    try {
      console.log('[Plagiarism suite test requested]');
      const { runAutomatedTestSuite } = await import('./src/tools/plagiarism-checker/test_suite');
      const testResults = await runAutomatedTestSuite();

      const allPassed = testResults.every(t => t.passed);
      return res.json({
        success: allPassed,
        tests: testResults
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Serve static assets / Vite middle-wares
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  const port = 3000;
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}

startServer();
