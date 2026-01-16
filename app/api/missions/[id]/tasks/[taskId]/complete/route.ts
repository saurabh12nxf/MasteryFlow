import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, missionTasks, xpTransactions, tracks, streaks } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string; taskId: string }> }
) {
    try {
        // Await params as required by Next.js 15
        const { id, taskId } = await params;

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

        const body = await req.json();
        const { actualMinutes, difficultyRating, effortRating } = body;

        // Get task
        const [task] = await db
            .select()
            .from(missionTasks)
            .where(eq(missionTasks.id, taskId))
            .limit(1);

        if (!task) {
            return NextResponse.json({ error: "Task not found" }, { status: 404 });
        }

        if (task.status === "COMPLETED") {
            return NextResponse.json(
                { error: "Task already completed" },
                { status: 400 }
            );
        }

        // Update task
        const [updatedTask] = await db
            .update(missionTasks)
            .set({
                status: "COMPLETED",
                completedAt: new Date(),
                actualMinutes: actualMinutes || task.estimatedMinutes,
                difficultyRating: difficultyRating || null,
                effortRating: effortRating || null,
            })
            .where(eq(missionTasks.id, taskId))
            .returning();

        // Calculate XP
        const baseXP = calculateTaskXP(task, actualMinutes || task.estimatedMinutes);

        // Award XP
        await db.insert(xpTransactions).values({
            userId: user.id,
            amount: baseXP,
            source: "TASK_COMPLETION",
            sourceId: task.id,
            description: `Completed task from mission`,
        });

        // Update track progress if track item
        if (task.trackId) {
            const [track] = await db
                .select()
                .from(tracks)
                .where(eq(tracks.id, task.trackId))
                .limit(1);

            if (track) {
                await db
                    .update(tracks)
                    .set({
                        completedItems: track.completedItems + 1,
                        updatedAt: new Date(),
                    })
                    .where(eq(tracks.id, task.trackId));

                // Update track streak
                const today = new Date().toISOString().split("T")[0];
                const [trackStreak] = await db
                    .select()
                    .from(streaks)
                    .where(
                        and(eq(streaks.userId, user.id), eq(streaks.trackId, task.trackId))
                    )
                    .limit(1);

                if (trackStreak) {
                    // Check if last activity was yesterday
                    const lastDate = trackStreak.lastActivityDate;
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    const yesterdayStr = yesterday.toISOString().split("T")[0];

                    let newStreak = trackStreak.currentStreak;
                    if (lastDate === yesterdayStr) {
                        newStreak += 1;
                    } else if (lastDate !== today) {
                        newStreak = 1; // Reset if gap
                    }

                    await db
                        .update(streaks)
                        .set({
                            currentStreak: newStreak,
                            longestStreak: Math.max(newStreak, trackStreak.longestStreak),
                            lastActivityDate: today,
                            updatedAt: new Date(),
                        })
                        .where(eq(streaks.id, trackStreak.id));
                } else {
                    // Create streak
                    await db.insert(streaks).values({
                        userId: user.id,
                        trackId: task.trackId,
                        currentStreak: 1,
                        longestStreak: 1,
                        lastActivityDate: today,
                    });
                }
            }
        }

        // Update global streak
        const [globalStreak] = await db
            .select()
            .from(streaks)
            .where(and(eq(streaks.userId, user.id), isNull(streaks.trackId)))
            .limit(1);

        if (globalStreak) {
            const today = new Date().toISOString().split("T")[0];
            const lastDate = globalStreak.lastActivityDate;
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split("T")[0];

            let newStreak = globalStreak.currentStreak;
            if (lastDate === yesterdayStr) {
                newStreak += 1;
            } else if (lastDate !== today) {
                newStreak = 1;
            }

            await db
                .update(streaks)
                .set({
                    currentStreak: newStreak,
                    longestStreak: Math.max(newStreak, globalStreak.longestStreak),
                    lastActivityDate: today,
                    updatedAt: new Date(),
                })
                .where(eq(streaks.id, globalStreak.id));
        }

        return NextResponse.json({
            task: updatedTask,
            xpAwarded: baseXP,
        });
    } catch (error) {
        console.error("Error completing task:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

function calculateTaskXP(task: any, actualMinutes: number): number {
    const baseXP = {
        EASY: 50,
        MEDIUM: 100,
        HARD: 200,
    };

    const difficulty = task.difficulty || "MEDIUM";
    let xp = baseXP[difficulty as keyof typeof baseXP] || 100;

    // Time bonus (completed faster than estimated)
    if (actualMinutes < task.estimatedMinutes) {
        const timeFactor = task.estimatedMinutes / actualMinutes;
        if (timeFactor > 1.2) {
            xp += Math.floor(xp * 0.2); // 20% bonus
        }
    }

    return xp;
}
