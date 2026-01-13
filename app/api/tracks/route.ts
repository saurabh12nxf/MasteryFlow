import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tracks, users } from "@/lib/db/schema";
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

        const userTracks = await db
            .select()
            .from(tracks)
            .where(eq(tracks.userId, user.id))
            .orderBy(tracks.createdAt);

        return NextResponse.json({ tracks: userTracks });
    } catch (error) {
        console.error("Error fetching tracks:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

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

        const body = await req.json();
        const { name, category, difficultyLevel, estimatedDays, sourceUrl } = body;

        if (!name || !category) {
            return NextResponse.json(
                { error: "Name and category are required" },
                { status: 400 }
            );
        }

        const [newTrack] = await db
            .insert(tracks)
            .values({
                userId: user.id,
                name,
                category,
                difficultyLevel: difficultyLevel || "INTERMEDIATE",
                estimatedDays: estimatedDays || null,
                sourceUrl: sourceUrl || null,
            })
            .returning();

        return NextResponse.json({ track: newTrack }, { status: 201 });
    } catch (error) {
        console.error("Error creating track:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
