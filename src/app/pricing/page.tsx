import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function PricingPage() {
    return (
        <div className="container py-24 mx-auto px-4">
            <div className="text-center mb-16">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
                    Simple, Transparent Pricing
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    No monthly fees. We only make money when you do.
                </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">Standard</CardTitle>
                        <CardDescription>Perfect for free events and RSVPs</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold mb-6">Free</div>
                        <ul className="space-y-3">
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> Unlimited Events</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> Free Tickets</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> 1000 Monthly Votes</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> Basic Reporting</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" variant="outline">Get Started</Button>
                    </CardFooter>
                </Card>
                <Card className="border-primary relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-primary/20 text-primary px-3 py-1 text-xs font-bold rounded-bl-lg">
                        POPULAR
                    </div>
                    <CardHeader>
                        <CardTitle className="text-2xl">Pro</CardTitle>
                        <CardDescription>For paid events and large voting campaigns</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold mb-6">20% <span className="text-lg font-normal text-muted-foreground">/ txn</span></div>
                        <ul className="space-y-3">
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> Paid Tickets (80/20 split)</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" />  Paid Voting (80/20 split)</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> Real-time Analytics</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> Priority Support</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full">Start Selling</Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
