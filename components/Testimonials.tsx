
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { cn } from '../lib/utils';

const TESTIMONIALS = [
  {
    id: 1,
    name: "Marcus Vane",
    role: "Platinum Songwriter",
    quote: "The textures and sound selection in these kits are unmatched. SonicSphere has become my go-to for starting every major session. The quality is industry-standard right out of the box.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    rating: 5
  },
  {
    id: 2,
    name: "Elena Ross",
    role: "Independent Artist",
    quote: "I've bought dozens of beats online, but nothing sounds as 'expensive' as what I find here. The licensing is clear, and the support team actually cares about your release success.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
    rating: 5
  },
  {
    id: 3,
    name: "Jordan Beats",
    role: "Grammy-Nominated Producer",
    quote: "Lejja's ear for melody is incredible. The custom production service took my project to a level I couldn't have reached on my own. Absolute professional workflow.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
    rating: 5
  }
];

const Testimonials: React.FC = () => {
  return (
    <div className="py-24 bg-dark relative overflow-hidden">
      {/* Background Lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-sm font-black uppercase tracking-[0.5em] text-primary mb-4">Co-Signs</h2>
            <h3 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-white">Trusted by Creators</h3>
          </motion.div>
        </div>

        <div className="flex flex-col md:grid md:grid-cols-3 gap-4 md:gap-12">
          {TESTIMONIALS.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className={cn(
                "group flex items-center md:flex-col md:text-center p-4 md:p-0 bg-white/5 md:bg-transparent rounded-2xl md:rounded-none border border-white/5 md:border-none",
                "gap-4 md:gap-0"
              )}
            >
              {/* Avatar Circle */}
              <div className="relative mb-0 md:mb-6 flex-shrink-0">
                <div className="w-14 h-14 md:w-32 md:h-32 rounded-full p-0.5 md:p-1 border md:border-2 border-primary/20 group-hover:border-primary transition-colors">
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="w-full h-full object-cover rounded-full shadow-2xl grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                </div>
                {/* Decoration Desktop Only */}
                <div className="hidden md:block absolute -bottom-2 -right-2 bg-dark-card border border-white/10 p-2 rounded-full shadow-lg">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={8} className="fill-primary text-primary" />
                    ))}
                  </div>
                </div>
              </div>

              <div className="text-left md:text-center min-w-0">
                {/* Info */}
                <h4 className="text-sm md:text-xl font-black uppercase italic tracking-tight text-white mb-0.5 md:mb-2 group-hover:text-primary transition-colors truncate">
                  {item.name}
                </h4>
                <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2 md:mb-6 group-hover:text-white transition-colors truncate">
                  {item.role}
                </p>

                {/* Minimal Quote */}
                <div className="relative">
                  <p className="text-xs md:text-sm text-gray-400 leading-snug md:leading-relaxed italic max-w-xs mx-auto line-clamp-2 md:line-clamp-none">
                    "{item.quote}"
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
