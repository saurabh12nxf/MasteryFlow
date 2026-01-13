import { db } from "@/lib/db";
import { tracks, trackItems, dailyMissions, missionTasks, users } from "@/lib/db/schema";
import { eq, and, lt, asc, sql } from "drizzle-orm";

export interface MissionGenerationResult {
    mission: any;
    tasksCreated: number;
    totalEstimatedMinutes: number;
}

/**
 * Generate daily mission for a user
 * Implements track rotation and cognitive load balancing
 */
export async function generateDailyMission(
    userId: string,
    missionDate: Date
): Promise<MissionGenerationResult | null> {
    // 1. Get user preferences
    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

    if (!user) {
        throw new Error("User not found");
    }

    const maxTasks = user.cognitiveLoadMax || 5;
    const maxMinutes = 180; // 3 hours default

    // 2. Get active tracks
    const activeTracks = await db
        .select()
        .from(tracks)
        .where(and(eq(tracks.userId, userId), eq(tracks.isActive, true)))
        .orderBy(asc(tracks.rotationPriority));

    if (activeTracks.length === 0) {
        return null; // No tracks to assign
    }

    // 3. Select tracks for today (rotation algorithm)
    const selectedTracks = await selectTracksForToday(userId, activeTracks);

    if (selectedTracks.length === 0) {
        return null;
    }

    // 4. Get next items from each track
    const taskItems = await getNextItemsFromTracks(selectedTracks, maxTasks);

    if (taskItems.length === 0) {
        return null; // No items available
    }

    // 5. Balance cognitive load
    const balancedTasks = balanceCognitiveLoad(taskItems, maxMinutes);

    // 6. Create daily mission
    const deadline = new Date(missionDate);
    deadline.setHours(23, 59, 59, 999);

    const totalEstimatedMinutes = balancedTasks.reduce(
        (sum, t) => sum + t.estimatedMinutes,
        0
    );

    const [mission] = await db
        .insert(dailyMissions)
        .values({
            userId,
            missionDate: missionDate.toISOString().split("T")[0],
            deadline,
            totalEstimatedMinutes,
        })
        .returning();

    // 7. Create mission tasks
    for (const item of balancedTasks) {
        await db.insert(missionTasks).values({
            missionId: mission.id,
            trackId: item.trackId,
            trackItemId: item.id,
            taskType: "TRACK_ITEM",
            estimatedMinutes: item.estimatedMinutes,
        });
    }

    return {
        mission,
        tasksCreated: balancedTasks.length,
        totalEstimatedMinutes,
    };
}

/**
 * Track rotation algorithm
 * Selects tracks based on recency, priority, and progress
 */
async function selectTracksForToday(
    userId: string,
    activeTracks: any[]
): Promise<any[]> {
    // Get recent mission history (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentMissions = await db.query.dailyMissions.findMany({
        where: and(
            eq(dailyMissions.userId, userId),
            lt(dailyMissions.missionDate, sevenDaysAgo.toISOString().split("T")[0])
        ),
        with: {
            tasks: true,
        },
    });

    // Calculate engagement score for each track
    const trackScores = activeTracks.map((track) => {
        // Count how many times this track appeared in recent missions
        const recentEngagement = recentMissions.filter((m) =>
            m.tasks.some((t) => t.trackId === track.id)
        ).length;

        const daysSinceEngagement =
            recentEngagement > 0 ? 7 - recentEngagement : 7;
        const completionRate =
            track.totalItems > 0 ? track.completedItems / track.totalItems : 0;

        // Scoring formula
        const recencyScore = daysSinceEngagement * 10; // Higher = more urgent
        const priorityScore = track.rotationPriority * 5;
        const progressScore = (1 - completionRate) * 10; // Prioritize incomplete

        const totalScore = recencyScore + priorityScore + progressScore;

        return { track, score: totalScore };
    });

    // Sort by score and select top 3 tracks
    return trackScores
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map((ts) => ts.track);
}

/**
 * Get next uncompleted items from selected tracks
 */
async function getNextItemsFromTracks(
    selectedTracks: any[],
    maxItems: number
): Promise<any[]> {
    const items = [];

    for (const track of selectedTracks) {
        // Get all items for this track, ordered by index
        const trackItemsList = await db
            .select()
            .from(trackItems)
            .where(eq(trackItems.trackId, track.id))
            .orderBy(asc(trackItems.orderIndex));

        // Find first uncompleted item
        // TODO: Track completion status in separate table
        // For now, just get the first item based on track progress
        const nextItemIndex = Math.floor(
            (track.completedItems / track.totalItems) * trackItemsList.length
        );

        const nextItem = trackItemsList[nextItemIndex] || trackItemsList[0];

        if (nextItem) {
            items.push({ ...nextItem, trackId: track.id });
        }

        if (items.length >= maxItems) break;
    }

    return items;
}

/**
 * Cognitive load balancing
 * Balances task difficulty to prevent burnout
 */
function balanceCognitiveLoad(items: any[], maxMinutes: number): any[] {
    // Separate by difficulty
    const easy = items.filter((i) => i.difficulty === "EASY");
    const medium = items.filter((i) => i.difficulty === "MEDIUM");
    const hard = items.filter((i) => i.difficulty === "HARD");

    const selected: any[] = [];
    let totalMinutes = 0;

    // Strategy: Start with 1 hard task, then medium, then easy
    // This ensures a balanced cognitive load

    // Add 1 hard task if available
    if (hard.length > 0 && totalMinutes + hard[0].estimatedMinutes <= maxMinutes) {
        selected.push(hard[0]);
        totalMinutes += hard[0].estimatedMinutes;
    }

    // Add medium tasks
    for (const item of medium) {
        if (totalMinutes + item.estimatedMinutes <= maxMinutes && selected.length < 5) {
            selected.push(item);
            totalMinutes += item.estimatedMinutes;
        }
    }

    // Fill remaining with easy tasks
    for (const item of easy) {
        if (totalMinutes + item.estimatedMinutes <= maxMinutes && selected.length < 5) {
            selected.push(item);
            totalMinutes += item.estimatedMinutes;
        }
    }

    return selected;
}
