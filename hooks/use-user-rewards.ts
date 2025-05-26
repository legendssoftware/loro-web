import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth-store';

export interface RewardsBreakdown {
    attendance: number;
    'check-in-client': number;
    claim: number;
    collaboration: number;
    journal: number;
    lead: number;
    leads: number;
    login: number;
    other: number;
    sales: number;
    task: number;
    tasks: number;
}

export interface Achievement {
    uid: number;
    name: string;
    description: string;
    xpValue: number;
    icon: string;
    category: string;
    isRepeatable: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface XPTransaction {
    uid: number;
    action: string;
    xpAmount: number;
    metadata: {
        sourceId: string;
        sourceType: string;
        details: any;
    };
    timestamp: string;
}

export interface UserRewards {
    uid: number;
    currentXP: number;
    totalXP: number;
    level: number;
    rank: string;
    xpBreakdown: RewardsBreakdown;
    lastAction: string;
    createdAt: string;
    updatedAt: string;
    achievements: Achievement[];
    inventory: any[];
    xpTransactions: XPTransaction[];
}

interface RewardsApiResponse {
    message: string;
    rewards: UserRewards | null;
}

export const useUserRewards = (userId?: number) => {
    const { accessToken, profileData } = useAuthStore();
    const targetUserId = userId || profileData?.uid;

    return useQuery<UserRewards | null>({
        queryKey: ['user-rewards', targetUserId],
        queryFn: async () => {
            if (!targetUserId) return null;

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/rewards/user-stats/${targetUserId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: RewardsApiResponse = await response.json();
            return data.rewards;
        },
        enabled: !!targetUserId && !!accessToken,
        retry: 1,
        retryDelay: 1000,
    });
};
