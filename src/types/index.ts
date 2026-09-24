export type Role = 'owner' | 'admin' | 'manager' | 'editor' | 'seo_manager' | 'developer' | 'support';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  plan: 'free' | 'pro' | 'business';
  status: 'active' | 'suspended' | 'pending';
  avatar?: string;
  createdAt: string;
  lastLogin: string;
  usageCount: number;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'content' | 'tools' | 'users' | 'developer' | 'billing' | 'settings';
  roles: Role[];
}

export type ProcessingMode = 'browser' | 'server' | 'hybrid';

export interface ToolConfigField {
  id: string;
  label: string;
  type: 'number' | 'string' | 'boolean' | 'select' | 'range';
  defaultValue: any;
  value: any;
  description?: string;
  options?: { label: string; value: any }[];
  unit?: string;
  min?: number;
  max?: number;
}

export interface ToolPageSection {
  id: string;
  type: 'hero' | 'tool' | 'description' | 'instructions' | 'how-it-works' | 'features' | 'faq' | 'related' | 'cta' | 'ads';
  title: string;
  enabled: boolean;
  content?: string;
  items?: { question?: string; answer?: string; icon?: string; title?: string; text?: string }[];
}

export interface ToolVersion {
  version: string;
  releaseDate: string;
  author: string;
  changelog: string;
  isCurrent: boolean;
}

export interface ToolActivityLog {
  id: string;
  user: string;
  action: string;
  date: string;
  previousValue?: string;
  newValue?: string;
  ip?: string;
}

export interface ToolModule {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  iconName: string;
  status: 'published' | 'draft' | 'disabled' | 'maintenance' | 'scheduled';
  processingMode: ProcessingMode;
  workerName?: string;
  sourcePath?: string;
  version: string;
  tags: string[];
  isInstalled: boolean;
  installedAt?: string;
  schedule?: {
    start?: string;
    end?: string;
  };
  limits: {
    guest: { allowed: boolean; maxRunsPerDay: number; maxPayloadSize: string };
    registered: { allowed: boolean; maxRunsPerDay: number; maxPayloadSize: string };
    pro: { allowed: boolean; maxRunsPerDay: number; maxPayloadSize: string };
    business: { allowed: boolean; maxRunsPerDay: number; maxPayloadSize: string };
  };
  seo: {
    title: string;
    metaDescription: string;
    canonicalUrl: string;
    indexInSearch: boolean;
    includeInSitemap: boolean;
    keywords: string[];
    ogImage?: string;
  };
  configSchema: ToolConfigField[];
  pageSections: ToolPageSection[];
  versions: ToolVersion[];
  activityLogs: ToolActivityLog[];
  metrics: {
    totalRuns: number;
    successRate: number;
    avgLatencyMs: number;
    uniqueUsers: number;
    errorCount: number;
  };
}

export type BlockType = 'paragraph' | 'heading' | 'image' | 'quote' | 'code' | 'faq' | 'tool' | 'table' | 'columns' | 'cta' | 'divider';

export interface ContentBlock {
  id: string;
  type: BlockType;
  content: string;
  level?: 1 | 2 | 3;
  toolId?: string;
  caption?: string;
  metadata?: Record<string, any>;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'pending' | 'scheduled' | 'published' | 'trash';
  author: {
    name: string;
    avatar?: string;
  };
  category: string;
  tags: string[];
  featuredImage: string;
  excerpt: string;
  blocks: ContentBlock[];
  publishedAt: string;
  updatedAt: string;
  seo: {
    targetKeyword: string;
    title: string;
    metaDescription: string;
    canonicalUrl: string;
    index: boolean;
    score: number;
  };
  views: number;
  commentsCount: number;
}

export interface StaticPage {
  id: string;
  title: string;
  slug: string;
  status: 'published' | 'draft';
  content: string;
  updatedAt: string;
  seoTitle: string;
  seoDescription: string;
}

export interface AdUnit {
  id: string;
  name: string;
  location: 'header_leaderboard' | 'in_tool_result' | 'sidebar_sticky' | 'interstitial_delay';
  enabled: boolean;
  codeSnippet: string;
  minTierToBypass: 'pro' | 'business';
  delaySeconds?: number;
  impressions: number;
  clicks: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  popular?: boolean;
  description: string;
  features: string[];
  toolQuotaPerDay: number;
  hasApiAccess: boolean;
  hasAdFree: boolean;
  maxFileSize: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  enabled: boolean;
  trigger: 'user_registered' | 'tool_threshold_reached' | 'subscription_created' | 'article_published' | 'error_spike';
  condition: string;
  action: 'send_email' | 'notify_admin' | 'purge_cache' | 'trigger_webhook' | 'create_audit_log';
  lastRun?: string;
  runCount: number;
}

export interface ApiKey {
  id: string;
  name: string;
  keyMasked: string;
  key?: string;
  rateLimitPerMin: number;
  status: 'active' | 'revoked';
  createdAt: string;
  lastUsedAt: string;
  totalCalls: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  service: 'application' | 'api' | 'auth' | 'database' | 'functions' | 'worker' | 'billing';
  category?: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  requestId: string;
  user?: string;
  toolSlug?: string;
  stackTrace?: string;
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  primaryColor: string; // #1d4ed8 (Royal blue)
  accentColor: string;  // #10b981 (Emerald green)
  goldColor: string;    // #f59e0b (Amber)
  logoText: string;
  footerText: string;
  maintenanceMode: boolean;
  registrationOpen: boolean;
  allowUserRegistration?: boolean;
  enableApiAccess?: boolean;
  cacheTtlSeconds: number;
  defaultProcessingMode: ProcessingMode;
}
