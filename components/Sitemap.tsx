import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Map, Music, Box, Phone, HelpCircle, FileText } from 'lucide-react';
import { View } from '../types';

interface SitemapProps {
    onBack: () => void;
    onNavigate: (view: View) => void;
}

const Sitemap: React.FC<SitemapProps> = ({ onBack, onNavigate }) => {
    const sections = [
        {
            title: "Main Catalog",
            icon: Music,
            links: [
                { label: "Latest Beats", view: 'Beats' as View },
                { label: "Trending Catalog", view: 'Beats' as View }, // Could scroll to trending
            ]
        },
        {
            title: "Products",
            icon: Box,
            links: [
                { label: "Drum Kits", view: 'Sound Kits' as View },
                { label: "Melody Packs", view: 'Sound Kits' as View },
                { label: "Services", view: 'Services' as View },
            ]
        },
        {
            title: "Support",
            icon: HelpCircle,
            links: [
                { label: "Help Center / FAQ", view: 'FAQ' as View },
                { label: "Contact Us", view: 'Contact' as View },
            ]
        },
        {
            title: "Legal",
            icon: FileText,
            links: [
                { label: "Terms of Service", view: 'Terms' as View },
                { label: "Privacy Policy", view: 'Privacy' as View },
                { label: "Refund Policy", view: 'Refunds' as View },
            ]
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="py-12 max-w-5xl mx-auto px-6"
        >
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8 uppercase font-black text-xs tracking-widest"
            >
                <ArrowLeft size={16} /> Back
            </button>

            <div className="flex items-center gap-4 mb-16 border-b border-white/10 pb-8">
                <Map className="w-10 h-10 text-primary" />
                <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-white">
                    Sitemap
                </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {sections.map((section, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-dark-card border border-white/5 p-8 rounded-3xl hover:border-primary/30 transition-colors group"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <section.icon size={24} className="text-gray-500 group-hover:text-primary transition-colors" />
                            <h3 className="text-lg font-black uppercase tracking-wider text-white">{section.title}</h3>
                        </div>
                        <ul className="space-y-4">
                            {section.links.map((link, i) => (
                                <li key={i}>
                                    <button
                                        onClick={() => onNavigate(link.view)}
                                        className="text-gray-400 hover:text-white text-sm font-bold uppercase tracking-wide flex items-center gap-2 transition-all hover:translate-x-2"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-primary transition-colors"></span>
                                        {link.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                ))}
            </div>

        </motion.div>
    );
};

export default Sitemap;
