export enum AchievementCategory {
    DAILY = 'daily',
    WEEKLY = 'weekly',
    MONTHLY = 'monthly',
    SPECIAL = 'special',
    MILESTONE = 'milestone',
    SEASONAL = 'seasonal'
}

export enum ItemType {
    BADGE = 'badge',
    AVATAR = 'avatar',
    THEME = 'theme',
    EMOJI = 'emoji',
    TITLE = 'title',
    FEATURE = 'feature'
}

export enum ItemRarity {
    COMMON = 'common',
    RARE = 'rare',
    EPIC = 'epic',
    LEGENDARY = 'legendary'
}

export interface RewardSource {
    id: string;
    type: string;
    details: Record<string, unknown>;
}

export interface Reward {
    uid: number;
    owner: number;
    action: string;
    amount: number;
    source: RewardSource;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateRewardDTO {
    owner: number;
    action: string;
    amount: number;
    source: RewardSource;
} 