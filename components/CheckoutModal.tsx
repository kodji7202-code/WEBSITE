import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Music, CreditCard, ShoppingCart, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { CartItem, Track, License } from '../types';
import { supabase } from '../lib/supabase';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  total?: string;
  beatName?: string | null;
  track?: Track | null;
  cart?: CartItem[];
  globalLicenses: License[];
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, total, beatName, track, cart, globalLicenses }) => {
  const [currentLicenseId, setCurrentLicenseId] = useState('mp3');
  const [loading, setLoading] = useState(false);

  // Determine available licenses for current track (Single Buy context)
  const availableLicenses = track
    ? globalLicenses.filter(l => {
      if (l.id === 'mp3') return !!track.mp3Path;
      if (l.id === 'wav') return !!track.wavPath;
      if (l.id === 'unlimited') return track.mp3Path && track.wavPath && track.stemsPath;
      return false;
    })
    : globalLicenses;

  // Set default license if current selected is not available
  useEffect(() => {
    if (!isCartCheckout && availableLicenses.length > 0) {
      if (!availableLicenses.find(l => l.id === currentLicenseId)) {
        setCurrentLicenseId(availableLicenses[0].id);
      }
    }
  }, [availableLicenses, isOpen]);

  const activeLicense = availableLicenses.find(l => l.id === currentLicenseId) || availableLicenses[0] || globalLicenses[0];
  const isCartCheckout = beatName === "Your Cart Items" && cart && cart.length > 0;

  // Calculate display total
  const displayTotal = isCartCheckout && total ? total : activeLicense?.price;

  const handleCheckout = async () => {
    setLoading(true);

    try {
      const storageItems: { name: string; license: string; downloadUrl?: string }[] = [];
      // Payload sent to backend will now include file names/paths and Stripe Price IDs dynamically
      const payloadItems: { license: string; name: string; url: string; priceId: string }[] = [];

      // 1. Prepare Payload
      if (isCartCheckout && cart) {
        cart.forEach((item) => {
          if (item.type === 'track') {
            // Determine correct file based on license path mapping
            let fileUrl = '';
            if (item.license.id === 'mp3') fileUrl = item.track.mp3Path || '';
            else if (item.license.id === 'wav') fileUrl = item.track.wavPath || '';
            else if (item.license.id === 'unlimited') fileUrl = item.track.stemsPath || item.track.wavPath || '';

            const trackName = item.track.title;

            // Find price ID from global license object stored in cart
            const priceId = item.license.stripeId;
            if (!priceId) throw new Error(`Missing price configuration for ${trackName}`);

            payloadItems.push({
              license: item.license.id,
              name: trackName,
              url: fileUrl,
              priceId: priceId
            });

            storageItems.push({
              name: trackName.toUpperCase().replace(/\s+/g, '_'),
              license: item.license.id,
              downloadUrl: fileUrl
            });
          } else if (item.type === 'soundkit') {
            const kitName = item.kit.title;
            const priceId = item.kit.stripePriceId;
            const fileUrl = item.kit.fileUrl || '';

            if (!priceId) {
              console.warn(`Skipping ${kitName}: Missing Stripe Price ID`);
              // Optional: throw error if strict? Or just skip? User needs to know.
              // Let's throw to block checkout and prompt user to fix admin data
              throw new Error(`Sound Kit '${kitName}' is missing Stripe Price ID. Contact support.`);
            }

            payloadItems.push({
              license: 'soundkit', // custom type for backend to handle or valid string
              name: kitName,
              url: fileUrl,
              priceId: priceId
            });

            storageItems.push({
              name: kitName.toUpperCase().replace(/\s+/g, '_'),
              license: 'Usage License',
              downloadUrl: fileUrl
            });
          }
        });
      } else {
        // Single Item Checkout
        let fileUrl = '';
        if (activeLicense.id === 'mp3') fileUrl = track?.mp3Path || '';
        else if (activeLicense.id === 'wav') fileUrl = track?.wavPath || '';
        else if (activeLicense.id === 'unlimited') fileUrl = track?.stemsPath || track?.wavPath || '';

        const trackName = beatName || 'BEAT';
        const priceId = activeLicense.stripeId;

        if (!priceId) throw new Error("Price configuration missing for selected license.");

        payloadItems.push({
          license: activeLicense.id,
          name: trackName,
          url: fileUrl,
          priceId: priceId
        });

        storageItems.push({
          name: trackName.toUpperCase().replace(/\s+/g, '_'),
          license: activeLicense.id,
          downloadUrl: fileUrl
        });
      }

      if (payloadItems.length === 0) {
        throw new Error("No valid items for checkout.");
      }

      // 2. Save metadata for success page
      localStorage.setItem('paidItems', JSON.stringify(storageItems));

      // 3. Invoke Supabase Edge Function
      console.log("🚀 Invoking checkout function...");
      console.log("Payload:", JSON.stringify({ cartItems: payloadItems, origin: window.location.origin }, null, 2));

      const { data, error } = await supabase.functions.invoke('checkout', {
        body: {
          cartItems: payloadItems,
          origin: window.location.origin
        }
      });

      console.log("🏁 Checkout Function Response:");
      console.log("Data:", data);
      console.log("Error Object:", error);

      if (error) {
        // Extract body if possible
        let errorMessage = error.message;
        try {
          // Sometimes error body is hidden in context
          if (error.context && error.context.json) {
            const body = await error.context.json();
            console.log("Error Body:", body);
            if (body.error) errorMessage = body.error;
          }
        } catch (e) { /* ignore */ }

        throw new Error(errorMessage || "Failed to create checkout session");
      }

      if (!data?.url) throw new Error("No checkout URL returned");

      // 4. Redirect
      window.location.href = data.url;

    } catch (error: any) {
      console.error("❌ Checkout Exception:", error);
      alert(`Payment Error: ${error.message}`);
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-sm cursor-pointer"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-[460px] bg-white rounded-[32px] overflow-hidden shadow-[0_30px_60px_-12px_rgba(0,0,0,0.6)] flex flex-col items-center p-8 md:p-12 pt-14 text-gray-900"
          >
            <button onClick={onClose} className="absolute top-6 right-6 text-gray-300 hover:text-gray-900 transition-colors">
              <X size={24} />
            </button>

            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-4 py-1.5 bg-gray-100 rounded-full mb-4 border border-gray-200"
              >
                {isCartCheckout ? <ShoppingCart size={12} className="text-primary" /> : <Music size={12} className="text-primary" />}
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 truncate max-w-[220px]">
                  {beatName || (track ? track.title : 'Selection')}
                </span>
              </motion.div>
            </AnimatePresence>

            <motion.div
              key={displayTotal}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center mb-2"
            >
              <h2 className="text-[56px] font-bold text-[#1f2937] leading-none tracking-tighter">
                ${displayTotal}
              </h2>
            </motion.div>

            <p className="text-[#9ca3af] text-sm font-bold uppercase tracking-widest mb-8">
              {isCartCheckout ? `Total for ${cart?.length} items` : `${activeLicense?.name || 'License'} Selected`}
            </p>

            {!isCartCheckout && (
              <div className="w-full flex p-1.5 bg-gray-100 rounded-2xl mb-10 gap-1 overflow-x-auto">
                {availableLicenses.map((lic) => (
                  <button
                    key={lic.id}
                    onClick={() => setCurrentLicenseId(lic.id)}
                    className={cn(
                      "flex-1 py-3 px-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap",
                      currentLicenseId === lic.id
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-400 hover:text-gray-600"
                    )}
                  >
                    {lic.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            )}



            <button
              onClick={handleCheckout}
              disabled={loading || (!isCartCheckout && availableLicenses.length === 0)}
              className="group w-full h-[64px] bg-[#635bff] hover:bg-[#5a52e5] transition-all duration-300 rounded-[14px] flex items-center justify-center gap-3 mb-10 shadow-lg shadow-indigo-100 active:scale-[0.98] disabled:opacity-70 disabled:cursor-wait"
            >
              {loading ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <CreditCard className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />}
              <span className="text-white font-bold text-lg">
                {loading ? 'Processing...' : 'Pay with Card'}
              </span>
            </button>

            <div className="text-center">
              <p className="text-[9px] text-gray-400 uppercase tracking-widest">Secured by Stripe</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CheckoutModal;