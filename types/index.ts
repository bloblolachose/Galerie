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
  createdAt: number;
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
}

export interface AppSettings {
  id: string; // 'settings'
  galleryName: string;
  passwordHash?: string; // In a real app. Here we use a simple secret check.
}
