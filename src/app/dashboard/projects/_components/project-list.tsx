import React from 'react'
import ProjectCard from './project-card'
import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react'

export function ProjectList() {
  return (
    <div className='flex flex-col gap-4 items-center'>
        <div className='grid md:grid-cols-3 lg:grid-cols-4 gap-4 w-full'>
            {Array.from({ length: 38 }).map((item,index)=>(
                <ProjectCard key={index}/>
            ))}
        </div>
        <Button className='rounded-full'>Voir plus <ChevronDown/></Button>
    </div>
  )
}
