"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, Trash2, Upload, Save, Loader2, DollarSign, Ticket } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Nominee {
    id: string;
    name: string;
    photo_url: string;
    bio?: string;
}

interface Category {
    id: string;
    name: string;
    nominees: Nominee[];
}

interface TicketType {
    id: string;
    name: string;
    price: number;
    total_quantity: number;
    remaining_quantity: number;
    description: string;
}

export default function ManageEventPage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params.id as string;

    const [categories, setCategories] = useState<Category[]>([]);
    const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [newCategoryName, setNewCategoryName] = useState("");
    const [newTicketName, setNewTicketName] = useState("");

    // Fetch Data
    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
                return;
            }

            // Fetch Categories (Voting)
            const { data: catData } = await supabase
                .from("categories")
                .select("*, nominees(*)")
                .eq("event_id", eventId)
                .order("created_at", { ascending: true });

            setCategories(catData || []);

            // Fetch Ticket Types (Ticketing)
            const { data: ticketData } = await supabase
                .from("ticket_types")
                .select("*")
                .eq("event_id", eventId)
                .order("price", { ascending: true }); // Sort by price usually makes sense

            setTicketTypes(ticketData || []);
            setLoading(false);
        }
        fetchData();
    }, [eventId, router]);

    // --- CATEGORY LOGIC ---
    const addCategory = async () => {
        if (!newCategoryName.trim()) return;
        const { data, error } = await supabase
            .from("categories")
            .insert({ event_id: eventId, name: newCategoryName })
            .select().single();
        if (!error && data) {
            setCategories([...categories, { ...data, nominees: [] }]);
            setNewCategoryName("");
        }
    };

    const addNominee = async (categoryId: string) => {
        const { data, error } = await supabase
            .from("nominees")
            .insert({ category_id: categoryId, name: "New Nominee", photo_url: "" })
            .select().single();
        if (!error && data) {
            setCategories(categories.map(cat => cat.id === categoryId ? { ...cat, nominees: [...cat.nominees, data] } : cat));
        }
    };

    const updateNomineeLocal = (catId: string, nomId: string, field: keyof Nominee, val: string) => {
        setCategories(categories.map(cat => cat.id === catId ?
            { ...cat, nominees: cat.nominees.map(n => n.id === nomId ? { ...n, [field]: val } : n) } : cat
        ));
    };

    const removeNominee = async (catId: string, nomId: string) => {
        const { error } = await supabase.from("nominees").delete().eq("id", nomId);
        if (!error) {
            setCategories(categories.map(c => c.id === catId ? { ...c, nominees: c.nominees.filter(n => n.id !== nomId) } : c));
        }
    };

    // --- TICKETING LOGIC ---
    const addTicketType = async () => {
        if (!newTicketName.trim()) return;
        const { data, error } = await supabase
            .from("ticket_types")
            .insert({
                event_id: eventId,
                name: newTicketName,
                price: 0,
                total_quantity: 100,
                remaining_quantity: 100
            })
            .select().single();

        if (!error && data) {
            setTicketTypes([...ticketTypes, data]);
            setNewTicketName("");
        }
    };

    const updateTicketLocal = (ticketId: string, field: keyof TicketType, val: any) => {
        setTicketTypes(ticketTypes.map(t => t.id === ticketId ? { ...t, [field]: val } : t));
    };

    const removeTicketType = async (ticketId: string) => {
        const { error } = await supabase.from("ticket_types").delete().eq("id", ticketId);
        if (!error) {
            setTicketTypes(ticketTypes.filter(t => t.id !== ticketId));
        }
    };

    // --- SAVE ALL ---
    const saveChanges = async () => {
        setSaving(true);
        try {
            // Save Nominees
            const allNominees = categories.flatMap(c => c.nominees);
            if (allNominees.length > 0) {
                await supabase.from("nominees").upsert(
                    allNominees.map(n => ({
                        id: n.id,
                        category_id: categories.find(c => c.nominees.some(nom => nom.id === n.id))?.id,
                        name: n.name,
                        photo_url: n.photo_url
                    }))
                );
            }

            // Save Ticket Types
            if (ticketTypes.length > 0) {
                await supabase.from("ticket_types").upsert(
                    ticketTypes.map(t => ({
                        id: t.id,
                        event_id: eventId, // Ensure ID is present
                        name: t.name,
                        price: t.price,
                        total_quantity: t.total_quantity,
                        description: t.description
                        // remaining_quantity is updated via triggers usually, or careful manual updates. 
                        // For config, we act as if resetting total resets remaining if needed, but let's keep it simple.
                    }))
                );
            }

            alert("All changes saved!");
        } catch (e: any) {
            alert("Error saving: " + e.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Manage Event</h2>
                <Button onClick={saveChanges} disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </div>

            <Tabs defaultValue="voting" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="voting">Voting Configuration</TabsTrigger>
                    <TabsTrigger value="ticketing">Ticketing</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="voting" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Voting Categories</CardTitle>
                            <CardDescription>Setup awards categories and nominees.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex space-x-2 mb-4">
                                <Input
                                    placeholder="New Category (e.g. Best Artist)"
                                    value={newCategoryName}
                                    onChange={e => setNewCategoryName(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && addCategory()}
                                />
                                <Button onClick={addCategory} variant="secondary"><Plus className="mr-2 h-4 w-4" /> Add</Button>
                            </div>
                            <Accordion type="single" collapsible className="w-full">
                                {categories.map(cat => (
                                    <AccordionItem key={cat.id} value={cat.id}>
                                        <AccordionTrigger>{cat.name} ({cat.nominees?.length || 0})</AccordionTrigger>
                                        <AccordionContent className="pt-4 space-y-4">
                                            {cat.nominees?.map(nom => (
                                                <div key={nom.id} className="flex items-center space-x-2 p-2 border rounded bg-secondary/10">
                                                    <Input value={nom.name} onChange={e => updateNomineeLocal(cat.id, nom.id, 'name', e.target.value)} className="h-8 flex-1" placeholder="Name" />
                                                    <Input value={nom.photo_url || ""} onChange={e => updateNomineeLocal(cat.id, nom.id, 'photo_url', e.target.value)} className="h-8 flex-1" placeholder="Photo URL" />
                                                    <Button size="icon" variant="ghost" className="text-destructive h-8 w-8" onClick={() => removeNominee(cat.id, nom.id)}><Trash2 className="h-4 w-4" /></Button>
                                                </div>
                                            ))}
                                            <Button variant="outline" size="sm" onClick={() => addNominee(cat.id)}><Plus className="mr-2 h-4 w-4" /> Add Nominee</Button>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="ticketing" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Ticket Types</CardTitle>
                            <CardDescription>Define tickets for your event (VIP, Regular, etc).</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex space-x-2 mb-4">
                                <Input
                                    placeholder="New Ticket Name (e.g. VIP Pass)"
                                    value={newTicketName}
                                    onChange={e => setNewTicketName(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && addTicketType()}
                                />
                                <Button onClick={addTicketType} variant="secondary"><Plus className="mr-2 h-4 w-4" /> Add</Button>
                            </div>

                            <div className="space-y-4">
                                {ticketTypes.map(ticket => (
                                    <div key={ticket.id} className="p-4 border rounded-lg bg-card space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="font-semibold text-lg flex items-center">
                                                <Ticket className="mr-2 h-4 w-4 text-primary" />
                                                <Input
                                                    value={ticket.name}
                                                    onChange={e => updateTicketLocal(ticket.id, 'name', e.target.value)}
                                                    className="font-bold border-none shadow-none focus-visible:ring-0 px-0 h-auto w-[200px]"
                                                />
                                            </div>
                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeTicketType(ticket.id)}><Trash2 className="h-4 w-4" /></Button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-1">
                                                <Label>Price</Label>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        type="number"
                                                        value={ticket.price}
                                                        onChange={e => updateTicketLocal(ticket.id, 'price', parseFloat(e.target.value))}
                                                        className="pl-8"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <Label>Total Quantity</Label>
                                                <Input
                                                    type="number"
                                                    value={ticket.total_quantity}
                                                    onChange={e => updateTicketLocal(ticket.id, 'total_quantity', parseInt(e.target.value))}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label>Description</Label>
                                                <Input
                                                    value={ticket.description || ""}
                                                    onChange={e => updateTicketLocal(ticket.id, 'description', e.target.value)}
                                                    placeholder="Perks included..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {ticketTypes.length === 0 && <p className="text-center text-muted-foreground py-8">No ticket types created yet.</p>}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="settings">
                    <Card>
                        <CardHeader><CardTitle>General Settings</CardTitle></CardHeader>
                        <CardContent>
                            <div className="pt-2">
                                <Label>Public Voting Link</Label>
                                <Input readOnly value={`https://evotes.com/events/${eventId}/vote`} className="bg-muted text-muted-foreground mb-4" />
                                <Label>Public Ticket Link</Label>
                                <Input readOnly value={`https://evotes.com/events/${eventId}/tickets`} className="bg-muted text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
