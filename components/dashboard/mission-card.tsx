"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, Flame, Target, Play, CheckCircle2 } from "lucide-react";
import { useState } from "react";

interface MissionCardProps {
    mission: any;
}

export default function MissionCard({ mission }: MissionCardProps) {
    const [selectedTask, setSelectedTask] = useState<string | null>(null);

    if (!mission) {
        return (
            <Card className="border-2 border-dashed">
                <CardHeader>
                    <CardTitle>No Mission Today</CardTitle>
                    <CardDescription>
                        Create your first track to get started with daily missions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button className="w-full">Create Track</Button>
                </CardContent>
            </Card>
        );
    }

    const completedTasks = mission.tasks.filter((t: any) => t.status === "COMPLETED").length;
    const totalTasks = mission.tasks.length;
    const progress = (completedTasks / totalTasks) * 100;

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case "EASY":
                return "bg-green-500";
            case "MEDIUM":
                return "bg-yellow-500";
            case "HARD":
                return "bg-red-500";
            default:
                return "bg-gray-500";
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "COMPLETED":
                return "text-green-600";
            case "IN_PROGRESS":
                return "text-blue-600";
            default:
                return "text-gray-600";
        }
    };

    return (
        <Card className="border-2 border-purple-200 dark:border-purple-800">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl">Today's Mission</CardTitle>
                        <CardDescription>
                            {completedTasks} of {totalTasks} tasks completed
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Target className="h-8 w-8 text-purple-600" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Progress Bar */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-3" />
                </div>

                {/* Mission Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                            {mission.totalEstimatedMinutes} min total
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Flame className="h-4 w-4 text-orange-500" />
                        <span className="text-muted-foreground">
                            {mission.status === "COMPLETED" ? "Complete!" : "In Progress"}
                        </span>
                    </div>
                </div>

                {/* Task List */}
                <div className="space-y-3">
                    <h3 className="font-semibold text-sm text-muted-foreground">Tasks</h3>
                    {mission.tasks.map((task: any) => (
                        <div
                            key={task.id}
                            className={`p-4 rounded-lg border-2 transition-all ${task.status === "COMPLETED"
                                    ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
                                    : "bg-card border-border hover:border-purple-300"
                                }`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                        {task.status === "COMPLETED" ? (
                                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                                        ) : (
                                            <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                                        )}
                                        <h4 className="font-medium">{task.trackItem?.title || "Task"}</h4>
                                    </div>

                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Badge variant="outline" className="text-xs">
                                            {task.track?.name}
                                        </Badge>
                                        <div className={`h-2 w-2 rounded-full ${getDifficultyColor(task.trackItem?.difficulty)}`} />
                                        <span className="text-xs text-muted-foreground">
                                            {task.trackItem?.difficulty}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            • {task.estimatedMinutes} min
                                        </span>
                                    </div>

                                    {task.trackItem?.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {task.trackItem.description}
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2">
                                    {task.status === "COMPLETED" ? (
                                        <Badge className="bg-green-600">Completed</Badge>
                                    ) : task.status === "IN_PROGRESS" ? (
                                        <Button size="sm" variant="outline">
                                            Complete
                                        </Button>
                                    ) : (
                                        <Button size="sm">
                                            <Play className="h-4 w-4 mr-1" />
                                            Start
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Action Button */}
                {mission.status !== "COMPLETED" && (
                    <Button className="w-full" size="lg">
                        Continue Mission
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
