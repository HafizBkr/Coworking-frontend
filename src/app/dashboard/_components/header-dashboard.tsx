/* eslint-disable react/react-in-jsx-scope */
"use client";
import { ModeToggle } from '@/components/customs/toggle-theme';
// import { NotifyButton } from "./notify-button";
import { UserProfile } from "./user-profile";
import { WorkSpaceSwitcher } from './workspace-switcher';
import { Input } from '@/components/ui/input';


export function HeaderDashboard() {

  return (
    <header className='border-b flex bg-background items-center gap-2 sticky top-0 z-20 justify-between  p-2 h-16 '>
        <div className='max-w-52 w-full'>
            <WorkSpaceSwitcher />
        </div>
        <div className='w-full'>
          <Input className='shadow-none bg-secondary' placeholder='rechercher...'/>
        </div>
        <div className=' flex gap-2 items-center'>
            <ModeToggle/>
            {/* <NotifyButton/> */}
            <UserProfile/>
        </div>
    </header>
  )
}




  