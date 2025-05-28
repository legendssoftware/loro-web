import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

// Enhanced Lead Data Interface using all available rich data
interface EnhancedLeadData {
    // Core identification
    uid: number;
    name: string;
    email: string;
    phone: string;
    companyName?: string;
    jobTitle?: string;
    
    // Lead qualification and scoring
    status: string;
    intent?: string;
    temperature?: string;
    priority?: string;
    leadScore?: number;
    userQualityRating?: number;
    lifecycleStage?: string;
    
    // Business context
    industry?: string;
    businessSize?: string;
    decisionMakerRole?: string;
    budgetRange?: string;
    purchaseTimeline?: string;
    estimatedValue?: number;
    
    // Communication and behavior
    source?: string;
    preferredCommunication?: string;
    timezone?: string;
    bestContactTime?: string;
    averageResponseTime?: number;
    totalInteractions?: number;
    daysSinceLastResponse?: number;
    lastContactDate?: string;
    nextFollowUpDate?: string;
    
    // Business intelligence
    painPoints?: string[];
    competitorInfo?: string;
    referralSource?: string;
    campaignName?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    
    // Activity and engagement
    scoringData?: {
        totalScore: number;
        engagementScore: number;
        demographicScore: number;
        behavioralScore: number;
        fitScore: number;
    };
    activityData?: {
        engagementLevel: 'HIGH' | 'MEDIUM' | 'LOW';
        lastEngagementType: string;
        unresponsiveStreak: number;
    };
    
    // Additional context
    notes?: string;
    assignee?: string;
    customFields?: Record<string, any>;
}

// Multi-dimensional tone matrix
interface ToneConfiguration {
    baseTone: 'consultative' | 'authoritative' | 'collaborative' | 'empathetic' | 'innovative' | 
              'results-driven' | 'professional' | 'encouraging' | 'motivational' | 'urgent' | 
              'friendly' | 'educational';
    intensity: 'subtle' | 'moderate' | 'strong';
    regionalAdaptation: 'south_african' | 'international' | 'local';
    industrySpecific: boolean;
}

// Enhanced template types
type EnhancedTemplateType = 
    'introduction' | 'follow_up' | 'proposal' | 'objection_handling' | 'closing' | 
    're_engagement' | 'referral' | 'upsell' | 'check_in' | 'nurture' | 'educational' |
    'urgent_response' | 'value_demonstration' | 'social_proof';

