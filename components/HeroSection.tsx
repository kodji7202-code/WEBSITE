import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useScroll } from 'framer-motion';
import { Search } from 'lucide-react';
import { cn } from '../lib/utils';

// Added missing interface for HeroSectionProps
interface HeroSectionProps {
  selectedGenre: string | null;
  onSelectGenre: (genre: string) => void;
  onSearch: (query: string) => void;
}

interface Genre {
  id: string;
  name: string;
  image: string;
}

const GENRES: Genre[] = [
  { id: 'Drill', name: 'Drill', image: '/images/genres/Drill.jpeg' },
  { id: 'R&B', name: 'R&B', image: '/images/genres/RnB.jpeg' },
  { id: 'Trap', name: 'Trap', image: '/images/genres/Trap.jpeg' },
  { id: 'Boom Bap', name: 'Boom Bap', image: '/images/genres/BoomBap.jpeg' },
  { id: 'Pop', name: 'Pop', image: '/images/genres/Pop.jpeg' },
];

interface TiltCardProps {
  genre: Genre;
  isSelected: boolean;
  onClick: () => void;
}

const TiltCard: React.FC<TiltCardProps> = ({ genre, isSelected, onClick }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smoother, heavier spring physics for "premium" feel
  const mouseXSpring = useSpring(x, { stiffness: 120, damping: 15, mass: 0.8 });
  const mouseYSpring = useSpring(y, { stiffness: 120, damping: 15, mass: 0.8 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["18deg", "-18deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-18deg", "18deg"]);

  // Parallax layers movement
  const contentX = useTransform(mouseXSpring, [-0.5, 0.5], ["-8px", "8px"]);
  const contentY = useTransform(mouseYSpring, [-0.5, 0.5], ["-8px", "8px"]);

  // Dynamic Glare Effect
  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ["0%", "100%"]);
  const glareOpacity = useTransform(mouseXSpring, [-0.5, 0, 0.5], [0, 0.6, 0]); // Glimmer on edges

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 1000
      }}
      initial={{ scale: 1 }}
      whileHover={{ scale: 1.05, z: 20 }}
      whileTap={{ scale: 0.95 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={cn(
        "relative h-32 md:h-56 rounded-2xl overflow-hidden cursor-pointer group transition-all duration-500",
        isSelected
          ? "ring-2 ring-primary shadow-[0_0_50px_rgba(168,85,247,0.4)]"
          : "shadow-2xl hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
      )}
    >
      {/* 1. Background Image Layer (Deepest) */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-300 ease-out"
        style={{
          backgroundImage: `url(${genre.image})`,
          transform: "scale(1.15) translateZ(-40px)", // Push back and scale up to cover gaps
          x: useTransform(contentX, (val) => typeof val === 'number' ? val * -1.5 : 0), // Move opposite to content
          y: useTransform(contentY, (val) => typeof val === 'number' ? val * -1.5 : 0)
        }}
      />

      {/* 2. Dark Overlay Layer */}
      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-500 z-10" />

      {/* 3. Text Content Layer (Floating above) */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none"
        style={{
          transform: "translateZ(40px)",
          x: contentX,
          y: contentY
        }}
      >
        <span className="font-wide text-sm md:text-2xl font-black uppercase tracking-widest text-white drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)] border-b-2 border-transparent group-hover:border-primary pb-1 group-hover:tracking-[0.3em] transition-all duration-500 whitespace-nowrap">
          {genre.name}
        </span>
      </motion.div>

      {/* 4. Glass/Glare Overlay (Top) */}
      <motion.div
        className="absolute inset-0 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none mix-blend-overlay"
        style={{
          background: `
            linear-gradient(
              135deg, 
              transparent 0%, 
              rgba(255,255,255,0.1) 45%, 
              rgba(255,255,255,0.5) 50%, 
              rgba(255,255,255,0.1) 55%, 
              transparent 100%
            )
          `,
          backgroundPosition: useTransform(
            [glareX, glareY],
            ([x, y]) => `${x} ${y}`
          ) as any // Cast to fix TS weak typing with Framer Motion transforms
        }}
      />

      {/* 5. Border Frame (Stay flush) */}
      <div className={cn(
        "absolute inset-0 border-2 rounded-2xl z-40 transition-colors duration-300",
        isSelected ? "border-primary" : "border-white/10 group-hover:border-white/40"
      )} />
    </motion.div>
  );
};

const HeroSection: React.FC<HeroSectionProps> = ({ selectedGenre, onSelectGenre, onSearch }) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const backgroundScale = useTransform(scrollYProgress, [0, 1], [1.1, 1.25]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-[600px] md:min-h-[800px] mb-20 overflow-hidden flex flex-col items-center justify-center"
    >
      {/* Background Container - FULL WIDTH EDGE-TO-EDGE */}
      <div className="absolute inset-0 z-0 w-full h-full overflow-hidden">
        <motion.img
          style={{
            y: backgroundY,
            scale: backgroundScale,
          }}
          src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&q=80&w=2000"
          srcSet="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&q=80&w=640 640w,
                  https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&q=80&w=1200 1200w,
                  https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&q=80&w=2000 2000w"
          sizes="100vw"
          alt="Studio Background"
          initial={{ scale: 1.4, opacity: 0 }}
          animate={{ scale: 1.1, opacity: 1 }}
          transition={{ duration: 1.8, ease: "easeOut" }}
          className="w-full h-full object-cover grayscale-[0.4] contrast-[1.1] brightness-[0.6] blur-[1px]"
          // @ts-ignore
          fetchPriority="high"
        />

        {/* Cinematic Film Grain Texture Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04] z-[1]"
          style={{ backgroundImage: `url('https://grainy-gradients.vercel.app/noise.svg')` }} />

        {/* Cinematic Overlays for Text Legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-dark/90 via-dark/30 to-dark z-[2]" />
        <div className="absolute inset-0 bg-black/50 z-[2]" />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-6 flex flex-col items-center pt-12 md:pt-0">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center w-full flex flex-col items-center"
        >
          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="font-wide text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black uppercase italic tracking-tighter text-white mb-8 drop-shadow-[0_10px_40px_rgba(0,0,0,0.8)] leading-[0.9] select-none"
          >
            Multi Platinum <span className="text-primary block md:inline drop-shadow-[0_0_30px_rgba(255,46,46,0.5)]">Beats</span>
          </motion.h1>

          {/* Search Form - Visible and centered */}
          <form onSubmit={handleSubmit} className="w-full max-w-3xl relative group mb-16">
            <motion.div
              animate={{
                scale: isFocused ? 1.05 : 1,
              }}
              className="absolute inset-y-0 left-6 flex items-center pointer-events-none z-10"
            >
              <Search className={cn("w-5 h-5 transition-colors duration-300", isFocused ? "text-primary" : "text-gray-400")} />
            </motion.div>
            <motion.input
              type="text"
              value={query}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChange={(e) => {
                setQuery(e.target.value);
                onSearch(e.target.value);
              }}
              animate={{
                backgroundColor: isFocused ? "rgba(22, 22, 26, 0.6)" : "rgba(22, 22, 26, 0.35)",
                borderColor: isFocused ? "rgba(168, 85, 247, 0.5)" : "rgba(255, 255, 255, 0.08)",
                boxShadow: isFocused ? "0 20px 60px rgba(0, 0, 0, 0.8)" : "0 10px 30px rgba(0,0,0,0.4)"
              }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              placeholder="Find your vibe..."
              className="w-full h-16 md:h-18 bg-dark-card/20 backdrop-blur-3xl border rounded-2xl pl-16 pr-40 text-lg md:text-xl outline-none transition-all text-white placeholder:text-gray-600 font-bold"
            />
            <div className="absolute inset-y-0 right-2 flex items-center">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="h-[calc(100%-1rem)] px-8 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-primary/20"
              >
                Discover
              </motion.button>
            </div>
          </form>
        </motion.div>

        {/* Genres Grid - Force 5 columns on mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="grid grid-cols-5 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-6 w-full max-w-6xl perspective-1000"
        >
          {GENRES.map((genre, i) => (
            <TiltCard
              key={genre.id}
              genre={genre}
              isSelected={selectedGenre === genre.id}
              onClick={() => onSelectGenre(genre.id)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;