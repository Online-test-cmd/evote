"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    Calendar,
    Settings,
    BarChart3,
    Shield,
    LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const adminNavItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/events", label: "Events", icon: Calendar },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    return (
        <div className="flex h-screen w-64 flex-col border-r bg-card">
            {/* Header */}
            <div className="flex h-16 items-center border-b px-6">
                <Link href="/admin" className="flex items-center space-x-2">
                    <Shield className="h-6 w-6 text-primary" />
                    <span className="text-xl font-bold">Admin Panel</span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-4">
                {adminNavItems.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href !== "/admin" && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="border-t p-4 space-y-2">
                <Link href="/dashboard">
                    <Button variant="outline" className="w-full justify-start">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Organizer Dashboard
                    </Button>
                </Link>
                <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground"
                    onClick={handleLogout}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log Out
                </Button>
            </div>
        </div>
    );
}
