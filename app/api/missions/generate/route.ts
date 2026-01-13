import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, dailyMissions } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { generateDailyMission } from "@/lib/mission-engine/assignment";

export async function POST(req: Request) {
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

        const today = new Date();
        const todayStr = today.toISOString().split("T")[0];

        // Check if mission already exists for today
        const existingMission = await db.query.dailyMissions.findFirst({
            where: and(
                eq(dailyMissions.userId, user.id),
                eq(dailyMissions.missionDate, todayStr)
            ),
        });

        if (existingMission) {
            return NextResponse.json(
                { error: "Mission already exists for today" },
                { status: 400 }
            );
        }

        // Generate mission
        const result = await generateDailyMission(user.id, today);

        if (!result) {
            return NextResponse.json(
                { error: "No tracks or items available to create mission" },
                { status: 400 }
            );
        }

        // Fetch complete mission with tasks
        const mission = await db.query.dailyMissions.findFirst({
            where: eq(dailyMissions.id, result.mission.id),
            with: {
                tasks: {
                    with: {
                        track: true,
                        trackItem: true,
                    },
                },
            },
        });

        return NextResponse.json({ mission }, { status: 201 });
    } catch (error) {
        console.error("Error generating mission:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
