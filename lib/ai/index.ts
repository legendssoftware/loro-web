/**
 * Centralized AI module exports
 */

export { aiService, AIService } from './ai-service';
export type { AIGenerationOptions, AIGenerationResult } from './ai-service';

export * from './types/ai-request.types';
export * from './types/ai-response.types';
export * from './types/prompt-config.types';

export {
  buildLeadIntelligenceContext,
  buildClientContext,
  buildSouthAfricanContext,
  buildPersonalizationContext,
  buildTargetContext,
  buildComprehensiveContext,
} from './prompt-builders/context-builder';

export {
  parseStructuredResponse,
  parseJSONResponse,
  parseInsightsResponse,
  parseSuggestionsResponse,
  cleanResponseText,
  extractKeyValuePairs,
  formatResponse,
} from './prompt-builders/response-formatter';
