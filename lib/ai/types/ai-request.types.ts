/**
 * Common AI request types used across all AI endpoints
 */

export interface BaseAIRequest {
  /** Optional data hash for caching */
  dataHash?: string;
  /** User profile information */
  userProfile?: {
    uid: string;
    name: string;
    surname: string;
    email: string;
    role: string;
    department?: string;
  };
}

export interface AIRequestWithTimeFrame extends BaseAIRequest {
  timeFrame: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'today' | 'this_week' | 'this_month';
}

export interface AIRequestWithContext extends BaseAIRequest {
  context?: Record<string, any>;
  customInstructions?: string;
}

export interface ToneConfiguration {
  baseTone: 'consultative' | 'authoritative' | 'collaborative' | 'empathetic' | 'innovative' | 
            'results-driven' | 'professional' | 'encouraging' | 'motivational' | 'urgent' | 
            'friendly' | 'educational';
  intensity: 'subtle' | 'moderate' | 'strong';
  regionalAdaptation: 'south_african' | 'international' | 'local';
  industrySpecific: boolean;
}

export interface LeadData {
  uid: number;
  name: string;
  email: string;
  phone: string;
  status: string;
  score?: number;
  lastContact?: string;
  source: string;
  value?: number;
  assignee?: string;
  companyName?: string;
  jobTitle?: string;
  industry?: string;
  businessSize?: string;
  temperature?: string;
  priority?: string;
  leadScore?: number;
  notes?: string;
}

export interface TargetData {
  currentValue: number;
  targetValue: number;
  progress: number;
  period: string;
  category: string;
}

export interface ClientData {
  uid: number;
  name: string;
  email: string;
  phone: string;
  companyName?: string;
  industry?: string;
  businessSize?: string;
  status?: string;
  totalValue?: number;
  lastPurchaseDate?: string;
}
