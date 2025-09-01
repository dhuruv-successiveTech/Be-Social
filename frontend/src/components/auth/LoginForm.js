"use client";

import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { useMutation } from "@apollo/client/react";
import { useAuth } from "../../hooks/useAuth";
import { FiMail, FiLock, FiArrowRight } from "react-icons/fi";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LOGIN_MUTATION } from "../../graphql/mutations/auth";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const [loginMutation, { loading }] = useMutation(LOGIN_MUTATION, {
    onCompleted: (data) => {
      const { token, refreshToken, user } = data.login;
      login(user, token, refreshToken);
      router.push("/");
    },
    onError: (error) => {
      setError(error.message);
      toast.error(error.message || "Login failed. Please try again.");
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await loginMutation({
        variables: {
          input: {
            email,
            password,
          },
        },
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="absolute w-full h-full">
        <motion.div
          className="absolute w-96 h-96 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute w-96 h-96 bg-yellow-300 dark:bg-yellow-900 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute w-96 h-96 bg-pink-300 dark:bg-pink-900 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"
          animate={{
            x: [0, -100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-md w-full space-y-8 relative z-10"
      >
        <div className="bg-white dark:bg-gray-800 backdrop-blur-lg bg-opacity-90 dark:bg-opacity-90 rounded-2xl shadow-xl p-8 transform transition-all duration-500 hover:scale-[1.02]">
          <motion.div variants={itemVariants} className="text-center">
            <motion.h2
              variants={itemVariants}
              className="text-4xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent pb-2"
            >
              Welcome Back
            </motion.h2>
            <p className="text-gray-500 dark:text-gray-400">
              Sign in to your account
            </p>
          </motion.div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <motion.div variants={itemVariants} className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail
                    className={`h-5 w-5 transition-colors duration-200 ${
                      isEmailFocused ? "text-indigo-500" : "text-gray-400"
                    }`}
                  />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl 
                           text-gray-900 dark:text-white bg-white dark:bg-gray-700 
                           placeholder-gray-500 focus:outline-none focus:border-indigo-500 
                           focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 
                           transition-all duration-300"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setIsEmailFocused(true)}
                  onBlur={() => setIsEmailFocused(false)}
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock
                    className={`h-5 w-5 transition-colors duration-200 ${
                      isPasswordFocused ? "text-indigo-500" : "text-gray-400"
                    }`}
                  />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl 
                           text-gray-900 dark:text-white bg-white dark:bg-gray-700 
                           placeholder-gray-500 focus:outline-none focus:border-indigo-500 
                           focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 
                           transition-all duration-300"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                />
              </div>
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm text-center bg-red-100 dark:bg-red-900/30 p-3 rounded-lg"
              >
                {error}
              </motion.div>
            )}

            <motion.div variants={itemVariants}>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex items-center justify-center px-4 py-3 
                         bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500
                         text-white font-medium rounded-xl
                         focus:outline-none focus:ring-2 focus:ring-offset-2 
                         focus:ring-indigo-500 transform transition-all duration-300
                         hover:scale-[1.02] disabled:opacity-50"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-6 h-6 border-2 border-white rounded-full border-t-transparent"
                  />
                ) : (
                  <>
                    Sign in
                    <FiArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </button>
            </motion.div>

            <motion.div variants={itemVariants} className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="font-medium text-indigo-600 hover:text-indigo-500 
                           focus:outline-none focus:underline transition-all duration-300
                           relative after:absolute after:bottom-0 after:left-0 after:h-[2px]
                           after:w-full after:origin-left after:scale-x-0 after:bg-indigo-500
                           after:transition-transform hover:after:scale-x-100"
                >
                  Register here
                </Link>
              </p>
            </motion.div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginForm;
