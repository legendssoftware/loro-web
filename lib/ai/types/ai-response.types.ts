/**
 * Common AI response types used across all AI endpoints
 */

export interface BaseAIResponse {
  /** Timestamp when response was generated */
  generatedAt: string;
  /** Whether fallback was used */
  usingFallback?: boolean;
  /** Data hash for caching */
  dataHash?: string;
}

export interface AIInsightsResponse extends BaseAIResponse {
  insights: string[];
  summary: string;
  recommendations: string[];
  quickActions?: string[];
}

export interface AISuggestionsResponse extends BaseAIResponse {
  suggestions: Array<{
    id?: string | number;
    title: string;
    description: string;
    priority?: 'high' | 'medium' | 'low';
    action?: string;
    timing?: string;
  }>;
}

export interface AIContentResponse extends BaseAIResponse {
  content: string;
  alternativeOptions?: string[];
  metadata?: {
    wordCount?: number;
    tone?: string;
    personalizationScore?: number;
  };
}

export interface AIAnalysisResponse extends BaseAIResponse {
  analysis: string;
  keyFindings: string[];
  riskFactors?: string[];
  opportunities?: string[];
  score?: number;
  probability?: number;
}

export interface AIErrorResponse {
  error: string;
  errorType?: 'api_key' | 'model_unavailable' | 'rate_limit' | 'network' | 'general';
  message: string;
  fallback?: any;
}
