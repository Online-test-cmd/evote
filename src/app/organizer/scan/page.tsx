"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Scanner } from "@yudiel/react-qr-scanner"; // Modern scanner
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ScanPage() {
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [validationStatus, setValidationStatus] = useState<'idle' | 'loading' | 'valid' | 'invalid' | 'used'>('idle'); // Added 'used'
    const [ticketData, setTicketData] = useState<any>(null);
    const [message, setMessage] = useState("");

    const handleScan = async (result: string) => {
        if (!result || validationStatus !== 'idle') return; // Debounce

        // Ensure result is clean (sometimes returns objects depending on version)
        const code = typeof result === 'string' ? result : (result as any)?.[0]?.rawValue || (result as any)?.text;

        if (!code) return;

        setScanResult(code);
        validateTicket(code);
    };

    const validateTicket = async (code: string) => {
        setValidationStatus('loading');
        setMessage("Checking ticket...");

        try {
            // 1. Fetch Ticket
            const { data, error } = await supabase
                .from("tickets")
                .select(`
                    *,
                    ticket_types(name),
                    orders(
                        events(title)
                    )
                `)
                .eq("unique_code", code)
                .single();

            if (error || !data) {
                setValidationStatus('invalid');
                setMessage("Ticket not found in database.");
                return;
            }

            setTicketData(data);

            // 2. Check Status
            if (data.status === 'used') {
                setValidationStatus('used');
                setMessage(`Ticket ALREADY USED on ${new Date(data.used_at).toLocaleString()}`);
                return;
            }

            if (data.status === 'cancelled') {
                setValidationStatus('invalid'); // Or specific 'cancelled' state
                setMessage("Ticket was cancelled.");
                return;
            }

            // 3. Mark as Used (Check-in)
            const { error: updateError } = await supabase
                .from("tickets")
                .update({
                    status: 'used',
                    used_at: new Date().toISOString()
                })
                .eq("id", data.id);

            if (updateError) {
                throw updateError;
            }

            setValidationStatus('valid');
            setMessage("Check-in Successful!");

        } catch (err: any) {
            console.error(err);
            setValidationStatus('invalid');
            setMessage("System Error: " + err.message);
        }
    };

    const resetScanner = () => {
        setScanResult(null);
        setValidationStatus('idle');
        setTicketData(null);
        setMessage("");
    };

    return (
        <div className="container max-w-md mx-auto py-8 px-4 flex flex-col items-center min-h-screen">
            <h1 className="text-2xl font-bold mb-6 text-center">Ticket Scanner</h1>

            <Card className="w-full overflow-hidden shadow-xl mb-6">
                <CardHeader className="bg-muted/30">
                    <CardTitle className="text-center text-lg">
                        {validationStatus === 'idle' ? "Ready to Scan" : "Processing"}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 relative aspect-square bg-black">
                    {validationStatus === 'idle' && (
                        <Scanner
                            onScan={(detectedCodes) => {
                                // library returns array
                                if (detectedCodes && detectedCodes.length > 0) {
                                    handleScan(detectedCodes[0].rawValue);
                                }
                            }}
                            onError={(error) => console.log(error)}
                            styles={{
                                container: { width: '100%', height: '100%' }
                            }}
                        />
                    )}

                    {validationStatus !== 'idle' && (
                        <div className={cn(
                            "absolute inset-0 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-300",
                            validationStatus === 'valid' ? "bg-green-100 dark:bg-green-900" :
                                validationStatus === 'loading' ? "bg-background" :
                                    "bg-red-100 dark:bg-red-900"
                        )}>
                            {validationStatus === 'loading' && <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />}

                            {validationStatus === 'valid' && <CheckCircle className="h-24 w-24 text-green-600 dark:text-green-400 mb-4" />}

                            {(validationStatus === 'invalid' || validationStatus === 'used') && <XCircle className="h-24 w-24 text-red-600 dark:text-red-400 mb-4" />}

                            <h2 className="text-2xl font-bold mb-2">
                                {validationStatus === 'valid' ? "VALID TICKET" :
                                    validationStatus === 'used' ? "ALREADY USED" :
                                        validationStatus === 'loading' ? "Verifying..." :
                                            "INVALID TICKET"}
                            </h2>
                            <p className="text-lg font-medium opacity-90">{message}</p>

                            {ticketData && (
                                <div className="mt-4 p-4 bg-background/50 rounded-lg w-full text-sm">
                                    <p><strong>Holder:</strong> {ticketData.holder_name}</p>
                                    <p><strong>Type:</strong> {ticketData.ticket_types?.name}</p>
                                    <p><strong>Event:</strong> {ticketData.orders?.events?.title}</p>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {validationStatus !== 'idle' && (
                <Button size="lg" className="w-full text-lg h-12" onClick={resetScanner}>
                    <RefreshCw className="mr-2 h-5 w-5" /> Scan Next Ticket
                </Button>
            )}

            <p className="text-xs text-muted-foreground mt-8 text-center max-w-xs">
                Ensure regular lighting. Hold camera steady over the QR code.
            </p>
        </div>
    );
}
