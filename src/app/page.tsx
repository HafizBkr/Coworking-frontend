import { Navbar1 } from "./_components/Navbar/navbar";
import  {HeroSection}  from "./_components/Landing/Hero";
import  VisioHero  from "./_components/Landing/VisioHero";
import  ThirdHero  from "./_components/Landing/ThirdHero";
export default function Home() {
  return (
    <>
      <Navbar1 />
      <HeroSection />
      <ThirdHero />
      <VisioHero />
    </>
  );
}
