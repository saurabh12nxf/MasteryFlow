import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users, tracks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, BookOpen, TrendingUp, Clock } from "lucide-react";

export default async function TracksPage() {
    const clerkUser = await currentUser();
    if (!clerkUser) redirect("/sign-in");

    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, clerkUser.id))
        .limit(1);

    if (!user) redirect("/sign-in");

    // Get all user tracks
    const userTracks = await db
        .select()
        .from(tracks)
        .where(eq(tracks.userId, user.id))
        .orderBy(tracks.createdAt);

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            DSA: "bg-blue-500",
            "SYSTEM_DESIGN": "bg-purple-500",
            "AI_ML": "bg-green-500",
            "WEB_DEV": "bg-orange-500",
            "MOBILE_DEV": "bg-pink-500",
            "DEVOPS": "bg-cyan-500",
            OTHER: "bg-gray-500",
        };
        return colors[category] || colors.OTHER;
    };

    const getDifficultyBadge = (difficulty: string) => {
        const variants: Record<string, "default" | "secondary" | "destructive"> = {
            BEGINNER: "default",
            INTERMEDIATE: "secondary",
            ADVANCED: "destructive",
        };
        return variants[difficulty] || "default";
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            Learning Tracks
                        </h1>
                        <p className="mt-2 text-muted-foreground">
                            Manage your learning paths and track progress
                        </p>
                    </div>
                    <Link href="/dashboard/tracks/new">
                        <Button size="lg" className="gap-2">
                            <Plus className="h-5 w-5" />
                            Create Track
                        </Button>
                    </Link>
                </div>

                {/* Empty State */}
                {userTracks.length === 0 ? (
                    <Card className="border-2 border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
                            <h3 className="text-xl font-semibold mb-2">No tracks yet</h3>
                            <p className="text-muted-foreground mb-6 text-center max-w-md">
                                Create your first learning track to start your journey. Tracks help you organize
                                and focus on specific topics or skills.
                            </p>
                            <Link href="/dashboard/tracks/new">
                                <Button size="lg">
                                    <Plus className="h-5 w-5 mr-2" />
                                    Create Your First Track
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    /* Track Grid */
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {userTracks.map((track) => {
                            const progress = track.totalItems > 0
                                ? (track.completedItems / track.totalItems) * 100
                                : 0;

                            return (
                                <Link key={track.id} href={`/dashboard/tracks/${track.id}`}>
                                    <Card className="h-full hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer border-2">
                                        <CardHeader>
                                            <div className="flex items-start justify-between mb-2">
                                                <div className={`h-2 w-2 rounded-full ${getCategoryColor(track.category)}`} />
                                                <Badge variant={getDifficultyBadge(track.difficultyLevel)}>
                                                    {track.difficultyLevel}
                                                </Badge>
                                            </div>
                                            <CardTitle className="text-xl">{track.name}</CardTitle>
                                            <CardDescription className="line-clamp-2">
                                                {track.category.replace("_", " ")}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {/* Progress */}
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Progress</span>
                                                    <span className="font-medium">
                                                        {track.completedItems}/{track.totalItems} items
                                                    </span>
                                                </div>
                                                <Progress value={progress} className="h-2" />
                                            </div>

                                            {/* Stats */}
                                            <div className="grid grid-cols-2 gap-4 pt-2">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <TrendingUp className="h-4 w-4 text-green-600" />
                                                    <span className="text-muted-foreground">
                                                        {Math.round(progress)}% done
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Clock className="h-4 w-4 text-blue-600" />
                                                    <span className="text-muted-foreground">
                                                        {track.isActive ? "Active" : "Paused"}
                                                    </span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
