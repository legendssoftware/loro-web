# AI Service Library - Developer Guide

## Quick Start

```typescript
import { aiService, buildComprehensiveContext, parseInsightsResponse } from '@/lib/ai';

// Check if AI is configured
if (!aiService.isConfigured()) {
  // Use fallback
}

// Build context
const context = buildComprehensiveContext({
  leadData: {...},
  clientData: {...},
  targetData: [...],
  southAfricanContext: { industry: 'FINANCE' },
});

// Build prompt
const prompt = aiService.buildPrompt({
  role: 'an AI Assistant',
  mission: 'Your mission',
  instructions: ['Step 1', 'Step 2'],
  outputFormat: { type: 'json', schema: {...} },
});

// Generate
const result = await aiService.generateContent(context + '\n' + prompt);

// Parse
const parsed = parseInsightsResponse(result.text);
```

## API Reference

### `aiService`

#### `isConfigured(): boolean`
Check if AI service is available.

#### `generateContent(prompt: string, options?: AIGenerationOptions): Promise<AIGenerationResult>`
Generate content with automatic model fallback.

**Options:**
- `temperature?: number` (default: 0.7)
- `topK?: number` (default: 40)
- `topP?: number` (default: 0.95)
- `maxOutputTokens?: number` (default: 2048)
- `model?: string` (preferred model, falls back automatically)

#### `buildPrompt(config: PromptConfig): string`
Build a structured prompt from configuration.

#### `handleError(error: unknown): AIErrorResponse`
Handle errors and return typed error response.

### Context Builders

#### `buildLeadIntelligenceContext(leadData?: LeadData): string`
Build context from lead data.

#### `buildClientContext(clientData?: ClientData): string`
Build context from client data.

#### `buildSouthAfricanContext(config?: SouthAfricanContext): string`
Build South African business context.

#### `buildComprehensiveContext(options): string`
Combine multiple context sources.

### Response Parsers

#### `parseStructuredResponse(text: string, sections: string[]): Record<string, string[]>`
Parse structured text with section headers.

#### `parseJSONResponse<T>(text: string, fallback: T): T`
Parse JSON with fallback.

#### `parseInsightsResponse(text: string): AIInsightsResponse`
Parse insights format (SUMMARY, INSIGHTS, RECOMMENDATIONS, QUICK_ACTIONS).

#### `parseSuggestionsResponse(text: string): AISuggestionsResponse`
Parse suggestions format.

#### `formatResponse<T>(data: T, usingFallback: boolean, dataHash?: string): T & Metadata`
Add metadata to response.

## Common Patterns

### Creating a New Endpoint

1. **Create route file:** `client/app/api/ai/{module}/{action}/route.ts`

2. **Import utilities:**
```typescript
import { aiService, buildComprehensiveContext, parseJSONResponse, formatResponse } from '@/lib/ai';
```

3. **Define request/response types:**
```typescript
interface MyRequest extends BaseAIRequest {
  // Your fields
}

interface MyResponse {
  // Your response structure
}
```

4. **Implement POST handler:**
```typescript
export async function POST(request: NextRequest) {
  try {
    const body: MyRequest = await request.json();
    
    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackData, true));
    }
    
    const context = buildComprehensiveContext({...});
    const prompt = aiService.buildPrompt({...});
    const result = await aiService.generateContent(context + '\n' + prompt);
    const parsed = parseJSONResponse<MyResponse>(result.text, fallbackData);
    
    return NextResponse.json(formatResponse(parsed, false, body.dataHash));
  } catch (error) {
    const errorResponse = aiService.handleError(error);
    return NextResponse.json({...}, { status: 500 });
  }
}
```

### Prompt Configuration

```typescript
const promptConfig: PromptConfig = {
  role: 'an AI Specialist',
  mission: 'Your objective',
  context: {
    // Your context data
  },
  instructions: [
    'Instruction 1',
    'Instruction 2',
  ],
  outputFormat: {
    type: 'json', // or 'text' or 'structured'
    schema: {
      // JSON schema
    },
    sections: ['SECTION1', 'SECTION2'], // For structured
  },
  tone: {
    baseTone: 'professional',
    intensity: 'moderate',
    regionalAdaptation: 'south_african',
  },
  limits: {
    maxWords: 500,
    maxCharacters: 2000,
    maxItems: 10,
  },
};
```

### Error Handling

```typescript
try {
  // AI generation
} catch (error) {
  const errorResponse = aiService.handleError(error);
  
  // errorResponse.errorType: 'api_key' | 'model_unavailable' | 'rate_limit' | 'network' | 'general'
  // errorResponse.message: string
  // errorResponse.error: string
  
  return NextResponse.json(
    {
      error: 'Failed to generate',
      errorType: errorResponse.errorType,
      ...formatResponse(fallbackData, true),
    },
    { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
  );
}
```

## Best Practices

1. **Always provide fallbacks** - Ensure functionality without AI
2. **Use typed interfaces** - Leverage TypeScript for safety
3. **Build rich context** - Include all relevant CRM data
4. **Parse responses carefully** - Use appropriate parsers
5. **Handle errors gracefully** - Use `aiService.handleError()`
6. **Include metadata** - Use `formatResponse()` for consistency
7. **Consider South African context** - Use `buildSouthAfricanContext()`

## Environment Variables

- `GOOGLE_AI_API_KEY` - Google Generative AI API key (required)

## Model Fallback Strategy

The service automatically tries models in this order:
1. `gemini-1.5-pro` (if specified or default)
2. `gemini-1.5-flash` (fallback)
3. `gemini-pro` (final fallback)

This ensures maximum compatibility and availability.
