import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, dailyMissions } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

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

        const today = new Date().toISOString().split("T")[0];

        // Get today's mission
        const mission = await db.query.dailyMissions.findFirst({
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

        if (!mission) {
            return NextResponse.json({ mission: null });
        }

        return NextResponse.json({ mission });
    } catch (error) {
        console.error("Error fetching today's mission:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