interface EnhancedEmailTemplateRequest {
    recipientName: string;
    recipientEmail: string;
    leadData?: EnhancedLeadData;
    templateType: EnhancedTemplateType;
    tone: ToneConfiguration;
    customMessage?: string;
    contextNotes?: string;
    industryInsights?: string[];
    competitiveContext?: string[];
    urgencyFactors?: string[];
    businessContext?: {
        companyNews?: string[];
        marketConditions?: string[];
        seasonalFactors?: string[];
    };
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

function buildLeadIntelligenceContext(leadData?: EnhancedLeadData): string {
    if (!leadData) return '';
    
    let context = '\n=== LEAD INTELLIGENCE CONTEXT ===\n';
    
    // Core Profile
    context += `PROSPECT PROFILE:
- Name: ${leadData.name}
- Company: ${leadData.companyName || 'Not specified'}
- Role: ${leadData.jobTitle || 'Not specified'}
- Industry: ${leadData.industry || 'Not specified'}
- Company Size: ${leadData.businessSize || 'Not specified'}
- Decision Maker Level: ${leadData.decisionMakerRole || 'Not specified'}\n`;
    
    // Lead Qualification
    context += `\nLEAD QUALIFICATION:
- Temperature: ${leadData.temperature || 'COLD'}
- Intent: ${leadData.intent || 'ENQUIRY'}
- Priority: ${leadData.priority || 'MEDIUM'}
- Lead Score: ${leadData.leadScore || 0}/100
- Quality Rating: ${leadData.userQualityRating || 'Not rated'}/5
- Lifecycle Stage: ${leadData.lifecycleStage || 'LEAD'}\n`;
    
    // Business Context
    if (leadData.budgetRange || leadData.purchaseTimeline || leadData.estimatedValue) {
        context += `\nBUSINESS CONTEXT:
- Budget Range: ${leadData.budgetRange || 'Not specified'}
- Purchase Timeline: ${leadData.purchaseTimeline || 'Not specified'}
- Estimated Value: ${leadData.estimatedValue ? `R${leadData.estimatedValue.toLocaleString()}` : 'Not specified'}\n`;
    }
    
    // Pain Points and Challenges
    if (leadData.painPoints && leadData.painPoints.length > 0) {
        context += `\nPAIN POINTS & CHALLENGES:
${leadData.painPoints.map(point => `- ${point}`).join('\n')}\n`;
    }
    
    // Communication Intelligence
    context += `\nCOMMUNICATION INTELLIGENCE:
- Source: ${leadData.source || 'Unknown'}
- Preferred Communication: ${leadData.preferredCommunication || 'EMAIL'}
- Average Response Time: ${leadData.averageResponseTime || 'Unknown'} hours
- Total Interactions: ${leadData.totalInteractions || 0}
- Days Since Last Response: ${leadData.daysSinceLastResponse || 0}
- Last Contact: ${leadData.lastContactDate || 'Never contacted'}\n`;
    
    // Engagement Analysis
    if (leadData.activityData) {
        context += `\nENGAGEMENT ANALYSIS:
- Engagement Level: ${leadData.activityData.engagementLevel}
- Last Engagement Type: ${leadData.activityData.lastEngagementType}
- Unresponsive Streak: ${leadData.activityData.unresponsiveStreak} days\n`;
    }
    
    // Competitive Intelligence
    if (leadData.competitorInfo) {
        context += `\nCOMPETITIVE INTELLIGENCE:
- Current/Previous Provider: ${leadData.competitorInfo}\n`;
    }
    
    // Source Attribution
    if (leadData.campaignName || leadData.utmSource) {
        context += `\nSOURCE ATTRIBUTION:
- Campaign: ${leadData.campaignName || 'Direct'}
- UTM Source: ${leadData.utmSource || 'Direct'}
- UTM Medium: ${leadData.utmMedium || 'Direct'}
- Referral Source: ${leadData.referralSource || 'None'}\n`;
    }
    
    return context;
}

function buildSouthAfricanContext(industry?: string, businessSize?: string): string {
    let context = '\n=== SOUTH AFRICAN BUSINESS CONTEXT ===\n';
    
    // Economic context
    context += `ECONOMIC CONSIDERATIONS:
- Consider load shedding impacts on business operations
- Reference local economic conditions and market dynamics
- Use South African business terminology and cultural references
- Consider Ubuntu philosophy in relationship building\n`;
    
    // Industry-specific considerations
    if (industry) {
        switch (industry) {
            case 'MINING':
                context += `\nMINING INDUSTRY CONTEXT:
- Consider safety and regulatory compliance priorities
- Reference commodity price volatility impacts
- Emphasize operational efficiency and cost reduction
- Consider environmental and community impact concerns\n`;
                break;
            case 'FINANCE':
                context += `\nFINANCE INDUSTRY CONTEXT:
- Reference regulatory compliance requirements (SARB, FSCA)
- Consider digital transformation and fintech disruption
- Emphasize security and risk management
- Reference BEE compliance and transformation initiatives\n`;
                break;
            case 'RETAIL':
                context += `\nRETAIL INDUSTRY CONTEXT:
- Consider consumer spending patterns and economic pressures
- Reference omnichannel retail trends
- Emphasize inventory management and supply chain efficiency
- Consider seasonal patterns (holiday seasons, back-to-school)\n`;
                break;
            case 'AGRICULTURE':
                context += `\nAGRICULTURE INDUSTRY CONTEXT:
- Consider weather patterns and climate impact
- Reference land reform and transformation
- Emphasize sustainability and water conservation
- Consider export market dynamics\n`;
                break;
        }
    }
    
    // Business size considerations
    if (businessSize) {
        switch (businessSize) {
            case 'STARTUP':
                context += `\nSTARTUP CONSIDERATIONS:
- Limited budget and cash flow constraints
- Focus on growth and scaling challenges
- Emphasize quick wins and ROI
- Consider funding and investment stage\n`;
                break;
            case 'SMALL':
                context += `\nSMALL BUSINESS CONSIDERATIONS:
- Resource constraints and efficiency needs
- Focus on practical, implementable solutions
- Emphasize cost-effectiveness and clear ROI
- Consider family business dynamics\n`;
                break;
            case 'ENTERPRISE':
                context += `\nENTERPRISE CONSIDERATIONS:
- Complex procurement processes and compliance requirements
- Multiple stakeholders and decision makers
- Focus on strategic value and competitive advantage
- Consider integration with existing systems\n`;
                break;
        }
    }
    
    return context;
}

function buildPersonalizationStrategy(leadData?: EnhancedLeadData, tone?: ToneConfiguration): string {
    if (!leadData) return '';
    
    let strategy = '\n=== PERSONALIZATION STRATEGY ===\n';
    
    // Engagement approach based on temperature and score
    if (leadData.temperature === 'HOT' || (leadData.leadScore && leadData.leadScore > 80)) {
        strategy += 'APPROACH: High-engagement, confident, action-oriented\n';
        strategy += 'URGENCY: Create appropriate urgency and momentum\n';
        strategy += 'CTA: Strong, direct call-to-action\n';
    } else if (leadData.temperature === 'WARM' || (leadData.leadScore && leadData.leadScore > 60)) {
        strategy += 'APPROACH: Relationship-building, educational, value-focused\n';
        strategy += 'URGENCY: Moderate, emphasize benefits and next steps\n';
        strategy += 'CTA: Collaborative, invitation-based\n';
    } else {
        strategy += 'APPROACH: Educational, trust-building, non-pressured\n';
        strategy += 'URGENCY: Low-pressure, focus on education and value\n';
        strategy += 'CTA: Soft, information-gathering focused\n';
    }
    
    // Communication timing and frequency
    if (leadData.averageResponseTime !== undefined) {
        if (leadData.averageResponseTime <= 2) {
            strategy += 'RESPONSE EXPECTATION: Quick responder - can be more direct\n';
        } else if (leadData.averageResponseTime <= 24) {
            strategy += 'RESPONSE EXPECTATION: Moderate responder - allow processing time\n';
        } else {
            strategy += 'RESPONSE EXPECTATION: Slower responder - be patient, provide value\n';
        }
    }
    
    // Engagement level adaptation
    if (leadData.activityData?.engagementLevel === 'HIGH') {
        strategy += 'ENGAGEMENT: High engager - can be more detailed and frequent\n';
    } else if (leadData.activityData?.engagementLevel === 'LOW') {
        strategy += 'ENGAGEMENT: Low engager - keep concise, focus on key value\n';
    }
    
    // Decision maker approach
    if (leadData.decisionMakerRole) {
        switch (leadData.decisionMakerRole) {
            case 'CEO':
            case 'OWNER':
                strategy += 'EXECUTIVE APPROACH: Strategic focus, business impact, competitive advantage\n';
                break;
            case 'CTO':
                strategy += 'TECHNICAL APPROACH: Technical details, integration, security considerations\n';
                break;
            case 'CFO':
                strategy += 'FINANCIAL APPROACH: ROI, cost-benefit, financial impact\n';
                break;
            case 'MANAGER':
                strategy += 'OPERATIONAL APPROACH: Efficiency gains, team impact, practical implementation\n';
                break;
        }
    }
    
    return strategy;
}

function createAdvancedEmailPrompt(request: EnhancedEmailTemplateRequest): string {
    const leadContext = buildLeadIntelligenceContext(request.leadData);
    const saContext = buildSouthAfricanContext(request.leadData?.industry, request.leadData?.businessSize);
    const personalizationStrategy = buildPersonalizationStrategy(request.leadData, request.tone);
    
    let templateInstructions = '';
    
    switch (request.templateType) {
        case 'introduction':
            templateInstructions = `INTRODUCTION EMAIL:
- Establish credibility and relevance quickly
- Reference specific industry or company context
- Demonstrate understanding of their challenges
- Provide immediate value or insight
- Set expectations for future communication
- Include social proof relevant to their industry/size`;
            break;

        case 'follow_up':
            templateInstructions = `FOLLOW-UP EMAIL:
- Reference previous interaction or communication specifically
- Acknowledge their current business context and challenges
- Provide additional value since last contact
- Address any concerns or questions that may have arisen
- Progress the conversation naturally
- Include relevant case study or insight`;
            break;

        case 'proposal':
            templateInstructions = `PROPOSAL EMAIL:
- Present solution tailored to their specific needs and context
- Address identified pain points directly
- Include industry-specific benefits and ROI
- Provide social proof from similar companies/industry
- Create appropriate urgency based on their timeline
- Make next steps crystal clear`;
            break;

        case 'objection_handling':
            templateInstructions = `OBJECTION HANDLING EMAIL:
- Acknowledge their concerns professionally
- Provide evidence-based responses
- Share relevant success stories and case studies
- Reframe objections as opportunities
- Offer alternative approaches or solutions
- Maintain relationship while addressing concerns`;
            break;

        case 'closing':
            templateInstructions = `CLOSING EMAIL:
- Summarize value proposition and key benefits
- Address any final concerns or objections
- Create appropriate urgency (deadline, pricing, availability)
- Make it extremely easy to say yes
- Provide multiple ways to move forward
- Include risk mitigation (guarantees, trials)`;
            break;
            
        case 're_engagement':
            templateInstructions = `RE-ENGAGEMENT EMAIL:
- Acknowledge the gap in communication professionally
- Reference what has changed since last contact
- Provide significant new value or insight
- Use pattern disruption to break through inbox noise
- Focus on their evolving business needs
- Keep initial commitment low`;
            break;
            
        case 'educational':
            templateInstructions = `EDUCATIONAL EMAIL:
- Provide valuable, actionable insights
- Focus on their industry or business challenges
- Include relevant data, trends, or research
- Position as thought leadership
- No direct sales pitch
- Subtle brand positioning and credibility building`;
            break;
            
        case 'urgent_response':
            templateInstructions = `URGENT RESPONSE EMAIL:
- Address time-sensitive matters immediately
- Be clear about urgency without being pushy
- Provide all necessary information upfront
- Include multiple contact methods
- Set clear expectations and deadlines
- Maintain professionalism while conveying urgency`;
            break;
    }

    return `You are an elite AI Sales Communication Specialist with deep expertise in South African business culture, CRM psychology, and advanced personalization techniques.

MISSION: Create a highly personalized, culturally aware, and strategically crafted email that drives engagement and moves the prospect forward in the sales journey.

${leadContext}
${saContext}
${personalizationStrategy}

=== EMAIL REQUIREMENTS ===
TEMPLATE TYPE: ${request.templateType.toUpperCase()}
${templateInstructions}

TONE CONFIGURATION:
- Base Tone: ${request.tone.baseTone}
- Intensity: ${request.tone.intensity}
- Regional Adaptation: ${request.tone.regionalAdaptation}
- Industry Specific: ${request.tone.industrySpecific}

${request.customMessage ? `CUSTOM MESSAGE INTEGRATION: ${request.customMessage}` : ''}
${request.contextNotes ? `ADDITIONAL CONTEXT: ${request.contextNotes}` : ''}
${request.industryInsights?.length ? `INDUSTRY INSIGHTS: ${request.industryInsights.join(', ')}` : ''}

=== ADVANCED PERSONALIZATION REQUIREMENTS ===

1. OPENING PERSONALIZATION:
- Never use generic openings like "I hope this email finds you well"
- Reference specific company context, industry trends, or recent events
- Demonstrate research and genuine interest
- Use conversational, natural language

2. VALUE PROPOSITION ADAPTATION:
- Tailor benefits to their specific industry and business size
- Reference South African market conditions and challenges
- Include relevant metrics and social proof
- Address their specific pain points and timeline

3. CULTURAL SENSITIVITY:
- Incorporate South African business culture nuances
- Use appropriate formality level for their role
- Consider Ubuntu philosophy in relationship building
- Reference local business conditions when relevant

4. CALL-TO-ACTION OPTIMIZATION:
- Match CTA to their engagement level and temperature
- Provide multiple engagement options
- Consider their preferred communication method
- Make next steps clear and non-threatening

5. SUBJECT LINE STRATEGY:
- Create curiosity without being clickbait
- Include company-specific or benefit-specific hooks
- Avoid spam trigger words
- Keep under 50 characters while being compelling

=== OUTPUT REQUIREMENTS ===

Return a JSON object with these exact keys:
{
  "subject": "Compelling, personalized subject line",
  "body": "Full email body with advanced personalization",
  "followUpReminder": "Strategic follow-up timing and approach",
  "personalizationScore": "Numerical score (1-100) indicating personalization depth",
  "keyPersonalizationElements": ["Array of specific personalization elements used"],
  "alternativeSubjectLines": ["Array of 2-3 alternative subject line options"],
  "responseStrategy": "Strategy for handling likely responses or objections"
}

CRITICAL REQUIREMENTS:
- Email must sound genuinely human and naturally conversational
- Demonstrate clear research and understanding of prospect
- Include specific South African business context
- Match tone and approach to lead intelligence data
- Provide genuine value in every communication
- Never sound robotic or template-generated
- Keep email length appropriate for busy executives (200-400 words)`;
}

export async function POST(request: NextRequest) {
    try {
        const body: EnhancedEmailTemplateRequest = await request.json();

        if (!process.env.GOOGLE_AI_API_KEY) {
            return NextResponse.json(
                { error: 'AI service not configured' },
                { status: 500 }
            );
        }

        const model = genAI.getGenerativeModel({ 
            model: 'gemini-pro',
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048,
            }
        });
        
        const prompt = createAdvancedEmailPrompt(body);

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        try {
            // Try to parse as JSON first
            const jsonResponse = JSON.parse(text);
            
            // Ensure all required fields are present
            if (!jsonResponse.subject || !jsonResponse.body) {
                throw new Error('Missing required fields in AI response');
            }
            
            return NextResponse.json(jsonResponse);
        } catch (parseError) {
            console.warn('AI returned non-JSON response, using fallback parser');
            
            // Intelligent fallback with personalization
            const leadName = body.leadData?.name || body.recipientName;
            const companyName = body.leadData?.companyName || '';
            const industry = body.leadData?.industry || '';
            const temperature = body.leadData?.temperature || 'COLD';
            
            const personalizedSubject = generatePersonalizedSubject(leadName, companyName, industry, body.templateType);
            const personalizedBody = generatePersonalizedBody(body, temperature);
            
            return NextResponse.json({
                subject: personalizedSubject,
                body: personalizedBody,
                followUpReminder: generateSmartFollowUpReminder(body.leadData),
                personalizationScore: 75,
                keyPersonalizationElements: ['Company name', 'Industry context', 'South African market'],
                alternativeSubjectLines: [
                    `${companyName} - Quick question`,
                    `Insights for ${industry} businesses`
                ],
                responseStrategy: 'Focus on providing value and building trust'
            });
        }

    } catch (error: unknown) {
        console.error('Error generating enhanced email template:', error);
        
        // Intelligent error fallback
        const body = await request.json().catch(() => ({}));
        const leadName = body.leadData?.name || body.recipientName || 'Valued Contact';
        
        return NextResponse.json(
            {
                subject: `Following up - ${leadName}`,
                body: generateErrorFallbackEmail(leadName, body.leadData),
                followUpReminder: 'Follow up in 3-5 business days if no response',
                personalizationScore: 25,
                keyPersonalizationElements: ['Name personalization'],
                alternativeSubjectLines: ['Quick follow-up', 'Next steps discussion'],
                responseStrategy: 'Keep message simple and focused on value',
                error: 'AI generation failed, using enhanced fallback'
            },
            { status: 200 } // Still return 200 since we have a fallback
        );
    }
}

