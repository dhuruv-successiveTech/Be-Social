'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiImage, FiArrowRight, FiUserPlus } from 'react-icons/fi';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    avatar: null,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const router = useRouter();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      const file = files[0];
      setFormData((prev) => ({
        ...prev,
        [name]: file
      }));
      
      // Create preview URL for avatar
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true); // Set loading to true

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      const errorMsg = 'Passwords do not match';
      setError(errorMsg);
      toast.error(errorMsg);
      setLoading(false); // Reset loading
      return;
    }

    const data = new FormData();
    data.append('username', formData.username);
    data.append('email', formData.email);
    data.append('password', formData.password);
    data.append('name', formData.name);
    if (formData.avatar) {
      data.append('avatar', formData.avatar);
    }
    console.log(formData);
    

    try {
      const response = await fetch('http://localhost:4000/register-with-avatar', { // Use the new REST endpoint
        method: 'POST',
        body: data,
      });
      console.log(response);
      
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Registration failed');
      }

      setSuccess(true);
      toast.success('Registration successful! Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false); // Reset loading
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Background Animation */}
      <div className="absolute w-full h-full">
        <motion.div
          className="absolute w-96 h-96 bg-pink-300 dark:bg-pink-900 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute w-96 h-96 bg-indigo-300 dark:bg-indigo-900 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute w-96 h-96 bg-blue-300 dark:bg-blue-900 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"
          animate={{
            x: [0, -50, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
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
              className="text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent pb-2"
            >
              Join Us
            </motion.h2>
            <p className="text-gray-500 dark:text-gray-400">Create your account</p>
          </motion.div>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <motion.div variants={itemVariants} className="space-y-4">
              {/* Avatar Upload */}
              <div className="flex justify-center">
                <motion.div
                  className="relative group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                    <label htmlFor="avatar" className="cursor-pointer block w-full h-full">
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="Avatar preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                          <FiImage className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </label>
                  </div>
                  <input
                    type="file"
                    id="avatar"
                    name="avatar"
                    accept="image/*"
                    onChange={handleChange}
                    className="hidden"
                  />
                  {/* <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                    <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Change
                    </span>
                  </div> */}
                </motion.div>
              </div>

              {/* Username Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className={`h-5 w-5 transition-colors duration-200 ${
                    focusedField === 'username' ? 'text-purple-500' : 'text-gray-400'
                  }`} />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl 
                           text-gray-900 dark:text-white bg-white dark:bg-gray-700 
                           placeholder-gray-500 focus:outline-none focus:border-purple-500 
                           focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 
                           transition-all duration-300"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField(null)}
                />
              </div>

              {/* Name Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUserPlus className={`h-5 w-5 transition-colors duration-200 ${
                    focusedField === 'name' ? 'text-purple-500' : 'text-gray-400'
                  }`} />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl 
                           text-gray-900 dark:text-white bg-white dark:bg-gray-700 
                           placeholder-gray-500 focus:outline-none focus:border-purple-500 
                           focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 
                           transition-all duration-300"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                />
              </div>

              {/* Email Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className={`h-5 w-5 transition-colors duration-200 ${
                    focusedField === 'email' ? 'text-purple-500' : 'text-gray-400'
                  }`} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl 
                           text-gray-900 dark:text-white bg-white dark:bg-gray-700 
                           placeholder-gray-500 focus:outline-none focus:border-purple-500 
                           focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 
                           transition-all duration-300"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className={`h-5 w-5 transition-colors duration-200 ${
                    focusedField === 'password' ? 'text-purple-500' : 'text-gray-400'
                  }`} />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl 
                           text-gray-900 dark:text-white bg-white dark:bg-gray-700 
                           placeholder-gray-500 focus:outline-none focus:border-purple-500 
                           focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 
                           transition-all duration-300"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                />
              </div>

              {/* Confirm Password Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className={`h-5 w-5 transition-colors duration-200 ${
                    focusedField === 'confirmPassword' ? 'text-purple-500' : 'text-gray-400'
                  }`} />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl 
                           text-gray-900 dark:text-white bg-white dark:bg-gray-700 
                           placeholder-gray-500 focus:outline-none focus:border-purple-500 
                           focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 
                           transition-all duration-300"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField(null)}
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

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-green-500 text-sm text-center bg-green-100 dark:bg-green-900/30 p-3 rounded-lg"
              >
                Registration successful! Redirecting to login...
              </motion.div>
            )}

            <motion.div variants={itemVariants}>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex items-center justify-center px-4 py-3 
                         bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500
                         text-white font-medium rounded-xl
                         focus:outline-none focus:ring-2 focus:ring-offset-2 
                         focus:ring-purple-500 transform transition-all duration-300
                         hover:scale-[1.02] disabled:opacity-50"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-6 h-6 border-2 border-white rounded-full border-t-transparent"
                  />
                ) : (
                  <>
                    Create Account
                    <FiArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </button>
            </motion.div>

            <motion.div variants={itemVariants} className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="font-medium text-purple-600 hover:text-purple-500 
                           focus:outline-none focus:underline transition-all duration-300
                           relative after:absolute after:bottom-0 after:left-0 after:h-[2px]
                           after:w-full after:origin-left after:scale-x-0 after:bg-purple-500
                           after:transition-transform hover:after:scale-x-100"
                >
                  Sign in here
                </Link>
              </p>
            </motion.div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterForm;