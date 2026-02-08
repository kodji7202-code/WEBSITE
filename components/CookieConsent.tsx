import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X } from 'lucide-react';

const CookieConsent: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      // Small delay so it doesn't flash on mount
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie_consent', 'declined');
    setVisible(false);
    // Disable Vercel Analytics if declined
    if (typeof window !== 'undefined') {
      (window as any).va = function () { /* noop */ };
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-28 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-[200] bg-dark-card border border-white/10 rounded-2xl p-5 shadow-2xl backdrop-blur-xl"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary flex-shrink-0 mt-0.5">
              <Cookie size={18} />
            </div>
            <div className="flex-grow">
              <h4 className="text-white font-bold text-sm mb-1">Cookie Preferences</h4>
              <p className="text-gray-500 text-xs leading-relaxed mb-4">
                We use analytics cookies to improve your experience. No personal data is sold or shared.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleAccept}
                  className="px-4 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-primary/80 transition-all"
                >
                  Accept
                </button>
                <button
                  onClick={handleDecline}
                  className="px-4 py-2 bg-white/5 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-white/10 transition-all"
                >
                  Decline
                </button>
              </div>
            </div>
            <button onClick={handleDecline} className="text-gray-600 hover:text-white transition-colors flex-shrink-0">
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
