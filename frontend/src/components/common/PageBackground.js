'use client';

import { motion } from 'framer-motion';

export const PageBackground = ({ children, variant = 'default' }) => {
  const variants = {
    default: {
      background: 'bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900',
      blob1: {
        color: 'bg-pink-300 dark:bg-pink-900',
        animation: {
          x: [0, -100, 0],
          y: [0, 100, 0],
        }
      },
      blob2: {
        color: 'bg-indigo-300 dark:bg-indigo-900',
        animation: {
          x: [0, 100, 0],
          y: [0, -100, 0],
        }
      },
      blob3: {
        color: 'bg-blue-300 dark:bg-blue-900',
        animation: {
          x: [0, -50, 0],
          y: [0, -50, 0],
        }
      }
    },
    purple: {
      background: 'bg-gradient-to-br from-purple-100 via-indigo-50 to-blue-100 dark:from-purple-900 dark:via-indigo-900 dark:to-blue-900',
      blob1: {
        color: 'bg-purple-300 dark:bg-purple-800',
        animation: {
          x: [0, -100, 0],
          y: [0, 100, 0],
        }
      },
      blob2: {
        color: 'bg-indigo-300 dark:bg-indigo-800',
        animation: {
          x: [0, 100, 0],
          y: [0, -100, 0],
        }
      },
      blob3: {
        color: 'bg-blue-300 dark:bg-blue-800',
        animation: {
          x: [0, -50, 0],
          y: [0, -50, 0],
        }
      }
    }
  };

  const selectedVariant = variants[variant];

  return (
    <div className={`min-h-screen relative overflow-hidden ${selectedVariant.background}`}>
      {/* Background Animation */}
      <div className="absolute w-full h-full">
        <motion.div
          className={`absolute w-96 h-96 ${selectedVariant.blob1.color} rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob`}
          animate={selectedVariant.blob1.animation}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className={`absolute w-96 h-96 ${selectedVariant.blob2.color} rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000`}
          animate={selectedVariant.blob2.animation}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className={`absolute w-96 h-96 ${selectedVariant.blob3.color} rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000`}
          animate={selectedVariant.blob3.animation}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