// Helper functions for intelligent fallbacks
function generatePersonalizedSubject(name: string, company: string, industry: string, templateType: string): string {
    const templates = {
        introduction: [
            `${company ? company + ' - ' : ''}Quick introduction`,
            `${industry ? industry + ' insights for ' : ''}${name}`,
            `Helping ${company || 'businesses like yours'} grow`
        ],
        follow_up: [
            `${name} - Following up on our conversation`,
            `${company ? company + ' - ' : ''}Next steps discussion`,
            `Quick follow-up for ${name}`
        ],
        proposal: [
            `${company ? company + ' - ' : ''}Proposal for your review`,
            `Solution for ${name} at ${company || 'your company'}`,
            `${industry ? industry + ' solution - ' : ''}Proposal attached`
        ]
    };
    
    const typeTemplates = templates[templateType as keyof typeof templates] || templates.follow_up;
    return typeTemplates[0];
}

function generatePersonalizedBody(request: EnhancedEmailTemplateRequest, temperature: string): string {
    const name = request.leadData?.name || request.recipientName;
    const company = request.leadData?.companyName || 'your company';
    const industry = request.leadData?.industry || 'your industry';
    
    const urgency = temperature === 'HOT' ? 'immediate' : temperature === 'WARM' ? 'timely' : 'when convenient';
    
    return `Dear ${name},

I hope you're doing well. I've been researching ${company} and the ${industry} sector, and I believe there are some valuable opportunities we could explore together.

${request.customMessage || 'Based on current market trends and challenges facing South African businesses, I thought you might be interested in discussing how we can help optimize your operations and drive growth.'}

I'd love to schedule a brief conversation to understand your current priorities and share some insights specific to ${industry} businesses in the South African market.

Would you be available for a ${urgency} call this week? I can work around your schedule.

Best regards,
Your Business Development Team

P.S. I've helped several ${industry} companies in South Africa achieve significant growth - happy to share some relevant case studies if you're interested.`;
}

