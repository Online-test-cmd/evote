"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";

interface RealTimeCounterProps {
    eventId: string;
    nomineeId: string;
    initialCount: number;
}

export function RealTimeCounter({
    eventId,
    nomineeId,
    initialCount,
}: RealTimeCounterProps) {
    const [count, setCount] = useState(initialCount);

    useEffect(() => {
        // Subscribe to changes for this specific nominee in the 'votes' table
        // Assumes a 'votes' table exits with 'event_id' and 'nominee_id' columns.
        // For aggregate counts, usually we'd listen to a 'nominees' table update where 'vote_count' is incremented.

        console.log(`Subscribing to votes for nominee ${nomineeId}`);

        const channel = supabase
            .channel(`nominee-${nomineeId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "votes",
                    filter: `nominee_id=eq.${nomineeId}`,
                },
                (payload) => {
                    console.log("Vote received!", payload);
                    setCount((prev) => prev + 1);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [eventId, nomineeId]);

    return (
        <Badge variant="secondary" className="text-sm font-bold bg-secondary/50 backdrop-blur-md">
            {count.toLocaleString()} Votes
        </Badge>
    );
}
