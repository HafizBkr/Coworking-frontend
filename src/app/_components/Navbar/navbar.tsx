/* eslint-disable react/no-unknown-property */
"use client";

import * as React from "react";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const Navbar1 = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className="fixed top-0 left-0 right-0 flex justify-center w-full py-6 px-4 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
      <div className="flex items-center justify-between px-6 py-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg w-full max-w-3xl relative">
        <div className="flex items-center">
          <div className="mr-6 group cursor-pointer">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center transition-all duration-300 group-hover:rotate-12 group-hover:scale-110">
              <span className="text-white font-bold text-sm">W</span>
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {["Home", "Pricing", "Docs", "Projects"].map((item, index) => (
            <div
              key={item}
              className="opacity-0 animate-fade-in-up"
              style={{
                animationDelay: `${index * 100}ms`,
                animationFillMode: "forwards",
              }}
            >
              <a
                href="#"
                className="text-sm text-gray-900 hover:text-gray-600 transition-all duration-200 font-medium hover:scale-105 inline-block"
              >
                {item}
              </a>
            </div>
          ))}
        </nav>

        {/* Desktop CTA Buttons */}
        <div className="hidden md:flex space-x-3">
          <a
            href="#"
            className="inline-flex items-center justify-center px-5 py-2 text-sm text-black bg-white border border-black rounded-full hover:bg-gray-100 transition-all duration-200 hover:scale-105 opacity-0 animate-fade-in-right"
            style={{ animationDelay: "200ms", animationFillMode: "forwards" }}
          >
            Login
          </a>
          <a
            href="#"
            className="inline-flex items-center justify-center px-5 py-2 text-sm text-white bg-black rounded-full hover:bg-gray-800 transition-all duration-200 hover:scale-105 opacity-0 animate-fade-in-right"
            style={{ animationDelay: "250ms", animationFillMode: "forwards" }}
          >
            Signup
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden flex items-center transition-transform duration-200 active:scale-90"
          onClick={toggleMenu}
        >
          <Menu className="h-6 w-6 text-gray-900" />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-md z-40 pt-24 px-6 md:hidden transform transition-all duration-300 ease-out">
          <button
            className="absolute top-6 right-6 p-2 transition-transform duration-200 active:scale-90"
            onClick={toggleMenu}
          >
            <X className="h-6 w-6 text-gray-900" />
          </button>
          <div className="flex flex-col space-y-6">
            {["Home", "Pricing", "Docs", "Projects"].map((item, i) => (
              <div
                key={item}
                className="opacity-0 animate-fade-in-right"
                style={{
                  animationDelay: `${i * 100 + 100}ms`,
                  animationFillMode: "forwards",
                }}
              >
                <a
                  href="#"
                  className="text-base text-gray-900 font-medium"
                  onClick={toggleMenu}
                >
                  {item}
                </a>
              </div>
            ))}

            <div
              className="pt-6 flex flex-col space-y-3 opacity-0 animate-fade-in-up"
              style={{ animationDelay: "500ms", animationFillMode: "forwards" }}
            >
              <a
                href="#"
                className="inline-flex items-center justify-center w-full px-5 py-3 text-base text-black bg-white border border-black rounded-full hover:bg-gray-100 transition-colors"
                onClick={toggleMenu}
              >
                Login
              </a>
              <a
                href="#"
                className="inline-flex items-center justify-center w-full px-5 py-3 text-base text-white bg-black rounded-full hover:bg-gray-800 transition-colors"
                onClick={toggleMenu}
              >
                Signup
              </a>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-right {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out;
        }

        .animate-fade-in-right {
          animation: fade-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export { Navbar1 };
