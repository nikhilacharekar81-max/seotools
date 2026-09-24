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

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '12mb' }));

  /**
   * Genuine Web-Source Plagiarism Scan Endpoint (Phase 3-11, 14, 17)
   */
  app.post('/api/plagiarism/scan', async (req, res) => {
    const { text, excludedUrl, sensitivity } = req.body;
    
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Text input is required' });
    }

    try {
      console.log(`[Plagiarism scan started] Word count: ${countWords(text)}`);
      
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
   * Fetches URL content, extracts main text content, and pipes it through the same detection pipeline.
   */
  app.post('/api/plagiarism/scan-url', async (req, res) => {
    const { url, excludedUrl, sensitivity } = req.body;

    if (!url || !url.trim()) {
      return res.status(400).json({ error: 'Target URL is required' });
    }

    try {
      console.log(`[URL scan requested]: ${url}`);
      
      // 1. Validate and retrieve remote HTML safely
      const html = await fetchWithSsrfProtection(url);
      
      // 2. Extract clean body copy text
      const extractedText = extractCleanArticleText(html);
      const wordCount = countWords(extractedText);

      if (wordCount < 10) {
        return res.status(422).json({ 
          error: 'Webpage contains insufficient readable body copy text to perform a reliable plagiarism scan.' 
        });
      }

      console.log(`[URL scan content extracted] Word count: ${wordCount}`);

      // 3. Run same comparison pipeline on extracted text
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
   * Executes a suite of controlled plagiarism scans to verify detection metrics
   */
  app.get('/api/plagiarism/test', async (req, res) => {
    try {
      console.log('[Plagiarism suite test requested]');

      // Test 1: Completely original text
      const report1 = await runBackendPlagiarismScan('This is a completely unique sentence written from scratch that has absolutely no matches in any web search database.');
      
      // Test 2: Exact copied text (Wikipedia signature)
      const report2 = await runBackendPlagiarismScan('GitHub is a developer platform that lets developers store, manage, and track modifications to software code repositories.');

      return res.json({
        success: true,
        tests: [
          {
            name: 'Test 1 - Completely original text',
            expected: '0% plagiarism',
            actual: `${report1.matchingPercentage}% plagiarism`,
            passed: report1.matchingPercentage === 0
          },
          {
            name: 'Test 2 - Exact copied text',
            expected: 'plagiarism detected with sources',
            actual: `${report2.matchingPercentage}% plagiarism with ${report2.sources.length} sources`,
            passed: report2.matchingPercentage > 0 && report2.sources.length > 0
          }
        ]
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

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}

startServer();
