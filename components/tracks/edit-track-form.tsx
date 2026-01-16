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
import { Loader2 } from "lucide-react";
import Link from "next/link";

interface EditTrackFormProps {
    track: any;
}

export default function EditTrackForm({ track }: EditTrackFormProps) {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: track.name,
        category: track.category,
        difficultyLevel: track.difficultyLevel,
        rotationPriority: track.rotationPriority,
        isActive: track.isActive,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const response = await fetch(`/api/tracks/${track.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error("Failed to update track");

            router.push(`/dashboard/tracks/${track.id}`);
            router.refresh();
        } catch (error) {
            console.error("Error updating track:", error);
            alert("Failed to update track. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Track Details</CardTitle>
                <CardDescription>
                    Modify the information about your learning track
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
                                <SelectItem value="CS_FUNDAMENTALS">CS Fundamentals</SelectItem>
                                <SelectItem value="OPEN_SOURCE">Open Source</SelectItem>
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

                    {/* Active Status */}
                    <div className="space-y-2">
                        <Label htmlFor="isActive">Status</Label>
                        <Select
                            value={formData.isActive ? "active" : "paused"}
                            onValueChange={(value) =>
                                setFormData({ ...formData, isActive: value === "active" })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="paused">Paused</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-sm text-muted-foreground">
                            Paused tracks won't appear in daily missions
                        </p>
                    </div>

                    {/* Submit */}
                    <div className="flex gap-4">
                        <Button type="submit" disabled={saving} className="flex-1">
                            {saving ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                        <Link href={`/dashboard/tracks/${track.id}`} className="flex-1">
                            <Button type="button" variant="outline" className="w-full">
                                Cancel
                            </Button>
                        </Link>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
