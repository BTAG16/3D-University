import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * @typedef {Object} MagneticButtonProps
 * @property {React.ReactNode} children
 * @property {string} [className]
 * @property {() => void} [onClick]
 * @property {'primary' | 'secondary' | 'outline'} [variant]
 * @property {React.CSSProperties} [style]
 */

/**
 * @param {MagneticButtonProps} props
 */
export const MagneticButton = ({ 
  children, 
  className = "", 
  onClick,
  variant = 'primary',
  style
}) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  const getVariantClass = () => {
    switch (variant) {
      case 'secondary':
        return 'btn-secondary bg-white text-black hover:bg-gray-100';
      case 'outline':
        return 'btn-outline';
      case 'primary':
      default:
        return 'btn-primary';
    }
  };

  const glowVariant = variant === 'primary' ? 'rgba(118, 75, 162, 0.5)' : 'rgba(255, 255, 255, 0.2)';

  return (
    <motion.button
      ref={ref}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={`btn ${getVariantClass()} ${className}`}
      onClick={onClick}
      style={style}
    >
      <span style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {children}
      </span>
      <motion.div 
        className="glow-effect"
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0,
          background: `radial-gradient(circle at center, ${glowVariant}, transparent 70%)`,
          zIndex: 0,
          transition: 'opacity 0.3s'
        }}
        whileHover={{ opacity: 1 }}
      />
    </motion.button>
  );
};