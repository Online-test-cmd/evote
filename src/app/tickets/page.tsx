"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import QRCode from "react-qr-code";
import { Loader2, Calendar, MapPin, Ticket as TicketIcon } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function MyTicketsPage() {
    const router = useRouter();
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTickets() {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push("/login?next=/tickets");
                return;
            }

            // Fetch tickets with event details and ticket type info
            const { data, error } = await supabase
                .from("tickets")
                .select(`
                    *,
                    ticket_types (
                        name,
                        price,
                        description
                    ),
                    orders (
                        event_id
                    )
                `)
                .eq("holder_name", user.email) // OR using RLS and order_id linkage if strictly enforced
            // Note: In our purchase flow we saved holder_name as email. 
            // A better joins approach: Join orders -> Join events.

            // Let's try a more robust query leveraging the relations
            const { data: robustData, error: robustError } = await supabase
                .from("tickets")
                .select(`
                    *,
                    ticket_types (
                        name,
                        price
                    ),
                    orders!inner (
                        events (
                            title,
                            start_date,
                            location,
                            banner_url
                        )
                    )
                `)
            //.eq("orders.voter_id", user.id); // This relies on orders having voter_id set

            // Fallback if RLS handles filter (which it does in our schema: "Users can view their own tickets")
            // So we just select *

            if (robustError) {
                console.error("Error fetching tickets:", robustError);
            } else {
                setTickets(robustData || []);
            }
            setLoading(false);
        }

        fetchTickets();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="container max-w-4xl py-12 px-4 space-y-8 min-h-screen">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Tickets</h1>
                <p className="text-muted-foreground">Present these QR codes at the event entrance.</p>
            </div>

            {tickets.length === 0 ? (
                <div className="bg-muted/50 border-2 border-dashed rounded-lg p-12 text-center">
                    <TicketIcon className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                    <h3 className="text-lg font-medium">No tickets found</h3>
                    <p className="text-muted-foreground mb-4">You haven't purchased any tickets yet.</p>
                    <Button onClick={() => router.push("/events")}>Browse Events</Button>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                    {tickets.map((ticket) => {
                        const event = ticket.orders?.events;
                        const type = ticket.ticket_types;

                        return (
                            <Card key={ticket.id} className="overflow-hidden flex flex-col md:flex-row shadow-lg border-l-4 border-l-primary">
                                <div className="bg-white p-6 flex items-center justify-center md:border-r border-b md:border-b-0 min-w-[200px]">
                                    <div style={{ height: "auto", margin: "0 auto", maxWidth: 128, width: "100%" }}>
                                        <QRCode
                                            size={256}
                                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                            value={ticket.unique_code}
                                            viewBox={`0 0 256 256`}
                                        />
                                    </div>
                                    <p className="sr-only">Code: {ticket.unique_code}</p>
                                </div>
                                <div className="flex-1 p-6 flex flex-col justify-between space-y-4">
                                    <div>
                                        <h3 className="font-bold text-xl mb-1">{event?.title || "Unknown Event"}</h3>
                                        <p className="text-primary font-medium flex items-center mb-2">
                                            {type?.name || "General Admission"}
                                        </p>
                                        <div className="text-sm text-muted-foreground space-y-1">
                                            <div className="flex items-center">
                                                <Calendar className="mr-2 h-4 w-4" />
                                                {event?.start_date ? new Date(event.start_date).toLocaleDateString() : "Date TBD"}
                                            </div>
                                            <div className="flex items-center">
                                                <MapPin className="mr-2 h-4 w-4" />
                                                {event?.location || "Location TBD"}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t flex justify-between items-center text-xs text-muted-foreground">
                                        <span>Ticket ID: {ticket.unique_code?.substring(0, 8).toUpperCase()}</span>
                                        {ticket.status === 'valid' ? (
                                            <span className="text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">
                                                Valid
                                            </span>
                                        ) : (
                                            <span className="text-red-500 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-full">
                                                {ticket.status}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
