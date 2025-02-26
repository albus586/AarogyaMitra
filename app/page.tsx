"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Hero from "@/components/home/Hero";
// import FeaturesComponent from "@/components/home/Features";
import Guide from "@/components/home/Guide";
import Pricing from "@/components/home/Pricing";
import Footer from "@/components/home/Footer";
import Header from "@/components/home/Header";
import { motion, useAnimation } from "framer-motion";

export default function Landing() {
  const [isSignedUp] = useState(false);
  const router = useRouter();
  const controls = useAnimation();
  const featuresRef = useRef<HTMLDivElement>(null);

  const handleSectionClick = (section: string) => {
    if (!isSignedUp) {
      router.push("/sign-in");
    } else {
      router.push(section);
    }
  };

  const handleScroll = () => {
    const top = featuresRef.current?.getBoundingClientRect().top;
    if (top !== undefined && top <= window.innerHeight && top > 0) {
      controls.start({ rotateY: 0 });
    } else {
      controls.start({ rotateY: 180 });
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <Header />
      <Hero />
      {/* <div ref={featuresRef}>
        <Features controls={controls} />
      </div> */}
      <Guide />
      {/* <Pricing /> */}
      <Footer />
    </>
  );
}

const Features = ({ controls }: { controls: any }) => {
  const features = [
    {
      image: "/images/diagnosis.png",
      title: "Disease Diagnosis",
      description:
        "Leverage advanced algorithms to diagnose a wide range of diseases.",
    },
    {
      image: "/images/appointments.png",
      title: "Book Appointment",
      description:
        "Schedule appointments with ease, directly through the platform.",
    },
    {
      image: "/images/medical-records.png",
      title: "Medical Records",
      description:
        "Safely store and access all your medical records in one place.",
    },
    {
      image: "/images/diet.png",
      title: "Diet Plan",
      description:
        "Receive personalized diet plans tailored to your health needs.",
    },
    {
      image: "/images/emergency.png",
      title: "Emergency",
      description:
        "Get immediate assistance and support during medical emergencies.",
    },
    {
      image: "/images/pharmacy.png",
      title: "Pharmacy Section",
      description:
        "Order medications and health products directly from trusted pharmacies.",
    },
  ];

  return (
    <section
      id="features"
      className="w-full py-12 md:py-24 lg:py-32 flex items-center justify-center min-h-screen bg-muted"
    >
      <div className="container px-4 md:px-6 text-center">
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold">Key Features</h2>
          <p className="text-muted-foreground text-lg md:text-xl">
            Explore the powerful features that elevate your Chronix experience.
          </p>
        </motion.div>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-12"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                delayChildren: 0.5,
                staggerChildren: 0.5,
              },
            },
          }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center group"
              variants={{
                hidden: { opacity: 0, y: 50 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              {/* Enhanced card for image */}
              <div className="relative w-full aspect-[3/2] bg-background rounded-xl shadow-md overflow-hidden group-hover:shadow-xl transition-all duration-300 ease-in-out transform group-hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              {/* Enhanced text below the card */}
              <div className="mt-6 text-center px-4">
                <h3 className="text-2xl font-bold tracking-tight group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground mt-3 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
