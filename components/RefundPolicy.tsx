import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, RotateCcw, AlertTriangle, CheckCircle } from 'lucide-react';

interface RefundPolicyProps {
    onBack: () => void;
}

const RefundPolicy: React.FC<RefundPolicyProps> = ({ onBack }) => {
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
                    <RotateCcw className="w-8 h-8 text-primary" />
                </div>
                <div>
                    <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white mb-2">
                        Refund Policy
                    </h1>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Standard Digital Goods Policy</p>
                </div>
            </div>

            <div className="space-y-12 bg-dark-card border border-white/5 p-8 md:p-12 rounded-3xl">

                {/* Section 1 */}
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <AlertTriangle className="text-primary" size={20} />
                        <h2 className="text-xl font-bold uppercase tracking-wide text-white">All Sales are Final</h2>
                    </div>
                    <div className="space-y-4 text-sm leading-relaxed text-gray-400">
                        <p>
                            Due to the nature of digital products (instant download access to unencrypted audio files), <strong>Lejja Beats does not offer refunds</strong> once a transaction is completed and the download link has been generated.
                        </p>
                        <p>
                            Unlike physical goods, digital files cannot be "returned." Once you have access to the files, the sale is considered final. This standard industry practice protects our intellectual property and prevents abuse.
                        </p>
                    </div>
                </section>

                <hr className="border-white/5" />

                {/* Section 2 */}
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <CheckCircle className="text-primary" size={20} />
                        <h2 className="text-xl font-bold uppercase tracking-wide text-white">Exceptions</h2>
                    </div>
                    <div className="space-y-4 text-sm leading-relaxed text-gray-400">
                        <p>
                            We may offer a replacement or store credit in the following rare circumstances:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 marker:text-primary">
                            <li><strong>Double Charge:</strong> If you were accidentally charged twice for the same order due to a technical glitch.</li>
                            <li><strong>Corrupted Files:</strong> If the files you downloaded are corrupted and a fresh download link does not resolve the issue.</li>
                            <li><strong>Wrong File Delivered:</strong> If a technical error provided you with a different beat than the one you purchased.</li>
                        </ul>
                        <p className="mt-4">
                            If you believe you qualify for an exception, please contact us immediately regarding your order.
                        </p>
                    </div>
                </section>
            </div>
        </motion.div>
    );
};

export default RefundPolicy;
