'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, ShieldCheck, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Button: React.FC<{
  children: React.ReactNode;
  to?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'white' | 'gold-outline';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}> = ({ children, to, variant = 'primary', className = '', onClick, disabled }) => {
  const baseStyle = "group relative inline-flex items-center justify-center px-10 py-4 text-sm font-semibold tracking-widest uppercase transition-all duration-300 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-gold-500 text-white hover:bg-gold-600 shadow-lg shadow-gold-500/20",
    secondary: "bg-navy-950 text-white hover:bg-navy-900 shadow-lg shadow-navy-900/30",
    outline: "border border-white/30 text-white hover:bg-white hover:text-navy-950 backdrop-blur-sm",
    "gold-outline": "border border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-white",
    white: "bg-white text-navy-950 hover:bg-gray-100 shadow-lg"
  };

  const content = (
    <span className="relative z-10 flex items-center">
      {children}
      {variant !== 'outline' && variant !== 'gold-outline' && !disabled && (
        <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
      )}
    </span>
  );

  const buttonContent = (
    <>
      <div className={`absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full ${!disabled ? 'group-hover:animate-shimmer' : ''}`} />
      {content}
    </>
  );

  if (to && !disabled) {
    return (
      <Link href={to} className={`${baseStyle} ${variants[variant]} ${className}`}>
        {buttonContent}
      </Link>
    );
  }

  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {buttonContent}
    </button>
  );
};

export const SectionHeader: React.FC<{
  title: string;
  subtitle: string;
  centered?: boolean;
  light?: boolean;
  className?: string;
}> = ({ title, subtitle, centered = true, light = false, className = '' }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className={`mb-16 ${centered ? 'text-center' : 'text-left'} ${className}`}
  >
    <div className={`inline-block mb-4 px-3 py-1 border ${light ? 'border-gold-500/30 text-gold-400' : 'border-gold-600/20 text-gold-600'} text-xs font-bold tracking-[0.2em] uppercase`}>
      {subtitle}
    </div>
    <h2 className={`font-serif text-4xl md:text-5xl lg:text-6xl font-medium ${light ? 'text-white' : 'text-navy-950'} leading-tight`}>
      {title}
    </h2>
    <div className={`mt-8 w-24 h-[2px] bg-gradient-to-r from-gold-400 to-transparent ${centered ? 'mx-auto' : ''}`} />
  </motion.div>
);

export const FadeIn: React.FC<{ children: React.ReactNode; delay?: number, className?: string, direction?: 'up' | 'left' | 'right' }> = ({ children, delay = 0, className = "", direction = 'up' }) => {
  const directions = {
    up: { y: 40, x: 0 },
    left: { x: -40, y: 0 },
    right: { x: 40, y: 0 }
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directions[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const ImageSlideshow: React.FC<{ images: string[], interval?: number, overlayOpacity?: string }> = ({ images, interval = 6000, overlayOpacity = "bg-navy-950/20" }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, interval);
    return () => clearInterval(timer);
  }, [images.length, interval]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-navy-950">
      <AnimatePresence initial={false}>
        <motion.img
          key={index}
          src={images[index]}
          alt="Background"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>
      <div className={`absolute inset-0 ${overlayOpacity} z-10`} />
    </div>
  );
};

export const Badge: React.FC<{ children: React.ReactNode; variant?: 'success' | 'warning' | 'error' | 'neutral' }> = ({ children, variant = 'neutral' }) => {
  const styles = {
    success: 'bg-green-100 text-green-700 border-green-200',
    warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    error: 'bg-red-100 text-red-700 border-red-200',
    neutral: 'bg-gray-100 text-gray-700 border-gray-200',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border ${styles[variant]}`}>
      {children}
    </span>
  );
};

export const SimpleLineChart: React.FC<{ data: number[], color?: string }> = ({ data, color = '#C69C45' }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;
  
  // Normalize data to 0-100 for SVG path
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((val - min) / range) * 80; // keep some padding
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full h-16 overflow-hidden">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
         <motion.path
           initial={{ pathLength: 0 }}
           animate={{ pathLength: 1 }}
           transition={{ duration: 2, ease: "easeInOut" }}
           d={`M ${points}`}
           fill="none"
           stroke={color}
           strokeWidth="2"
           vectorEffect="non-scaling-stroke"
         />
         {/* Fill Area */}
         <motion.path
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            transition={{ delay: 1, duration: 1 }}
            d={`M 0,100 L 0,${100 - ((data[0] - min) / range) * 80} L ${points} L 100,100 Z`}
            fill={color}
         />
      </svg>
    </div>
  );
};
