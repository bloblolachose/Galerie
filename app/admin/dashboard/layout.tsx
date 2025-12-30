"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/store/adminStore";
import Link from "next/link";
import { LogOut, LayoutGrid, Image as ImageIcon, Mail } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const isAuthenticated = useAdminStore((state) => state.isAuthenticated);
    const logout = useAdminStore((state) => state.logout);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isAuthenticated) {
            // Prevent infinite loop if already on login
            router.push("/admin");
        }
    }, [isAuthenticated, router]);

    if (!isAuthenticated) return null;

    return (
        <div className="flex flex-col md:flex-row h-[100dvh] bg-black text-white overflow-hidden">
            {/* Sidebar */}
            <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-neutral-800 bg-neutral-900 z-50 p-4 md:p-6 flex flex-row md:flex-col items-center md:items-stretch gap-4 md:gap-0 shrink-0">
                <div className="flex md:flex-col gap-4 items-center md:items-start mr-auto md:mr-0">
                    <img src="/logo.png" alt="Gallery Logo" className="w-8 h-8 md:w-12 md:h-12 object-contain invert" />
                    {/* <h2 className="text-xl font-bold tracking-tight">Gallery Admin</h2> */}
                </div>

                <nav className="flex md:flex-col gap-2 md:space-y-2 flex-1 md:mt-8 justify-end md:justify-start">
                    <Link
                        href="/admin/dashboard"
                        className={cn(
                            "flex items-center gap-3 px-3 py-2 md:px-4 md:py-3 rounded-lg text-sm font-medium transition-colors",
                            pathname === "/admin/dashboard" ? "bg-white text-black" : "text-neutral-400 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <LayoutGrid className="w-5 h-5" />
                        <span className="hidden md:inline">Exhibitions</span>
                    </Link>
                    <Link
                        href="/admin/dashboard/reservations"
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium",
                            pathname === "/admin/dashboard/reservations"
                                ? "bg-white text-black shadow-lg shadow-black/5"
                                : "text-neutral-400 hover:text-black hover:bg-neutral-100"
                        )}
                    >
                        <div className={cn(
                            "p-2 rounded-lg transition-colors",
                            pathname === "/admin/dashboard/reservations" ? "bg-black text-white" : "bg-white border border-neutral-200 group-hover:border-neutral-300"
                        )}>
                            <Mail className="w-4 h-4" />
                        </div>
                        Inbox / Reservations
                    </Link>
                    <Link
                        href="/admin/dashboard/artworks"
                        className={cn(
                            "flex items-center gap-3 px-3 py-2 md:px-4 md:py-3 rounded-lg text-sm font-medium transition-colors",
                            pathname === "/admin/dashboard/artworks" ? "bg-white text-black" : "text-neutral-400 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <ImageIcon className="w-5 h-5" />
                        <span className="hidden md:inline">Artworks</span>
                    </Link>
                </nav>

                <button
                    onClick={() => {
                        logout();
                        router.push("/admin");
                    }}
                    className="flex items-center gap-3 px-3 py-2 md:px-4 md:py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-white/5 transition-colors mt-0 md:mt-auto"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="hidden md:inline">Sign Out</span>
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
