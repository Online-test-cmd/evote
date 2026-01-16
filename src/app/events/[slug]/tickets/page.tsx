"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
import { Check, Ticket, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TicketsPage() {
    const params = useParams();
    const eventId = params.slug as string; // Assuming route is /events/[slug]/tickets

    const [ticketTypes, setTicketTypes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        async function fetchTickets() {
            setLoading(true);
            const { data, error } = await supabase
                .from("ticket_types")
                .select("*")
                .eq("event_id", eventId)
                .gt("remaining_quantity", 0) // Only show available tickets
                .order("price", { ascending: true });

            if (error) {
                console.error("Error fetching tickets:", error);
            } else {
                setTicketTypes(data || []);
            }
            setLoading(false);
        }
        if (eventId) fetchTickets();
    }, [eventId]);

    const handlePurchase = async (ticketType: any) => {
        setProcessingId(ticketType.id);

        try {
            // 1. Simulate Payment (Mock success)
            await new Promise(resolve => setTimeout(resolve, 1500));

            // 2. Create Order in DB
            // First, get user if logged in, otherwise guest (for now assume guest or auth)
            const { data: { user } } = await supabase.auth.getUser();

            const { data: orderData, error: orderError } = await supabase
                .from("orders")
                .insert({
                    event_id: eventId,
                    voter_id: user?.id || null, // Nullable for guest
                    total_amount: ticketType.price,
                    status: 'paid', // Immediately paid for this demo
                    transaction_id: `txn_${Math.random().toString(36).substr(2, 9)}`
                })
                .select()
                .single();

            if (orderError || !orderData) throw orderError || new Error("Order creation failed");

            // 3. Create Ticket Asset
            const { error: ticketError } = await supabase
                .from("tickets")
                .insert({
                    order_id: orderData.id,
                    ticket_type_id: ticketType.id,
                    holder_name: user?.email || "Guest User",
                    status: 'valid'
                });

            if (ticketError) throw ticketError;

            // 4. Decrement Quantity (Using our secure RPC function)
            const { error: rpcError } = await supabase
                .rpc("data_decrement_ticket_qty", {
                    row_id: ticketType.id,
                    amount: 1
                });

            if (rpcError) console.error("Warning: Qty decrement failed", rpcError);

            alert(`Success! You purchased a ${ticketType.name} ticket.`);

            // Refresh list to update quantity UI
            // In a real app we'd use realtime subscription for quantity
            window.location.reload();

        } catch (err: any) {
            console.error("Purchase failed:", err);
            alert("Purchase failed: " + err.message);
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex justify-center items-center"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="container py-12 px-4 max-w-5xl mx-auto min-h-screen">
            <div className="text-center mb-12 space-y-4">
                <h1 className="text-4xl font-bold tracking-tight">Get Your Tickets</h1>
                <p className="text-lg text-muted-foreground">
                    Secure your spot today.
                </p>
            </div>

            {ticketTypes.length === 0 ? (
                <div className="text-center text-muted-foreground border-2 border-dashed p-12 rounded-lg">
                    <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold">No tickets available</h3>
                    <p>Tickets for this event are not yet on sale or sold out.</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 gap-8">
                    {ticketTypes.map((ticket) => {
                        const isBestValue = ticket.name.toLowerCase().includes("vip"); // Simple logic for demo
                        return (
                            <Card key={ticket.id} className={cn("relative flex flex-col transition-all hover:shadow-xl",
                                isBestValue ? "border-primary/50 shadow-lg scale-[1.02]" : ""
                            )}>
                                {isBestValue && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-bold shadow-md">
                                        Premium Access
                                    </div>
                                )}
                                <CardHeader>
                                    <CardTitle className="text-2xl flex justify-between items-center">
                                        {ticket.name}
                                        <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-1 rounded">
                                            {ticket.remaining_quantity} left
                                        </span>
                                    </CardTitle>
                                    <CardDescription>{ticket.description || "General Admission"}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <div className="text-4xl font-bold mb-6">
                                        ${ticket.price}
                                    </div>
                                    <ul className="space-y-3">
                                        <li className="flex items-center space-x-2">
                                            <Check className="h-4 w-4 text-green-500" />
                                            <span className="text-sm">Instant Delivery</span>
                                        </li>
                                        <li className="flex items-center space-x-2">
                                            <Check className="h-4 w-4 text-green-500" />
                                            <span className="text-sm">Secure Payment</span>
                                        </li>
                                    </ul>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        className="w-full"
                                        size="lg"
                                        variant={isBestValue ? "default" : "outline"}
                                        onClick={() => handlePurchase(ticket)}
                                        disabled={processingId !== null || ticket.remaining_quantity < 1}
                                    >
                                        {processingId === ticket.id ? (
                                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                                        ) : (
                                            <><Ticket className="mr-2 h-4 w-4" /> Purchase</>
                                        )}
                                    </Button>
                                </CardFooter>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    );
}
