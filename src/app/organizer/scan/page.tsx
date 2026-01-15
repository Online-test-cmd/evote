"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, QrCode } from "lucide-react";

export default function AttendanceScanPage() {
    const [scanning, setScanning] = useState(false);
    const [scanResult, setScanResult] = useState<string | null>(null);

    const toggleScan = () => {
        setScanning(!scanning);
        if (!scanning) {
            // Simulate a scan after 3 seconds
            setScanResult(null);
            setTimeout(() => {
                setScanResult("VALID TICKET: John Doe - VIP");
                setScanning(false);
            }, 3000);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-black/95">
            <Card className="w-full max-w-md bg-background/10 border-white/20 backdrop-blur-md text-white">
                <CardHeader className="text-center">
                    <CardTitle className="flex items-center justify-center gap-2">
                        <QrCode className="h-6 w-6" />
                        Ticket Scanner
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-6">
                    <div className={`relative w-64 h-64 rounded-xl border-2 flex items-center justify-center overflow-hidden bg-black ${scanning ? 'border-primary animate-pulse' : 'border-white/20'}`}>
                        {scanning ? (
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/20 to-transparent w-full h-full animate-[scan_2s_ease-in-out_infinite]" />
                        ) : (
                            <Camera className="h-12 w-12 text-muted-foreground" />
                        )}
                        {scanResult && !scanning && (
                            <div className="absolute inset-0 flex items-center justify-center bg-green-500/80 text-white font-bold text-center p-4">
                                {scanResult}
                            </div>
                        )}
                    </div>

                    <p className="text-sm text-center text-muted-foreground">
                        {scanning ? "Searching for QR Code..." : "Ready to scan"}
                    </p>

                    <Button size="lg" className="w-full" onClick={toggleScan}>
                        {scanning ? "Stop Scanning" : "Start Camera"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
