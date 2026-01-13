import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, xpTransactions, streaks } from "@/lib/db/schema";
import { eq, and, sql, isNull } from "drizzle-orm";

export async function GET() {
    try {
        const clerkUser = await currentUser();

        if (!clerkUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.clerkId, clerkUser.id))
            .limit(1);

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Get total XP
        const xpResult = await db
            .select({
                totalXp: sql<number>`COALESCE(SUM(${xpTransactions.amount}), 0)`,
            })
            .from(xpTransactions)
            .where(eq(xpTransactions.userId, user.id));

        const totalXp = xpResult[0]?.totalXp || 0;

        // Calculate level (simple formula: level = floor(sqrt(totalXp / 100)))
        const level = Math.floor(Math.sqrt(totalXp / 100));
        const nextLevelXp = Math.pow(level + 1, 2) * 100;
        const currentLevelXp = Math.pow(level, 2) * 100;
        const xpProgress = totalXp - currentLevelXp;
        const xpNeeded = nextLevelXp - currentLevelXp;

        // Get global streak
        const [globalStreak] = await db
            .select()
            .from(streaks)
            .where(and(eq(streaks.userId, user.id), isNull(streaks.trackId)))
            .limit(1);

        // Get all streaks
        const allStreaks = await db
            .select()
            .from(streaks)
            .where(eq(streaks.userId, user.id));

        return NextResponse.json({
            stats: {
                totalXp,
                level,
                xpProgress,
                xpNeeded,
                globalStreak: globalStreak?.currentStreak || 0,
                longestStreak: globalStreak?.longestStreak || 0,
                freezeCount: globalStreak?.freezeCount || 0,
                allStreaks,
            },
        });
    } catch (error) {
        console.error("Error fetching gamification stats:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
