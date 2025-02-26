import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import "./timeline.css";

const Guide = () => {
  const timelineData = [
    {
      year: "1",
      title: "Dashboard",
      description:
        "Get a comprehensive overview of your health with the dashboard. Monitor your current body vitals in real time, track your mental health trends, and stay informed about upcoming appointments.",
      season: "Feature 1",
      image: "images/dashboard.png",
    },
    {
      year: "2",
      title: "AI Risk Assessment",
      description:
        "Empower your health decisions with AI-driven insights. Answer a few simple questions to help the AI evaluate your symptoms and risk factors.",
      season: "Feature 2",
      image: "images/ai_risk_assessment.png",
    },
    {
      year: "3",
      title: "Lab Test",
      description:
        "Take control of your health with our lab test feature. Upload your diagnostic reports to predict potential diseases such as diabetes, heart disease, eye conditions.",
      season: "Feature 3",
      image: "images/diagnosis.png",
    },
    {
      year: "4",
      title: "My Appointment",
      description:
        "Scheduling your healthcare appointments has never been easier. Choose from a list of specialized doctors based on your needs.",
      season: "Feature 4",
      image: "images/appointments.png",
    },
    {
      year: "5",
      title: "Consult Doctor",
      description:
        "Experience seamless virtual consultations with experienced doctors from the comfort of your home. Through video calls, doctors can assess your symptoms.",
      season: "Feature 5",
      image: "images/consult_doctor.png",
    },
    {
      year: "6",
      title: "Reports",
      description:
        "Access all your lab reports and prescriptions provided by doctors. Also, find a section to buy medicines from top pharma websites.",
      season: "Feature 6",
      image: "images/reports.png",
    },
    {
      year: "7",
      title: "Mental Fitness",
      description:
        "Track your mental fitness and get personalized insights to improve your well-being. Discover your mental fitness score and start your journey to a healthier mind.",
      season: "Feature 7",
      image: "images/mental-health.png",
    },
  ];

  const timelineRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!timelineRef.current || !progressRef.current) return;
      const timelineTop =
        timelineRef.current.getBoundingClientRect().top + window.scrollY;
      const timelineHeight = timelineRef.current.offsetHeight;
      const scrollPosition = window.scrollY + window.innerHeight / 2;
      let progress = ((scrollPosition - timelineTop) / timelineHeight) * 100;
      progress = Math.max(0, Math.min(progress, 100));
      progressRef.current.style.height = `${progress}%`;
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative w-full bg-gradient-to-b from-sky-50 to-blue-100 min-h-screen py-16 px-4 sm:px-6">
      <div className="container mx-auto relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-gray-800 mb-12 sm:mb-16 px-4"
        >
          How It{" "}
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Works
          </span>
        </motion.h2>

        <div className="relative" ref={timelineRef}>
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-blue-200 to-cyan-200">
            <div
              ref={progressRef}
              className="absolute top-0 left-0 w-full bg-gradient-to-b from-blue-400 to-cyan-400 transition-all duration-500"
            ></div>
          </div>

          <div className="space-y-8 sm:space-y-12 md:space-y-16">
            {timelineData.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`${
                  index % 2 === 0 ? "md:mr-auto" : "md:ml-auto"
                } w-full md:w-1/2`}
              >
                <div
                  className={`relative ${
                    index % 2 === 0 ? "md:pr-16" : "md:pl-16"
                  } px-4 sm:px-0`}
                >
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 h-auto sm:h-[400px] flex flex-col"
                  >
                    <div
                      className={`absolute top-1/2 transform -translate-y-1/2 
                        ${
                          index % 2 === 0
                            ? "right-0 translate-x-1/2"
                            : "left-0 -translate-x-1/2"
                        }
                        bg-gradient-to-r from-blue-400 to-cyan-400 w-12 h-12 rounded-full 
                        flex items-center justify-center text-white font-bold z-10
                        shadow-lg border-2 border-white`}
                    >
                      {item.year}
                    </div>

                    <div className="flex flex-col h-full">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed text-sm mb-4 flex-shrink-0">
                        {item.description}
                      </p>
                      <div className="mt-auto h-48 overflow-hidden rounded-lg">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
                        />
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Guide;
