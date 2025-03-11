'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductStatus } from '@/hooks/use-products-query';

interface ProductsTabGroupProps {
    activeTab: string;
    onTabChange: (value: string) => void;
    counts: {
        [key: string]: number;
    };
}

export function ProductsTabGroup({
    activeTab,
    onTabChange,
    counts,
}: ProductsTabGroupProps) {
    return (
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
            <TabsList className="mb-4 bg-transparent">
                <TabsTrigger
                    value="all"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                    All ({counts.all || 0})
                </TabsTrigger>
                <TabsTrigger
                    value={ProductStatus.ACTIVE}
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                    In Stock ({counts[ProductStatus.ACTIVE] || 0})
                </TabsTrigger>
                <TabsTrigger
                    value={ProductStatus.OUTOFSTOCK}
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                    Low Stock ({counts[ProductStatus.OUTOFSTOCK] || 0})
                </TabsTrigger>
                <TabsTrigger
                    value="promotion"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                    On Promotion ({counts.promotion || 0})
                </TabsTrigger>
            </TabsList>
        </Tabs>
    );
}
