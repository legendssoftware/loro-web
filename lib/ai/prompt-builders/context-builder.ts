/**
 * Context builder utilities for creating rich context in AI prompts
 */

import { LeadData, ClientData, TargetData } from '../types/ai-request.types';
import { SouthAfricanContext, PersonalizationContext } from '../types/prompt-config.types';

/**
 * Build lead intelligence context from lead data
 */
export function buildLeadIntelligenceContext(leadData?: LeadData): string {
  if (!leadData) return '';
  
  let context = '\n=== LEAD INTELLIGENCE CONTEXT ===\n';
  
  context += `PROSPECT PROFILE:
- Name: ${leadData.name}
- Company: ${leadData.companyName || 'Not specified'}
- Role: ${leadData.jobTitle || 'Not specified'}
- Industry: ${leadData.industry || 'Not specified'}
- Company Size: ${leadData.businessSize || 'Not specified'}
- Status: ${leadData.status}
- Source: ${leadData.source || 'Unknown'}\n`;
  
  if (leadData.temperature || leadData.priority || leadData.leadScore) {
    context += `\nLEAD QUALIFICATION:
- Temperature: ${leadData.temperature || 'COLD'}
- Priority: ${leadData.priority || 'MEDIUM'}
- Lead Score: ${leadData.leadScore || 0}/100\n`;
  }
  
  if (leadData.lastContact) {
    context += `\nCOMMUNICATION HISTORY:
- Last Contact: ${leadData.lastContact}
- Total Interactions: ${leadData.score || 0}\n`;
  }
  
  if (leadData.notes) {
    context += `\nNOTES: ${leadData.notes}\n`;
  }
  
  return context;
}

/**
 * Build client context from client data
 */
export function buildClientContext(clientData?: ClientData): string {
  if (!clientData) return '';
  
  let context = '\n=== CLIENT CONTEXT ===\n';
  
  context += `CLIENT PROFILE:
- Name: ${clientData.name}
- Company: ${clientData.companyName || 'Not specified'}
- Industry: ${clientData.industry || 'Not specified'}
- Business Size: ${clientData.businessSize || 'Not specified'}
- Status: ${clientData.status || 'Active'}\n`;
  
  if (clientData.totalValue) {
    context += `- Total Value: R${clientData.totalValue.toLocaleString()}\n`;
  }
  
  if (clientData.lastPurchaseDate) {
    context += `- Last Purchase: ${clientData.lastPurchaseDate}\n`;
  }
  
  return context;
}

/**
 * Build South African business context
 */
export function buildSouthAfricanContext(config?: SouthAfricanContext): string {
  if (!config) return '';
  
  let context = '\n=== SOUTH AFRICAN BUSINESS CONTEXT ===\n';
  
  context += `ECONOMIC CONSIDERATIONS:
- Consider load shedding impacts on business operations
- Reference local economic conditions and market dynamics
- Use South African business terminology and cultural references
- Consider Ubuntu philosophy in relationship building\n`;
  
  if (config.industry) {
    const industryContexts: Record<string, string> = {
      'MINING': 'MINING INDUSTRY CONTEXT:\n- Consider safety and regulatory compliance priorities\n- Reference commodity price volatility impacts\n- Emphasize operational efficiency and cost reduction\n',
      'FINANCE': 'FINANCE INDUSTRY CONTEXT:\n- Reference regulatory compliance requirements (SARB, FSCA)\n- Consider digital transformation and fintech disruption\n- Emphasize security and risk management\n',
      'RETAIL': 'RETAIL INDUSTRY CONTEXT:\n- Consider consumer spending patterns and economic pressures\n- Reference omnichannel retail trends\n- Emphasize inventory management and supply chain efficiency\n',
      'AGRICULTURE': 'AGRICULTURE INDUSTRY CONTEXT:\n- Consider weather patterns and climate impact\n- Reference land reform and transformation\n- Emphasize sustainability and water conservation\n',
    };
    
    if (industryContexts[config.industry]) {
      context += `\n${industryContexts[config.industry]}\n`;
    }
  }
  
  if (config.businessSize) {
    const sizeContexts: Record<string, string> = {
      'STARTUP': 'STARTUP CONSIDERATIONS:\n- Limited budget and cash flow constraints\n- Focus on growth and scaling challenges\n- Emphasize quick wins and ROI\n',
      'SMALL': 'SMALL BUSINESS CONSIDERATIONS:\n- Resource constraints and efficiency needs\n- Focus on practical, implementable solutions\n- Emphasize cost-effectiveness and clear ROI\n',
      'ENTERPRISE': 'ENTERPRISE CONSIDERATIONS:\n- Complex procurement processes and compliance requirements\n- Multiple stakeholders and decision makers\n- Focus on strategic value and competitive advantage\n',
    };
    
    if (sizeContexts[config.businessSize]) {
      context += `\n${sizeContexts[config.businessSize]}\n`;
    }
  }
  
  return context;
}

/**
 * Build personalization context
 */
export function buildPersonalizationContext(personalization?: PersonalizationContext): string {
  if (!personalization) return '';
  
  let context = '\n=== PERSONALIZATION CONTEXT ===\n';
  
  if (personalization.recipientName) {
    context += `RECIPIENT: ${personalization.recipientName}\n`;
  }
  
  if (personalization.companyName) {
    context += `COMPANY: ${personalization.companyName}\n`;
  }
  
  if (personalization.industry) {
    context += `INDUSTRY: ${personalization.industry}\n`;
  }
  
  if (personalization.role) {
    context += `ROLE: ${personalization.role}\n`;
  }
  
  if (personalization.preferences) {
    context += `PREFERENCES: ${JSON.stringify(personalization.preferences)}\n`;
  }
  
  return context;
}

/**
 * Build target/progress context
 */
export function buildTargetContext(targetData?: TargetData[]): string {
  if (!targetData || targetData.length === 0) return '';
  
  let context = '\n=== TARGET & PERFORMANCE CONTEXT ===\n';
  
  targetData.forEach(target => {
    context += `${target.category.toUpperCase()}:
- Current: ${target.currentValue}
- Target: ${target.targetValue}
- Progress: ${target.progress}%
- Period: ${target.period}\n\n`;
  });
  
  return context;
}

/**
 * Build comprehensive context from multiple sources
 */
export function buildComprehensiveContext(options: {
  leadData?: LeadData;
  clientData?: ClientData;
  targetData?: TargetData[];
  southAfricanContext?: SouthAfricanContext;
  personalization?: PersonalizationContext;
  customContext?: Record<string, any>;
}): string {
  let context = '';
  
  if (options.leadData) {
    context += buildLeadIntelligenceContext(options.leadData);
  }
  
  if (options.clientData) {
    context += buildClientContext(options.clientData);
  }
  
  if (options.targetData) {
    context += buildTargetContext(options.targetData);
  }
  
  if (options.southAfricanContext) {
    context += buildSouthAfricanContext(options.southAfricanContext);
  }
  
  if (options.personalization) {
    context += buildPersonalizationContext(options.personalization);
  }
  
  if (options.customContext) {
    context += '\n=== ADDITIONAL CONTEXT ===\n';
    context += JSON.stringify(options.customContext, null, 2);
    context += '\n';
  }
  
  return context;
}
