/* eslint-disable react/react-in-jsx-scope */
"use client";
import { ModeToggle } from '@/components/customs/toggle-theme';
// import { NotifyButton } from "./notify-button";
import { UserProfile } from "./user-profile";
import { WorkSpaceSwitcher } from './workspace-switcher';


export function HeaderDashboard() {

  return (
    <header className='border-b flex items-center justify-between  p-2 h-16 '>
        <div className='max-w-52 w-full'>
            <WorkSpaceSwitcher />
        </div>
        <div className=' flex gap-4 items-center px-4'>
            <ModeToggle/>
            {/* <NotifyButton/> */}
            <UserProfile/>
        </div>
    </header>
  )
}




  