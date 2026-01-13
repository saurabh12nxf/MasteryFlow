import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, tracks, trackItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
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

        // Get track
        const [track] = await db
            .select()
            .from(tracks)
            .where(eq(tracks.id, params.id))
            .limit(1);

        if (!track) {
            return NextResponse.json({ error: "Track not found" }, { status: 404 });
        }

        // Verify ownership
        if (track.userId !== user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();
        const { items } = body; // Array of items to add

        if (!Array.isArray(items) || items.length === 0) {
            return NextResponse.json(
                { error: "Items array is required" },
                { status: 400 }
            );
        }

        // Get current max order index
        const existingItems = await db
            .select()
            .from(trackItems)
            .where(eq(trackItems.trackId, params.id));

        let maxOrderIndex = existingItems.length > 0
            ? Math.max(...existingItems.map(i => i.orderIndex))
            : -1;

        // Insert items
        const createdItems = [];
        for (const item of items) {
            maxOrderIndex++;
            const [newItem] = await db
                .insert(trackItems)
                .values({
                    trackId: params.id,
                    title: item.title,
                    description: item.description || null,
                    difficulty: item.difficulty || "MEDIUM",
                    estimatedMinutes: item.estimatedMinutes || 30,
                    orderIndex: maxOrderIndex,
                    tags: item.tags || [],
                    resourceLinks: item.resourceLinks || [],
                })
                .returning();

            createdItems.push(newItem);
        }

        // Update track total items count
        await db
            .update(tracks)
            .set({
                totalItems: track.totalItems + createdItems.length,
                updatedAt: new Date(),
            })
            .where(eq(tracks.id, params.id));

        return NextResponse.json({ items: createdItems }, { status: 201 });
    } catch (error) {
        console.error("Error adding track items:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
