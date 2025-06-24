import { glass } from '@dicebear/collection';
import { createAvatar } from '@dicebear/core';
import Image from 'next/image'
import React, { useState, useTransition } from 'react'
import {  Edit, EllipsisIcon, Layers2, Loader, Trash2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from 'next/link';
import { Project } from '@/models/project.model';
import DeleteDialog from '@/components/customs/delete-dialog';
import { duplicateProject } from '../_services/project.service';
import { toast } from 'sonner';
import { redirect } from 'next/navigation';
import { routes } from '@/config/routes';
import { useProjectStore } from '@/stores/project.store';

export default function ProjectCard(project:Project) {
  const avatar = createAvatar(glass);
  const svg = avatar.toDataUri();
  const { setCurrentProject } = useProjectStore();
  return (
    <div className='w-full hover:scale-105 transition-all ease-in-out duration-300 group  p-4 bg-background border shadow rounded-xl relative'>
        <div className='flex gap-2'>
            <div className='size-12 shrink-0 relative rounded-full overflow-hidden'>
                <Image
                src={svg}
                alt={svg}
                fill
                />
            </div>
            <Link 
            onClick={()=>setCurrentProject(project)}
            prefetch 
            href={routes.dashboard.projects+`/${project._id}`} className='max-w-md hover:underline w-full'>
                <h1 className='text-lg font-semibold'>{project.name}</h1>
                <p className='text-muted-foreground text-sm line-clamp-2'>{project.description}</p>
            </Link>
        </div>
        {/* <div className='flex  items-center mt-4 justify-between'>
          <Badge className='rounded-full dark:text-white'>{format(project.startDate,"PPP")}</Badge>

          <Badge className='rounded-full  dark:text-white'>{format(project.endDate,"PPP")}</Badge>
        </div> */}
        <div className='absolute -z-20 group-hover:z-0 top-2 right-2'>
            <OptionsProjects 
            projectId={project._id} 
            projectName={project.name}
            />
        </div>
    </div>
  )
}


function OptionsProjects({ projectId, projectName }:{ projectId: string, projectName:string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  // const { current}
  // async function handleDeleteProject() {
    
  // }

  async function handleDuplicateProject(){
    startTransition(async () =>{
      const response = await duplicateProject(projectId, projectName);
      
      // console.log(response)
      if(!response.success && !response.errors ){
        toast.error(response.message)
      }
      
      if(response.success){
        setOpen(false)
        redirect(routes.dashboard.projects)
      }

    })
  }

    return (
      <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full size-6 shadow-none"
            aria-label="Open edit menu"
          >
            <EllipsisIcon size={16} aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={handleDuplicateProject}
            disabled={isPending} >
              {isPending ? 
              <Loader className='animate-spin'/> :
              <Layers2/>
              }
              Dupliquer
          </DropdownMenuItem>
          <DropdownMenuItem><Edit/>Modifier</DropdownMenuItem>
          <DropdownMenuItem 
            onClick={()=>setOpen(true)}
            variant='destructive'>
            <Trash2Icon/>Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteDialog open={open} setOpen={setOpen}/>
      </>
    )
  }