function generateSmartFollowUpReminder(leadData?: EnhancedLeadData): string {
    if (!leadData) return 'Follow up in 3-5 business days if no response';
    
    const temperature = leadData.temperature;
    const avgResponseTime = leadData.averageResponseTime;
    
    if (temperature === 'HOT') {
        return 'Follow up within 24-48 hours if no response - high interest lead';
    } else if (temperature === 'WARM') {
        return 'Follow up in 2-3 business days if no response';
    } else if (avgResponseTime && avgResponseTime > 72) {
        return 'Follow up in 1 week - prospect typically takes time to respond';
    } else {
        return 'Follow up in 3-5 business days if no response';
    }
}

function generateErrorFallbackEmail(name: string, leadData?: EnhancedLeadData): string {
    const company = leadData?.companyName || 'your organization';
    
    return `Dear ${name},

I hope this message finds you well. I wanted to reach out to see how things are going at ${company} and explore how we might be able to support your business objectives.

Given the current business landscape in South Africa, many organizations are looking for innovative solutions to drive growth and efficiency. I'd love to learn more about your current priorities and challenges.

Would you be open to a brief conversation to discuss how we might be able to help? I can work around your schedule for a call or meeting.

Looking forward to hearing from you.

Best regards,
Your Business Development Team`;
}
