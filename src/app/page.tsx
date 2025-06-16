"use client";
import { Navbar1 } from "./components/Navbar/navbar";
import { HeroSection } from "./components/Landing/Hero";
// import CoreHRHero from "./components/Landing/SecondHero";
import ThirdHero from "./components/Landing/ThirdHero";
import VisioHero from "./components/Landing/VisioHero";
export default function Page() {
  return (
    <>
      <Navbar1 />
      <HeroSection />
      {/* <CoreHRHero /> */}
      <ThirdHero />
      <VisioHero />
    </>
  );
}
