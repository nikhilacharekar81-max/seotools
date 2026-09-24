import { ToolModule } from '../types';

export interface RouteState {
  page: 'home' | 'tool' | 'blog' | 'blog_post' | 'pricing' | 'custom_page';
  param?: string;
}

// Convert current browser URL (path or hash) to an internal route state
export function parseInitialRouteFromUrl(): RouteState {
  if (typeof window === 'undefined') return { page: 'home' };

  // Support both clean pathname and hash (for preview/iframe environments)
  const pathname = window.location.pathname.replace(/^\/+|\/+$/g, '');
  const hash = window.location.hash.replace(/^#\/?/, '').replace(/^tool-/, '');

  const slug = hash || pathname;

  if (!slug || slug === 'home') {
    return { page: 'home' };
  }

  if (slug === 'blog') {
    return { page: 'blog' };
  }

  if (slug.startsWith('blog/')) {
    return { page: 'blog_post', param: slug.replace('blog/', '') };
  }

  if (slug === 'pricing') {
    return { page: 'pricing' };
  }

  // Handle aliases like 'word-counter' -> 'text-counter'
  if (slug === 'word-counter') {
    return { page: 'tool', param: 'text-counter' };
  }

  // If slug exists, assume it is a tool route
  return { page: 'tool', param: slug };
}

// Map route to clean SEO URL string
export function getCleanUrlForRoute(route: RouteState): string {
  if (route.page === 'home') return '/';
  if (route.page === 'tool' && route.param) {
    // Return clean search engine friendly slug, e.g. /plagiarism-checker
    return `/${route.param}`;
  }
  if (route.page === 'blog') return '/blog';
  if (route.page === 'blog_post' && route.param) return `/blog/${route.param}`;
  if (route.page === 'pricing') return '/pricing';
  if (route.page === 'custom_page' && route.param) return `/p/${route.param}`;
  return '/';
}

// Update document head metadata, canonical links, and Schema.org JSON-LD
export function updateDocumentSeo(route: RouteState, activeTool?: ToolModule | null) {
  if (typeof document === 'undefined') return;

  const origin = window.location.origin;
  let title = 'SmallSEOTools - 100% Free Online SEO Tools & Webmaster Toolkit';
  let description = 'SmallSEOTools offers over 50+ free online search engine optimization tools, text analysis, keyword density calculators, backlink checkers, and web utilities.';
  let canonicalUrl = `${origin}/`;

  if (route.page === 'tool' && activeTool) {
    title = `${activeTool.seo?.title || activeTool.name} | SmallSEOTools`;
    description = activeTool.seo?.metaDescription || activeTool.description;
    canonicalUrl = `${origin}/${activeTool.slug}`;
  } else if (route.page === 'blog') {
    title = 'SEO & Digital Marketing Blog – Latest Search Engine Guides | SmallSEOTools';
    description = 'Read expert SEO tutorials, content marketing strategies, Google algorithm updates, and copywriting tips from industry professionals.';
    canonicalUrl = `${origin}/blog`;
  } else if (route.page === 'pricing') {
    title = 'Pro Plans & Free Tier Limits | SmallSEOTools';
    description = 'Explore generous free limits and enterprise API access for high-volume SEO audits, bulk plagiarism scans, and automated reporting.';
    canonicalUrl = `${origin}/pricing`;
  }

  // 1. Update Title
  document.title = title;

  // 2. Update Meta Description
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute('content', description);

  // 3. Update Canonical Tag
  let canonicalTag = document.querySelector('link[rel="canonical"]');
  if (!canonicalTag) {
    canonicalTag = document.createElement('link');
    canonicalTag.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalTag);
  }
  canonicalTag.setAttribute('href', canonicalUrl);

  // 4. Update OpenGraph Tags
  setMetaTag('og:title', title, true);
  setMetaTag('og:description', description, true);
  setMetaTag('og:url', canonicalUrl, true);
  setMetaTag('og:type', route.page === 'tool' ? 'website' : 'website', true);

  // 5. Update Twitter Card Tags
  setMetaTag('twitter:title', title);
  setMetaTag('twitter:description', description);

  // 6. Schema.org Structured Data (JSON-LD)
  let schemaScript = document.getElementById('seo-structured-data') as HTMLScriptElement | null;
  if (!schemaScript) {
    schemaScript = document.createElement('script');
    schemaScript.id = 'seo-structured-data';
    schemaScript.type = 'application/ld+json';
    document.head.appendChild(schemaScript);
  }

  if (route.page === 'tool' && activeTool) {
    schemaScript.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      'name': activeTool.name,
      'headline': activeTool.seo?.title || activeTool.name,
      'description': description,
      'applicationCategory': 'UtilitiesApplication',
      'operatingSystem': 'All',
      'browserRequirements': 'Requires JavaScript. Requires HTML5.',
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'USD'
      },
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': '4.9',
        'ratingCount': (activeTool.metrics?.totalRuns || 1200).toString(),
        'bestRating': '5',
        'worstRating': '1'
      },
      'url': canonicalUrl
    });
  } else {
    schemaScript.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': 'SmallSEOTools',
      'headline': '100% Free Online SEO & Webmaster Toolkit',
      'url': origin,
      'potentialAction': {
        '@type': 'SearchAction',
        'target': `${origin}/?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    });
  }
}

function setMetaTag(propertyOrName: string, content: string, isProperty: boolean = false) {
  const attr = isProperty ? 'property' : 'name';
  let el = document.querySelector(`meta[${attr}="${propertyOrName}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, propertyOrName);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}
