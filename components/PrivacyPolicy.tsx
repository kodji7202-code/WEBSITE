import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, Eye, Shield, Server } from 'lucide-react';

interface PrivacyPolicyProps {
    onBack: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="py-12 max-w-4xl mx-auto px-6 text-gray-300"
        >
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8 uppercase font-black text-xs tracking-widest"
            >
                <ArrowLeft size={16} /> Back
            </button>

            <div className="flex items-start gap-4 mb-12">
                <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20">
                    <Lock className="w-8 h-8 text-primary" />
                </div>
                <div>
                    <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white mb-2">
                        Privacy Policy
                    </h1>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Last Updated: February 2026</p>
                </div>
            </div>

            <div className="space-y-12 bg-dark-card border border-white/5 p-8 md:p-12 rounded-3xl">

                {/* Section 1 */}
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <Eye className="text-primary" size={20} />
                        <h2 className="text-xl font-bold uppercase tracking-wide text-white">1. Data Collection</h2>
                    </div>
                    <div className="space-y-4 text-sm leading-relaxed text-gray-400">
                        <p>
                            When you purchase a beat or sound kit from Lejja Beats, we collect personal information necessary to process your transaction and deliver your digital products. This typically includes your name, email address, and payment information (handled securely via Stripe).
                        </p>
                        <p>
                            We do NOT store your full credit card details on our servers. All sensitive payment data is encrypted and processed by our payment provider, Stripe, which adheres to the highest security standards (PCI-DSS compliant).
                        </p>
                    </div>
                </section>

                <hr className="border-white/5" />

                {/* Section 2 */}
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <Server className="text-primary" size={20} />
                        <h2 className="text-xl font-bold uppercase tracking-wide text-white">2. Usage of Data</h2>
                    </div>
                    <div className="space-y-4 text-sm leading-relaxed text-gray-400">
                        <p>
                            We use your email address to send you download links for your purchased products and, if you opt-in, to notify you about new beat drops, sales, and exclusive offers. You can unsubscribe from marketing emails at any time.
                        </p>
                        <p>
                            We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties, except for trusted third parties who assist us in operating our website, conducting our business, or servicing you (e.g., Stripe, Supabase), so long as those parties agree to keep this information confidential.
                        </p>
                    </div>
                </section>

                <hr className="border-white/5" />

                {/* Section 3 */}
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <Shield className="text-primary" size={20} />
                        <h2 className="text-xl font-bold uppercase tracking-wide text-white">3. Security</h2>
                    </div>
                    <div className="space-y-4 text-sm leading-relaxed text-gray-400">
                        <p>
                            We implement a variety of security measures to maintain the safety of your personal information. Our website uses Secure Socket Layer (SSL) technology to encrypt all communication between your browser and our servers.
                        </p>
                    </div>
                </section>
            </div>
        </motion.div>
    );
};

export default PrivacyPolicy;
