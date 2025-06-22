"use client";
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar';
import { routes } from '@/config/routes';
import { Logout } from '@/services/auth/session.service'
import { LogOut } from 'lucide-react'
import { redirect } from 'next/navigation';
import React, { useTransition } from 'react'

export function LogoutButton() {
  const { open } = useSidebar()
  const [isPending, startTransition]= useTransition();
  async function handleLogout(){
    startTransition(async()=>{
      const res = await Logout();
      if(res){
        redirect(routes.auth.signin)
      }
    })
  }

  return (
    <Button loading={isPending} onClick={handleLogout} variant={"outline"} >
        <LogOut/>
        <span hidden={!open}>Deconnexion</span>
    </Button>
  )
}
