"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Loader2, X } from "lucide-react";

interface AddItemsFormProps {
    trackId: string;
}

interface ItemFormData {
    title: string;
    description: string;
    difficulty: string;
    estimatedMinutes: number;
}

export default function AddItemsForm({ trackId }: AddItemsFormProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState<ItemFormData[]>([
        { title: "", description: "", difficulty: "MEDIUM", estimatedMinutes: 30 },
    ]);

    const addItem = () => {
        setItems([
            ...items,
            { title: "", description: "", difficulty: "MEDIUM", estimatedMinutes: 30 },
        ]);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: keyof ItemFormData, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`/api/tracks/${trackId}/items`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items }),
            });

            if (!response.ok) throw new Error("Failed to add items");

            setOpen(false);
            setItems([
                { title: "", description: "", difficulty: "MEDIUM", estimatedMinutes: 30 },
            ]);
            router.refresh();
        } catch (error) {
            console.error("Error adding items:", error);
            alert("Failed to add items. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Items
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add Items to Track</DialogTitle>
                    <DialogDescription>
                        Add one or more items to your learning track
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {items.map((item, index) => (
                        <div key={index} className="p-4 border rounded-lg space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="font-medium">Item {index + 1}</h4>
                                {items.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeItem(index)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Title *</Label>
                                <Input
                                    placeholder="e.g., Two Sum, Binary Search"
                                    value={item.title}
                                    onChange={(e) => updateItem(index, "title", e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Input
                                    placeholder="Brief description (optional)"
                                    value={item.description}
                                    onChange={(e) => updateItem(index, "description", e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Difficulty</Label>
                                    <Select
                                        value={item.difficulty}
                                        onValueChange={(value) => updateItem(index, "difficulty", value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="EASY">Easy</SelectItem>
                                            <SelectItem value="MEDIUM">Medium</SelectItem>
                                            <SelectItem value="HARD">Hard</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Estimated Time (min)</Label>
                                    <Input
                                        type="number"
                                        min="5"
                                        value={item.estimatedMinutes}
                                        onChange={(e) =>
                                            updateItem(index, "estimatedMinutes", parseInt(e.target.value))
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    ))}

                    <Button type="button" variant="outline" onClick={addItem} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Another Item
                    </Button>

                    <div className="flex gap-4">
                        <Button type="submit" disabled={loading} className="flex-1">
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Adding...
                                </>
                            ) : (
                                `Add ${items.length} Item${items.length > 1 ? "s" : ""}`
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
