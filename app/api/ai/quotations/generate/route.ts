import { NextRequest, NextResponse } from 'next/server';
import {
  aiService,
  buildClientContext,
  buildSouthAfricanContext,
  parseJSONResponse,
  formatResponse,
  type ClientData,
  type BaseAIRequest,
} from '@/lib/ai';

interface QuotationGenerateRequest extends BaseAIRequest {
  clientData: ClientData;
  products: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    description?: string;
  }>;
  quotationType?: 'standard' | 'proposal' | 'estimate';
  customRequirements?: string;
  paymentTerms?: string;
  deliveryTerms?: string;
}

interface QuotationContent {
  introduction: string;
  valueProposition: string;
  productDescriptions: Array<{
    name: string;
    description: string;
    benefits: string[];
  }>;
  termsAndConditions: string[];
  callToAction: string;
  closing: string;
}

const fallbackContent: QuotationContent = {
  introduction: 'Thank you for your interest in our products and services.',
  valueProposition: 'We are committed to providing you with high-quality solutions that meet your business needs.',
  productDescriptions: [],
  termsAndConditions: [
    'Prices are valid for 30 days',
    'Payment terms as agreed',
    'Delivery subject to stock availability',
  ],
  callToAction: 'We look forward to the opportunity to serve you.',
  closing: 'Best regards',
};

export async function POST(request: NextRequest) {
  try {
    const body: QuotationGenerateRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackContent, true, body.dataHash));
    }

    const clientContext = buildClientContext(body.clientData);
    const saContext = buildSouthAfricanContext({
      industry: body.clientData.industry,
      businessSize: body.clientData.businessSize,
      includeEconomicContext: true,
    });

    const prompt = aiService.buildPrompt({
      role: 'an AI Business Proposal Writer specializing in creating compelling quotations',
      mission: 'Generate professional, persuasive quotation content tailored to the client',
      context: {
        clientData: body.clientData,
        products: body.products,
        quotationType: body.quotationType || 'standard',
        customRequirements: body.customRequirements,
        paymentTerms: body.paymentTerms,
        deliveryTerms: body.deliveryTerms,
      },
      instructions: [
        'Create a professional introduction that builds rapport',
        'Develop a compelling value proposition',
        'Write detailed product descriptions highlighting benefits',
        'Include appropriate terms and conditions',
        'Create a strong call-to-action',
        'Use professional but warm closing',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          introduction: 'string',
          valueProposition: 'string',
          productDescriptions: 'array of {name, description, benefits}',
          termsAndConditions: 'array of strings',
          callToAction: 'string',
          closing: 'string',
        },
      },
      tone: {
        baseTone: 'professional',
        intensity: 'moderate',
        regionalAdaptation: 'south_african',
      },
    });

    const fullPrompt = clientContext + '\n' + saContext + '\n' + prompt;

    const result = await aiService.generateContent(fullPrompt, {
      temperature: 0.7,
      maxOutputTokens: 2048,
    });

    const parsed = parseJSONResponse<QuotationContent>(result.text, fallbackContent);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error generating quotation content:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to generate quotation content',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackContent, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
