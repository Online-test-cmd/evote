"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, ImageIcon, Loader2 } from "lucide-react";

export default function CreateEventPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                alert("You must be logged in to create an event.");
                router.push("/login");
                return;
            }

            const formData = new FormData(event.currentTarget);
            let bannerUrl: string | null = null;

            // Upload image if selected
            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `${user.id}-${Date.now()}.${fileExt}`;
                const filePath = `banners/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('event-images')
                    .upload(filePath, imageFile);

                if (uploadError) {
                    console.error("Upload error:", uploadError);
                    // Continue without image if upload fails
                } else {
                    const { data: urlData } = supabase.storage
                        .from('event-images')
                        .getPublicUrl(filePath);
                    bannerUrl = urlData.publicUrl;
                }
            }

            const { error } = await supabase.from("events").insert({
                organizer_id: user.id,
                title: formData.get("title") as string,
                description: formData.get("description") as string,
                start_date: formData.get("date") as string,
                location: formData.get("location") as string,
                banner_url: bannerUrl,
                is_active: true
            });

            if (error) throw error;

            alert("Event created successfully!");
            router.push("/dashboard/events");
        } catch (err: any) {
            console.error("Error creating event:", err);
            alert("Failed to create event: " + err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Create Event</h2>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Event Details</CardTitle>
                    <CardDescription>
                        Basic information about your event. You can configure voting and tickets later.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={onSubmit}>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Event Title</Label>
                            <Input id="title" name="title" placeholder="e.g. Annual Music Awards 2024" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Describe your event..."
                                className="min-h-[100px]"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="date">Date & Time</Label>
                                <Input id="date" name="date" type="datetime-local" required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="location">Location</Label>
                                <Input id="location" name="location" placeholder="e.g. Grand Hall or Online" required />
                            </div>
                        </div>

                        {/* Image Upload Section */}
                        <div className="grid gap-2">
                            <Label>Banner Image</Label>
                            <div
                                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {imagePreview ? (
                                    <div className="relative">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="max-h-48 mx-auto rounded-md object-cover"
                                        />
                                        <p className="text-sm text-muted-foreground mt-2">Click to change</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center space-y-2">
                                        <div className="p-3 bg-muted rounded-full">
                                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="font-medium">Click to upload banner</p>
                                            <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end space-x-2">
                        <Button variant="outline" type="button" onClick={() => router.back()}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                "Create Event"
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
