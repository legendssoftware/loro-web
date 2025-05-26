import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { User, TrendingUp, Target, Award } from 'lucide-react';

export function UserReportPlaceholder() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-xl font-normal uppercase font-body">
                        Personal Analytics
                    </h1>
                    <p className="text-xs font-thin uppercase text-muted-foreground font-body">
                        Your individual performance metrics and insights
                    </p>
                </div>
            </div>

            {/* Black placeholder tab */}
            <Card className="bg-black border-black text-white">
                <CardContent className="p-8">
                    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
                        <div className="flex items-center space-x-4">
                            <User className="w-12 h-12 text-white" />
                            <TrendingUp className="w-12 h-12 text-white" />
                            <Target className="w-12 h-12 text-white" />
                            <Award className="w-12 h-12 text-white" />
                        </div>

                        <div className="text-center space-y-4">
                            <h2 className="text-2xl font-normal uppercase font-body text-white">
                                User Reports Coming Soon
                            </h2>
                            <p className="text-lg font-thin uppercase text-white/80 font-body">
                                Personal dashboard activating soon
                            </p>

                            <div className="mt-8 space-y-2">
                                <p className="text-sm font-thin text-white/60 font-body">
                                    Your personalized analytics will include:
                                </p>
                                <div className="text-xs font-thin text-white/50 font-body space-y-1">
                                    <p>• Individual performance metrics</p>
                                    <p>• Personal goal tracking</p>
                                    <p>• Activity summaries</p>
                                    <p>• Achievement progress</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
