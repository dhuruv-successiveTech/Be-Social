"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FiAlertCircle } from "react-icons/fi";

export const Input = ({
  label,
  error,
  type = "text",
  className = "",
  icon: Icon,
  animate = true,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const baseClasses =
    "w-full rounded-xl focus:ring-2 focus:ring-offset-2 transition-all duration-300 py-3 pl-10 pr-3";
  const themeClasses =
    "bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-purple-400 focus:ring-purple-400";
  const errorClasses = error
    ? "border-red-500 focus:border-red-400 focus:ring-red-400"
    : "";

  const inputVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  const InputWrapper = animate ? motion.div : "div";
  const animationProps = animate
    ? {
        variants: inputVariants,
        initial: "hidden",
        animate: "visible",
      }
    : {};

  return (
    <InputWrapper className="space-y-1 relative" {...animationProps}>
      {label && (
        <motion.label
          className={`block text-sm font-medium mb-1 text-gray-300`}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {label}
        </motion.label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon
              className={`h-5 w-5 transition-colors duration-200 ${
                isFocused ? "text-purple-500" : "text-gray-400"
              }`}
            />
          </div>
        )}
        <input
          type={type}
          className={`${baseClasses} ${themeClasses} ${errorClasses} ${className} transform transition-transform focus:scale-[1.01]`}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {error && (
          <motion.div
            className="absolute inset-y-0 right-0 flex items-center pr-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <FiAlertCircle className="h-5 w-5 text-red-500" />
          </motion.div>
        )}
      </div>
      {error && (
        <motion.p
          className={`text-sm flex items-center gap-1 text-red-400`}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {error}
        </motion.p>
      )}
    </InputWrapper>
  );
};
