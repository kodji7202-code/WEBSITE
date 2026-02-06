import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck, Scale, FileText, AlertCircle } from 'lucide-react';

interface TermsOfServiceProps {
    onBack: () => void;
}

const TermsOfService: React.FC<TermsOfServiceProps> = ({ onBack }) => {
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
                    <Scale className="w-8 h-8 text-primary" />
                </div>
                <div>
                    <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white mb-2">
                        Terms of Service
                    </h1>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Last Updated: February 2026</p>
                </div>
            </div>

            <div className="space-y-12 bg-dark-card border border-white/5 p-8 md:p-12 rounded-3xl">

                {/* Section 1 */}
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <FileText className="text-primary" size={20} />
                        <h2 className="text-xl font-bold uppercase tracking-wide text-white">1. Licensing & Usage</h2>
                    </div>
                    <div className="space-y-4 text-sm leading-relaxed text-gray-400">
                        <p>
                            By purchasing a license from Lejja Beats (SonicSphere), you acknowledge that you do not own the rights to the underlying composition (the "Beat") unless an Exclusive Rights agreement has been signed. You are granted a non-exclusive license to use the Beat for your own recording, as defined by the specific license tier purchased (MP3 Lease, WAV Lease, or Unlimited).
                        </p>
                        <p>
                            Reselling or distributing the beat file itself (in its original or modified instrumental form) is strictly prohibited. Use of Content ID systems (such as YouTube Content ID) on derivative works created with Non-Exclusive licenses is strictly prohibited, as this interferes with the rights of other licensees.
                        </p>
                    </div>
                </section>

                <hr className="border-white/5" />

                {/* Section 2 */}
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <ShieldCheck className="text-primary" size={20} />
                        <h2 className="text-xl font-bold uppercase tracking-wide text-white">2. Payments & Refunds</h2>
                    </div>
                    <div className="space-y-4 text-sm leading-relaxed text-gray-400">
                        <p>
                            All purchases are final. Due to the digital nature of our products (downloadable audio files), we cannot offer refunds once a download link has been generated or accessed. Please listen to the provided previews carefully before making a purchase.
                        </p>
                        <p>
                            If you experience technical issues receiving your files, please contact support immediately, and we will ensure your files are delivered to you manually.
                        </p>
                    </div>
                </section>

                <hr className="border-white/5" />

                {/* Section 3 */}
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <AlertCircle className="text-primary" size={20} />
                        <h2 className="text-xl font-bold uppercase tracking-wide text-white">3. Credit & Attribution</h2>
                    </div>
                    <div className="space-y-4 text-sm leading-relaxed text-gray-400">
                        <p>
                            Credit must be given to "Lejja" in all commercially released works (e.g., "Produced by Lejja"). This applies to all license types, including Unlimited and Exclusive rights, unless explicitly negotiated otherwise in writing.
                        </p>
                    </div>
                </section>

                <div className="p-6 bg-white/5 rounded-2xl border border-white/10 mt-8">
                    <p className="text-xs text-gray-500 italic text-center">
                        These terms are subject to change. Continued use of the platform after changes constitutes acceptance of the new terms.
                    </p>
                </div>
            </div>

        </motion.div>
    );
};

export default TermsOfService;
