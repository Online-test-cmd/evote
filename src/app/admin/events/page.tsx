"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Calendar, MapPin, Eye, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import Link from "next/link";

export default function AdminEventsPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchEvents();
    }, []);

    async function fetchEvents() {
        setLoading(true);
        const { data, error } = await supabase
            .from("events")
            .select("*, profiles(email, full_name)")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching events:", error);
        } else {
            setEvents(data || []);
        }
        setLoading(false);
    }

    async function toggleEventStatus(eventId: string, currentStatus: boolean) {
        const { error } = await supabase
            .from("events")
            .update({ is_active: !currentStatus })
            .eq("id", eventId);

        if (error) {
            alert("Failed to update: " + error.message);
        } else {
            setEvents(events.map(e => e.id === eventId ? { ...e, is_active: !currentStatus } : e));
        }
    }

    async function deleteEvent(eventId: string) {
        if (!confirm("Are you sure you want to delete this event? This cannot be undone.")) return;

        const { error } = await supabase
            .from("events")
            .delete()
            .eq("id", eventId);

        if (error) {
            alert("Failed to delete: " + error.message);
        } else {
            setEvents(events.filter(e => e.id !== eventId));
        }
    }

    const filteredEvents = events.filter(event =>
        event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Event Management</h1>
                    <p className="text-muted-foreground">View and manage all platform events</p>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">{events.length} events</span>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Events Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredEvents.map((event) => (
                    <Card key={event.id} className="overflow-hidden">
                        {event.banner_url && (
                            <div className="aspect-video overflow-hidden">
                                <img src={event.banner_url} alt={event.title} className="w-full h-full object-cover" />
                            </div>
                        )}
                        <CardHeader className="pb-2">
                            <div className="flex items-start justify-between">
                                <CardTitle className="text-lg line-clamp-1">{event.title}</CardTitle>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${event.is_active
                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                                    }`}>
                                    {event.is_active ? "Active" : "Inactive"}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="text-sm text-muted-foreground space-y-1">
                                {event.start_date && (
                                    <div className="flex items-center">
                                        <Calendar className="h-3 w-3 mr-2" />
                                        {new Date(event.start_date).toLocaleDateString()}
                                    </div>
                                )}
                                {event.location && (
                                    <div className="flex items-center">
                                        <MapPin className="h-3 w-3 mr-2" />
                                        {event.location}
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Organizer: {event.profiles?.email || "Unknown"}
                            </p>
                            <div className="flex items-center space-x-2 pt-2">
                                <Link href={`/events/${event.id}/vote`} className="flex-1">
                                    <Button variant="outline" size="sm" className="w-full">
                                        <Eye className="h-3 w-3 mr-1" /> View
                                    </Button>
                                </Link>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => toggleEventStatus(event.id, event.is_active)}
                                >
                                    {event.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:bg-destructive/10"
                                    onClick={() => deleteEvent(event.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredEvents.length === 0 && (
                <Card className="p-12 text-center">
                    <p className="text-muted-foreground">No events found</p>
                </Card>
            )}
        </div>
    );
}
