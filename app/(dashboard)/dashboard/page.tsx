import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const user = await currentUser();

    if (!user) {
        redirect("/sign-in");
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
            <div className="container mx-auto px-4 py-8">
                <header className="mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        Welcome to MasteryFlow
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Hello, {user.firstName || user.emailAddresses[0].emailAddress}
                    </p>
                </header>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Mission Card */}
                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <h2 className="text-xl font-semibold mb-4">Today's Mission</h2>
                        <p className="text-muted-foreground">
                            Your daily missions will appear here once you set up your tracks.
                        </p>
                    </div>

                    {/* Streak Card */}
                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <h2 className="text-xl font-semibold mb-4">Current Streak</h2>
                        <div className="text-4xl font-bold text-purple-600">0</div>
                        <p className="text-sm text-muted-foreground mt-2">days</p>
                    </div>

                    {/* XP Card */}
                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <h2 className="text-xl font-semibold mb-4">Neurons (XP)</h2>
                        <div className="text-4xl font-bold text-blue-600">0</div>
                        <p className="text-sm text-muted-foreground mt-2">total XP earned</p>
                    </div>
                </div>

                <div className="mt-8 rounded-lg border bg-card p-6">
                    <h2 className="text-2xl font-semibold mb-4">Get Started</h2>
                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                        <li>Create your first learning track (DSA, System Design, AI/ML, etc.)</li>
                        <li>Add items to your track (problems, topics, resources)</li>
                        <li>Let MasteryFlow assign your daily missions automatically</li>
                        <li>Complete tasks, earn XP, and build unstoppable streaks</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}
