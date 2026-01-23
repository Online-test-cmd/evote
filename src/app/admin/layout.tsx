import { AdminSidebar } from "@/components/layout/AdminSidebar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-background">
            <AdminSidebar />
            <main className="flex-1 overflow-y-auto">
                <div className="container py-6 px-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
