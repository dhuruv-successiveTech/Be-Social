'use client';

import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';

export const Card = ({
  children,
  className = '',
  padding = 'normal',
  hover = false,
  animate = true,
  ...props
}) => {
  const { theme } = useTheme();

  const baseClasses = 'rounded-xl shadow-sm backdrop-blur-lg bg-opacity-95';
  const themeClasses = theme === 'light'
    ? 'bg-white border border-gray-100 dark:bg-gray-800 dark:border-gray-700'
    : 'bg-gray-800 border border-gray-700';
  const hoverClasses = hover
    ? theme === 'light'
      ? 'hover:shadow-xl hover:scale-[1.02] hover:bg-gradient-to-br hover:from-white hover:to-pink-50'
      : 'hover:shadow-xl hover:scale-[1.02] hover:bg-gradient-to-br hover:from-gray-800 hover:to-gray-750'
    : '';
  const paddingClasses = {
    none: '',
    small: 'p-3',
    normal: 'p-6',
    large: 'p-8'
  }[padding];

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const CardComponent = animate ? motion.div : 'div';
  const animationProps = animate ? {
    variants: cardVariants,
    initial: "hidden",
    animate: "visible"
  } : {};

  return (
    <CardComponent
      className={`${baseClasses} ${themeClasses} ${hoverClasses} ${paddingClasses} ${className} transform transition-all duration-300`}
      {...animationProps}
      {...props}
    >
      {children}
    </CardComponent>
  );
};
