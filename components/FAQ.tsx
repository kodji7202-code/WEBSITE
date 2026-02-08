
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, HelpCircle } from 'lucide-react';
import { cn } from '../lib/utils';

const FAQ_ITEMS = [
  {
    question: "Are beats tagged after purchase?",
    answer: "No, all licensed versions (MP3, WAV, or Stems) are delivered untagged without any voice tags or watermarks."
  },
  {
    question: "What payment methods are accepted?",
    answer: "We accept all major credit cards (Visa, Mastercard, Amex), PayPal, and Apple Pay through our secure processing system."
  },
  {
    question: "Can I immediately download beats after payment?",
    answer: "Yes! Immediately after your payment is processed, you will be redirected to a download page, and an email with download links will be sent to you instantly."
  },
  {
    question: "How can I find a specific beat in the store?",
    answer: "You can use the search bar at the top of the catalog to search by title, artist, or vibe. You can also filter by genre using the category cards."
  },
  {
    question: "What should I do when my license expires?",
    answer: "If you reach the distribution or stream limit of your current license, you can simply 'upgrade' by paying the difference for a higher tier license."
  },
  {
    question: "Can others use the beat I've licensed?",
    answer: "Yes, standard leases are non-exclusive. This means other artists can also lease the same beat until someone purchases the Exclusive rights."
  },
  {
    question: "Lease vs. Exclusive Rights: What's the difference?",
    answer: "A lease gives you limited rights to use the beat for a project. Exclusive rights mean you own the beat entirely, and it is removed from our store forever."
  },
  {
    question: "Will the beat be removed from the store once licensed?",
    answer: "The beat will only be removed from the store if you purchase the 'Exclusive' license. For all other tiers, the beat remains available for others."
  }
];

import { supabase } from '../lib/supabase';

// ...

interface FAQProps {
  onContactClick?: () => void;
  isContactMode?: boolean;
}

const FAQ: React.FC<FAQProps> = ({ onContactClick, isContactMode = false }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const fullName = (formData.get('full_name') as string || '').trim();
    const emailValue = (formData.get('email') as string || '').trim();
    const subject = (formData.get('subject') as string || '').trim();
    const message = (formData.get('message') as string || '').trim();

    // Validation
    if (fullName.length < 2) {
      setError('Please enter your full name (at least 2 characters).');
      setSending(false);
      return;
    }
    if (!emailValue || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      setError('Please enter a valid email address.');
      setSending(false);
      return;
    }
    if (message.length < 10) {
      setError('Please write a message (at least 10 characters).');
      setSending(false);
      return;
    }

    const data = { full_name: fullName, email: emailValue, subject, message };

    try {
      const { error: dbError } = await supabase
        .from('contact_messages')
        .insert([data]);

      if (dbError) throw dbError;

      setSent(true);
      setTimeout(() => {
        setSent(false);
        if (onContactClick) onContactClick();
      }, 3000);
    } catch (err) {
      console.error(err);
      setError('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (isContactMode) {
    return (
      <div className="py-24 max-w-2xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-white">
              <HelpCircle size={32} />
            </div>
          </div>
          <h2 className="text-sm font-black uppercase tracking-[0.5em] text-primary mb-4">Get in Touch</h2>
          <h3 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white">Contact Support</h3>
        </motion.div>

        {sent ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-green-500/10 border border-green-500/20 p-8 rounded-3xl text-center">
            <h4 className="text-2xl font-black uppercase text-green-500 mb-2">Message Sent!</h4>
            <p className="text-gray-400">We've received your inquiry and will get back to you shortly.</p>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 bg-dark-card border border-white/5 p-8 md:p-12 rounded-[40px] shadow-2xl"
            onSubmit={handleSubmit}
          >
            {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-center font-bold text-sm">{error}</div>}

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-4">Full Name</label>
              <input required name="full_name" type="text" placeholder="ENTER YOUR NAME" className="w-full bg-dark-soft border border-white/10 rounded-2xl px-6 py-4 text-white font-bold placeholder:text-gray-600 focus:border-primary focus:outline-none transition-all" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-4">Email Address</label>
              <input required name="email" type="email" placeholder="ENTER YOUR EMAIL" className="w-full bg-dark-soft border border-white/10 rounded-2xl px-6 py-4 text-white font-bold placeholder:text-gray-600 focus:border-primary focus:outline-none transition-all" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-4">Subject</label>
              <select name="subject" className="w-full bg-dark-soft border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:border-primary focus:outline-none transition-all appearance-none cursor-pointer">
                <option value="General Inquiry">General Inquiry</option>
                <option value="Order Issue">Order Issue</option>
                <option value="Custom Service Booking">Custom Service Booking</option>
                <option value="Exclusive Rights">Exclusive Rights</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-4">Message</label>
              <textarea required name="message" rows={5} placeholder="HOW CAN WE HELP?" className="w-full bg-dark-soft border border-white/10 rounded-2xl px-6 py-4 text-white font-bold placeholder:text-gray-600 focus:border-primary focus:outline-none transition-all resize-none"></textarea>
            </div>

            <button disabled={sending} className="w-full py-5 bg-white text-dark font-black uppercase tracking-widest rounded-2xl hover:bg-primary hover:text-white transition-all shadow-xl mt-4 disabled:opacity-50 disabled:cursor-not-allowed">
              {sending ? 'Sending...' : 'Send Message'}
            </button>
          </motion.form>
        )}
      </div>
    );
  }

  return (
    <div className="py-24 max-w-4xl mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <HelpCircle size={32} />
          </div>
        </div>
        <h2 className="text-sm font-black uppercase tracking-[0.5em] text-secondary mb-4">Support Center</h2>
        <h3 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white">Frequently Asked Questions</h3>
      </motion.div>

      <div className="space-y-3">
        {FAQ_ITEMS.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className={cn(
                "group rounded-2xl border transition-all duration-300 overflow-hidden",
                isOpen
                  ? "bg-dark-card border-primary/30 shadow-[0_10px_40px_rgba(168,85,247,0.1)]"
                  : "bg-dark-soft/40 border-white/5 hover:border-white/20 hover:bg-dark-soft/60"
              )}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className={cn(
                  "text-base md:text-lg font-bold transition-colors uppercase tracking-tight",
                  isOpen ? "text-primary" : "text-gray-200 group-hover:text-white"
                )}>
                  {item.question}
                </span>
                <ChevronRight
                  className={cn(
                    "w-5 h-5 transition-transform duration-300",
                    isOpen ? "rotate-90 text-primary" : "text-gray-500"
                  )}
                />
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-6 pt-0 border-t border-white/5 mt-2">
                      <p className="text-gray-400 leading-relaxed pt-4">
                        {item.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div className="mt-20 p-8 bg-primary/5 rounded-3xl border border-primary/10 text-center">
        <p className="text-gray-400 mb-6">Don't see your question here? Our team is ready to help.</p>
        <button
          onClick={onContactClick}
          className="px-10 py-4 bg-white text-dark font-black uppercase tracking-widest text-xs rounded-xl hover:bg-primary hover:text-white transition-all shadow-xl active:scale-95"
        >
          Contact Support
        </button>
      </div>
    </div>
  );
};

export default FAQ;
