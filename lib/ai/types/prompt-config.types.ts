/**
 * Prompt configuration types for building AI prompts
 */

export interface PromptConfig {
  /** System role/persona for the AI */
  role: string;
  /** Mission/objective of the prompt */
  mission: string;
  /** Context data to include */
  context?: Record<string, any>;
  /** Specific instructions */
  instructions: string[];
  /** Output format requirements */
  outputFormat: {
    type: 'json' | 'text' | 'structured';
    schema?: Record<string, any>;
    sections?: string[];
  };
  /** Tone and style requirements */
  tone?: {
    baseTone?: string;
    intensity?: string;
    regionalAdaptation?: string;
  };
  /** Character/word limits */
  limits?: {
    maxWords?: number;
    maxCharacters?: number;
    maxItems?: number;
  };
}

export interface SouthAfricanContext {
  industry?: string;
  businessSize?: string;
  includeEconomicContext?: boolean;
  includeCulturalContext?: boolean;
}

export interface PersonalizationContext {
  recipientName?: string;
  recipientEmail?: string;
  companyName?: string;
  industry?: string;
  role?: string;
  previousInteractions?: any[];
  preferences?: Record<string, any>;
}
