import { create } from 'zustand';

interface SyncState {
    version: number;
    refreshData: () => void;
}

export const useSyncStore = create<SyncState>((set) => ({
    version: 0,
    refreshData: () => set((state) => ({ version: state.version + 1 }))
}));
