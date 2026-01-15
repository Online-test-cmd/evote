"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, BarChart3, Settings, Users, LogOut } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const sidebarItems = [
    {
        title: "Overview",
        href: "/dashboard",
        icon: BarChart3,
    },
    {
        title: "Events",
        href: "/dashboard/events",
        icon: Calendar,
    },
    {
        title: "Attendees",
        href: "/dashboard/attendees",
        icon: Users,
    },
    {
        title: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
    },
];

export function DashboardSidebar() {
    const pathname = usePathname();

    return (
        <nav className="relative hidden h-screen border-r pt-16 lg:block w-64 bg-background">
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <div className="space-y-1">
                        <h2 className="mb-2 px-4 text-xl font-semibold tracking-tight">
                            Organizer
                        </h2>
                        <div className="space-y-1">
                            {sidebarItems.map((item) => (
                                <Button
                                    key={item.href}
                                    variant={pathname === item.href ? "secondary" : "ghost"}
                                    className="w-full justify-start"
                                    asChild
                                >
                                    <Link href={item.href}>
                                        <item.icon className="mr-2 h-4 w-4" />
                                        {item.title}
                                    </Link>
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div className="absolute bottom-4 w-full px-4">
                <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                </Button>
            </div>
        </nav>
    );
}
