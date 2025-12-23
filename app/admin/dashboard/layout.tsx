"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/store/adminStore";
import Link from "next/link";
import { LogOut, LayoutGrid, Image as ImageIcon } from "lucide-react";
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
        <div className="flex h-screen bg-black text-white">
            {/* Sidebar */}
            <aside className="w-64 border-r border-neutral-800 bg-neutral-900/50 p-6 flex flex-col">
                <div className="mb-8 flex flex-col gap-4">
                    <img src="/logo.png" alt="Gallery Logo" className="w-12 h-12 object-contain invert self-start" />
                    {/* <h2 className="text-xl font-bold tracking-tight">Gallery Admin</h2> */}
                </div>

                <nav className="space-y-2 flex-1">
                    <Link
                        href="/admin/dashboard"
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                            pathname === "/admin/dashboard" ? "bg-white text-black" : "text-neutral-400 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <LayoutGrid className="w-5 h-5" />
                        Exhibitions
                    </Link>
                    <Link
                        href="/admin/dashboard/artworks"
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                            pathname === "/admin/dashboard/artworks" ? "bg-white text-black" : "text-neutral-400 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <ImageIcon className="w-5 h-5" />
                        Artworks
                    </Link>
                </nav>

                <button
                    onClick={() => {
                        logout();
                        router.push("/admin");
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-white/5 transition-colors mt-auto"
                >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
