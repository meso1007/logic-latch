"use client";

import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "@/components/Sidebar";
import { usePathname } from "next/navigation";

export function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const pathname = usePathname();

    // Pages that don't need the sidebar (public pages)
    const publicPages = ["/login", "/signup"];
    const isPublicPage = publicPages.includes(pathname);

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!user || isPublicPage) {
        return <>{children}</>;
    }

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto bg-slate-50">
                {children}
            </main>
        </div>
    );
}
