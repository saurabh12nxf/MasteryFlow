import { notFound, redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users, tracks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import EditTrackForm from "@/components/tracks/edit-track-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function EditTrackPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const clerkUser = await currentUser();
    if (!clerkUser) redirect("/sign-in");

    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, clerkUser.id))
        .limit(1);

    if (!user) redirect("/sign-in");

    // Get track
    const [track] = await db
        .select()
        .from(tracks)
        .where(eq(tracks.id, id))
        .limit(1);

    if (!track || track.userId !== user.id) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                {/* Header */}
                <div className="mb-8">
                    <Link href={`/dashboard/tracks/${id}`}>
                        <Button variant="ghost" className="mb-4">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Track
                        </Button>
                    </Link>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        Edit Track
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        Update your learning track details
                    </p>
                </div>

                {/* Form Component */}
                <EditTrackForm track={track} />
            </div>
        </div>
    );
}
