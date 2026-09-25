import axios from 'axios';

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

// Replaceable search provider interface adhering to the core abstraction objective
export interface SearchProvider {
  search(query: string): Promise<SearchResult[]>;
}

/**
 * Google Custom Search Engine (CSE) JSON API Search Provider
 */
export class GoogleSearchProvider implements SearchProvider {
  private apiKey: string;
  private cx: string;

  constructor(apiKey: string, cx: string) {
    this.apiKey = apiKey;
    this.cx = cx;
  }

  async search(query: string): Promise<SearchResult[]> {
    if (!this.apiKey || !this.cx) {
      throw new Error('Google Search API Key or CX Engine ID is missing in server environment variables.');
    }

    try {
      const response = await axios.get('https://customsearch.googleapis.com/customsearch/v1', {
        params: {
          key: this.apiKey,
          cx: this.cx,
          q: query,
          num: 5 // Recommended limit to prevent excessive query usage
        }
      });

      const items = response.data.items || [];
      return items.map((item: any) => ({
        title: item.title || '',
        url: item.link || '',
        snippet: item.snippet || ''
      }));
    } catch (error: any) {
      console.error('Google Search Provider Error:', error?.response?.data || error?.message);
      throw new Error(`Google Search API failed: ${error?.response?.data?.error?.message || error.message}`);
    }
  }
}

/**
 * Bing Web Search API Provider
 */
export class BingSearchProvider implements SearchProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async search(query: string): Promise<SearchResult[]> {
    if (!this.apiKey) {
      throw new Error('Bing Search API Key is missing in server environment variables.');
    }

    try {
      const response = await axios.get('https://api.bing.microsoft.com/v7.0/search', {
        headers: { 'Ocp-Apim-Subscription-Key': this.apiKey },
        params: {
          q: query,
          count: 5
        }
      });

      const webPages = response.data.webPages?.value || [];
      return webPages.map((page: any) => ({
        title: page.name || '',
        url: page.url || '',
        snippet: page.snippet || ''
      }));
    } catch (error: any) {
      console.error('Bing Search Provider Error:', error?.response?.data || error?.message);
      throw new Error(`Bing Search API failed: ${error?.response?.data?.error?.message || error.message}`);
    }
  }
}

/**
 * Developer Test Mode Provider: Returns deterministic search results for target test queries.
 * Ideal for running local automated scans without consuming search API search quotas.
 */
export class TestModeSearchProvider implements SearchProvider {
  async search(query: string): Promise<SearchResult[]> {
    const qLower = query.toLowerCase();

    // Test Scenario: Copied Github content
    if (qLower.includes('git') || qLower.includes('github') || qLower.includes('repository')) {
      return [
        {
          title: 'Git and GitHub Basics - Wikipedia',
          url: 'https://en.wikipedia.org/wiki/GitHub',
          snippet: 'GitHub is a developer platform that lets developers store, manage, and track modifications to their software code repositories.'
        }
      ];
    }

    // Test Scenario: Wikipedia definitions
    if (qLower.includes('encyclopedia') || qLower.includes('wikipedia')) {
      return [
        {
          title: 'Wikipedia, the Free Encyclopedia',
          url: 'https://en.wikipedia.org/wiki/Main_Page',
          snippet: 'Wikipedia is a free-content online encyclopedia written and maintained by a community of volunteers.'
        }
      ];
    }

    // Test Scenario: Example Domain documentation
    if (qLower.includes('example') || qLower.includes('documentation') || qLower.includes('permission')) {
      return [
        {
          title: 'Example Domain - IANA',
          url: 'http://example.com',
          snippet: 'This domain is for use in documentation examples without needing permission.'
        }
      ];
    }

    // Default neutral results
    return [];
  }
}

/**
 * Factory class to instantiate the configured Search Provider
 */
export class SearchProviderFactory {
  static getProvider(): SearchProvider {
    const isProd = process.env.NODE_ENV === 'production';
    const providerType = process.env.SEARCH_PROVIDER || (isProd ? 'google' : 'test_mode');
    
    if (isProd && providerType.toLowerCase() === 'test_mode') {
      throw new Error('Configuration Error: Plagiarism Checker is running in production, but test_mode is active. Test mode is forbidden in production environments.');
    }
    
    switch (providerType.toLowerCase()) {
      case 'google':
        return new GoogleSearchProvider(
          process.env.SEARCH_API_KEY || '',
          process.env.SEARCH_ENGINE_CX || ''
        );
      case 'bing':
        return new BingSearchProvider(process.env.SEARCH_API_KEY || '');
      case 'test_mode':
      default:
        return new TestModeSearchProvider();
    }
  }
}
