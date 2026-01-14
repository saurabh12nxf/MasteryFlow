import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, dailyMissions } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { generateDailyMission } from "@/lib/mission-engine/assignment";

export async function GET(req: Request) {
    try {
        // Verify cron secret for security
        const authHeader = req.headers.get("authorization");
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const today = new Date();
        const todayStr = today.toISOString().split("T")[0];

        // Get all users
        const allUsers = await db.select().from(users);

        let generated = 0;
        let skipped = 0;
        let errors = 0;

        for (const user of allUsers) {
            try {
                // Check if mission already exists for today
                const existingMission = await db.query.dailyMissions.findFirst({
                    where: and(
                        eq(dailyMissions.userId, user.id),
                        eq(dailyMissions.missionDate, todayStr)
                    ),
                });

                if (existingMission) {
                    skipped++;
                    continue;
                }

                // Generate mission
                const result = await generateDailyMission(user.id, today);

                if (result) {
                    generated++;
                } else {
                    skipped++; // No tracks or items available
                }
            } catch (error) {
                console.error(`Error generating mission for user ${user.id}:`, error);
                errors++;
            }
        }

        return NextResponse.json({
            success: true,
            date: todayStr,
            totalUsers: allUsers.length,
            generated,
            skipped,
            errors,
        });
    } catch (error) {
        console.error("Cron job error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
