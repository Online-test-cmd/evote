"use client";

import { useState } from "react";
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

export default function CreateEventPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

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

            const { error } = await supabase.from("events").insert({
                organizer_id: user.id,
                title: formData.get("title") as string,
                description: formData.get("description") as string,
                start_date: formData.get("date") as string,
                location: formData.get("location") as string,
                banner_url: formData.get("branding") as string || null,
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
                        <div className="grid gap-2">
                            <Label htmlFor="branding">Banner Image URL</Label>
                            <Input id="branding" name="branding" placeholder="https://..." />
                            <p className="text-xs text-muted-foreground">
                                Enter a URL for your event banner. (File upload coming soon)
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end space-x-2">
                        <Button variant="outline" type="button" onClick={() => router.back()}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Creating..." : "Create Event"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
