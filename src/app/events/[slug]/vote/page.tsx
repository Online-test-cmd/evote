"use client";

import { useState } from "react";
import Image from "next/image"; // In real app, use this. For now we use img tags for placeholder URLs.
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { RealTimeCounter } from "@/components/voting/RealTimeCounter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Star, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock Data
const EVENT_DATA = {
    id: "1",
    title: "Annual Music Awards 2024",
    description: "Vote for your favorite artists in this years grand event.",
    banner: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=2574&auto=format&fit=crop",
    categories: [
        {
            id: "cat1",
            name: "Artist of the Year",
            nominees: [
                { id: "nom1", name: "Artist One", votes: 450, image: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=800&auto=format&fit=crop&q=60" },
                { id: "nom2", name: "Artist Two", votes: 320, image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800&auto=format&fit=crop&q=60" },
            ],
        },
        {
            id: "cat2",
            name: "Song of the Year",
            nominees: [
                { id: "nom3", name: "Melody Blue", votes: 120, image: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=800&auto=format&fit=crop&q=60" },
                { id: "nom4", name: "Rhythm Red", votes: 85, image: "https://images.unsplash.com/photo-1628157588553-5eeea00af15c?w=800&auto=format&fit=crop&q=60" },
            ],
        },
    ],
};

export default function VotingPage() {
    const params = useParams();
    const [selectedNominee, setSelectedNominee] = useState<string | null>(null);
    const [isPaying, setIsPaying] = useState(false);

    // In a real app, this would trigger a Payment Modal (Paystack/Flutterwave)
    const handleVote = async () => {
        if (!selectedNominee) return;
        setIsPaying(true);

        // Simulate Payment Delay
        setTimeout(() => {
            alert(`Vote cast successfully for ${selectedNominee}! (Payment Simulation)`);
            setIsPaying(false);
            setSelectedNominee(null);
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Hero Section */}
            <div className="relative h-[300px] w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10" />
                <img
                    src={EVENT_DATA.banner}
                    alt="Event Banner"
                    className="h-full w-full object-cover"
                />
                <div className="absolute bottom-0 left-0 z-20 p-8 w-full">
                    <div className="container max-w-4xl">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2 shadow-sm drop-shadow-md">
                            {EVENT_DATA.title}
                        </h1>
                        <p className="text-white/80 text-lg max-w-xl drop-shadow-sm">
                            {EVENT_DATA.description}
                        </p>
                    </div>
                </div>
            </div>

            <div className="container max-w-4xl mt-8 px-4">
                <Tabs defaultValue={EVENT_DATA.categories[0].id} className="w-full">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-semibold">Categories</h2>
                    </div>
                    <TabsList className="w-full justify-start overflow-x-auto h-auto p-1 mb-6 bg-transparent border-b rounded-none space-x-2">
                        {EVENT_DATA.categories.map((cat) => (
                            <TabsTrigger
                                key={cat.id}
                                value={cat.id}
                                className="px-6 py-3 rounded-full border border-border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
                            >
                                {cat.name}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {EVENT_DATA.categories.map((cat) => (
                        <TabsContent key={cat.id} value={cat.id} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                {cat.nominees.map((nominee) => (
                                    <div
                                        key={nominee.id}
                                        className={cn(
                                            "group relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md cursor-pointer",
                                            selectedNominee === nominee.id ? "ring-2 ring-primary" : ""
                                        )}
                                        onClick={() => setSelectedNominee(nominee.id)}
                                    >
                                        <div className="aspect-square relative overflow-hidden">
                                            <img
                                                src={nominee.image}
                                                alt={nominee.name}
                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                            <div className="absolute top-2 right-2">
                                                <RealTimeCounter
                                                    eventId={EVENT_DATA.id}
                                                    nomineeId={nominee.id}
                                                    initialCount={nominee.votes}
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
                            </div>
                        </TabsContent>
                    ))}
                </Tabs>
            </div>

            {/* Sticky Bottom Vote Bar */}
            {selectedNominee && (
                <div className="fixed bottom-0 left-0 right-0 p-4 border-t bg-background/80 backdrop-blur-lg z-50 animate-in slide-in-from-bottom-10">
                    <div className="container max-w-4xl flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-sm text-muted-foreground">You selected</span>
                            <span className="font-bold">
                                {EVENT_DATA.categories.flatMap(c => c.nominees).find(n => n.id === selectedNominee)?.name}
                            </span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="text-right hidden sm:block">
                                <span className="block text-sm font-medium">Total: $1.00</span>
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
