import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Volume2,
  X,
  ArrowLeft,
  Loader2,
  Menu
} from 'lucide-react';
import { Track, View, SoundKit, CartItem, License } from './types';
import { cn, formatTime } from './lib/utils';
import TrackCard from './components/TrackCard';
import HeroSection from './components/HeroSection';
import HowItWorks from './components/HowItWorks';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import { supabase } from './lib/supabase';
import React, { useState, useMemo, useEffect, useRef, Suspense } from 'react';

// Lazy Load Heavy/Secondary Components
const AdminDashboard = React.lazy(() => import('./components/AdminDashboard'));
const SoundKitDetail = React.lazy(() => import('./components/SoundKitDetail'));
const TermsOfService = React.lazy(() => import('./components/TermsOfService'));
const PrivacyPolicy = React.lazy(() => import('./components/PrivacyPolicy'));
const RefundPolicy = React.lazy(() => import('./components/RefundPolicy'));
const Sitemap = React.lazy(() => import('./components/Sitemap'));

const LoadingFallback = () => (
  <div className="flex h-screen w-full items-center justify-center bg-dark text-primary">
    <Loader2 className="h-10 w-10 animate-spin" />
  </div>
);

// Static definitions for display purposes (prices/names), IDs will come from DB
const LICENSE_TEMPLATES: Record<string, Omit<License, 'id' | 'stripeId'>> = {
  mp3: { name: 'MP3 LEASE', price: 29.99, description: 'MP3 file only' },
  wav: { name: 'WAV LEASE', price: 49.99, description: 'High quality WAV' },
  unlimited: { name: 'UNLIMITED', price: 199.99, description: 'Unlimited usage + Stems' }
};

