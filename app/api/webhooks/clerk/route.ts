import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users, userSettings, streaks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
        throw new Error("Please add CLERK_WEBHOOK_SECRET to .env");
    }

    // Get headers
    const headerPayload = await headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response("Error: Missing svix headers", {
            status: 400,
        });
    }

    // Get body
    const payload = await req.json();
    const body = JSON.stringify(payload);

    // Create new Svix instance
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: WebhookEvent;

    // Verify webhook
    try {
        evt = wh.verify(body, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature,
        }) as WebhookEvent;
    } catch (err) {
        console.error("Error: Could not verify webhook:", err);
        return new Response("Error: Verification error", {
            status: 400,
        });
    }

    // Handle the webhook
    const eventType = evt.type;

    if (eventType === "user.created") {
        const { id, email_addresses, username } = evt.data;

        try {
            // Create user in database
            const [newUser] = await db
                .insert(users)
                .values({
                    clerkId: id,
                    email: email_addresses[0].email_address,
                    username: username || null,
                    timezone: "UTC",
                })
                .returning();

            // Create default user settings
            await db.insert(userSettings).values({
                userId: newUser.id,
            });

            // Create global streak
            await db.insert(streaks).values({
                userId: newUser.id,
                trackId: null, // Global streak
            });

            console.log("User created:", newUser.id);
        } catch (error) {
            console.error("Error creating user:", error);
            return new Response("Error: Could not create user", {
                status: 500,
            });
        }
    }

    if (eventType === "user.updated") {
        const { id, email_addresses, username } = evt.data;

        try {
            await db
                .update(users)
                .set({
                    email: email_addresses[0].email_address,
                    username: username || null,
                    updatedAt: new Date(),
                })
                .where(eq(users.clerkId, id));

            console.log("User updated:", id);
        } catch (error) {
            console.error("Error updating user:", error);
            return new Response("Error: Could not update user", {
                status: 500,
            });
        }
    }

    if (eventType === "user.deleted") {
        const { id } = evt.data;

        try {
            await db.delete(users).where(eq(users.clerkId, id!));
            console.log("User deleted:", id);
        } catch (error) {
            console.error("Error deleting user:", error);
            return new Response("Error: Could not delete user", {
                status: 500,
            });
        }
    }

    return new Response("Webhook processed successfully", { status: 200 });
}
