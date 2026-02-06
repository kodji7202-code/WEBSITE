
import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Share2, MessageSquare, ArrowLeft } from 'lucide-react';
import { SoundKit } from '../types';
import { cn } from '../lib/utils';

interface SoundKitDetailProps {
  kit: SoundKit;
  onBack: () => void;
  onAddToCart: (kit: SoundKit) => void;
  isInCart: boolean;
}

const SoundKitDetail: React.FC<SoundKitDetailProps> = ({ kit, onBack, onAddToCart, isInCart }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-7xl mx-auto px-6 py-12"
    >
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-12 uppercase font-black text-xs tracking-widest group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Kits
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-16">
        {/* Left Column: Image and Actions */}
        <div className="flex flex-col gap-6">
          <div className="aspect-square w-full rounded-sm overflow-hidden border border-white/5 shadow-2xl">
            <img src={kit.coverUrl} alt={kit.title} className="w-full h-full object-cover" />
          </div>

          <div className="flex items-center gap-4 mt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onAddToCart(kit)}
              className={cn(
                "w-full flex items-center justify-center gap-3 py-4 rounded-md font-black uppercase tracking-widest shadow-xl transition-all",
                isInCart
                  ? "bg-green-600 text-white shadow-green-600/20"
                  : "bg-[#e11d48] text-white shadow-red-600/20 hover:bg-[#be123c]"
              )}
            >
              <ShoppingCart size={20} />
              <span>{isInCart ? 'Added' : `$${kit.price}`}</span>
            </motion.button>
          </div>
        </div>

        {/* Right Column: Information */}
        <div className="flex flex-col">
          <div className="flex justify-between items-start mb-1">
            <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tight text-white italic">
              {kit.title}
            </h1>
            <span className="text-gray-500 font-bold text-xs uppercase tracking-widest mt-4">
              {kit.timestamp || 'Just now'}
            </span>
          </div>

          <h2 className="text-gray-500 font-bold text-lg uppercase tracking-tight mb-8">
            {kit.type}
          </h2>

          <div className="space-y-8 max-w-3xl">
            <div className="space-y-4">
              <p className="text-gray-400 text-lg font-medium leading-relaxed">
                Lejja - {kit.title}
              </p>
              <p className="text-gray-400 text-base leading-relaxed">
                {kit.longDescription || kit.description}
              </p>
            </div>

            {kit.contents && (
              <div className="space-y-6 pt-8 border-t border-white/5">
                <h3 className="text-white font-black uppercase text-sm tracking-[0.2em]">
                  Content inside this kit:
                </h3>
                <ul className="space-y-3 font-bold text-gray-300 uppercase tracking-tighter text-sm">
                  {kit.contents.map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <span className="w-1 h-1 bg-primary rounded-full" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SoundKitDetail;