const MOCK_TRACKS: Track[] = [
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



const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(() => {
    if (typeof window !== 'undefined' && window.location.pathname === '/admin') {
      return 'Admin';
    }
    return 'Beats';
  });

  // Data State
  const [tracks, setTracks] = useState<Track[]>([]);
  const [soundKits, setSoundKits] = useState<SoundKit[]>([]);
  const [globalLicenses, setGlobalLicenses] = useState<License[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(true);

  // Player State
  const audioRef = useRef<HTMLAudioElement>(null);
  const isFirstMount = useRef(true);
  const [activeTrack, setActiveTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

  // Shopping Cart & Modals
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Mobile Menu State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [selectedBeatName, setSelectedBeatName] = useState<string | null>(null);
  const [selectedKit, setSelectedKit] = useState<SoundKit | null>(null);

  // Filtering & UI
  const [activeGenre, setActiveGenre] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // -------------------------------------------------------------------------
  // AUDIO PLAYER LOGIC
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (activeTrack && audioRef.current) {
      audioRef.current.src = activeTrack.audioUrl;
      audioRef.current.load();

      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .catch(err => {
              console.warn("Playback interrupted or failed:", err);
            });
        }
      }
    }
  }, [activeTrack]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        if (audioRef.current.paused) {
          audioRef.current.play().catch(() => setIsPlaying(false));
        }
      } else {
        if (!audioRef.current.paused) {
          audioRef.current.pause();
        }
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const time = audioRef.current.currentTime;
      // LIMIT PREVIEW TO 90 SECONDS
      if (time >= 90) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
        // Optional: You could add a toast here saying "Purchase to hear full track"
      }
      setCurrentTime(time);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newVolume = Math.max(0, Math.min(1, x / rect.width));
    setVolume(newVolume);
  };

  const handleTrackEnd = () => {
    if (isRepeat && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else {
      handleSkip('next');
    }
  };

  const handleSkip = (direction: 'next' | 'prev') => {
    if (!activeTrack || !tracks || tracks.length === 0) return;
    const currentIndex = tracks.findIndex(t => t.id === activeTrack.id);
    let nextIndex;

    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * tracks.length);
    } else {
      nextIndex = direction === 'next'
        ? (currentIndex + 1) % tracks.length
        : (currentIndex - 1 + tracks.length) % tracks.length;
    }
    setActiveTrack(tracks[nextIndex]);
  };

  // -------------------------------------------------------------------------
  // DATA FETCHING
  // -------------------------------------------------------------------------
  useEffect(() => {
    const initData = async () => {
      setLoadingTracks(true);
      try {
        // 1. Fetch Licenses
        const { data: licensesData, error: licError } = await supabase
          .from('licenses')
          .select('*');

        if (licError) throw licError;

        const mappedLicenses: License[] = [];
        if (licensesData && licensesData.length > 0) {
          licensesData.forEach((lic: any) => {
            // Robust casing handling: DB 'MP3' -> 'mp3' to match template
            const code = lic.code?.toLowerCase();
            const template = LICENSE_TEMPLATES[code];
            if (template) {
              mappedLicenses.push({
                id: code,
                stripeId: lic.stripe_payment_link, // Storing ID/Link from DB
                ...template
              });
            }
          });
        }

        // FALLBACK: If DB returned no licenses (empty table OR RLS blocking), use defaults
        // This ensures the site works even if the DB is not fully configured or public
        if (mappedLicenses.length === 0) {
          console.warn("No licenses found in DB (or blocked by RLS). Using default templates.");
          mappedLicenses.push(
            { id: 'mp3', ...LICENSE_TEMPLATES.mp3, stripeId: 'price_123_placeholder_mp3' },
            { id: 'wav', ...LICENSE_TEMPLATES.wav, stripeId: 'price_123_placeholder_wav' },
            { id: 'unlimited', ...LICENSE_TEMPLATES.unlimited, stripeId: 'price_123_placeholder_unlimited' }
          );
        }

        setGlobalLicenses(mappedLicenses);

        setGlobalLicenses(mappedLicenses);

        // 2. Fetch Beats (Independent Try/Catch)
        try {
          const { data: beatsData, error: beatsError } = await supabase
            .from('beats')
            .select('*')
            .order('id', { ascending: false })
            .limit(10);

          if (beatsError) throw beatsError;

          if (beatsData && beatsData.length > 0) {
            const mappedTracks = beatsData.map((b: any) => ({
              id: b.id,
              title: b.name || 'Untitled Beat',
              slug: b.slug,
              artist: 'Lejja',
              bpm: b.bpm || 140,
              key: b.key || 'Cm',
              duration: '3:00',
              coverUrl: b.cover_path || MOCK_TRACKS[0].coverUrl,
              audioUrl: b.preview_path || '',
              price: 29.99,
              genre: b.genre || 'Trap',
              mp3Path: b.mp3_path,
              wavPath: b.wav_path,
              stemsPath: b.stems_path
            }));

            setTracks(mappedTracks);
            if (!activeTrack) setActiveTrack(mappedTracks[0]);
          } else {
            console.log("No beats found in DB, using mocks.");
            setTracks(MOCK_TRACKS);
            if (!activeTrack) setActiveTrack(MOCK_TRACKS[0]);
          }
        } catch (err) {
          console.error('Beats Fetch Error:', err);
          setTracks(MOCK_TRACKS);
          if (!activeTrack) setActiveTrack(MOCK_TRACKS[0]);
        }

        // 3. Fetch Sound Kits (Independent Try/Catch)
        try {
          const { data: kitsData, error: kitsError } = await supabase
            .from('sound_kits')
            .select('*')
            .order('created_at', { ascending: false });

          if (kitsError) throw kitsError;

          if (kitsData && kitsData.length > 0) {
            const mappedKits = kitsData.map((k: any) => ({
              id: k.id,
              title: k.title,
              type: k.type,
              price: k.price,
              imageUrl: k.cover_path || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=600',
              description: k.description,
              coverUrl: k.cover_path,
              fileUrl: k.file_path,
              stripePriceId: k.stripe_price_id,
              timestamp: new Date(k.created_at).toLocaleDateString(),
              contents: []
            }));
            setSoundKits(mappedKits);
          } else {
            setSoundKits([]);
          }
        } catch (err) {
          console.error('Sound Kits Fetch Error:', err);
          setSoundKits([]);
        }

      } catch (error) {
        console.error('General Supabase initialization error:', error);
      } finally {
        setLoadingTracks(false);
      }
    };

    initData();
  }, []);

  // -------------------------------------------------------------------------
  // UI HELPERS
  // -------------------------------------------------------------------------
  const filteredTracks = useMemo(() => {
    if (!tracks) return [];
    return tracks.filter(track => {
      const title = track.title || '';
      return title.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [searchQuery, tracks]);

  const genreSpecificTracks = useMemo(() => {
    if (!activeGenre || !tracks) return [];
    return tracks.filter(t => t.genre === activeGenre);
  }, [activeGenre, tracks]);

  const addTrackToCart = (track: Track, license: License) => {
    setCart(prev => {
      const cartItemId = `${track.id}-${license.id}`;
      const existsIndex = prev.findIndex(item => item.id === cartItemId);
      if (existsIndex !== -1) {
        return prev.filter((_, i) => i !== existsIndex);
      }
      return [...prev, { type: 'track', id: cartItemId, track, license }];
    });
    setIsCartOpen(true);
  };

  const addSoundKitToCart = (kit: SoundKit) => {
    setCart(prev => {
      const existsIndex = prev.findIndex(item => item.id === kit.id);
      if (existsIndex !== -1) {
        return prev.filter((_, i) => i !== existsIndex);
      }
      return [...prev, { type: 'soundkit', id: kit.id, kit }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const cartTotal = cart.reduce((sum, item) => {
    const price = item.type === 'track' ? item.license.price : item.kit.price;
    return sum + Number(price);
  }, 0).toFixed(2);

  const openCheckout = (context: string | Track) => {
    if (typeof context === 'string') {
      setSelectedBeatName(context);
      setSelectedTrack(null);
    } else {
      setSelectedTrack(context);
      setSelectedBeatName(context.title);
    }
    setIsCheckoutOpen(true);
  };

  const closeCheckout = () => {
    setIsCheckoutOpen(false);
    setSelectedBeatName(null);
    setSelectedTrack(null);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'Beats':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="perspective-[2000px]">
              <PerspectiveSection>
                <HeroSection
                  selectedGenre={null}
                  onSelectGenre={(genre) => {
                    setActiveGenre(genre);
                    setCurrentView('GenreDetail');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onSearch={setSearchQuery}
                />
              </PerspectiveSection>

              <PerspectiveSection id="trending-catalog" className="max-w-7xl mx-auto px-6 mb-12">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                  <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">
                    Trending Catalog
                  </h2>
                </div>
                <div className="flex flex-col gap-2 min-h-[400px] mb-0">
                  {loadingTracks ? (
                    <div className="flex flex-col items-center justify-center py-20">
                      <Loader2 className="animate-spin text-primary mb-2" />
                      <p className="text-gray-500 text-xs font-black uppercase tracking-widest">Loading Library...</p>
                    </div>
                  ) : filteredTracks.map(track => (
                    <TrackCard
                      key={track.id}
                      track={track}
                      availableLicenses={globalLicenses}
                      isActive={activeTrack?.id === track.id}
                      isInCart={cart.some(item => item.type === 'track' && item.track.id === track.id)}
                      onPlay={(t) => {
                        setActiveTrack(t);
                        setIsPlaying(true);
                      }}
                      onAddToCart={addTrackToCart}
                    />
                  ))
                  }
                </div>
              </PerspectiveSection>

              <PerspectiveSection id="pricing">
                <HowItWorks />
              </PerspectiveSection>

              <PerspectiveSection>
                <Testimonials />
              </PerspectiveSection>
            </div>
          </motion.div>
        );

      case 'GenreDetail':
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="py-12 max-w-7xl mx-auto px-6"
          >
            <button
              onClick={() => setCurrentView('Beats')}
              className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8 uppercase font-black text-xs tracking-widest"
            >
              <ArrowLeft size={16} /> Back to Catalog
            </button>
            <div className="space-y-2">
              {genreSpecificTracks?.map(track => (
                <TrackCard
                  key={track.id}
                  track={track}
                  availableLicenses={globalLicenses}
                  isActive={activeTrack?.id === track.id}
                  isInCart={cart.some(item => item.type === 'track' && item.track.id === track.id)}
                  onPlay={(t) => {
                    setActiveTrack(t);
                    setIsPlaying(true);
                  }}
                  onAddToCart={addTrackToCart}
                />
              ))}
            </div>
          </motion.div>
        );

      case 'Sound Kits':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-12 max-w-7xl mx-auto px-6"
          >
            <h2 className="text-5xl font-black uppercase italic tracking-tighter mb-12 border-b border-white/10 pb-6">Sample Packs & Sound Kits</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {soundKits.length === 0 ? (
                <div className="col-span-full text-center py-20">
                  <p className="text-gray-500 font-bold uppercase tracking-widest text-xl">No Sound Kits Available Yet.</p>
                </div>
              ) : (
                soundKits.map(kit => (
                  <motion.div
                    key={kit.id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-dark-card border border-white/5 rounded-2xl overflow-hidden group shadow-2xl cursor-pointer"
                    onClick={() => {
                      setSelectedKit(kit);
                      setCurrentView('SoundKitDetail');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    <div className="aspect-square relative overflow-hidden">
                      <img src={kit.coverUrl || 'https://via.placeholder.com/400'} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={kit.title} />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 text-white font-black uppercase text-[10px] tracking-widest">View Details</span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold uppercase mb-2 group-hover:text-primary transition-colors">{kit.title}</h3>
                      <button
                        onClick={(e) => { e.stopPropagation(); addSoundKitToCart(kit); }}
                        className="w-full py-3 mt-4 border border-white/10 rounded-lg uppercase font-bold text-xs tracking-widest hover:bg-white hover:text-dark transition-all"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        );

      case 'SoundKitDetail':
        return selectedKit ? (
          <Suspense fallback={<LoadingFallback />}>
            <SoundKitDetail
              kit={selectedKit}
              onBack={() => setCurrentView('Sound Kits')}
              onAddToCart={addSoundKitToCart}
              isInCart={cart.some(item => item.type === 'soundkit' && item.kit.id === selectedKit.id)}
            />
          </Suspense>
        ) : null;

      case 'Services':
        return <Services onBookNow={() => setCurrentView('Contact')} />;

      case 'Contact':
      case 'FAQ':
        return <FAQ
          onContactClick={() => setCurrentView('Contact')}
          isContactMode={currentView === 'Contact'}
        />;

      // ... (existing imports, skipping to renderContent switch)

      case 'Terms':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <TermsOfService onBack={() => setCurrentView('Beats')} />
          </Suspense>
        );

      case 'Privacy':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <PrivacyPolicy onBack={() => setCurrentView('Beats')} />
          </Suspense>
        );

      case 'Refunds':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <RefundPolicy onBack={() => setCurrentView('Beats')} />
          </Suspense>
        );

      case 'Sitemap':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <Sitemap onBack={() => setCurrentView('Beats')} onNavigate={setCurrentView} />
          </Suspense>
        );

      case 'Admin':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <AdminDashboard />
          </Suspense>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen w-full bg-dark text-slate-200 font-sans pb-32 overflow-x-hidden flex flex-col">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleTrackEnd}
        preload="auto"
      />

      <nav className="h-20 bg-dark/90 backdrop-blur-2xl border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <span className="text-3xl font-serif text-white tracking-wide cursor-pointer" onClick={() => setCurrentView('Beats')}>Lejja</span>
            <div className="hidden md:flex items-center gap-8">
              {(['Beats', 'Sound Kits', 'Services', 'FAQ'] as View[]).map(link => (
                <button
                  key={link}
                  onClick={() => setCurrentView(link)}
                  className={cn("text-[10px] font-black uppercase tracking-[0.25em] transition-all", currentView === link ? "text-primary" : "text-gray-500 hover:text-white")}
                >
                  {link}
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-gray-400 hover:text-white">
            <ShoppingCart className="w-6 h-6" />
            {cart.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[9px] font-black rounded-full flex items-center justify-center">{cart.length}</span>}
            {cart.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[9px] font-black rounded-full flex items-center justify-center">{cart.length}</span>}
          </button>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-white ml-2"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-dark flex flex-col p-8"
          >
            <div className="flex justify-between items-center mb-12">
              <span className="text-3xl font-serif text-white tracking-wide">Lejja</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-gray-400 hover:text-white"
              >
                <X className="w-8 h-8" />
              </button>
            </div>

            <div className="flex flex-col gap-6">
              {(['Beats', 'Sound Kits', 'Services', 'FAQ'] as View[]).map(link => (
                <button
                  key={link}
                  onClick={() => {
                    setCurrentView(link);
                    setIsMobileMenuOpen(false);
                  }}
                  className={cn(
                    "text-3xl font-black uppercase tracking-tighter text-left transition-colors",
                    currentView === link ? "text-primary" : "text-gray-500 hover:text-white"
                  )}
                >
                  {link}
                </button>
              ))}
            </div>

            <div className="mt-auto pt-8 border-t border-white/5">
              <p className="text-gray-500 text-xs uppercase tracking-widest mb-4">Contact & Support</p>
              <button
                onClick={() => {
                  setCurrentView('Contact');
                  setIsMobileMenuOpen(false);
                }}
                className="text-white font-bold"
              >
                Get in touch
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="w-full flex-grow">
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </main>

      <Footer onNavigate={setCurrentView} />

      {/* Hidden Admin Entry */}
      <div className="fixed bottom-0 right-0 p-1 opacity-0 hover:opacity-100 z-[9999]">
        <button onClick={() => setCurrentView('Admin')} className="w-4 h-4 bg-white/10 rounded-full"></button>
      </div>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCartOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-dark-card border-l border-white/5 z-[101] p-8 shadow-2xl flex flex-col">
              <div className="flex justify-between mb-10"><h3 className="text-2xl font-black">Cart</h3><button onClick={() => setIsCartOpen(false)}><X /></button></div>
              <div className="flex-grow overflow-y-auto space-y-4">
                {cart.map((item, i) => (
                  <div key={i} className="flex gap-4 p-4 bg-dark-soft/50 rounded-2xl border border-white/5">
                    <div className="flex-grow">
                      <p className="font-bold text-white">{item.type === 'track' ? item.track.title : item.kit.title}</p>
                      <p className="text-[10px] text-primary font-black uppercase">{item.type === 'track' ? item.license.name : item.kit.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black">${item.type === 'track' ? item.license.price : item.kit.price}</p>
                      <button onClick={() => removeFromCart(i)} className="text-[10px] text-red-500 uppercase font-bold mt-1">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/5 pt-8">
                <div className="flex justify-between mb-8"><span className="uppercase text-xs font-bold text-gray-500">Total</span><span className="text-3xl font-black">${cartTotal}</span></div>
                <button onClick={() => openCheckout("Your Cart Items")} className="w-full py-5 bg-white text-dark font-black uppercase tracking-widest rounded-2xl hover:bg-primary hover:text-white transition-all">Checkout</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={closeCheckout}
        total={cartTotal}
        beatName={selectedBeatName}
        track={selectedTrack}
        cart={cart}
        globalLicenses={globalLicenses}
      />

      {/* Global Player Bar */}
      <footer className="fixed bottom-0 left-0 right-0 h-24 bg-dark/95 backdrop-blur-3xl border-t border-white/5 z-[60]">
        <div className="max-w-7xl mx-auto h-full px-4 md:px-6 flex items-center justify-between gap-4 md:gap-12">
          {/* TRACK INFO - Adjusted width for mobile */}
          <div className="flex items-center gap-3 md:gap-5 w-auto md:w-1/4 max-w-[40%] md:max-w-none flex-shrink-0">
            {activeTrack && (
              <>
                <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl overflow-hidden shadow-2xl border border-white/5 relative flex-shrink-0">
                  <img src={activeTrack.coverUrl} className="w-full h-full object-cover" alt="cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-black text-xs md:text-sm truncate uppercase tracking-tight text-white">{activeTrack.title}</p>
                  <p className="text-[9px] md:text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5 truncate">@{activeTrack.artist}</p>
                </div>
              </>
            )}
          </div>

          {/* CONTROLS - Simplified for mobile */}
          <div className="flex flex-col items-center gap-1 md:gap-2.5 flex-grow max-w-2xl">
            <div className="flex items-center gap-4 md:gap-10">
              <button onClick={() => setIsShuffle(!isShuffle)} className={cn(isShuffle ? "text-primary" : "text-gray-700", "hidden md:block")}><Shuffle size={16} /></button>
              <button onClick={() => handleSkip('prev')} className="text-gray-500 hover:text-white"><SkipBack size={18} fill="currentColor" className="md:w-5 md:h-5" /></button>
              <button onClick={() => setIsPlaying(!isPlaying)} className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-white text-dark flex items-center justify-center shadow-2xl hover:bg-primary hover:text-white transition-colors">
                {isPlaying ? <Pause size={20} fill="currentColor" className="md:w-7 md:h-7" /> : <Play size={20} fill="currentColor" className="ml-1 md:w-7 md:h-7" />}
              </button>
              <button onClick={() => handleSkip('next')} className="text-gray-500 hover:text-white"><SkipForward size={18} fill="currentColor" className="md:w-5 md:h-5" /></button>
              <button onClick={() => setIsRepeat(!isRepeat)} className={cn(isRepeat ? "text-primary" : "text-gray-700", "hidden md:block")}><Repeat size={16} /></button>
            </div>

            <div className="flex items-center gap-2 md:gap-4 w-full">
              <span className="text-[8px] md:text-[9px] font-black text-gray-600 font-mono tracking-tighter w-6 md:w-8 text-right">{formatTime(currentTime)}</span>
              <div className="flex-grow h-1 md:h-1.5 bg-white/5 rounded-full relative overflow-hidden group cursor-pointer" onClick={handleSeek}>
                <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${(currentTime / (duration || 1)) * 100}%` }} />
              </div>
              <span className="text-[8px] md:text-[9px] font-black text-gray-600 font-mono tracking-tighter w-6 md:w-8">{formatTime(duration || 0)}</span>
            </div>
          </div>

          {/* RIGHT SIDE - Volume & Desktop Actions */}
          <div className="hidden lg:flex items-center justify-end gap-10 w-1/4">
            <div className="flex items-center gap-3 w-28">
              <button onClick={() => setVolume(v => v === 0 ? 0.8 : 0)}><Volume2 size={16} className="text-gray-600 hover:text-white" /></button>
              <div className="flex-grow h-1.5 bg-white/10 rounded-full cursor-pointer" onClick={handleVolumeClick}>
                <div className="h-full bg-gray-500 hover:bg-primary" style={{ width: `${volume * 100}%` }}></div>
              </div>
            </div>
            {activeTrack && (
              <button
                onClick={() => openCheckout(activeTrack)}
                className="px-8 py-3 bg-white text-dark text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-primary hover:text-white transition-all shadow-lg"
              >
                Buy Now
              </button>
            )}
          </div>

          {/* MOBILE BUY BUTTON - Mini Version */}
          {activeTrack && (
            <button
              onClick={() => openCheckout(activeTrack)}
              className="lg:hidden p-2 bg-white text-dark rounded-lg hover:bg-primary hover:text-white transition-all shadow-lg font-black text-[9px] uppercase tracking-wider"
            >
              ${activeTrack.price}
            </button>
          )}
        </div>
      </footer>
    </div>
  );
};

export default App;