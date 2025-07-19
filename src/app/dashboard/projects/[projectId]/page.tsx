import React from 'react'
import { NavBarProject } from './_components/navbar-project'
import { KanbanDashboard } from '@/components/kanban/kanban-dashboard'

export default async function Page({
    params,
  }: {
    params: Promise<{ projectId: string }>
  }) {
    const { projectId } = await params;
    console.log({ projectId });
    
    return (
        <section  className='min-h-[calc(100svh-4rem)] overflow-y-auto p-8 space-y-8  w-full'>
            <NavBarProject/>
            <KanbanDashboard/>
        </section>
    )
  }