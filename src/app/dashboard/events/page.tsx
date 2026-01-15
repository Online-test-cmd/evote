import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function EventsListPage() {
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
                {/* Placeholder for empty state or list */}
                <Card className="col-span-full flex flex-col items-center justify-center p-8 text-center border-dashed">
                    <CardHeader>
                        <CardTitle>No events yet</CardTitle>
                        <CardDescription>
                            You havent created any events. Click the button above to get started.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        </div>
    );
}
