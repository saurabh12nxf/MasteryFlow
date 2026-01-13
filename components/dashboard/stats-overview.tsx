"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Zap, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

interface StatsOverviewProps {
    userId: string;
}

export default function StatsOverview({ userId }: StatsOverviewProps) {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch("/api/gamification/stats");
            const data = await res.json();
            setStats(data.stats);
        } catch (error) {
            console.error("Error fetching stats:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                        <CardHeader className="pb-3">
                            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    const level = stats?.level || 0;
    const xpProgress = stats?.xpProgress || 0;
    const xpNeeded = stats?.xpNeeded || 100;
    const progressPercent = (xpProgress / xpNeeded) * 100;

    return (
        <div className="space-y-4">
            {/* Current Streak */}
            <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 border-orange-200 dark:border-orange-800">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Flame className="h-4 w-4 text-orange-500" />
                        Current Streak
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-orange-600">
                        {stats?.globalStreak || 0}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Longest: {stats?.longestStreak || 0} days
                    </p>
                </CardContent>
            </Card>

            {/* Neurons (XP) */}
            <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 border-purple-200 dark:border-purple-800">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Zap className="h-4 w-4 text-purple-500" />
                        Neurons (XP)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-purple-600">
                        {stats?.totalXp || 0}
                    </div>
                    <div className="mt-2 space-y-1">
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Level {level}</span>
                            <span className="text-muted-foreground">
                                {xpProgress}/{xpNeeded}
                            </span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Streak Freezes */}
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-200 dark:border-blue-800">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                        Streak Freezes
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-blue-600">
                        {stats?.freezeCount || 0}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        From OSS contributions
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
