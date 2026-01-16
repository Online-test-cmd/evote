"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RealTimeCounter } from "@/components/voting/RealTimeCounter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Loader2, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";

export default function VotingPage() {
    const params = useParams();
    // Treat slug as ID for simplicity in this iteration
    const eventId = params.slug as string;

    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedNominee, setSelectedNominee] = useState<string | null>(null);
    const [isPaying, setIsPaying] = useState(false);

    useEffect(() => {
        async function fetchEventData() {
            setLoading(true);
            const { data, error } = await supabase
                .from("events")
                .select(`
                    *,
                    categories (
                        *,
                        nominees (*)
                    )
                `)
                .eq("id", eventId)
                .single();

            if (error) {
                console.error("Error fetching event:", error);
                setError("Event not found or failed to load.");
            } else {
                // Sort categories and nominees if needed
                if (data.categories) {
                    data.categories.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
                }
                setEvent(data);
            }
            setLoading(false);
        }

        if (eventId) fetchEventData();
    }, [eventId]);

    const handleVote = async () => {
        if (!selectedNominee) return;
        setIsPaying(true);

        try {
            // 1. Simulate Payment (or integrate Paystack here later)
            // For now, we assume payment success and insert the vote.

            // 2. Insert Vote into DB
            const { error } = await supabase.from("votes").insert({
                event_id: eventId,
                nominee_id: selectedNominee,
                payment_status: "PAID",
                amount_paid: event.price_per_vote || 1.00
            });

            if (error) throw error;

            alert(`Vote cast successfully!`);
            setSelectedNominee(null);

        } catch (err: any) {
            console.error("Voting failed:", err);
            alert("Voting failed: " + err.message);
        } finally {
            setIsPaying(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
                <Loader2 className="animate-spin h-12 w-12 text-primary" />
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Oops!</h1>
                    <p className="text-muted-foreground">{error || "Event not found"}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Hero Section */}
            <div className="relative h-[300px] w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10" />
                {event.banner_url ? (
                    <img
                        src={event.banner_url}
                        alt="Event Banner"
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="h-full w-full bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground">No Banner</span>
                    </div>
                )}
                <div className="absolute bottom-0 left-0 z-20 p-8 w-full">
                    <div className="container max-w-4xl">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2 shadow-sm drop-shadow-md">
                            {event.title}
                        </h1>
                        <p className="text-white/80 text-lg max-w-xl drop-shadow-sm">
                            {event.description}
                        </p>
                    </div>
                </div>
            </div>

            <div className="container max-w-4xl mt-8 px-4">
                {(!event.categories || event.categories.length === 0) ? (
                    <div className="text-center py-12 text-muted-foreground">
                        No categories set up for this event yet.
                    </div>
                ) : (
                    <Tabs defaultValue={event.categories[0]?.id} className="w-full">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-semibold">Categories</h2>
                        </div>
                        <TabsList className="w-full justify-start overflow-x-auto h-auto p-1 mb-6 bg-transparent border-b rounded-none space-x-2">
                            {event.categories.map((cat: any) => (
                                <TabsTrigger
                                    key={cat.id}
                                    value={cat.id}
                                    className="px-6 py-3 rounded-full border border-border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
                                >
                                    {cat.name}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        {event.categories.map((cat: any) => (
                            <TabsContent key={cat.id} value={cat.id} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                    {cat.nominees && cat.nominees.map((nominee: any) => (
                                        <div
                                            key={nominee.id}
                                            className={cn(
                                                "group relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md cursor-pointer",
                                                selectedNominee === nominee.id ? "ring-2 ring-primary" : ""
                                            )}
                                            onClick={() => setSelectedNominee(nominee.id)}
                                        >
                                            <div className="aspect-square relative overflow-hidden bg-muted">
                                                {nominee.photo_url ? (
                                                    <img
                                                        src={nominee.photo_url}
                                                        alt={nominee.name}
                                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                                                        <span className="text-4xl font-bold opacity-30">?</span>
                                                    </div>
                                                )}

                                                <div className="absolute top-2 right-2">
                                                    <RealTimeCounter
                                                        eventId={event.id}
                                                        nomineeId={nominee.id}
                                                        initialCount={nominee.vote_count || 0}
                                                    />
                                                </div>

                                                {selectedNominee === nominee.id && (
                                                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center backdrop-blur-[1px]">
                                                        <div className="bg-primary text-primary-foreground rounded-full p-2">
                                                            <Check className="h-6 w-6" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-semibold text-lg leading-none mb-2">{nominee.name}</h3>
                                                <div className="flex items-center justify-between text-muted-foreground text-sm">
                                                    <span>Nominee</span>
                                                    <Trophy className="h-4 w-4" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {(!cat.nominees || cat.nominees.length === 0) && (
                                        <div className="col-span-full text-center py-8 text-muted-foreground">
                                            No nominees in this category.
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                        ))}
                    </Tabs>
                )}
            </div>

            {/* Sticky Bottom Vote Bar */}
            {selectedNominee && (
                <div className="fixed bottom-0 left-0 right-0 p-4 border-t bg-background/80 backdrop-blur-lg z-50 animate-in slide-in-from-bottom-10">
                    <div className="container max-w-4xl flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-sm text-muted-foreground">You selected</span>
                            <span className="font-bold">
                                {event.categories.flatMap((c: any) => c.nominees).find((n: any) => n.id === selectedNominee)?.name}
                            </span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="text-right hidden sm:block">
                                <span className="block text-sm font-medium">
                                    Total: {event.currency} {event.price_per_vote || 0}
                                </span>
                                <span className="text-xs text-muted-foreground">Includes fees</span>
                            </div>
                            <Button size="lg" onClick={handleVote} disabled={isPaying} className="px-8 shadow-lg shadow-primary/20">
                                {isPaying ? "Processing..." : "Pay & Vote"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
