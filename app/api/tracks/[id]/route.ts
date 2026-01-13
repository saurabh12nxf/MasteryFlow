import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, tracks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
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

        // Get track with items
        const track = await db.query.tracks.findFirst({
            where: eq(tracks.id, params.id),
            with: {
                items: {
                    orderBy: (items, { asc }) => [asc(items.orderIndex)],
                },
            },
        });

        if (!track) {
            return NextResponse.json({ error: "Track not found" }, { status: 404 });
        }

        // Verify ownership
        if (track.userId !== user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        return NextResponse.json({ track });
    } catch (error) {
        console.error("Error fetching track:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function PATCH(
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

        const body = await req.json();
        const { name, category, difficultyLevel, isActive, rotationPriority } = body;

        // Get existing track
        const [existingTrack] = await db
            .select()
            .from(tracks)
            .where(eq(tracks.id, params.id))
            .limit(1);

        if (!existingTrack) {
            return NextResponse.json({ error: "Track not found" }, { status: 404 });
        }

        // Verify ownership
        if (existingTrack.userId !== user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Update track
        const [updatedTrack] = await db
            .update(tracks)
            .set({
                name: name || existingTrack.name,
                category: category || existingTrack.category,
                difficultyLevel: difficultyLevel || existingTrack.difficultyLevel,
                isActive: isActive !== undefined ? isActive : existingTrack.isActive,
                rotationPriority:
                    rotationPriority !== undefined
                        ? rotationPriority
                        : existingTrack.rotationPriority,
                updatedAt: new Date(),
            })
            .where(eq(tracks.id, params.id))
            .returning();

        return NextResponse.json({ track: updatedTrack });
    } catch (error) {
        console.error("Error updating track:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(
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

        // Get existing track
        const [existingTrack] = await db
            .select()
            .from(tracks)
            .where(eq(tracks.id, params.id))
            .limit(1);

        if (!existingTrack) {
            return NextResponse.json({ error: "Track not found" }, { status: 404 });
        }

        // Verify ownership
        if (existingTrack.userId !== user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Delete track (cascade will delete items)
        await db.delete(tracks).where(eq(tracks.id, params.id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting track:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
