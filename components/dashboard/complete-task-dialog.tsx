"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Trophy, Star } from "lucide-react";

interface CompleteTaskDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    task: any;
    missionId: string;
}

export default function CompleteTaskDialog({
    open,
    onOpenChange,
    task,
    missionId,
}: CompleteTaskDialogProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [xpEarned, setXpEarned] = useState(0);
    const [formData, setFormData] = useState({
        actualMinutes: task?.estimatedMinutes || 30,
        difficultyRating: 3,
        effortRating: 3,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(
                `/api/missions/${missionId}/tasks/${task.id}/complete`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                }
            );

            if (!response.ok) throw new Error("Failed to complete task");

            const { xpAwarded } = await response.json();
            setXpEarned(xpAwarded);
            setShowSuccess(true);

            // Close dialog and refresh after showing success
            setTimeout(() => {
                setShowSuccess(false);
                onOpenChange(false);
                router.refresh();
            }, 2000);
        } catch (error) {
            console.error("Error completing task:", error);
            alert("Failed to complete task. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (showSuccess) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-md">
                    <div className="flex flex-col items-center justify-center py-8 space-y-4">
                        <div className="relative">
                            <Trophy className="h-20 w-20 text-yellow-500 animate-bounce" />
                            <Star className="h-8 w-8 text-yellow-400 absolute -top-2 -right-2 animate-spin" />
                        </div>
                        <h2 className="text-2xl font-bold text-center">Task Completed!</h2>
                        <p className="text-4xl font-bold text-purple-600">+{xpEarned} XP</p>
                        <p className="text-muted-foreground text-center">
                            Great work! Keep up the momentum 🔥
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Complete Task</DialogTitle>
                    <DialogDescription>
                        How did it go? Share your experience to help us improve your learning journey.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Task Info */}
                    <div className="p-3 bg-muted rounded-lg">
                        <p className="font-medium">{task?.trackItem?.title}</p>
                        <p className="text-sm text-muted-foreground">
                            Estimated: {task?.estimatedMinutes} minutes
                        </p>
                    </div>

                    {/* Actual Time */}
                    <div className="space-y-2">
                        <Label htmlFor="actualMinutes">Actual Time Spent (minutes)</Label>
                        <Input
                            id="actualMinutes"
                            type="number"
                            min="1"
                            value={formData.actualMinutes}
                            onChange={(e) =>
                                setFormData({ ...formData, actualMinutes: parseInt(e.target.value) })
                            }
                            required
                        />
                    </div>

                    {/* Difficulty Rating */}
                    <div className="space-y-2">
                        <Label htmlFor="difficultyRating">
                            How difficult was it? (1 = Easy, 5 = Very Hard)
                        </Label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((rating) => (
                                <button
                                    key={rating}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, difficultyRating: rating })}
                                    className={`flex-1 py-2 rounded-lg border-2 transition-all ${formData.difficultyRating === rating
                                        ? "border-purple-600 bg-purple-50 dark:bg-purple-950"
                                        : "border-border hover:border-purple-300"
                                        }`}
                                >
                                    {rating}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Effort Rating */}
                    <div className="space-y-2">
                        <Label htmlFor="effortRating">
                            How much effort did you put in? (1 = Minimal, 5 = Maximum)
                        </Label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((rating) => (
                                <button
                                    key={rating}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, effortRating: rating })}
                                    className={`flex-1 py-2 rounded-lg border-2 transition-all ${formData.effortRating === rating
                                        ? "border-purple-600 bg-purple-50 dark:bg-purple-950"
                                        : "border-border hover:border-purple-300"
                                        }`}
                                >
                                    {rating}
                                </button>
                            ))}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Completing...
                                </>
                            ) : (
                                "Complete Task"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
