/* eslint-disable react/react-in-jsx-scope */
"use client"
import { Button } from '@/components/ui/button'
import {  CalendarMinus2Icon, EllipsisIcon, Share2Icon, Star, UserCheck } from 'lucide-react'
// import { Input } from '@/components/ui/input'
// import { useState } from 'react'
// import { Project } from '@/models/project.model'
import { useProjectStore } from '@/stores/project.store'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
// import { ProjectDialog } from './project-dialog'

export function NavBarProject() {
    // const [open, setOpen] = useState(false);
    const { currentProject } = useProjectStore();
    return (
      <div className='space-y-8'>
        <div className='w-full flex justify-between items-start'>
            <div>
              {currentProject?.name ? (
                <h1 className='text-4xl font-bold'>{currentProject.name}</h1>
              ) : (
                <div className="h-10 w-48 bg-muted animate-pulse rounded" />
              )}
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
            <div hidden className=''>
                <div className='flex gap-2 items-end'>
                    <UserCheck strokeWidth={1.5} className='text-muted-foreground'/>
                    <span className='text-muted-foreground font-semibold'>Assigné a</span>
                </div>
            </div>
            <div className=''>
                <div className='flex gap-2 items-center'>
                    <div className='size-10 bg-violet-200 shrink-0 flex flex-col justify-center items-center relative rounded-lg overflow-hidden'>
                        <CalendarMinus2Icon strokeWidth={1.5} className='text-muted-foreground'/>
                    </div>
                    <span className='font-semibold flex items-center gap-2'>
                        Date limite :{" "}
                        {currentProject?.endDate ? (
                            <Badge variant={"secondary"}>
                                {format(new Date(currentProject.endDate), "dd/MM/yyyy")}
                            </Badge>
                        ) : (
                            <span className="h-6 w-24 bg-muted animate-pulse rounded inline-block" />
                        )}
                    </span>
                </div>
            </div>
        </div>
        {/* <ProjectDialog open={open} setOpen={setOpen}/> */}
      </div>
    )
  }