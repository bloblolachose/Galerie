export interface Artwork {
    id: string;
    title: string;
    artist: string;
    year: string;
    medium: string;
    dimensions: string;
    imageUrl: string;
    description?: string;
    price?: string; // Optional, might not be shown
    status?: 'available' | 'reserved' | 'sold'; // Status for commerce
    createdAt: number;
}

export interface Reservation {
    id: string;
    artworkId: string;
    visitorName: string;
    visitorEmail: string;
    visitorPhone?: string;
    status: 'pending' | 'contacted' | 'closed';
    createdAt: number;
}

export interface Artist {
    id: string;
    name: string;
    bio: string;
    photoUrl: string;
}

export interface Exhibition {
    id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    isActive: boolean; // Only one exhibition can be active
    artworkIds: string[]; // Order matters
    createdAt: number;
    artists?: Artist[]; // New: List of artists
    // Deprecated single-artist fields (kept for migration safety)
    artistBio?: string;
    artistPhotoUrl?: string;
}

export interface AppSettings {
    id: string; // 'settings'
    galleryName: string;
    passwordHash?: string; // In a real app. Here we use a simple secret check.
}
