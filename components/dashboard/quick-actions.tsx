"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ListTodo, Brain, Settings } from "lucide-react";
import Link from "next/link";

export default function QuickActions() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
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
