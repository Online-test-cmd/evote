"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Shield, User, Mail } from "lucide-react";

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchUsers();
    }, []);

    async function fetchUsers() {
        setLoading(true);
        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching users:", error);
        } else {
            setUsers(data || []);
        }
        setLoading(false);
    }

    async function updateRole(userId: string, newRole: string) {
        const { error } = await supabase
            .from("profiles")
            .update({ role: newRole })
            .eq("id", userId);

        if (error) {
            alert("Failed to update role: " + error.message);
        } else {
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        }
    }

    const filteredUsers = users.filter(user =>
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case "admin": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
            case "organizer": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
            default: return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
        }
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                    <p className="text-muted-foreground">Manage platform users and roles</p>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">{users.length} users</span>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Users Table */}
            <Card>
                <CardHeader>
                    <CardTitle>All Users</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b text-left">
                                    <th className="pb-3 font-medium">User</th>
                                    <th className="pb-3 font-medium">Role</th>
                                    <th className="pb-3 font-medium">Joined</th>
                                    <th className="pb-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="border-b last:border-0">
                                        <td className="py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                                    <User className="h-5 w-5 text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{user.full_name || "No name"}</p>
                                                    <p className="text-sm text-muted-foreground flex items-center">
                                                        <Mail className="h-3 w-3 mr-1" />
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                                                {user.role || "voter"}
                                            </span>
                                        </td>
                                        <td className="py-4 text-muted-foreground">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="py-4 text-right space-x-2">
                                            {user.role !== "admin" && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => updateRole(user.id, "admin")}
                                                >
                                                    <Shield className="h-3 w-3 mr-1" />
                                                    Make Admin
                                                </Button>
                                            )}
                                            {user.role === "admin" && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => updateRole(user.id, "organizer")}
                                                >
                                                    Remove Admin
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredUsers.length === 0 && (
                            <p className="text-center text-muted-foreground py-8">No users found</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
