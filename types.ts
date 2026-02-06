
export interface License {
  id: string; // 'mp3' | 'wav' | 'unlimited' (matches DB 'code')
  name: string;
  price: number;
  description: string;
  stripeId?: string; // The ID from the 'licenses' table
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  key: string;
  duration: string;
  coverUrl: string;
  audioUrl: string;
  price: number; // Display price (usually MP3)
  genre: string;
  slug?: string;

  // New Schema Fields
  mp3Path?: string;
  wavPath?: string;
  stemsPath?: string;
}

export interface SoundKit {
  id: string;
  title: string;
  type: string; // 'Drum Kit' | 'Loop Kit' | 'Melody Pack'
  price: number;
  coverUrl: string;
  description: string;
  fileUrl?: string; // Link to the actual content (ZIP)
  stripePriceId?: string; // Stripe Price ID (e.g. price_123...)
  created_at?: string;
  // Optional fields for UI display (compat with SoundKitDetail)
  timestamp?: string;
  contents?: string[];
  longDescription?: string;
}

export type CartItem =
  | { type: 'track'; id: string; track: Track; license: License }
  | { type: 'soundkit'; id: string; kit: SoundKit };

export interface ContactMessage {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export enum ProducerTask {
  LYRICS = 'LYRICS',
  BEAT_IDEAS = 'BEAT_IDEAS',
  MIXING_ADVICE = 'MIXING_ADVICE',
  VIBE_CHECK = 'VIBE_CHECK',
}

export type View = 'Beats' | 'Sound Kits' | 'Services' | 'Contact' | 'GenreDetail' | 'FAQ' | 'SoundKitDetail' | 'Admin' | 'Terms' | 'Privacy' | 'Refunds' | 'Sitemap';
