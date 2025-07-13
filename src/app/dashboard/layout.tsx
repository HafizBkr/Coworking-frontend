import { SidebarProvider } from '@/components/ui/sidebar'
import React from 'react'
import { AppSidebar } from './_components/app-sidebar'
import { HeaderDashboard } from './_components/header-dashboard'

export default function DashboardLayout({ children }:{ readonly children: React.ReactNode }) {
  return (
    <SidebarProvider>
        <AppSidebar />
        <main className='flex-1 flex flex-col bg-background h-svh overflow-hidden'>
            <HeaderDashboard/>
            {children}
        </main>
  </SidebarProvider>
  )
}
