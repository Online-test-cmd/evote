"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, Ticket, Vote, DollarSign, TrendingUp, Loader2 } from "lucide-react";

interface Stats {
    totalUsers: number;
    totalEvents: number;
    totalVotes: number;
    totalTicketsSold: number;
    totalRevenue: number;
    activeEvents: number;
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [recentEvents, setRecentEvents] = useState<any[]>([]);

    useEffect(() => {
        async function fetchStats() {
            try {
                // Fetch counts from various tables
                const [
                    { count: userCount },
                    { count: eventCount },
                    { count: voteCount },
                    { count: ticketCount },
                    { data: events },
                    { data: orders }
                ] = await Promise.all([
                    supabase.from("profiles").select("*", { count: "exact", head: true }),
                    supabase.from("events").select("*", { count: "exact", head: true }),
                    supabase.from("votes").select("*", { count: "exact", head: true }),
                    supabase.from("tickets").select("*", { count: "exact", head: true }),
                    supabase.from("events").select("*").order("created_at", { ascending: false }).limit(5),
                    supabase.from("orders").select("total_amount").eq("status", "paid")
                ]);

                const totalRevenue = orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;
                const activeEvents = events?.filter(e => e.is_active).length || 0;

                setStats({
                    totalUsers: userCount || 0,
                    totalEvents: eventCount || 0,
                    totalVotes: voteCount || 0,
                    totalTicketsSold: ticketCount || 0,
                    totalRevenue,
                    activeEvents
                });

                setRecentEvents(events || []);
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const statCards = [
        { title: "Total Users", value: stats?.totalUsers || 0, icon: Users, color: "text-blue-500" },
        { title: "Total Events", value: stats?.totalEvents || 0, icon: Calendar, color: "text-purple-500" },
        { title: "Active Events", value: stats?.activeEvents || 0, icon: TrendingUp, color: "text-green-500" },
        { title: "Total Votes", value: stats?.totalVotes || 0, icon: Vote, color: "text-orange-500" },
        { title: "Tickets Sold", value: stats?.totalTicketsSold || 0, icon: Ticket, color: "text-pink-500" },
        { title: "Total Revenue", value: `$${stats?.totalRevenue?.toFixed(2) || "0.00"}`, icon: DollarSign, color: "text-emerald-500" },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                <p className="text-muted-foreground">Platform overview and statistics</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {statCards.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className={`h-5 w-5 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Recent Events */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Events</CardTitle>
                    <CardDescription>Latest events created on the platform</CardDescription>
                </CardHeader>
                <CardContent>
                    {recentEvents.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">No events yet</p>
                    ) : (
                        <div className="space-y-4">
                            {recentEvents.map((event) => (
                                <div key={event.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                                    <div>
                                        <h3 className="font-medium">{event.title}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {event.location} • {new Date(event.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${event.is_active
                                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                                        }`}>
                                        {event.is_active ? "Active" : "Inactive"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
