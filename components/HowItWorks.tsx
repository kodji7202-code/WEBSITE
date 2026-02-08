
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, Download, Check, X, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';

// Helper for Mobile Accordion
const MobileLicenseItem = ({ license, onReadLicense }: { license: typeof LICENSES[0], onReadLicense: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-dark-card border border-white/5 rounded-xl overflow-hidden shadow-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 bg-white/5 active:bg-white/10 transition-colors"
      >
        <div className="flex items-center gap-4">
          <span className="text-xl font-black uppercase italic tracking-tighter text-white">{license.name}</span>
          <span className="text-xs font-black px-2 py-1 bg-primary/20 text-primary rounded-md">{license.price}</span>
        </div>
        <ChevronDown
          className={cn("w-5 h-5 text-gray-400 transition-transform duration-300", isOpen && "rotate-180")}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-5 pt-0 border-t border-white/5 bg-dark-soft/20">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-6 mt-4">{license.subtitle}</p>
              <ul className="space-y-3 mb-6">
                {license.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-3 h-3 mt-0.5 text-primary" strokeWidth={3} />
                    <span className="text-[11px] font-bold text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={onReadLicense}
                className="w-full py-3 bg-white text-dark font-black uppercase text-[10px] tracking-widest rounded-lg"
              >
                Read License
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const STEPS = [
  {
    title: 'Browse Beats',
    description: 'Find your perfect sound from our curated catalog of industry-standard instrumentals.',
    icon: Search,
    color: 'from-primary to-purple-400',
    shadow: 'shadow-primary/20',
  },
  {
    title: 'Choose License',
    description: 'Select the license that fits your project, from MP3 leases to unlimited rights.',
    icon: FileText,
    color: 'from-secondary to-blue-400',
    shadow: 'shadow-secondary/20',
  },
  {
    title: 'Download Instantly',
    description: 'Get high-quality files delivered instantly to your email after checkout.',
    icon: Download,
    color: 'from-green-400 to-emerald-500',
    shadow: 'shadow-green-400/20',
  },
];

const LICENSES = [
  {
    name: 'Mp3',
    price: '$29.99',
    subtitle: 'Non-Exclusive',
    features: [
      'MP3 File',
      'Receive Files Immediately After Purchase',
      'Distribute Up To 5,000 Copies',
      '100,000 Online Audio Streams',
      '1 Music Video',
      '1 Paid Performance',
      'Radio Broadcasting Allowed (1)'
    ],
    terms: 'The MP3 License grants you a non-exclusive right to use the beat for one commercial project. You can distribute up to 5,000 copies and stream up to 100,000 times. This license is perfect for independent artists starting their journey.'
  },
  {
    name: 'Wav',
    price: '$49.99',
    subtitle: 'Non-Exclusive',
    features: [
      'MP3 and WAV File',
      'Receive Files Immediately After Purchase',
      'Distribute Up To Unlimited Copies',
      'Unlimited Online Audio Streams',
      'Unlimited Music Videos',
      'Unlimited Paid Performances',
      'Radio Broadcasting Allowed (2)'
    ],
    terms: 'The WAV License provides high-quality lossless audio. It includes unlimited distribution and streaming rights, making it the industry standard for professional singles and albums. You receive both MP3 and WAV versions.'
  },
  {
    name: 'Unlimited',
    price: '$199.99',
    subtitle: 'Non-Exclusive',
    features: [
      'MP3, WAV and STEMS File',
      'Receive Files Immediately After Purchase',
      'Distribute Up To Unlimited Copies',
      'Unlimited Online Audio Streams',
      'Unlimited Music Videos',
      'Unlimited Paid Performances',
      'Radio Broadcasting Allowed (Unlimited)'
    ],
    terms: 'The Unlimited License is the ultimate package. No caps on distribution, streaming, or performances. This is as close as you get to ownership without buying the exclusive rights. Best for high-traffic projects and label releases.'
  }
];

const HowItWorks: React.FC = () => {
  const [activeLicenseModal, setActiveLicenseModal] = useState<typeof LICENSES[0] | null>(null);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (activeLicenseModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [activeLicenseModal]);

  return (
    <div className="py-12 md:py-16 bg-dark/50 border-y border-white/5 overflow-hidden">
      {/* Licensing Comparison Section */}
      <div className="max-w-7xl mx-auto px-6 mb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-sm font-black uppercase tracking-[0.5em] text-secondary mb-4">Pricing</h2>
          <h3 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white">License Features</h3>
        </motion.div>

        {/* Mobile: Accordion Layout (Compact High-End) */}
        <div className="flex flex-col gap-3 md:hidden">
          {LICENSES.map((lic) => {
            const isExpanded = activeLicenseModal?.name === lic.name; // Re-using state for expansion strictly for UI logic if we wanted, but let's use a local state or just use the modal logic? 
            // Wait, user wants "view all at once" but collapsed. 
            // Let's use a local state for the accordion expansion, distinct from the "Read License" modal.
            // Actually, let's keep it simple: 
            // The item IS the card. 
            // Header: Name -- Price.
            // Body: Features + Button.
            return (
              <MobileLicenseItem key={lic.name} license={lic} onReadLicense={() => setActiveLicenseModal(lic)} />
            );
          })}
        </div>

        {/* Desktop: Grid Layout */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {LICENSES.map((lic, index) => (
            <motion.div
              key={lic.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "group flex flex-col p-8 rounded-lg transition-all duration-500 border h-full relative",
                "bg-dark-card text-white hover:bg-white hover:text-dark hover:border-white hover:shadow-[0_20px_80px_rgba(255,255,255,0.1)] hover:scale-105 hover:z-10",
                index === 1 ? "border-primary shadow-[0_0_30px_rgba(168,85,247,0.15)] scale-105 z-10" : "border-white/5"
              )}
            >
              {index === 1 && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg border border-white/20">
                  Most Popular
                </div>
              )}
              <h4 className="text-2xl font-black uppercase mb-2 tracking-tighter italic group-hover:text-dark">{lic.name}</h4>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-black tracking-tighter group-hover:text-dark">{lic.price}</span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest mb-10 text-gray-500 group-hover:text-dark/60">
                {lic.subtitle}
              </p>

              <ul className="flex-grow space-y-5 mb-12">
                {lic.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-start gap-3">
                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-white group-hover:text-dark transition-colors" strokeWidth={3} />
                    <span className="text-[11px] font-bold uppercase tracking-tight leading-tight text-gray-400 group-hover:text-dark/80 transition-colors">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveLicenseModal(lic);
                }}
                className={cn(
                  "w-full py-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all rounded",
                  "bg-white/5 text-gray-400 group-hover:bg-dark group-hover:text-white group-hover:hover:bg-dark-soft"
                )}
              >
                Read License
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Steps Section */}
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-sm font-black uppercase tracking-[0.5em] text-primary mb-4">The Process</h2>
          <h3 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-white">How it works</h3>
        </motion.div>

        {/* Responsive Grid: 3 cols mobile & desktop */}
        <div className="grid grid-cols-3 gap-2 md:gap-12 relative px-2 md:px-0">
          <div className="hidden md:block absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent -z-10" />

          {STEPS.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className={cn(
                "flex flex-col items-center text-center group p-2 md:p-0 rounded-xl md:rounded-none",
                "bg-white/5 md:bg-transparent border border-white/5 md:border-none" // Card style on mobile only
              )}
            >
              <div className="relative mb-2 md:mb-8">
                <div className={cn(
                  "hidden md:block absolute inset-0 bg-gradient-to-br blur-3xl opacity-20 group-hover:opacity-40 transition-opacity",
                  step.color
                )} />

                <div className={cn(
                  "w-10 h-10 md:w-24 md:h-24 rounded-xl md:rounded-3xl bg-dark-card border border-white/10 flex items-center justify-center relative z-10 transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3 shadow-2xl",
                  step.shadow
                )}>
                  <step.icon className={cn("w-5 h-5 md:w-10 md:h-10 transition-colors", "text-white group-hover:text-primary")} strokeWidth={1.5} />
                  <div className="absolute -top-1.5 -right-1.5 md:-top-3 md:-right-3 w-4 h-4 md:w-8 md:h-8 rounded-full bg-white text-dark font-black flex items-center justify-center text-[8px] md:text-xs shadow-xl">
                    {index + 1}
                  </div>
                </div>
              </div>

              <h4 className="text-[10px] md:text-2xl font-black uppercase italic tracking-tight text-white mb-1 md:mb-4 group-hover:text-primary transition-colors leading-tight">
                {step.title}
              </h4>
              <p className="text-[10px] md:text-base text-gray-500 leading-relaxed max-w-[280px] hidden md:block">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* License Modal */}
      <AnimatePresence>
        {activeLicenseModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-10">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveLicenseModal(null)}
              className="absolute inset-0 bg-black/95 backdrop-blur-md cursor-pointer"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative w-full max-w-3xl bg-dark-card border border-white/10 rounded-[32px] p-8 md:p-12 shadow-[0_40px_100px_rgba(0,0,0,1)] overflow-hidden flex flex-col max-h-full"
            >
              <div className="flex justify-between items-start mb-8 flex-shrink-0">
                <div>
                  <h3 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white">{activeLicenseModal.name} License</h3>
                  <p className="text-primary font-black uppercase text-[10px] md:text-xs tracking-[0.3em] mt-2">Legal Terms & Usage Rights</p>
                </div>
                <button
                  onClick={() => setActiveLicenseModal(null)}
                  className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all border border-white/10 group"
                >
                  <X className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" />
                </button>
              </div>

              <div className="space-y-10 text-gray-400 overflow-y-auto pr-6 custom-scrollbar scroll-smooth">
                <section>
                  <h4 className="text-white font-black uppercase text-xs tracking-[0.2em] mb-4 border-l-4 border-primary pl-4">Overview</h4>
                  <p className="leading-relaxed text-base md:text-lg">{activeLicenseModal.terms}</p>
                </section>

                <section>
                  <h4 className="text-white font-black uppercase text-xs tracking-[0.2em] mb-4 border-l-4 border-secondary pl-4">Included Rights</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeLicenseModal.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 bg-dark-soft rounded-2xl border border-white/5 transition-all hover:border-white/20">
                        <Check size={18} className="text-primary flex-shrink-0" strokeWidth={3} />
                        <span className="text-[11px] font-black uppercase tracking-tight text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="p-8 bg-primary/5 rounded-[24px] border border-primary/20 italic text-sm md:text-base text-primary/90 leading-relaxed">
                  By purchasing this license, you agree to the full terms and conditions of SonicSphere. You are granted non-exclusive rights as specified above. Redistribution or resale of the instrumental as a standalone product is strictly prohibited. This agreement is legally binding upon completion of purchase.
                </section>
              </div>

              <div className="mt-10 flex gap-4 flex-shrink-0">
                <button
                  onClick={() => setActiveLicenseModal(null)}
                  className="flex-grow py-5 bg-white text-dark font-black uppercase tracking-[0.2em] text-[10px] md:text-xs rounded-2xl hover:bg-primary hover:text-white transition-all shadow-2xl shadow-white/5 active:scale-[0.98]"
                >
                  Close Agreement
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HowItWorks;
