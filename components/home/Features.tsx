import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  BadgeIcon,
  ImportIcon,
  InfoIcon,
  LockIcon,
  MailIcon,
  PrinterIcon,
} from "lucide-react";
import React from "react";

const Hero = () => {
  return (
    <section className="relative min-h-screen w-full flex items-center justify-center bg-gradient-to-r from-blue-700 via-purple-600 to-pink-500 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-10 left-10 w-60 h-60 bg-white opacity-20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-60 h-60 bg-white opacity-20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black opacity-30"></div>

      <div className="container px-6 md:px-12 flex flex-col md:flex-row items-center justify-between relative z-10">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="space-y-6 md:w-1/2 text-center md:text-left"
        >
          <h1 className="text-5xl md:text-6xl font-extrabold text-white drop-shadow-lg leading-tight">
            Your Trusted Partner in{" "}
            <span className="text-yellow-300">Chronix Solutions</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-lg leading-relaxed">
            Explore innovative tools to streamline patient care, enhance medical
            workflows, and improve health outcomes with our advanced platform.
          </p>
          <div className="flex gap-4 justify-center md:justify-start">
            <Link href="/sign-up">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="bg-yellow-300 text-blue-900 font-bold py-3 px-8 rounded-full shadow-lg backdrop-blur-xl hover:bg-yellow-400 transition-all duration-300"
              >
                Get Started
              </motion.button>
            </Link>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="bg-transparent border border-white text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:bg-white hover:text-blue-700 transition-all duration-300"
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
            className="rounded-lg shadow-2xl border-4 border-white/10 hover:scale-105 transition-transform duration-500"
            width={800}
            height={800}
          />
        </motion.div>
      </div>
    </section>
  );
};

const Features = () => {
  return (
    <section
      id="features"
      className="relative min-h-screen w-full py-12 md:py-24 lg:py-32 flex items-center justify-center bg-gradient-to-r from-blue-700 via-purple-600 to-pink-500 overflow-hidden"
    >
      <div className="container px-4 md:px-6 text-center relative z-10">
        <div className="space-y-4">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg">
            Key Features
          </h2>
          <p className="text-white/80 text-lg md:text-xl">
            Explore the powerful features that elevate your Chronix experience.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
          {[
            BadgeIcon,
            PrinterIcon,
            MailIcon,
            InfoIcon,
            ImportIcon,
            LockIcon,
          ].map((Icon, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl shadow-lg p-6 space-y-4 group hover:bg-white/20 transition-all duration-300 ease-in-out transform hover:-translate-y-2 hover:shadow-2xl"
            >
              <Icon className="text-yellow-300 h-10 w-10 group-hover:text-white transition-colors duration-300" />
              <h3 className="text-2xl font-bold text-white group-hover:text-yellow-300 transition-colors duration-300">
                Feature {index + 1}
              </h3>
              <p className="text-white/80 group-hover:text-white transition-colors duration-300">
                Description for feature {index + 1}, providing an excellent
                experience.
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export { Hero, Features };
