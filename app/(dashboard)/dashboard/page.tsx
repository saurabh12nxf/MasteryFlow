import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users, dailyMissions, userSettings, streaks } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import MissionCard from "@/components/dashboard/mission-card";
import StatsOverview from "@/components/dashboard/stats-overview";
import QuickActions from "@/components/dashboard/quick-actions";

export default async function DashboardPage() {
    const clerkUser = await currentUser();
    if (!clerkUser) redirect("/sign-in");

    // Try to get user from database
    let [user] = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, clerkUser.id))
        .limit(1);

    // If user doesn't exist, create it
    if (!user) {
        try {
            [user] = await db
                .insert(users)
                .values({
                    clerkId: clerkUser.id,
                    email: clerkUser.emailAddresses[0].emailAddress,
                    username: clerkUser.username || clerkUser.firstName || "User",
                    timezone: "Asia/Kolkata",
                })
                .returning();

            // Create user settings
            await db.insert(userSettings).values({
                userId: user.id,
            });

            // Create global streak
            await db.insert(streaks).values({
                userId: user.id,
                trackId: null,
            });
        } catch (error) {
            console.error("Error creating user:", error);
            redirect("/sign-in");
        }
    }

    // Get today's mission
    const today = new Date().toISOString().split("T")[0];
    const todayMission = await db.query.dailyMissions.findFirst({
        where: and(
            eq(dailyMissions.userId, user.id),
            eq(dailyMissions.missionDate, today)
        ),
        with: {
            tasks: {
                with: {
                    track: true,
                    trackItem: true,
                },
            },
        },
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
            <div className="container mx-auto px-4 py-8">
                <header className="mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        Welcome back, {user.username || clerkUser.firstName}!
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        {todayMission
                            ? "Let's complete today's mission"
                            : "Ready to start learning?"}
                    </p>
                </header>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <MissionCard mission={todayMission} />
                    </div>

                    <div className="space-y-6">
                        <StatsOverview userId={user.id} />
                        <QuickActions />
                    </div>
                </div>
            </div>
        </div>
    );
}
