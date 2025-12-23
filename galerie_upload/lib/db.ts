import Dexie, { type Table } from 'dexie';
import type { Artwork, Exhibition, AppSettings } from '@/types';

export class GalleryDatabase extends Dexie {
    artworks!: Table<Artwork>;
    exhibitions!: Table<Exhibition>;
    settings!: Table<AppSettings>;

    constructor() {
        super('GalleryDatabase');
        this.version(1).stores({
            artworks: 'id, title, artist, createdAt',
            exhibitions: 'id, title, isActive, createdAt',
            settings: 'id'
        });
    }
}

export const db = new GalleryDatabase();

// Helper to ensure initial data or "Active" exhibition logic if needed
export const initDatabase = async () => {
    // Check if we have any exhibitions, if not create a default one maybe?
    // For now we leave it empty.
};
