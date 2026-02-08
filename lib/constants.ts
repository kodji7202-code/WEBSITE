import { Track, License } from '../types';

// Static definitions for display purposes (prices/names), IDs will come from DB
export const LICENSE_TEMPLATES: Record<string, Omit<License, 'id' | 'stripeId'>> = {
  mp3: { name: 'MP3 LEASE', price: 29.99, description: 'MP3 file only' },
  wav: { name: 'WAV LEASE', price: 49.99, description: 'High quality WAV' },
  unlimited: { name: 'UNLIMITED', price: 199.99, description: 'Unlimited usage + Stems' }
};

export const MOCK_TRACKS: Track[] = [
  {
    id: 'mock1',
    title: 'MIDNIGHT TOKYO',
    artist: 'Lejja',
    bpm: 140,
    key: 'Gm',
    duration: '3:12',
    coverUrl: 'https://images.unsplash.com/photo-1514525253440-b39345208668?auto=format&fit=crop&q=80&w=400',
    audioUrl: '',
    price: 29.99,
    genre: 'Trap',
    mp3Path: 'mock'
  },
  {
    id: 'mock2',
    title: 'SAHARA DUST',
    artist: 'Lejja',
    bpm: 144,
    key: 'Cm',
    duration: '2:45',
    coverUrl: 'https://images.unsplash.com/photo-1542359649-31e03cd4d909?auto=format&fit=crop&q=80&w=400',
    audioUrl: '',
    price: 29.99,
    genre: 'Drill',
    mp3Path: 'mock'
  }
];

// Preview duration limit in seconds
export const PREVIEW_DURATION_LIMIT = 90;

// Default placeholder image
export const PLACEHOLDER_COVER = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=600';
