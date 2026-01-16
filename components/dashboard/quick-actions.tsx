"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ListTodo, Brain, Settings, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function QuickActions() {
    const router = useRouter();
    const [generating, setGenerating] = useState(false);

    const handleGenerateMission = async () => {
        setGenerating(true);
        try {
            const response = await fetch("/api/missions/generate", {
                method: "POST",
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to generate mission");
            }

            // Refresh the page to show new mission
            router.refresh();
        } catch (error: any) {
            console.error("Error generating mission:", error);
            alert(error.message || "Failed to generate mission. Please try again.");
        } finally {
            setGenerating(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <Button
                    variant="default"
                    className="w-full justify-start"
                    size="sm"
                    onClick={handleGenerateMission}
                    disabled={generating}
                >
                    {generating ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Generate Mission
                        </>
                    )}
                </Button>

                <Link href="/dashboard/tracks/new">
                    <Button variant="outline" className="w-full justify-start" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Track
                    </Button>
                </Link>

                <Link href="/dashboard/tracks">
                    <Button variant="outline" className="w-full justify-start" size="sm">
                        <ListTodo className="h-4 w-4 mr-2" />
                        View All Tracks
                    </Button>
                </Link>

                <Link href="/dashboard/brain-teaser">
                    <Button variant="outline" className="w-full justify-start" size="sm">
                        <Brain className="h-4 w-4 mr-2" />
                        Brain Teaser
                    </Button>
                </Link>

                <Link href="/dashboard/settings">
                    <Button variant="outline" className="w-full justify-start" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}
