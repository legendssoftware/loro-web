/**
 * Response parsing and formatting utilities for AI responses
 */

import { AIInsightsResponse, AISuggestionsResponse, AIContentResponse, AIAnalysisResponse } from '../types/ai-response.types';

/**
 * Parse structured text response with section headers
 */
export function parseStructuredResponse(text: string, sections: string[]): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  
  sections.forEach(section => {
    const regex = new RegExp(`=== ${section} ===([\\s\\S]*?)(?====|$)`, 'i');
    const match = text.match(regex);
    
    if (match) {
      const content = match[1].trim();
      // Parse bullet points or numbered items
      const items = content
        .split(/[•\-\*]/)
        .map(item => item.trim())
        .filter(item => item.length > 0);
      result[section.toLowerCase()] = items;
    } else {
      result[section.toLowerCase()] = [];
    }
  });
  
  return result;
}

/**
 * Parse JSON response with fallback
 */
export function parseJSONResponse<T>(text: string, fallback: T): T {
  try {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]) as T;
    }
    
    // Try direct JSON parse
    return JSON.parse(text) as T;
  } catch (error) {
    console.warn('Failed to parse JSON response, using fallback:', error);
    return fallback;
  }
}

/**
 * Parse insights response with sections
 */
export function parseInsightsResponse(text: string): AIInsightsResponse {
  const sections = parseStructuredResponse(text, [
    'SUMMARY',
    'INSIGHTS',
    'RECOMMENDATIONS',
    'QUICK_ACTIONS'
  ]);
  
  return {
    insights: sections.insights || [],
    summary: sections.summary?.[0] || 'Performance analysis completed.',
    recommendations: sections.recommendations || [],
    quickActions: sections.quick_actions || [],
    generatedAt: new Date().toISOString(),
    usingFallback: false,
  };
}

/**
 * Parse suggestions response
 */
export function parseSuggestionsResponse(text: string): AISuggestionsResponse {
  const parsed = parseStructuredResponse(text, ['SUGGESTIONS', 'RECOMMENDATIONS']);
  
  const suggestions = (parsed.suggestions || parsed.recommendations || []).map((item, index) => {
    // Try to parse structured suggestion
    const parts = item.split('|').map(p => p.trim());
    return {
      id: index,
      title: parts[0] || item,
      description: parts[1] || item,
      priority: parts[2]?.toLowerCase() as 'high' | 'medium' | 'low' | undefined,
      action: parts[3],
      timing: parts[4],
    };
  });
  
  return {
    suggestions,
    generatedAt: new Date().toISOString(),
    usingFallback: false,
  };
}

/**
 * Clean and format AI response text
 */
export function cleanResponseText(text: string): string {
  return text
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .replace(/^[\s\n]*/, '')
    .replace(/[\s\n]*$/, '')
    .trim();
}

/**
 * Extract key-value pairs from text
 */
export function extractKeyValuePairs(text: string): Record<string, string> {
  const pairs: Record<string, string> = {};
  const lines = text.split('\n');
  
  lines.forEach(line => {
    const match = line.match(/^[-*]\s*(.+?):\s*(.+)$/);
    if (match) {
      const key = match[1].trim().toLowerCase().replace(/\s+/g, '_');
      pairs[key] = match[2].trim();
    }
  });
  
  return pairs;
}

/**
 * Format response with metadata
 */
export function formatResponse<T extends Record<string, any>>(
  data: T,
  usingFallback = false,
  dataHash?: string
): T & { generatedAt: string; usingFallback: boolean; dataHash?: string } {
  return {
    ...data,
    generatedAt: (data as any).generatedAt || new Date().toISOString(),
    usingFallback,
    ...(dataHash && { dataHash }),
  };
}
