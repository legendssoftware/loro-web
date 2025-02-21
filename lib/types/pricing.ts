import { LucideIcon } from 'lucide-react';

export interface PricingPlan {
    icon: LucideIcon;
    name: string;
    description: string;
    price: string;
    isPopular?: boolean;
    features: string[];
    buttonText: string;
}
