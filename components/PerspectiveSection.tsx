import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { cn } from '../lib/utils';

interface PerspectiveSectionProps {
    children: React.ReactNode;
    className?: string;
    id?: string;
}

const PerspectiveSection: React.FC<PerspectiveSectionProps> = ({ children, className, id }) => {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });

    // Parallax & 3D Effect
    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.9, 1, 1, 0.9]);
    const rotateX = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [15, 0, 0, -15]);
    const y = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [100, 0, 0, -100]);

    return (
        <motion.div
            ref={ref}
            id={id}
            style={{
                opacity,
                scale,
                rotateX,
                y,
                transformStyle: "preserve-3d",
                perspective: "1000px"
            }}
            className={cn("w-full relative z-10", className)}
        >
            {children}
        </motion.div>
    );
};

export default PerspectiveSection;
