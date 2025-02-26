import Link from "next/link";
import { useState } from "react"; // Import useState to manage button state
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { motion } from "framer-motion";

// Spinner Component
const Spinner = () => (
  <div className="w-5 h-5 border-4 border-t-4 border-white border-solid rounded-full animate-spin"></div>
);

const Hero = () => {
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const handleGetStartedClick = () => {
    setIsButtonDisabled(true);
  };

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-sky-50 to-blue-100 overflow-hidden pt-24 md:pt-32">
      {/* Background Elements */}
      {/* <div className="absolute top-10 left-10 w-60 h-60 bg-white opacity-30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-60 h-60 bg-white opacity-20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black opacity-30"></div> */}

      <div className="container px-6 md:px-12 flex flex-col md:flex-row items-center justify-between relative z-10">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="space-y-6 md:w-1/2 text-center md:text-left"
        >
          <h1 className="text-5xl md:text-6xl font-extrabold drop-shadow-lg leading-tight">
            <span className="text-black">Your Trusted Partner </span>
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              ArogyaMitra
            </span>
          </h1>
          {/* New Tagline */}
          <p className="mt-4 text-sm md:text-lg text-gray-600">
            ArogyaMitra: Creating an affordable health tracking system
          </p>
          <p className="text-lg md:text-xl text-gray-700 max-w-lg leading-relaxed">
            Explore innovative tools to streamline patient care, enhance medical
            workflows, and improve health outcomes with our advanced platform.
          </p>
          <div className="flex gap-4 justify-center md:justify-start">
            <Link href="/sign-in">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleGetStartedClick}
                className="bg-gradient-to-r from-blue-400 to-cyan-400 text-white font-bold py-3 px-8 rounded-full shadow-lg backdrop-blur-xl hover:from-blue-400 hover:to-cyan-500 transition-all duration-300 flex items-center justify-center"
              >
                Get Started
              </motion.button>
            </Link>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="bg-transparent border border-blue-400 text-blue-400 font-semibold py-3 px-8 rounded-full shadow-lg hover:bg-blue-50 transition-all duration-300"
            >
              Learn More
            </motion.button>
          </div>
        </motion.div>

        {/* Right Content */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="md:w-1/2 mt-10 md:mt-0 relative"
        >
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-yellow-400 opacity-30 rounded-full blur-3xl animate-spin-slow"></div>
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-500 opacity-30 rounded-full blur-3xl animate-spin-slow"></div>
          <Image
            src="/image.png"
            alt="Healthcare"
            className="rounded-lg shadow-2xl border-4 border-white/10 hover:scale-105 transition-transform duration-500 w-full max-w-[600px] mx-auto"
            width={800}
            height={800}
          />
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
