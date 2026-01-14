import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users, tracks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Edit, Trash2, Plus, PlayCircle, CheckCircle2 } from "lucide-react";
import AddItemsForm from "@/components/tracks/add-items-form";

export default async function TrackDetailPage({
    params,
}: {
    params: { id: string };
}) {
    const clerkUser = await currentUser();
    if (!clerkUser) redirect("/sign-in");

    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, clerkUser.id))
        .limit(1);

    if (!user) redirect("/sign-in");

    // Get track with items
    const track = await db.query.tracks.findFirst({
        where: eq(tracks.id, params.id),
        with: {
            items: {
                orderBy: (items, { asc }) => [asc(items.orderIndex)],
            },
        },
    });

    if (!track || track.userId !== user.id) {
        notFound();
    }

    const progress = track.totalItems > 0
        ? (track.completedItems / track.totalItems) * 100
        : 0;

    const getDifficultyColor = (difficulty: string) => {
        const colors: Record<string, string> = {
            EASY: "text-green-600 bg-green-50 dark:bg-green-950",
            MEDIUM: "text-yellow-600 bg-yellow-50 dark:bg-yellow-950",
            HARD: "text-red-600 bg-red-50 dark:bg-red-950",
        };
        return colors[difficulty] || colors.MEDIUM;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/dashboard/tracks">
                        <Button variant="ghost" className="mb-4">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Tracks
                        </Button>
                    </Link>

                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                {track.name}
                            </h1>
                            <p className="mt-2 text-muted-foreground">
                                {track.category.replace("_", " ")} • {track.difficultyLevel}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Link href={`/dashboard/tracks/${track.id}/edit`}>
                                <Button variant="outline">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                </Button>
                            </Link>
                            <Button variant="destructive" size="icon">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-6 md:grid-cols-3 mb-8">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">Progress</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{Math.round(progress)}%</div>
                            <Progress value={progress} className="mt-2" />
                            <p className="text-xs text-muted-foreground mt-2">
                                {track.completedItems} of {track.totalItems} items completed
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {track.isActive ? "Active" : "Paused"}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                Priority: {track.rotationPriority}/10
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">Category</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {track.category.replace("_", " ")}
                            </div>
                            <Badge className="mt-2">{track.difficultyLevel}</Badge>
                        </CardContent>
                    </Card>
                </div>

                {/* Items Section */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Track Items</CardTitle>
                                <CardDescription>
                                    Manage the items in this learning track
                                </CardDescription>
                            </div>
                            <AddItemsForm trackId={track.id} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {track.items.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground mb-4">
                                    No items in this track yet
                                </p>
                                <AddItemsForm trackId={track.id} />
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {track.items.map((item, index) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center gap-4 p-4 rounded-lg border-2 hover:border-purple-300 transition-all"
                                    >
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-sm font-semibold">
                                            {index + 1}
                                        </div>

                                        <div className="flex-1">
                                            <h4 className="font-medium">{item.title}</h4>
                                            {item.description && (
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {item.description}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-3 mt-2">
                                                <Badge className={getDifficultyColor(item.difficulty)}>
                                                    {item.difficulty}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    {item.estimatedMinutes} min
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="destructive" size="sm">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
