"use client"
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function NotFoundPage() {
  return (
    <>
      <Head>
        <title>Balanzify - Page Not Found</title>
        <meta name="description" content="Balanzify - Your Financial Balance Companion" />
        <meta name="keywords" content="finance, balance, money, management" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 flex items-center justify-center px-4">
        <div className="text-center">
          {/* Animated 404 Number */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, type: 'spring' }}
            className="mb-8 relative"
          >
            <div className="floating-animation">
              <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                404
              </h1>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-600 opacity-10 blur-2xl rounded-full" />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">
              Oops! Page Lost in Space
            </h2>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              The page you are looking for has been abducted by aliens or drifted into the unknown. 
              Let us get you back to safe orbit!
            </p>
            
            {/* Home Button */}
            <Link href="/dashboard">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8 py-3 rounded-full 
                         font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300"
              >
                Bring Me Home
              </motion.div>
            </Link>
          </motion.div>

          {/* Balanzify Branding */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12"
          >
            <p className="text-gray-400 text-sm">
              Lost in space? Do not worry, your finances are safe with{' '}
              <span className="font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                Balanzify
              </span>
            </p>
          </motion.div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        .floating-animation {
          animation: float 3s ease-in-out infinite;
        }
        
        @media (max-width: 640px) {
          h1 {
            font-size: 8rem !important;
          }
          h2 {
            font-size: 1.75rem !important;
          }
        }
      `}</style>
    </>
  );
}