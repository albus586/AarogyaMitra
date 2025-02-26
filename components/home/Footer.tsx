import React from "react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="w-full bg-white py-6 border-t border-gray-200">
      <div className="container px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-600 text-center md:text-left">
          &copy; 2024 Chronix. All rights reserved.
        </div>
        <nav className="flex flex-wrap gap-4 justify-center">
          <Link
            href="#"
            className="group inline-flex h-9 items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-blue-50 focus:bg-blue-50 focus:outline-none whitespace-nowrap"
            prefetch={false}
          >
            Privacy Policy
          </Link>
          <Link
            href="#"
            className="group inline-flex h-9 items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-blue-50 focus:bg-blue-50 focus:outline-none whitespace-nowrap"
            prefetch={false}
          >
            Terms of Service
          </Link>
          <Link
            href="#"
            className="group inline-flex h-9 items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-blue-50 focus:bg-blue-50 focus:outline-none whitespace-nowrap"
            prefetch={false}
          >
            Contact Us
          </Link>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
