"use client";
import React, { useRef, useEffect } from "react";
import { ContentKey } from "./content";
import { motion, HTMLMotionProps } from "framer-motion";

interface SidebarProps {
  activeContent: ContentKey;
  setActiveContent: (key: ContentKey) => void;
  menuItems: {
    icon: React.ElementType;
    label: string;
    key: ContentKey;
  }[];
}

export function Sidebar({
  activeContent,
  setActiveContent,
  menuItems,
}: SidebarProps) {
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const activeItem = document.querySelector(`[data-key="${activeContent}"]`);
    if (activeItem) {
      activeItem.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [activeContent]);

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-gradient-to-b from-white/95 to-white/50 dark:from-gray-900/95 dark:to-gray-900/50 border-r border-gray-200 dark:border-gray-800">
      <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />

      <div className="relative h-full overflow-hidden">
        <nav
          ref={navRef}
          className="h-full overflow-y-auto scrollbar-none p-4 space-y-2"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {menuItems.map((item) => {
            const isActive = activeContent === item.key;

            return (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <button
                  data-key={item.key}
                  onClick={() => setActiveContent(item.key)}
                  className={`group relative w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ease-in-out
                    ${
                      isActive
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    }
                  `}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeBackground"
                      className="absolute inset-0 rounded-xl bg-blue-500/10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}

                  <div className="relative flex items-center gap-3">
                    <item.icon
                      className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${
                        isActive
                          ? "text-white"
                          : "text-blue-500 dark:text-blue-400"
                      }`}
                    />

                    <span
                      className={`font-medium transition-all duration-300 ${
                        isActive
                          ? "text-white"
                          : "group-hover:text-gray-900 dark:group-hover:text-white"
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>

                  {isActive && (
                    <motion.div
                      layoutId="activeDot"
                      className="absolute right-4 w-1.5 h-1.5 rounded-full bg-white/90"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}
                    />
                  )}
                </button>
              </motion.div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

export default Sidebar;
