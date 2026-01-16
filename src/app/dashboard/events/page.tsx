"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Calendar, MapPin, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";

export default function EventsListPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchEvents() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data, error } = await supabase
                    .from("events")
                    .select("*")
                    .eq("organizer_id", user.id)
                    .order("created_at", { ascending: false });

                if (error) throw error;
                setEvents(data || []);
            } catch (error) {
                console.error("Error fetching events:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchEvents();
    }, []);

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Your Events</h2>
                <Link href="/dashboard/events/create">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Create Event
                    </Button>
                </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {events.length === 0 ? (
                    <Card className="col-span-full flex flex-col items-center justify-center p-8 text-center border-dashed">
                        <CardHeader>
                            <CardTitle>No events yet</CardTitle>
                            <CardDescription>
                                You havent created any events. Click the button above to get started.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                ) : (
                    events.map((event) => (
                        <Card key={event.id} className="overflow-hidden">
                            {event.banner_url && (
                                <div className="aspect-video relative overflow-hidden">
                                    <img src={event.banner_url} alt={event.title} className="object-cover w-full h-full" />
                                </div>
                            )}
                            <CardHeader>
                                <CardTitle className="line-clamp-1">{event.title}</CardTitle>
                                <CardDescription className="line-clamp-2">{event.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm text-muted-foreground">
                                {event.start_date && (
                                    <div className="flex items-center">
                                        <Calendar className="mr-2 h-4 w-4" />
                                        {new Date(event.start_date).toLocaleDateString()}
                                    </div>
                                )}
                                {event.location && (
                                    <div className="flex items-center">
                                        <MapPin className="mr-2 h-4 w-4" />
                                        {event.location}
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter>
                                <Link href={`/dashboard/events/${event.id}/manage`} className="w-full">
                                    <Button variant="secondary" className="w-full">Manage</Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
