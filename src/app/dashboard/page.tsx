/* eslint-disable react/react-in-jsx-scope */

import { HomeSection } from "./_components/home-section";
import { WelcomeBar } from "./_components/welcome-bar";



// type VirtualSpaceCardItemProps = {
//   status?: "disponible" | "occupé" | "en reunion"
// }

export default function DashboardPage() {
  // await new Promise((resolve) => setTimeout(resolve, 5000))
  return (
    <section className='min-h-[calc(100svh-4rem)] overflow-y-auto p-8 space-y-4 bg-secondary/50 w-full'>
      <WelcomeBar/>
      <HomeSection/>
    </section>
  )
}













