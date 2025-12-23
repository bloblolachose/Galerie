import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdminState {
    isAuthenticated: boolean;
    login: (key: string) => boolean;
    logout: () => void;
}

// In a real app, verify against a secure hash. 
// Here we use an environment variable (set in Vercel) or a fallback
const SECRET_KEY = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "gallery-m4-master";

export const useAdminStore = create<AdminState>()(
    persist(
        (set) => ({
            isAuthenticated: false,
            login: (key) => {
                if (key === SECRET_KEY) {
                    set({ isAuthenticated: true });
                    return true;
                }
                return false;
            },
            logout: () => set({ isAuthenticated: false }),
        }),
        {
            name: 'admin-storage',
        }
    )
);
