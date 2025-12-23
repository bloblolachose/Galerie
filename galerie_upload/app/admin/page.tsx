"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/store/adminStore";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminLogin() {
    const [key, setKey] = useState("");
    const [error, setError] = useState(false);
    const login = useAdminStore((state) => state.login);
    const isAuthenticated = useAdminStore((state) => state.isAuthenticated);
    const router = useRouter();

    useEffect(() => {
        if (isAuthenticated) {
            router.push("/admin/dashboard");
        }
    }, [isAuthenticated, router]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const success = login(key);
        if (success) {
            router.push("/admin/dashboard");
        } else {
            setError(true);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4 text-white">
            <div className="w-full max-w-sm space-y-8">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-24 w-24 flex items-center justify-center">
                        <img src="/logo.png" alt="Gallery Logo" className="w-full h-full object-contain invert" />
                    </div>
                    <h1 className="text-2xl font-semibold tracking-tight">Gallery Admin</h1>
                    <p className="text-sm text-neutral-400">Enter access key to continue</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="password"
                            value={key}
                            onChange={(e) => {
                                setKey(e.target.value);
                                setError(false);
                            }}
                            placeholder="Secret Key"
                            className={cn(
                                "w-full rounded-lg border bg-neutral-900 px-4 py-3 text-white placeholder-neutral-500 outline-none transition-all focus:ring-2",
                                error
                                    ? "border-red-500 focus:ring-red-500/50"
                                    : "border-neutral-800 focus:border-white focus:ring-white/20"
                            )}
                        />
                        {error && <p className="mt-2 text-xs text-red-500">Invalid access key</p>}
                    </div>
                    <button
                        type="submit"
                        className="w-full rounded-lg bg-white py-3 text-sm font-medium text-black transition-transform active:scale-95"
                    >
                        Enter Dashboard
                    </button>
                </form>
            </div>
        </div>
    );
}
