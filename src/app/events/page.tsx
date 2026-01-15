import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin } from "lucide-react";

// Mock data (replace with Supabase fetch)
const PUBLIC_EVENTS = [
    {
        id: "1",
        title: "Annual Music Awards 2024",
        date: "2024-12-15",
        location: "Grand Arena, NY",
        image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=2574&auto=format&fit=crop",
        category: "Music"
    },
    {
        id: "2",
        title: "Tech Innovators Summit",
        date: "2024-10-20",
        location: "Convention Center, SF",
        image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&auto=format&fit=crop&q=60",
        category: "Technology"
    }
];

export default function PublicEventsPage() {
    return (
        <div className="container py-12 px-4 mx-auto">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Upcoming Events</h1>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {PUBLIC_EVENTS.map((event) => (
                    <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="aspect-video relative">
                            <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                            <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs font-bold">
                                {event.category}
                            </div>
                        </div>
                        <CardHeader>
                            <CardTitle className="line-clamp-1">{event.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center">
                                <Calendar className="mr-2 h-4 w-4" />
                                {event.date}
                            </div>
                            <div className="flex items-center">
                                <MapPin className="mr-2 h-4 w-4" />
                                {event.location}
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Link href={`/events/${event.id}/vote`} className="w-full">
                                <Button className="w-full">View & Vote</Button>
                            </Link>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
