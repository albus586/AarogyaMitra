"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";

export function HomeContent() {
  const headingRef = useRef(null);
  const textRef = useRef(null);
  const buttonRef = useRef(null);
  const imageContainerRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    // Initial states
    gsap.set([headingRef.current, textRef.current, buttonRef.current], {
      opacity: 0,
      y: 50,
    });
    gsap.set(imageContainerRef.current, {
      opacity: 0,
      scale: 0.8,
    });

    // Animation sequence
    tl.fromTo(
      headingRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1 }
    )
      .fromTo(
        textRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8 },
        "-=0.5"
      )
      .fromTo(
        buttonRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6 },
        "-=0.3"
      )
      .fromTo(
        imageContainerRef.current,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 1 },
        "-=0.8"
      );

    // Floating animation for image
    gsap.to(imageRef.current, {
      y: 15,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut",
    });

    // Hover effect for button
    const button = buttonRef.current as HTMLButtonElement | null;
    if (button) {
      button.addEventListener("mouseenter", () => {
        gsap.to(button, {
          scale: 1.05,
          duration: 0.3,
          ease: "power2.out",
        });
      });
      button.addEventListener("mouseleave", () => {
        gsap.to(button, {
          scale: 1,
          duration: 0.3,
          ease: "power2.out",
        });
      });
    }

    // Cleanup
    return () => {
      if (button) {
        button.removeEventListener("mouseenter", () => {});
        button.removeEventListener("mouseleave", () => {});
      }
    };
  }, []);

  return (
    <div className="h-auto md:h-24 pt-4 md:pt-2 px-4 md:px-6">
      <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center max-w-6xl mx-auto">
        <div className="space-y-6 md:space-y-8">
          <h1
            ref={headingRef}
            className="text-3xl md:text-5xl font-bold leading-tight"
          >
            Book{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">
              Appointment
            </span>{" "}
            with your Favourite{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">
              Doctors
            </span>
          </h1>

          <p
            ref={textRef}
            className="text-base md:text-lg text-gray-600 dark:text-gray-300 leading-relaxed"
          >
            Access personalized Chronix services anytime, anywhere. Whether you
            need a routine check-up or specialized care, find and schedule
            appointments with trusted doctors across various specialties. Take
            charge of your health with a smooth booking process and expert
            medical guidance tailored to your needs.
          </p>

          <button
            ref={buttonRef}
            className="relative group bg-gradient-to-r from-blue-600 to-blue-500 text-white px-8 py-4 rounded-xl font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300"
          >
            <span className="relative z-10">Explore Now</span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>

        <div
          ref={imageContainerRef}
          className="relative aspect-square mt-8 lg:mt-0"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-blue-50 rounded-3xl transform rotate-6 scale-95 opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-l from-blue-100 to-blue-50 rounded-3xl transform -rotate-3 scale-95 opacity-50" />
          <div className="relative m-5 w-full h-full bg-gradient-to-br from-blue-100 to-white rounded-2xl flex items-center justify-center overflow-hidden shadow-xl">
            <div ref={imageRef}>
              <Image
                src="/image.png"
                alt="Chronix"
                className="w-full h-full object-cover rounded-2xl transform transition-transform duration-300 hover:scale-105"
                width={500}
                height={500}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
