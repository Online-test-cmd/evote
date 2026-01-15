"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Check, Ticket } from "lucide-react";

export default function TicketsPage() {
    const ticketTypes = [
        {
            id: "regular",
            name: "Regular Admission",
            price: 15.0,
            description: "Access to the main event area and standing room.",
            features: ["Main Hall Access", "Standing Room", "Standard Support"],
        },
        {
            id: "vip",
            name: "VIP Pass",
            price: 45.0,
            description: "Premium access with seating, drinks, and meet & greet.",
            features: ["Front Row Seating", "2 Free Drinks", "Backstage Pass", "Priority Entry"],
            highlight: true
        },
    ];

    return (
        <div className="container py-12 px-4 max-w-5xl mx-auto">
            <div className="text-center mb-12 space-y-4">
                <h1 className="text-4xl font-bold tracking-tight">Get Your Tickets</h1>
                <p className="text-lg text-muted-foreground">
                    Secure your spot at the Annual Music Awards 2024.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {ticketTypes.map((ticket) => (
                    <Card key={ticket.id} className={`relative flex flex-col ${ticket.highlight ? 'border-primary shadow-lg scale-105 z-10' : ''}`}>
                        {ticket.highlight && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-bold shadow-md">
                                Best Value
                            </div>
                        )}
                        <CardHeader>
                            <CardTitle className="text-2xl">{ticket.name}</CardTitle>
                            <CardDescription>{ticket.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="text-4xl font-bold mb-6">
                                ${ticket.price}
                            </div>
                            <ul className="space-y-3">
                                {ticket.features.map((feature) => (
                                    <li key={feature} className="flex items-center space-x-2">
                                        <Check className="h-4 w-4 text-green-500" />
                                        <span className="text-sm">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" size="lg" variant={ticket.highlight ? "default" : "outline"}>
                                <Ticket className="mr-2 h-4 w-4" />
                                Purchase {ticket.name}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
