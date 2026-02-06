import { motion, AnimatePresence } from 'framer-motion';
import { Mic2, Music, Sliders, Check, ChevronDown } from 'lucide-react';
import React, { useState } from 'react';
import { cn } from '../lib/utils';

const SERVICES = [
    {
        icon: Sliders,
        title: "Mixing",
        price: "$100",
        description: "Professional mixing to balance your track and make it radio-ready.",
        features: [
            "Vocal Tuning & Cleanup",
            "EQ & Compression",
            "Dynamic Processing",
            "Stereo Imaging",
            "2 Revisions Included"
        ]
    },
    {
        icon: Music,
        title: "Mastering",
        price: "$50",
        description: "The final polish to ensure your song sounds loud and clear on all platforms.",
        features: [
            "Loudness Optimization",
            "Tonal Balance",
            "Analog Saturation",
            "Metadata Encoding",
            "Streaming Platform Ready"
        ]
    },
    {
        icon: Mic2,
        title: "Full Production",
        price: "$500+",
        description: "Custom beat production tailored specifically to your style and vision.",
        features: [
            "Custom Instrumental",
            "Exclusive Rights",
            "Full Stems Included",
            "Mixing & Mastering Included",
            "Direct Collaboration"
        ]
    }
];

interface ServicesProps {
    onBookNow?: () => void;
}

const MobileServiceItem = ({ service, onBookNow }: { service: typeof SERVICES[0], onBookNow?: () => void }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-dark-card border border-white/5 rounded-xl overflow-hidden shadow-lg">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-5 bg-white/5 active:bg-white/10 transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-dark rounded-lg flex items-center justify-center text-primary">
                        <service.icon size={20} />
                    </div>
                    <div className="text-left">
                        <span className="block text-lg font-black uppercase italic tracking-tighter text-white">{service.title}</span>
                        <span className="block text-xs font-bold text-primary">{service.price}</span>
                    </div>
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
                            <p className="text-xs text-gray-400 leading-relaxed mb-6 mt-4">{service.description}</p>
                            <ul className="space-y-3 mb-6">
                                {service.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3 text-xs font-bold text-gray-300">
                                        <Check size={14} className="text-primary" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={onBookNow}
                                className="w-full py-3 bg-white text-dark font-black uppercase tracking-widest rounded-lg hover:bg-primary hover:text-white transition-all active:scale-95 text-xs"
                            >
                                Book Now
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const Services: React.FC<ServicesProps> = ({ onBookNow }) => {
    return (
        <div className="py-24 max-w-7xl mx-auto px-6">
            <div className="text-center mb-10 md:mb-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h2 className="text-sm font-black uppercase tracking-[0.5em] text-primary mb-4">Professional</h2>
                    <h3 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-white">Services</h3>
                </motion.div>
            </div>

            {/* Mobile Accordion */}
            <div className="flex flex-col gap-3 md:hidden">
                {SERVICES.map((service) => (
                    <MobileServiceItem key={service.title} service={service} onBookNow={onBookNow} />
                ))}
            </div>

            {/* Desktop Grid */}
            <div className="hidden md:grid md:grid-cols-3 gap-8">
                {SERVICES.map((service, index) => (
                    <motion.div
                        key={service.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-dark-card border border-white/5 rounded-3xl p-8 hover:border-primary/50 transition-all group"
                    >
                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-white transition-colors">
                            <service.icon size={32} />
                        </div>

                        <h4 className="text-2xl font-black uppercase italic mb-2">{service.title}</h4>
                        <div className="text-3xl font-black text-primary mb-4">{service.price}</div>
                        <p className="text-gray-400 text-sm leading-relaxed mb-8">{service.description}</p>

                        <ul className="space-y-4 mb-8">
                            {service.features.map((feature, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm font-bold text-gray-300">
                                    <Check size={16} className="text-primary" />
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={onBookNow}
                            className="w-full py-4 bg-white text-dark font-black uppercase tracking-widest rounded-xl hover:bg-primary hover:text-white transition-all active:scale-95"
                        >
                            Book Now
                        </button>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Services;
