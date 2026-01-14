"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function NewTrackPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        category: "DSA",
        difficultyLevel: "INTERMEDIATE",
        rotationPriority: 5,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch("/api/tracks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error("Failed to create track");

            const { track } = await response.json();
            router.push(`/dashboard/tracks/${track.id}`);
        } catch (error) {
            console.error("Error creating track:", error);
            alert("Failed to create track. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/dashboard/tracks">
                        <Button variant="ghost" className="mb-4">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Tracks
                        </Button>
                    </Link>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        Create New Track
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        Set up a new learning path to organize your study materials
                    </p>
                </div>

                {/* Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Track Details</CardTitle>
                        <CardDescription>
                            Provide information about your learning track
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Track Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name">Track Name *</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g., NeetCode 150, System Design Primer"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            {/* Category */}
                            <div className="space-y-2">
                                <Label htmlFor="category">Category *</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="DSA">Data Structures & Algorithms</SelectItem>
                                        <SelectItem value="SYSTEM_DESIGN">System Design</SelectItem>
                                        <SelectItem value="AI_ML">AI/ML</SelectItem>
                                        <SelectItem value="WEB_DEV">Web Development</SelectItem>
                                        <SelectItem value="MOBILE_DEV">Mobile Development</SelectItem>
                                        <SelectItem value="DEVOPS">DevOps</SelectItem>
                                        <SelectItem value="OTHER">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Difficulty Level */}
                            <div className="space-y-2">
                                <Label htmlFor="difficulty">Difficulty Level *</Label>
                                <Select
                                    value={formData.difficultyLevel}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, difficultyLevel: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="BEGINNER">Beginner</SelectItem>
                                        <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                                        <SelectItem value="ADVANCED">Advanced</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Rotation Priority */}
                            <div className="space-y-2">
                                <Label htmlFor="priority">Rotation Priority (1-10)</Label>
                                <Input
                                    id="priority"
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={formData.rotationPriority}
                                    onChange={(e) =>
                                        setFormData({ ...formData, rotationPriority: parseInt(e.target.value) })
                                    }
                                />
                                <p className="text-sm text-muted-foreground">
                                    Higher priority tracks appear more frequently in daily missions
                                </p>
                            </div>

                            {/* Submit */}
                            <div className="flex gap-4">
                                <Button type="submit" disabled={loading} className="flex-1">
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        "Create Track"
                                    )}
                                </Button>
                                <Link href="/dashboard/tracks" className="flex-1">
                                    <Button type="button" variant="outline" className="w-full">
                                        Cancel
                                    </Button>
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
