/* eslint-disable react/react-in-jsx-scope */
"use client"
import { Button } from '@/components/ui/button'
import {  CalendarMinus2Icon, EllipsisIcon, Share2Icon, Star, UserCheck } from 'lucide-react'
// import { Input } from '@/components/ui/input'
// import { useState } from 'react'
// import { Project } from '@/models/project.model'
import { useProjectStore } from '@/stores/project.store'
import { format } from 'date-fns'
// import { ProjectDialog } from './project-dialog'

export function NavBarProject() {
    // const [open, setOpen] = useState(false);
    const { currentProject } = useProjectStore();
    return (
      <div className='space-y-8'>
        <div className='w-full flex justify-between items-start'>
            <div>
              <h1 className='text-4xl font-bold'>{ currentProject?.name }</h1>
            </div>
            <div className='flex gap-2'>
                
                <Button size={'icon'} variant={'outline'}>
                    <Star/>
                </Button>
                <Button size={'icon'} variant={'outline'}>
                    <Share2Icon/>
                </Button>
                <Button size={'icon'} variant={'outline'}>
                    <EllipsisIcon/>
                </Button>
            </div>
        </div>
        <div className='space-y-4'>
            <div className=''>
                <div className='flex gap-2 items-end'>
                    <UserCheck strokeWidth={1.5} className='text-muted-foreground'/>
                    <span className='text-muted-foreground font-semibold'>Assigné a</span>
                </div>
            </div>
            <div className=''>
                <div className='flex gap-2 items-end'>
                    <CalendarMinus2Icon strokeWidth={1.5} className='text-muted-foreground'/>
                    <span className='text-muted-foreground font-semibold'>Date limite : {currentProject?.endDate ? format(new Date(currentProject.endDate), "dd/MM/yyyy") : null}</span>
                </div>
            </div>
        </div>
        {/* <ProjectDialog open={open} setOpen={setOpen}/> */}
      </div>
    )
  }