'use client';

import { motion } from 'framer-motion';

const variants = {
  primary: {
    light: 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white',
    dark: 'bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-700 hover:via-purple-700 hover:to-indigo-700 text-white'
  },
  secondary: {
    light: 'bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800',
    dark: 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white'
  },
  outline: {
    light: 'border-2 border-purple-500 hover:bg-purple-50 text-purple-500 hover:text-purple-600',
    dark: 'border-2 border-purple-400 hover:bg-purple-900/30 text-purple-400 hover:text-purple-300'
  },
  danger: {
    light: 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white',
    dark: 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white'
  }
};

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-2.5',
  lg: 'px-8 py-3 text-lg'
};

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  animate = true,
  ...props
}) => {

  const baseClasses = 'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]';
  const variantClasses = variants[variant];
  const sizeClasses = sizes[size];

  const buttonVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    tap: { scale: 0.98 }
  };

  const ButtonComponent = animate ? motion.button : 'button';
  const animationProps = animate ? {
    variants: buttonVariants,
    initial: "initial",
    animate: "animate",
    whileTap: "tap"
  } : {};

  return (
    <ButtonComponent
      type={type}
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className} shadow-md hover:shadow-xl`}
      disabled={disabled || loading}
      onClick={onClick}
      {...animationProps}
      {...props}
    >
      {loading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="flex items-center space-x-2"
        >
          <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent" />
          <span>Processing...</span>
        </motion.div>
      ) : children}
    </ButtonComponent>
  );
};
