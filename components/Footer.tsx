
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Twitter, Instagram, Youtube, Mail, ArrowUpRight, Github, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { View } from '../types';

interface FooterLinkProps {
  label: string;
  onClick: () => void;
  disableScroll?: boolean;
}

const FooterLink: React.FC<FooterLinkProps> = ({ label, onClick, disableScroll }) => (
  <li>
    <motion.button
      onClick={(e) => {
        e.preventDefault();
        onClick();
        if (!disableScroll) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }}
      whileHover={{ x: 4, color: '#a855f7' }}
      className="text-gray-500 hover:text-primary transition-colors text-sm font-medium flex items-center gap-1 group text-left w-full"
    >
      {label}
      <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.button>
  </li>
);

const Footer: React.FC<{ onNavigate: (view: View) => void }> = ({ onNavigate }) => {
  const currentYear = new Date().getFullYear();
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 3000);
  };

  const scrollToTrending = () => {
    onNavigate('Beats');
    // Allow view transition to start before scrolling
    setTimeout(() => {
      const trendingSection = document.getElementById('trending-catalog');
      if (trendingSection) {
        trendingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const scrollToPricing = () => {
    onNavigate('Beats');
    setTimeout(() => {
      const pricingSection = document.getElementById('pricing');
      if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <footer className="bg-dark border-t border-white/5 pt-20 pb-12 mt-auto">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          {/* Brand Section */}
          <div className="space-y-6">
            <div
              onClick={() => onNavigate('Beats')}
              className="cursor-pointer group inline-block"
            >
              <span className="text-3xl font-serif text-white tracking-wide">Lejja</span>
              <p className="text-[10px] text-primary font-black uppercase tracking-[0.3em] mt-1 opacity-0 group-hover:opacity-100 transition-opacity">SonicSphere</p>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              Providing industry-standard instrumentals and sound kits for the next generation of multi-platinum artists.
            </p>
            <div className="flex items-center gap-4">
              {[
                { Icon: Instagram, href: "https://instagram.com" },
                { Icon: Twitter, href: "https://twitter.com" },
                { Icon: Youtube, href: "https://youtube.com" },
                { Icon: Github, href: "https://github.com" }
              ].map(({ Icon, href }, i) => (
                <motion.a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -4, scale: 1.1 }}
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-primary/50 transition-all"
                >
                  <Icon size={18} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Catalog Section */}
          <div>
            <h4 className="text-white font-black uppercase text-xs tracking-[0.2em] mb-8">Catalog</h4>
            <ul className="space-y-4">
              <FooterLink onClick={scrollToTrending} label="Latest Beats" disableScroll={true} />
              <FooterLink onClick={() => onNavigate('Sound Kits')} label="Drum Kits" />
              <FooterLink onClick={() => onNavigate('Sound Kits')} label="Melody Packs" />
            </ul>
          </div>

          {/* Support Section */}
          <div>
            <h4 className="text-white font-black uppercase text-xs tracking-[0.2em] mb-8">Support</h4>
            <ul className="space-y-4">
              <FooterLink onClick={() => onNavigate('FAQ')} label="Help Center / FAQ" />
              <FooterLink onClick={() => onNavigate('Contact')} label="Contact Us" />
              <FooterLink onClick={scrollToPricing} label="Licensing Info" disableScroll={true} />
              <FooterLink onClick={() => onNavigate('Terms')} label="Terms of Service" />
            </ul>
          </div>

          {/* Newsletter Section */}
          <div className="space-y-6">
            <h4 className="text-white font-black uppercase text-xs tracking-[0.2em] mb-2">Newsletter</h4>
            <p className="text-gray-500 text-sm">Stay updated with the latest drops and exclusive deals.</p>
            <form className="relative" onSubmit={handleSubscribe}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-sm outline-none focus:border-primary/50 transition-all text-white placeholder:text-gray-600"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 bottom-2 px-4 bg-white text-dark rounded-lg flex items-center justify-center hover:bg-primary hover:text-white transition-all disabled:opacity-50"
                disabled={subscribed}
              >
                {subscribed ? <CheckCircle2 size={16} className="text-green-500" /> : <Mail size={16} />}
              </button>
              <AnimatePresence>
                {subscribed && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute -bottom-6 left-0 text-[10px] text-green-500 font-bold uppercase tracking-widest"
                  >
                    Successfully subscribed!
                  </motion.p>
                )}
              </AnimatePresence>
            </form>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-600 text-[11px] font-medium uppercase tracking-widest">
            © {currentYear} LEJJA BEATS. All Rights Reserved.
          </p>
          <div className="flex items-center gap-8 text-[11px] font-black uppercase tracking-widest text-gray-600">
            <button onClick={() => onNavigate('Privacy')} className="hover:text-white transition-colors">Privacy Policy</button>
            <button onClick={() => onNavigate('Refunds')} className="hover:text-white transition-colors">Refund Policy</button>
            <button onClick={() => onNavigate('Sitemap')} className="hover:text-white transition-colors">Sitemap</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
