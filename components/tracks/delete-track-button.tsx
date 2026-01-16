"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";

interface DeleteTrackButtonProps {
    trackId: string;
    trackName: string;
}

export default function DeleteTrackButton({ trackId, trackName }: DeleteTrackButtonProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        setDeleting(true);

        try {
            const response = await fetch(`/api/tracks/${trackId}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to delete track");

            // Redirect to tracks list
            router.push("/dashboard/tracks");
            router.refresh();
        } catch (error) {
            console.error("Error deleting track:", error);
            alert("Failed to delete track. Please try again.");
            setDeleting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="destructive" size="icon">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        Delete Track
                    </DialogTitle>
                    <DialogDescription className="space-y-2">
                        <span className="block">
                            Are you sure you want to delete <strong>{trackName}</strong>?
                        </span>
                        <span className="block text-red-600 font-medium">
                            This action cannot be undone. All track items and progress will be permanently deleted.
                        </span>
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={deleting}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={deleting}
                    >
                        {deleting ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Track
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
