import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, userSettings, streaks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST() {
    try {
        const clerkUser = await currentUser();

        if (!clerkUser) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        // Check if user already exists
        const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.clerkId, clerkUser.id))
            .limit(1);

        if (existingUser.length > 0) {
            return NextResponse.json({
                message: "User already exists",
                user: existingUser[0]
            });
        }

        // Create user
        const [newUser] = await db
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
            userId: newUser.id,
        });

        // Create global streak
        await db.insert(streaks).values({
            userId: newUser.id,
            trackId: null,
        });

        return NextResponse.json({
            message: "User created successfully",
            user: newUser
        });
    } catch (error) {
        console.error("Error creating user:", error);
        return NextResponse.json(
            { error: "Failed to create user", details: error },
            { status: 500 }
        );
    }
}
