import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, ShoppingCart, Tag, Check, ChevronDown, AlertCircle } from 'lucide-react';
import { Track, License } from '../types';
import { cn } from '../lib/utils';

interface TrackCardProps {
  track: Track;
  availableLicenses: License[];
  isActive: boolean;
  isInCart: boolean;
  onPlay: (track: Track) => void;
  onAddToCart: (track: Track, license: License) => void;
}

const TrackCard: React.FC<TrackCardProps> = ({ track, availableLicenses, isActive, isInCart, onPlay, onAddToCart }) => {
  const [showLicenses, setShowLicenses] = useState(false);
  const divRef = React.useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  // Dynamic License Availability Logic
  const trackLicenses = useMemo(() => {
    return availableLicenses.filter(license => {
      if (license.id === 'mp3') return !!track.mp3Path;
      if (license.id === 'wav') return !!track.wavPath;
      if (license.id === 'unlimited') return !!(track.mp3Path && track.wavPath && track.stemsPath);
      return false;
    });
  }, [availableLicenses, track]);

  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);

  // Set default license using useEffect (side effect of data loading)
  useEffect(() => {
    if (trackLicenses.length > 0) {
      // If no selection yet, or current selection is no longer valid (e.g. track changed), reset to first
      if (!selectedLicense || !trackLicenses.find(l => l.id === selectedLicense.id)) {
        setSelectedLicense(trackLicenses[0]);
      }
    }
  }, [trackLicenses, selectedLicense]);

  // Derived state for immediate rendering (fixes flash of unavailable)
  const activeLicense = selectedLicense || trackLicenses[0];

  const cardVariants = {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0 },
    hover: {
      borderColor: "rgba(168, 85, 247, 0.4)",
      boxShadow: "0 0 25px rgba(168, 85, 247, 0.15)",
      transition: { duration: 0.3 }
    }
  } as const;

  const imageVariants = {
    hover: {
      scale: 1.1,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  } as const;

  return (
    <div className={cn("relative mb-2", showLicenses ? "z-[100]" : "z-10 hover:z-20")}>
      <motion.div
        ref={divRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        variants={cardVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
        className={cn(
          "group flex items-center gap-4 p-3 rounded-xl transition-all duration-300 border cursor-pointer relative overflow-hidden",
          isActive
            ? "bg-dark-card border-primary/40 shadow-xl shadow-primary/10"
            : "bg-dark-soft/40 border-white/5 hover:bg-dark-soft/60"
        )}
        onClick={() => onPlay(track)}
      >
        {/* Spotlight Effect */}
        <div
          className="pointer-events-none absolute -inset-px transition-opacity duration-300 z-0"
          style={{
            opacity,
            background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(255,255,255,0.06), transparent 40%)`
          }}
        />
        
        {/* Content Container (z-10 to sit above spotlight) */}
        <div className="relative z-10 flex items-center gap-4 flex-grow min-w-0">
        
        {/* Play Icon/Cover */}
        <div className="relative w-14 h-14 flex-shrink-0 overflow-hidden rounded-lg border border-white/10">
          <img
            src={track.coverUrl}
            alt={`Cover art for ${track.title}`}
            loading="lazy"
            decoding="async"
            width={56}
            height={56}
            className="w-full h-full object-cover transition-transform duration-300 ease-out hover:scale-110"
          />
          <div className={cn(
            "absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity",
            isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}>
            <Play className={cn("w-5 h-5 text-white fill-current", isActive && "text-primary")} />
          </div>
        </div>

        {/* Info */}
        <div className="flex-grow min-w-0 pr-4">
          <h4 className={cn(
            "font-black text-sm md:text-base truncate uppercase tracking-tight",
            isActive ? "text-primary" : "text-white"
          )}>
            {track.title}
          </h4>
          <div className="flex items-center gap-2 mt-0.5 overflow-hidden whitespace-nowrap">
            <span className="text-[10px] text-gray-500 font-bold">@{track.artist}</span>
            <span className="text-gray-800" aria-hidden="true">•</span>
            <div className="flex items-center gap-1.5">
              <Tag className="w-2.5 h-2.5 text-primary" aria-hidden="true" />
              <span className="text-[9px] uppercase font-black text-gray-400 tracking-wider">{track.genre}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="hidden sm:flex flex-shrink-0 items-center gap-8 text-[10px] text-gray-500 font-mono">
          <div className="flex flex-col items-center">
            <span className="text-[8px] uppercase text-gray-700 font-sans font-black">BPM</span>
            <span className="text-gray-300">{track.bpm}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[8px] uppercase text-gray-700 font-sans font-black">Key</span>
            <span className="text-gray-300">{track.key}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {trackLicenses.length > 0 && activeLicense ? (
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setShowLicenses(!showLicenses); }}
                className="flex items-center gap-3 px-4 py-2.5 bg-dark-card border border-white/10 rounded-lg text-xs font-black text-white hover:bg-white/5 transition-all shadow-lg active:scale-95"
                aria-label={`Select license for ${track.title}. Current: ${activeLicense.name} at $${activeLicense.price}`}
                aria-expanded={showLicenses}
                aria-haspopup="listbox"
              >
                <span className="tracking-tighter">${activeLicense.price}</span>
                <ChevronDown className={cn("w-3 h-3 text-gray-500 transition-transform", showLicenses && "rotate-180")} aria-hidden="true" />
              </button>

              <AnimatePresence>
                {showLicenses && (
                  <>
                    <div
                      className="fixed inset-0 z-40 bg-transparent"
                      onClick={(e) => { e.stopPropagation(); setShowLicenses(false); }}
                      aria-hidden="true"
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-dark-card border border-white/10 rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 ring-1 ring-white/5"
                      role="listbox"
                      aria-label="License options"
                    >
                      {trackLicenses.map((lic) => (
                        <button
                          key={lic.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLicense(lic);
                            setShowLicenses(false);
                          }}
                          className={cn(
                            "w-full px-4 py-4 text-left hover:bg-primary/10 transition-all border-b border-white/5 last:border-none group/item",
                            (activeLicense.id === lic.id) ? "bg-primary/5" : ""
                          )}
                          role="option"
                          aria-selected={activeLicense.id === lic.id}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className={cn(
                              "text-[10px] font-black uppercase tracking-widest transition-colors",
                              (activeLicense.id === lic.id) ? "text-primary" : "text-white group-hover/item:text-primary"
                            )}>
                              {lic.name}
                            </span>
                            <span className="text-xs font-black text-primary">${lic.price}</span>
                          </div>
                          <p className="text-[9px] text-gray-500 uppercase tracking-tight leading-none">{lic.description}</p>
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2" role="alert" aria-label="Not available">
              <AlertCircle size={14} className="text-red-500" aria-hidden="true" />
              <span className="text-[9px] font-black uppercase text-red-500 tracking-wider">Unavail.</span>
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              if (activeLicense) onAddToCart(track, activeLicense);
            }}
            disabled={!activeLicense || trackLicenses.length === 0}
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-lg transition-all shadow-xl",
              isInCart
                ? "bg-green-500 text-white shadow-green-500/20"
                : "bg-primary text-white shadow-primary/20 hover:bg-primary/80 disabled:bg-gray-700 disabled:shadow-none disabled:cursor-not-allowed"
            )}
            aria-label={isInCart ? "Remove from cart" : `Add ${track.title} to cart`}
          >
            {isInCart ? <Check className="w-5 h-5" aria-hidden="true" /> : <ShoppingCart className="w-4 h-4" aria-hidden="true" />}
          </motion.button>
        </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TrackCard;