"use client";
import React, { useEffect, useState } from "react";

const HeroSection: React.FC = () => {
  const [scrollY, setScrollY] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = (): void => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);

    const timer: NodeJS.Timeout = setTimeout(() => setIsVisible(true), 100);

    return (): void => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timer);
    };
  }, []);

  const handleDemoClick = (): void => {
    console.log("Demo requested");
  };

  return (
    <section
      className={`relative min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden pt-20 transition-opacity duration-700 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Subtle dot background */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.15) 1px, transparent 0)`,
            backgroundSize: "20px 20px",
          }}
        />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20">
        <div className="text-center relative z-20">
          {/* Central Image */}
          <div
            className={`mb-16 transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-8 scale-95"
            }`}
            style={{ transitionDelay: "400ms" }}
          >
            <img
              src="/landing-main.webp"
              alt="Coworking en ligne"
              className="w-full  mx-auto  object-cover"
              style={{
                transform: `translateY(${scrollY * 0.05}px)`,
                transition: "transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
            <div
              className="absolute inset-0 z-10"
              style={{ pointerEvents: "all", background: "transparent" }}
            />
          </div>

          {/* Main Heading */}
          <div
            className={`mb-8 transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: "600ms" }}
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-gray-900 leading-tight">
              Plateforme de coworking en ligne
              <br />
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Tout-en-un
              </span>
            </h1>
          </div>

          {/* Description */}
          <div
            className={`mb-12 transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: "800ms" }}
          >
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Gérez vos espaces de travail, projets, discussions en direct et
              réunions vidéo, le tout depuis une interface centralisée et
              sécurisée.
            </p>
          </div>

          {/* CTA Button */}
          <div
            className={`flex flex-col sm:flex-row gap-4 justify-center items-center transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: "1000ms" }}
          >
            <button
              onClick={handleDemoClick}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 min-w-[200px]"
              type="button"
            >
              Découvrir la plateforme
            </button>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </section>
  );
};

export { HeroSection };
