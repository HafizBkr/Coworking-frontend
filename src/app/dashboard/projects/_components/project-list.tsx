"use client";
import React from 'react'
import ProjectCard from './project-card'
import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react'
import { useProjects } from '../_hooks/use-projects';
import { Loader } from '@/components/customs/loader';


export function ProjectList() {
  const { isLoading, projects } = useProjects();

  return (
    <div className='flex flex-col gap-4 items-center'>
        {(isLoading && projects === undefined) && (
          <div className='h-96 flex flex-col justify-center items-center'>
            <Loader/>
          </div>
        )}
        <div className='grid md:grid-cols-3  gap-4 w-full'>
            {projects?.map((item)=>(
                <ProjectCard {...item} key={item._id}/>
            ))}
        </div>
        <Button className='rounded-full'>Voir plus <ChevronDown/></Button>
    </div>
  )
}
