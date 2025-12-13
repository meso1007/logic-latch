"use client";

import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { usePathname } from "next/navigation";
import Link from "next/link";

export function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const pathname = usePathname();

    // Pages that don't need the sidebar (public pages)
    const publicPages = ["/login", "/signup"];
    const isPublicPage = publicPages.includes(pathname);

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!user) {
        if (isPublicPage) {
            return <>{children}</>;
        }
        return (
            <div className="min-h-screen bg-slate-50 pt-16">
                <Header />
                <main className="h-[calc(100vh-4rem)] overflow-y-auto">
                    {children}
                </main>
            </div>
        );
    }

    if (isPublicPage) {
        return <>{children}</>;
    }

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
                <header className="h-14 flex items-center px-4 shrink-0 gap-2 border-b border-slate-200 bg-white/50 backdrop-blur-sm">
                    <Link href="/" className="flex items-center gap-1 group">
                        <div className="h-12 w-12 relative">
                            <img src="/logo.png" alt="Cartes" className="object-contain" />
                        </div>
                        <span className="font-bold text-2xl tracking-tight text-slate-600 group-hover:text-emerald-600 transition-colors">Cartes</span>
                    </Link>
                </header>
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
