import { DashboardSidebar } from "@/components/layout/DashboardSidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] flex-1 gap-12">
                <aside className="hidden w-[250px] flex-col md:flex">
                    <DashboardSidebar />
                </aside>
                <main className="flex w-full flex-1 flex-col overflow-hidden p-8 pt-24">
                    {children}
                </main>
            </div>
        </div>
    );
}
