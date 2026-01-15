"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Plus, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

interface Nominee {
    id: string;
    name: string;
    photoUrl: string;
}

interface Category {
    id: string;
    name: string;
    nominees: Nominee[];
}

export default function ManageEventPage() {
    const params = useParams();
    const eventId = params.id; // Will use this to fetch event data from Supabase

    // Temporary state for demo
    const [categories, setCategories] = useState<Category[]>([
        {
            id: "1",
            name: "Best New Artist",
            nominees: [
                { id: "101", name: "Artist A", photoUrl: "" },
                { id: "102", name: "Artist B", photoUrl: "" },
            ],
        },
    ]);

    const [newCategoryName, setNewCategoryName] = useState("");

    const addCategory = () => {
        if (!newCategoryName.trim()) return;
        setCategories([
            ...categories,
            {
                id: Math.random().toString(),
                name: newCategoryName,
                nominees: [],
            },
        ]);
        setNewCategoryName("");
    };

    const addNominee = (categoryId: string) => {
        setCategories(
            categories.map((cat) => {
                if (cat.id === categoryId) {
                    return {
                        ...cat,
                        nominees: [
                            ...cat.nominees,
                            {
                                id: Math.random().toString(),
                                name: "New Nominee",
                                photoUrl: "",
                            },
                        ],
                    };
                }
                return cat;
            })
        );
    };

    const updateNominee = (
        categoryId: string,
        nomineeId: string,
        field: keyof Nominee,
        value: string
    ) => {
        setCategories(
            categories.map((cat) => {
                if (cat.id === categoryId) {
                    return {
                        ...cat,
                        nominees: cat.nominees.map((nom) =>
                            nom.id === nomineeId ? { ...nom, [field]: value } : nom
                        ),
                    };
                }
                return cat;
            })
        );
    };

    const removeNominee = (categoryId: string, nomineeId: string) => {
        setCategories(
            categories.map((cat) => {
                if (cat.id === categoryId) {
                    return {
                        ...cat,
                        nominees: cat.nominees.filter((nom) => nom.id !== nomineeId),
                    };
                }
                return cat;
            })
        );
    };

    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Manage Voting</h2>
                <Button onClick={() => alert("Save functionality would trigger here")}>
                    Save Changes
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr_300px]">
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Categories</CardTitle>
                            <CardDescription>
                                Manage the voting categories and nominees for this event.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex space-x-2 mb-4">
                                <Input
                                    placeholder="New Category Name (e.g. Song of the Year)"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && addCategory()}
                                />
                                <Button onClick={addCategory} variant="secondary">
                                    <Plus className="h-4 w-4 mr-2" /> Add
                                </Button>
                            </div>

                            <Accordion type="single" collapsible className="w-full">
                                {categories.map((category) => (
                                    <AccordionItem key={category.id} value={category.id}>
                                        <AccordionTrigger className="text-lg">
                                            {category.name} ({category.nominees.length} nominees)
                                        </AccordionTrigger>
                                        <AccordionContent className="space-y-4 pt-4">
                                            {category.nominees.map((nominee, index) => (
                                                <div
                                                    key={nominee.id}
                                                    className="flex items-center space-x-4 p-3 border rounded-md bg-secondary/10"
                                                >
                                                    <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center shrink-0 overflow-hidden">
                                                        {/* Placeholder for Image */}
                                                        <Upload className="h-4 w-4 text-muted-foreground" />
                                                    </div>
                                                    <div className="flex-1 space-y-1">
                                                        <Label className="text-xs text-muted-foreground">Name</Label>
                                                        <Input
                                                            value={nominee.name}
                                                            onChange={(e) => updateNominee(category.id, nominee.id, 'name', e.target.value)}
                                                            className="h-8"
                                                        />
                                                    </div>
                                                    <div className="flex-1 space-y-1">
                                                        <Label className="text-xs text-muted-foreground">Photo URL</Label>
                                                        <Input
                                                            value={nominee.photoUrl}
                                                            placeholder="https://..."
                                                            onChange={(e) => updateNominee(category.id, nominee.id, 'photoUrl', e.target.value)}
                                                            className="h-8"
                                                        />
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive hover:bg-destructive/10"
                                                        onClick={() => removeNominee(category.id, nominee.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                            <Button
                                                variant="outline"
                                                className="w-full border-dashed"
                                                onClick={() => addNominee(category.id)}
                                            >
                                                <Plus className="mr-2 h-4 w-4" /> Add Nominee
                                            </Button>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Event Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Label>Voting Status</Label>
                            <div className="flex items-center space-x-2">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                </span>
                                <span className="text-sm font-medium">Active</span>
                            </div>
                            <div className="pt-4">
                                <Label>Public Link</Label>
                                <Input readOnly value={`https://evotes.com/events/${eventId}/vote`} className="bg-muted text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
