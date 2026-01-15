/**
 * Shared AI Service - Centralized Google Generative AI integration
 * Provides consistent interface for all AI endpoints with fallback strategies
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { PromptConfig } from './types/prompt-config.types';
import { AIErrorResponse } from './types/ai-response.types';

export interface AIGenerationOptions {
  temperature?: number;
  topK?: number;
  topP?: number;
  maxOutputTokens?: number;
  model?: string;
}

export interface AIGenerationResult {
  text: string;
  modelUsed: string;
  finishReason?: string;
}

/**
 * AI Service class for managing Google Generative AI interactions
 */
export class AIService {
  private genAI: GoogleGenerativeAI | null = null;
  private readonly modelFallbackOrder = ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro'];
  
  constructor() {
    const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }
  
  /**
   * Check if AI service is configured
   */
  isConfigured(): boolean {
    return this.genAI !== null && !!process.env.GOOGLE_AI_API_KEY;
  }
  
  /**
   * Generate content from a prompt with automatic model fallback
   */
  async generateContent(
    prompt: string,
    options: AIGenerationOptions = {}
  ): Promise<AIGenerationResult> {
    if (!this.genAI) {
      throw new Error('AI service not configured - GOOGLE_AI_API_KEY is missing');
    }
    
    const {
      temperature = 0.7,
      topK = 40,
      topP = 0.95,
      maxOutputTokens = 2048,
      model: preferredModel,
    } = options;
    
    const modelsToTry = preferredModel
      ? [preferredModel, ...this.modelFallbackOrder]
      : this.modelFallbackOrder;
    
    let lastError: Error | null = null;
    
    for (const modelName of modelsToTry) {
      try {
        const model = this.genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature,
            topK,
            topP,
            maxOutputTokens,
          },
        });
        
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        
        return {
          text,
          modelUsed: modelName,
          finishReason: response.candidates?.[0]?.finishReason,
        };
      } catch (error: any) {
        console.warn(`Failed to use model ${modelName}:`, error.message);
        lastError = error;
        
        // If this is the last model to try, throw the error
        if (modelName === modelsToTry[modelsToTry.length - 1]) {
          throw lastError;
        }
        continue;
      }
    }
    
    throw lastError || new Error('All model attempts failed');
  }
  
  /**
   * Build a comprehensive prompt from configuration
   */
  buildPrompt(config: PromptConfig): string {
    let prompt = `You are ${config.role}.\n\n`;
    prompt += `MISSION: ${config.mission}\n\n`;
    
    if (config.context) {
      prompt += `=== CONTEXT ===\n${JSON.stringify(config.context, null, 2)}\n\n`;
    }
    
    if (config.instructions && config.instructions.length > 0) {
      prompt += `=== INSTRUCTIONS ===\n`;
      config.instructions.forEach((instruction, index) => {
        prompt += `${index + 1}. ${instruction}\n`;
      });
      prompt += '\n';
    }
    
    if (config.outputFormat) {
      prompt += `=== OUTPUT REQUIREMENTS ===\n`;
      
      if (config.outputFormat.type === 'json' && config.outputFormat.schema) {
        prompt += `Return a JSON object with these exact keys:\n${JSON.stringify(config.outputFormat.schema, null, 2)}\n\n`;
      } else if (config.outputFormat.type === 'structured' && config.outputFormat.sections) {
        prompt += `Use these exact section headers:\n`;
        config.outputFormat.sections.forEach(section => {
          prompt += `=== ${section} ===\n[Content for ${section}]\n\n`;
        });
      } else {
        prompt += `Format: ${config.outputFormat.type}\n\n`;
      }
    }
    
    if (config.limits) {
      if (config.limits.maxWords) {
        prompt += `Keep response under ${config.limits.maxWords} words.\n`;
      }
      if (config.limits.maxCharacters) {
        prompt += `Keep response under ${config.limits.maxCharacters} characters.\n`;
      }
      if (config.limits.maxItems) {
        prompt += `Provide maximum ${config.limits.maxItems} items.\n`;
      }
    }
    
    if (config.tone) {
      prompt += `\n=== TONE & STYLE ===\n`;
      if (config.tone.baseTone) prompt += `Base Tone: ${config.tone.baseTone}\n`;
      if (config.tone.intensity) prompt += `Intensity: ${config.tone.intensity}\n`;
      if (config.tone.regionalAdaptation) prompt += `Regional: ${config.tone.regionalAdaptation}\n`;
    }
    
    prompt += `\nCRITICAL REQUIREMENTS:\n`;
    prompt += `- Be specific, actionable, and relevant\n`;
    prompt += `- Use natural, conversational language\n`;
    prompt += `- Focus on practical value and results\n`;
    prompt += `- Consider South African business context where relevant\n`;
    
    return prompt;
  }
  
  /**
   * Handle errors and return appropriate error response
   */
  handleError(error: unknown): AIErrorResponse {
    const errorMessage = (error as Error)?.message || String(error);
    let errorType: AIErrorResponse['errorType'] = 'general';
    let statusCode = 500;
    
    if (errorMessage.includes('API key') || errorMessage.includes('GOOGLE_AI_API_KEY')) {
      errorType = 'api_key';
      statusCode = 401;
    } else if (errorMessage.includes('not found') || errorMessage.includes('not supported')) {
      errorType = 'model_unavailable';
      statusCode = 503;
    } else if (errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
      errorType = 'rate_limit';
      statusCode = 429;
    } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      errorType = 'network';
      statusCode = 503;
    }
    
    return {
      error: 'Failed to generate AI response',
      errorType,
      message: errorMessage,
    };
  }
}

// Export singleton instance
export const aiService = new AIService();
